import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import GuestPhotoFeed from './GuestPhotoFeed'

async function addLike(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('photo_likes').insert({
    photo_id: formData.get('photo_id') as string,
    liker_name: formData.get('liker_name') as string,
  })
  revalidatePath(`/invité/${formData.get('slug')}/photos`)
}

async function addComment(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('photo_comments').insert({
    photo_id: formData.get('photo_id') as string,
    author_name: formData.get('author_name') as string,
    content: formData.get('content') as string,
  })
  revalidatePath(`/invité/${formData.get('slug')}/photos`)
}

async function uploadPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const uploader_name = formData.get('uploader_name') as string
  const moment_tag = (formData.get('moment_tag') as string) || null
  const tagged_guests = formData.getAll('tagged_guests') as string[]
  const file = formData.get('photo') as File

  if (!file || file.size === 0) return

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const ext = file.name.split('.').pop()
  const path = `${wedding.id}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('wedding-photos')
    .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })

  if (error) return

  const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)

  await supabase.from('photos').insert({
    wedding_id: wedding.id,
    url: urlData.publicUrl,
    uploader_name,
    moment_tag,
    tagged_guests: tagged_guests.length > 0 ? tagged_guests : null,
  })

  revalidatePath(`/invité/${slug}/photos`)
}

export default async function GuestPhotosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  if (!guestCookie) redirect(`/invité/${slug}`)

  const guest = JSON.parse(guestCookie.value)
  const guestName = `${guest.firstName} ${guest.lastName}`

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: steps } = await supabase
    .from('program_steps').select('title').eq('wedding_id', wedding.id).order('position')
  const moments = steps?.map(s => s.title) ?? []

  const { data: guests } = await supabase
    .from('guests').select('id, first_name, last_name, guest_type').eq('wedding_id', wedding.id).order('first_name')
  const guestList = guests ?? []

  const { data: rawPhotos } = await supabase
    .from('photos')
    .select('*, photo_likes(id, liker_name), photo_comments(id, author_name, content, created_at)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const photos = (rawPhotos ?? []).map(p => ({
    id: p.id,
    url: p.url,
    uploader_name: p.uploader_name,
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
          <a href={`/invité/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem' }}
            className="text-[#2d3228] mb-6">Photos</h1>

        {/* Upload */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
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
                   className="text-stone-400 uppercase mb-2">Qui voit-on sur la photo ?</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {guestList.map(g => (
                    <label key={g.id}
                      className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:border-[#4a5240] transition has-[:checked]:bg-[#4a5240] has-[:checked]:border-[#4a5240] has-[:checked]:text-white">
                      <input type="checkbox" name="tagged_guests"
                        value={`${g.first_name} ${g.last_name}`} className="hidden" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 300 }}>
                        {g.guest_type === 'enfant' ? '👶' : g.guest_type === 'animal' ? '🐾' : ''} {g.first_name} {g.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <input type="file" name="photo" accept="image/*" required
              className="w-full border border-stone-200 rounded-xl px-4 py-2 text-stone-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] transition"
              style={{ fontWeight: 300, fontSize: '0.85rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              Partager
            </button>
          </form>
        </div>

        <GuestPhotoFeed photos={photos} moments={moments} guestName={guestName} addLike={addLike} addComment={addComment} slug={slug} />
      </div>
    </div>
  )
}
