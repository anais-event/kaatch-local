import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding, error } = await supabase
    .from('weddings')
    .select('slug')
    .eq('couple_id', user.id)
    .single()

  console.log('USER ID:', user.id)
  console.log('WEDDING:', wedding)
  console.log('ERROR:', error)

  if (wedding) {
    redirect(`/wedding/${wedding.slug}`)
  }

  redirect('/dashboard/new-wedding')
}
