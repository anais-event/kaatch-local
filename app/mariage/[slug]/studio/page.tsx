import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import StudioWedding from './StudioWedding'

function cleanName(n: string | null | undefined): string {
  if (!n) return ''
  return n.split(' ').filter(p => p && p !== 'null').join(' ')
}

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

  const [
    { data: guests },
    { data: tables },
  ] = await Promise.all([
    supabase.from('guests').select('first_name, last_name').eq('wedding_id', wedding.id),
    supabase.from('seating_tables').select('name').eq('wedding_id', wedding.id).order('position'),
  ])

  const guestNames = (guests ?? []).map(g => [cleanName(g.first_name), cleanName(g.last_name)].filter(Boolean).join(' ')).filter(Boolean)
  const tableNames = (tables ?? []).map(t => t.name).filter(Boolean)

  return (
    <StudioWedding
      slug={slug}
      weddingName={wedding.name ?? ''}
      weddingDate={wedding.date}
      weddingLocation={wedding.location}
      guestNames={guestNames}
      tableNames={tableNames}
    />
  )
}
