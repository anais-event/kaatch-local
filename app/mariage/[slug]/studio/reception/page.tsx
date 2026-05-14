import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ReceptionClient from './ReceptionClient'

export default async function ReceptionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name, date, location').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const [
    { data: steps },
    { data: tables },
  ] = await Promise.all([
    supabase.from('programme_steps').select('id, title, time, description').eq('wedding_id', wedding.id).order('position'),
    supabase.from('seating_tables').select('id, name, capacity').eq('wedding_id', wedding.id).order('name'),
  ])

  // Invités par table
  const tableIds = (tables ?? []).map(t => t.id)
  const { data: assignments } = tableIds.length > 0
    ? await supabase.from('table_guests')
        .select('table_id, guests(first_name, last_name)')
        .in('table_id', tableIds)
    : { data: [] }

  return (
    <ReceptionClient
      slug={slug}
      weddingName={wedding.name ?? ''}
      weddingDate={wedding.date ?? null}
      weddingLocation={wedding.location ?? null}
      programmeSteps={steps ?? []}
      tables={(tables ?? []).map(t => ({
        ...t,
        guests: (assignments ?? [])
          .filter(a => a.table_id === t.id)
          .map(a => {
            const g = a.guests as { first_name: string; last_name: string } | null
            return g ? [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' ') : ''
          })
          .filter(Boolean),
      }))}
    />
  )
}
