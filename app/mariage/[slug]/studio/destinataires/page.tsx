import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DestinatairesClient from './DestinatairesClient'
import { saveStudioModule } from '../studio-actions'

export default async function DestinatairesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, slug, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const [
    { data: guests },
    { data: studioData },
  ] = await Promise.all([
    supabase.from('guests').select('id, first_name, last_name, guest_type, rsvp_status')
      .eq('wedding_id', wedding.id).order('last_name').order('first_name'),
    supabase.from('studio_progress').select('module_destinataires').eq('wedding_id', wedding.id).single(),
  ])

  const weddingId = wedding.id

  async function onSave(data: unknown, progress: number) {
    'use server'
    await saveStudioModule(weddingId, slug, 'destinataires', data, progress)
  }

  return (
    <DestinatairesClient
      slug={slug}
      weddingName={wedding.name ?? ''}
      guests={guests ?? []}
      savedData={studioData?.module_destinataires ?? null}
      onSave={onSave}
    />
  )
}
