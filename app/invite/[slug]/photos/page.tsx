import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import GuestPhotoFeed from './GuestPhotoFeed'

async function addLike(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('photo_likes').insert({
    photo_id: formData.get('photo_id') as string,
    liker_name: formData.get('liker_name') as string,
  })
  revalidatePath(`/invite/${formData.get('slug')}/photos`)
}

async function addComment(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('photo_comments').insert({
    photo_id: formData.get('photo_id') as string,
    author_name: formData.get('author_name') as string,
    content: formData.get('content') as string,
  })
  revalidatePath(`/invite/${formData.get('slug')}/photos`)
}

async function uploadPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const uploader_name = formData.get('uploader_name') as string
  const moment_tag = (formData.get('moment_tag') as string) || null
  const tagged_guests_raw = (formData.get('tagged_guests_raw') as string) || ''
  const tagged_guests = tagged_guests_raw.split(',').map((s: string) => s.trim()).filter(Boolean)
  const files = formData.getAll('photo') as File[]

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await Promise.all(files.map(async (file) => {
    if (!file || file.size === 0) return
    const ext = file.name.split('.').pop()
    const path = `${wedding.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error } = await supabase.storage
      .from('wedding-photos')
      .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })
    if (error) return
    const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)
    await supabase.from('photos').insert({
      wedding_id: wedding.id,
      url: urlData.publicUrl,
      uploaded_by_name: uploader_name,
      caption: moment_tag,
      tagged_guests: tagged_guests.length > 0 ? tagged_guests : null,
    })
  }))

  revalidatePath(`/invite/${slug}/photos`)
}

export default async function GuestPhotosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: "", lastName: "", id: null }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: steps } = await supabase
    .from('program_steps').select('title').eq('wedding_id', wedding.id).order('position')
  const moments = steps?.map(s => s.title) ?? []

  const { data: guests } = await supabase
    .from('guests').select('id, first_name, last_name, guest_type').eq('wedding_id', wedding.id).order('first_name')
  const guestList = guests ?? []
  const guestNames = guestList.map(g => [g.first_name, g.last_name].filter(Boolean).join(' '))

  const { data: rawPhotos } = await supabase
    .from('photos')
    .select('*, photo_likes(id, liker_name), photo_comments(id, author_name, content, created_at)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const photos = (rawPhotos ?? []).map(p => ({
    id: p.id,
    url: p.url,
    uploaded_by_name: p.uploaded_by_name,
    moment_tag: p.moment_tag,
    tagged_guests: p.tagged_guests ?? [],
    created_at: p.created_at,
    likes: p.photo_likes?.length ?? 0,
    liked_by: p.photo_likes?.map((l: { liker_name: string }) => l.liker_name) ?? [],
    comments: p.photo_comments ?? [],
  }))

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <a href={`/invite/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-6">Photos</h1>

        {/* Upload */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Partager une photo</h2>
          <form action={uploadPhoto} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="uploader_name" value={guestName} />
            {moments.length > 0 && (
              <select name="moment_tag"
                className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300, fontSize: '0.9rem' }}>
                <option value="">Quel moment ?</option>
                {moments.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
            {guestList.length > 0 && (
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                   className="text-stone-400 uppercase mb-2">Qui voit-on ? (séparé par virgules)</p>
                <input
                  type="text"
                  name="tagged_guests_raw"
                  list="guest-suggestions"
                  placeholder="Ex: Marie Dupont, Jean Martin…"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
                  style={{ fontWeight: 300 }}
                />
                <datalist id="guest-suggestions">
                  {guestList.map(g => (
                    <option key={g.id} value={`${g.first_name} ${g.last_name ?? ''}`.trim()} />
                  ))}
                </datalist>
              </div>
            )}
            <input type="file" name="photo" accept="image/*" required multiple
              className="w-full border border-stone-200 rounded-xl px-4 py-2 text-stone-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] transition"
              style={{ fontWeight: 300, fontSize: '0.85rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              Partager
            </button>
          </form>
        </div>

        <GuestPhotoFeed photos={photos} moments={moments} guestName={guestName} guestNames={guestNames} addLike={addLike} addComment={addComment} slug={slug} />
      </div>
    </div>
  )
}
