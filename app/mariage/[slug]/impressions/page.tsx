import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ImpressionsClient from './ImpressionsClient'

export default async function ImpressionsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Récupération du mariage avec vérification d'accès
  const { data: wedding, error: wError } = await supabase
    .from('weddings')
    .select('id, slug, name, date, location, user_id')
    .eq('slug', slug)
    .single()

  if (wError || !wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  if (user.id !== wedding.user_id) {
    redirect('/dashboard')
  }

  // Récupération des invités avec leur numéro de table
  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, table_number')
    .eq('wedding_id', wedding.id)
    .order('last_name')

  return (
    <ImpressionsClient
      wedding={{
        slug: wedding.slug,
        name: wedding.name ?? '',
        date: wedding.date ?? null,
        location: wedding.location ?? null,
        bride_name: null,
        groom_name: null,
      }}
      guests={guests ?? []}
      userEmail={user.email ?? ''}
    />
  )
}
