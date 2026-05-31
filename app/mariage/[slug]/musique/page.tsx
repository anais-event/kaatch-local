import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'
import MusiqueClient from './MusiqueClient'
import UpgradePrompt from '@/components/UpgradePrompt'
import { normalizePlan, canAccess } from '@/lib/plan'

async function addSong(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const moment = (formData.get('moment') as string) || null
  await supabase.from('playlist_songs').insert({
    wedding_id: wedding.id,
    moment: moment || null,
    title: formData.get('title') as string,
    artist: (formData.get('artist') as string) || null,
    notes: (formData.get('notes') as string) || null,
    song_url: (formData.get('song_url') as string) || null,
    position: Number(formData.get('position') ?? 0),
  })
  revalidatePath(`/mariage/${slug}/musique`)
}

async function deleteSong(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('playlist_songs').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/musique`)
}

async function updateSong(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const moment = (formData.get('moment') as string) || null
  await supabase.from('playlist_songs').update({
    title: formData.get('title') as string,
    artist: (formData.get('artist') as string) || null,
    notes: (formData.get('notes') as string) || null,
    song_url: (formData.get('song_url') as string) || null,
    moment: moment || null,
  }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/musique`)
}

async function addPlaylistLink(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('playlist_links').insert({
    wedding_id: wedding.id,
    name: (formData.get('name') as string) || 'Ma playlist',
    url: formData.get('url') as string,
    position: Number(formData.get('position') ?? 0),
  })
  revalidatePath(`/mariage/${slug}/musique`)
}

async function acceptSuggestion(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('playlist_songs').update({ suggested_by: null }).eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/musique`)
}

async function deletePlaylistLink(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('playlist_links').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/mariage/${formData.get('slug') as string}/musique`)
}

export default async function MusiquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings').select('id, name, plan').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const plan = normalizePlan(wedding.plan)
  if (!canAccess(plan, 'musique')) {
    return <UpgradePrompt feature="musique" currentPlan={plan} slug={slug} />
  }

  const [{ data: songs }, { data: playlistLinks }] = await Promise.all([
    supabase.from('playlist_songs').select('*').eq('wedding_id', wedding.id).order('position'),
    supabase.from('playlist_links').select('*').eq('wedding_id', wedding.id).order('position'),
  ])

  return (
    <MusiqueClient
      slug={slug}
      songs={songs ?? []}
      playlistLinks={playlistLinks ?? []}
      addSong={addSong}
      deleteSong={deleteSong}
      updateSong={updateSong}
      addPlaylistLink={addPlaylistLink}
      deletePlaylistLink={deletePlaylistLink}
      acceptSuggestion={acceptSuggestion}
    />
  )
}
