import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CollectionClient from './CollectionClient'

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const [
    { count: guestCount },
    { count: tableCount },
    { count: programmeCount },
  ] = await Promise.all([
    supabase.from('guests').select('id', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('seating_tables').select('id', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('programme_steps').select('id', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
  ])

  // Nombre de foyers (invités uniques par nom de famille)
  const { data: guestNames } = await supabase
    .from('guests').select('last_name').eq('wedding_id', wedding.id)
  const foyerCount = new Set((guestNames ?? []).map(g => g.last_name || 'solo')).size

  return (
    <CollectionClient
      slug={slug}
      weddingName={wedding.name ?? ''}
      guestCount={guestCount ?? 0}
      foyerCount={foyerCount}
      tableCount={tableCount ?? 0}
      programmeCount={programmeCount ?? 0}
    />
  )
}
