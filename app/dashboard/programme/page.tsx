import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ProgrammeClient from './ProgrammeClient'

export default async function ProgrammePage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!wedding) redirect('/dashboard/new-wedding')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('position')

  return <ProgrammeClient wedding={wedding} initialEvents={events || []} />
}
