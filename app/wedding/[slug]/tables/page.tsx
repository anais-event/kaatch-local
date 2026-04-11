import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import TablesClient from './TablesClient'

async function createTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const name = (formData.get('name') as string)?.trim()
  const capacity = parseInt(formData.get('capacity') as string) || 8
  if (!name) return
  await supabase.from('seating_tables').insert({ wedding_id: weddingId, name, capacity })
  revalidatePath(`/wedding/${slug}/tables`)
}

async function deleteTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  // Désassigner les invités de cette table
  await supabase.from('guests').update({ table_id: null }).eq('table_id', id)
  await supabase.from('seating_tables').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function assignGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const guestId = formData.get('guest_id') as string
  const tableId = formData.get('table_id') as string || null
  await supabase.from('guests').update({ table_id: tableId }).eq('id', guestId)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function updateTableName(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const capacity = parseInt(formData.get('capacity') as string) || 8
  if (!name) return
  await supabase.from('seating_tables').update({ name, capacity }).eq('id', id)
  revalidatePath(`/wedding/${slug}/tables`)
}

export default async function TablesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: tables }, { data: guests }] = await Promise.all([
    supabase
      .from('seating_tables')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('position_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('guests')
      .select('id, first_name, last_name, rsvp_status, table_id, relation, guest_type')
      .eq('wedding_id', wedding.id)
      .order('first_name'),
  ])

  return (
    <TablesClient
      slug={slug}
      weddingId={wedding.id}
      weddingName={wedding.name}
      tables={tables ?? []}
      guests={guests ?? []}
      createTable={createTable}
      deleteTable={deleteTable}
      assignGuest={assignGuest}
      updateTableName={updateTableName}
    />
  )
}
