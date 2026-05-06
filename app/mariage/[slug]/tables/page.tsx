import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import TablesClient from './TablesClient'
import RoomView from './RoomView'
import PageIntro from '../PageIntro'

async function createTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const weddingId = formData.get('wedding_id') as string
  const name = (formData.get('name') as string)?.trim()
  const capacity = parseInt(formData.get('capacity') as string) || 8
  if (!name) return
  const { count } = await supabase
    .from('seating_tables')
    .select('*', { count: 'exact', head: true })
    .eq('wedding_id', weddingId)
  await supabase.from('seating_tables').insert({ wedding_id: weddingId, name, capacity, position_order: (count ?? 0) + 1 })
  revalidatePath(`/mariage/${slug}/tables`)
}

async function deleteTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  // Désassigner les invités de cette table
  await supabase.from('guests').update({ table_id: null }).eq('table_id', id)
  await supabase.from('seating_tables').delete().eq('id', id)
  revalidatePath(`/mariage/${slug}/tables`)
}

async function assignGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const guestId = formData.get('guest_id') as string
  const tableId = formData.get('table_id') as string || null
  await supabase.from('guests').update({ table_id: tableId }).eq('id', guestId)
  revalidatePath(`/mariage/${slug}/tables`)
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
  revalidatePath(`/mariage/${slug}/tables`)
}

type Tab = 'brouillon' | 'salle'

export default async function TablesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab: tabParam = 'brouillon' } = await searchParams
  const tab: Tab = tabParam === 'salle' ? 'salle' : 'brouillon'
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

  const visibleGuests = (guests ?? []).filter(g => g.rsvp_status !== 'decline')

  const TABS = [
    { key: 'brouillon' as Tab, label: 'Brouillon' },
    { key: 'salle'     as Tab, label: 'Vue salle' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
      <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
         style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        ← Retour aux préparatifs
      </a>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 style={{ fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-lato)' }}
              className="text-[#2d3228]">
            Plan de table
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.75rem', fontFamily: 'var(--font-lato)' }} className="text-stone-400 mt-0.5">
            {visibleGuests.filter(g => g.table_id).length} placés · {visibleGuests.filter(g => !g.table_id).length} à placer
          </p>
        </div>
      </div>

      <div className="flex border-b border-stone-100 mb-6">
        {TABS.map(t => (
          <a key={t.key}
             href={`?tab=${t.key}`}
             className={`px-4 py-2.5 text-sm transition-all border-b-2 -mb-px ${
               tab === t.key
                 ? 'border-[#4a5240] text-[#2d3228]'
                 : 'border-transparent text-stone-400 hover:text-stone-500'
             }`}
             style={{ fontWeight: tab === t.key ? 500 : 300, fontSize: '0.82rem', fontFamily: 'var(--font-lato)' }}>
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'brouillon' && (
        <>
          <PageIntro
            what="Répartissez vos invités confirmés dans des tables nommées. Chaque table a une capacité définie pour éviter les oublis."
            how="Créez vos tables (nom + capacité), sélectionnez une table à gauche, puis cliquez sur Ajouter pour y placer un invité."
            guests="Les invités ne voient pas le plan de table — uniquement un outil d'organisation pour les mariés."
          />
          <TablesClient
            slug={slug}
            weddingId={wedding.id}
            weddingName={wedding.name}
            tables={tables ?? []}
            guests={visibleGuests}
            createTable={createTable}
            deleteTable={deleteTable}
            assignGuest={assignGuest}
            updateTableName={updateTableName}
          />
        </>
      )}

      {tab === 'salle' && (
        <RoomView
          tables={tables ?? []}
          guests={visibleGuests}
        />
      )}
    </div>
  )
}
