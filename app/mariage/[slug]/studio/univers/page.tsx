import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UniversClient from './UniversClient'

export default async function UniversPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  return <UniversClient slug={slug} weddingName={wedding.name ?? ''} />
}
