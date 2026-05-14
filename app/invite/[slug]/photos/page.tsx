import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import GuestPhotoFeed from './GuestPhotoFeed'
import MarkPhotosSeen from './MarkPhotosSeen'
import { notifyCouple } from '@/lib/email/notify-couple'

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

async function claimPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const photo_id = formData.get('photo_id') as string
  const new_name = (formData.get('new_name') as string)?.trim()
  if (!new_name) return
  const { data: photo } = await supabase.from('photos').select('uploaded_by_name').eq('id', photo_id).single()
  const current = photo?.uploaded_by_name
  // Autoriser si la photo est anonyme ou si c'est déjà ce nom
  const isAnonymous = !current || current === 'Anonyme'
  const isOwn = current === new_name
  if (isAnonymous || isOwn) {
    await supabase.from('photos').update({ uploaded_by_name: new_name }).eq('id', photo_id)
    revalidatePath(`/invite/${slug}/photos`)
  }
}

async function deletePhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const photo_id = formData.get('photo_id') as string
  const uploader_name = formData.get('uploader_name') as string
  // Vérifier que c'est bien la photo de cet invité
  const { data: photo } = await supabase.from('photos').select('uploaded_by_name').eq('id', photo_id).single()
  if (photo?.uploaded_by_name === uploader_name) {
    await supabase.from('photos').delete().eq('id', photo_id)
  }
  revalidatePath(`/invite/${slug}/photos`)
}

async function uploadPhoto(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const uploader_name = formData.get('uploader_name') as string
  const files = formData.getAll('photo') as File[]

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  await Promise.all(files.map(async (file, i) => {
    if (!file || file.size === 0) return
    const moment_tag = (formData.get(`moment_tag_${i}`) as string) || null
    const tagged_raw = (formData.get(`tagged_guests_raw_${i}`) as string) || ''
    const tagged_guests = tagged_raw.split(',').map((s: string) => s.trim()).filter(Boolean)
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
      moment_tag: moment_tag,
      tagged_guests: tagged_guests.length > 0 ? tagged_guests : null,
    })
  }))

  revalidatePath(`/invite/${slug}/photos`)

  // Notification email couple
  const { data: w } = await supabase
    .from('weddings')
    .select('name, slug, notification_prefs, notification_email, user_id')
    .eq('slug', slug).single()
  if (w) {
    const prefs = (w.notification_prefs ?? {}) as Record<string, boolean>
    if (prefs.new_photo) {
      const toEmail = w.notification_email || null
      if (toEmail) {
        notifyCouple({ to: toEmail, weddingName: w.name ?? '', slug, type: 'new_photo', data: { guestName: uploader_name } }).catch(() => {})
      }
    }
  }
}

export default async function GuestPhotosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: "", lastName: "", id: null }
  const guestName = [guest.firstName, guest.lastName].filter(v => v && v !== 'null').join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: steps } = await supabase
    .from('program_steps').select('title').eq('wedding_id', wedding.id).order('position')
  const moments = steps?.map(s => s.title) ?? []

  const { data: guests } = await supabase
    .from('guests').select('id, first_name, last_name, guest_type').eq('wedding_id', wedding.id).order('first_name')
  const guestList = guests ?? []
  const guestNames = guestList.map(g => [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '))

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
    <>
    <MarkPhotosSeen slug={slug} />
    <GuestPhotoFeed
      photos={photos}
      moments={moments}
      guestName={guestName}
      guestNames={guestNames}
      addLike={addLike}
      addComment={addComment}
      uploadPhoto={uploadPhoto}
      deletePhoto={deletePhoto}
      claimPhoto={claimPhoto}
      slug={slug}
    />
    </>
  )
}
