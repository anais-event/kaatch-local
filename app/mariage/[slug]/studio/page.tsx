import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import StudioDashboard from './StudioDashboard'

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, name, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const { count: guestCount } = await supabase
    .from('guests')
    .select('id', { count: 'exact', head: true })
    .eq('wedding_id', wedding.id)

  const { count: tableCount } = await supabase
    .from('tables')
    .select('id', { count: 'exact', head: true })
    .eq('wedding_id', wedding.id)

  // Progression par module (à implémenter avec studio_progress plus tard)
  const progress = {
    collection: 0,
    destinataires: 0,
    univers: 0,
    reception: 0,
  }

  return (
    <StudioDashboard
      slug={slug}
      weddingName={wedding.name ?? ''}
      guestCount={guestCount ?? 0}
      tableCount={tableCount ?? 0}
      progress={progress}
    />
  )
}
