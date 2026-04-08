import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import PhotoFeed from './PhotoFeed'

async function uploadPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const uploader_name = (formData.get('uploader_name') as string) || 'Anonyme'
  const moment_tag = (formData.get('moment_tag') as string) || null
  const file = formData.get('photo') as File

  if (!file || file.size === 0) return

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const ext = file.name.split('.').pop()
  const path = `${wedding.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('wedding-photos')
    .upload(path, file, { upsert: false })

  if (uploadError) return

  const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)

  await supabase.from('photos').insert({
    wedding_id: wedding.id,
    url: urlData.publicUrl,
    uploader_name,
    moment_tag,
  })

  revalidatePath(`/wedding/${slug}/photos`)
}

async function addLike(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const photo_id = formData.get('photo_id') as string
  const slug = formData.get('slug') as string
  await supabase.from('photo_likes').insert({ photo_id, liker_name: 'anonyme' })
  revalidatePath(`/wedding/${slug}/photos`)
}

async function addComment(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  await supabase.from('photo_comments').insert({
    photo_id: formData.get('photo_id') as string,
    author_name: formData.get('author_name') as string,
    content: formData.get('content') as string,
  })
  revalidatePath(`/wedding/${slug}/photos`)
}

export default async function PhotosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Récupérer les moments du programme
  const { data: steps } = await supabase
    .from('program_steps')
    .select('title')
    .eq('wedding_id', wedding.id)
    .order('position')

  const moments = steps?.map(s => s.title) ?? []

  // Récupérer les photos avec likes et commentaires
  const { data: rawPhotos } = await supabase
    .from('photos')
    .select('*, photo_likes(id), photo_comments(id, author_name, content, created_at)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const photos = (rawPhotos ?? []).map(p => ({
    id: p.id,
    url: p.url,
    uploader_name: p.uploader_name,
    moment_tag: p.moment_tag,
    created_at: p.created_at,
    likes: p.photo_likes?.length ?? 0,
    comments: p.photo_comments ?? [],
  }))

  // Lier le slug aux actions serveur
  const uploadPhotoWithSlug = uploadPhoto
  const addLikeWithSlug = async (fd: FormData) => {
    'use server'
    fd.append('slug', slug)
    return addLike(fd)
  }
  const addCommentWithSlug = async (fd: FormData) => {
    'use server'
    fd.append('slug', slug)
    return addComment(fd)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-6">
          Photos
        </h1>

        {/* Formulaire upload */}
        <div className="bg-white/80 rounded-3xl p-6 mb-8 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Partager une photo</h2>
          <form action={uploadPhotoWithSlug} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="uploader_name" placeholder="Votre prénom"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              {moments.length > 0 ? (
                <select name="moment_tag"
                  className="border border-stone-200 rounded-xl px-4 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
                  <option value="">Quel moment ?</option>
                  {moments.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input type="text" name="moment_tag" placeholder="Quel moment ? (optionnel)"
                  className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              )}
            </div>
            <input type="file" name="photo" accept="image/*" required
              className="w-full border border-stone-200 rounded-xl px-4 py-2 text-stone-500 bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-[#f5f0e8] file:text-[#4a5240] hover:file:bg-stone-200 transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              Partager
            </button>
          </form>
        </div>

        {/* Feed */}
        <PhotoFeed
          photos={photos}
          moments={moments}
          addLike={addLikeWithSlug}
          addComment={addCommentWithSlug}
        />
      </div>
    </div>
  )
}
