import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import CollectionClient from './CollectionClient'
import { saveStudioModule } from '../studio-actions'

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">{t('notFound')}</div>

  const [
    { count: guestCount },
    { count: tableCount },
    { data: guestNames },
    { data: studioData },
  ] = await Promise.all([
    supabase.from('guests').select('id', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('seating_tables').select('id', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('last_name').eq('wedding_id', wedding.id),
    supabase.from('studio_progress').select('module_collection').eq('wedding_id', wedding.id).single(),
  ])

  const familleCount = new Set((guestNames ?? []).map(g => g.last_name || 'solo')).size
  const weddingId = wedding.id

  async function onSave(data: unknown, progress: number) {
    'use server'
    await saveStudioModule(weddingId, slug, 'collection', data, progress)
  }

  return (
    <CollectionClient
      slug={slug}
      weddingName={wedding.name ?? ''}
      guestCount={guestCount ?? 0}
      familleCount={familleCount}
      tableCount={tableCount ?? 0}
      savedData={studioData?.module_collection ?? null}
      onSave={onSave}
    />
  )
}
