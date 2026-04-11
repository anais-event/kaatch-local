import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import PhotoGallery from './PhotoGallery'

async function uploadPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const uploader_name = (formData.get('uploader_name') as string) || 'Anonyme'
  const files = formData.getAll('photo') as File[]

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await Promise.all(files.map(async (file) => {
    if (!file || file.size === 0) return
    const ext = file.name.split('.').pop()
    const path = `${wedding.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('wedding-photos')
      .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })
    if (uploadError) return
    const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)
    await supabase.from('photos').insert({
      wedding_id: wedding.id,
      url: urlData.publicUrl,
      uploaded_by_name: uploader_name,
    })
  }))

  revalidatePath(`/wedding/${slug}/photos`)
}

async function deletePhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const photo_id = formData.get('photo_id') as string
  await supabase.from('photos').delete().eq('id', photo_id)
  revalidatePath(`/wedding/${slug}/photos`)
}

export default async function PhotosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: rawPhotos } = await supabase
    .from('photos')
    .select('*, photo_likes(id)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const photos = (rawPhotos ?? []).map(p => ({
    id: p.id,
    url: p.url,
    uploader_name: p.uploaded_by_name,
    created_at: p.created_at,
    likes: p.photo_likes?.length ?? 0,
  }))

  return (
    <PhotoGallery
      slug={slug}
      weddingName={wedding.name}
      photos={photos}
      uploadPhoto={uploadPhoto}
      deletePhoto={deletePhoto}
    />
  )
}
