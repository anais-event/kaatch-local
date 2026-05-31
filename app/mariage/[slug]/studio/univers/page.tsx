import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import UniversClient from './UniversClient'
import { saveStudioModule } from '../studio-actions'

export default async function UniversPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">{t('notFound')}</div>

  const { data: studioData } = await supabase
    .from('studio_progress').select('module_univers').eq('wedding_id', wedding.id).single()

  const weddingId = wedding.id

  async function onSave(data: unknown, progress: number) {
    'use server'
    await saveStudioModule(weddingId, slug, 'univers', data, progress)
  }

  return (
    <UniversClient
      slug={slug}
      weddingName={wedding.name ?? ''}
      savedData={studioData?.module_univers ?? null}
      onSave={onSave}
    />
  )
}
