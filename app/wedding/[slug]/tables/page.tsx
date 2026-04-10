import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import SeatingBoard from './SeatingBoard'

async function createTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const name = formData.get('name') as string
  const capacity = parseInt(formData.get('capacity') as string) || 8
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding || !name.trim()) return
  await supabase.from('wedding_tables').insert({ wedding_id: wedding.id, name: name.trim(), capacity })
  revalidatePath(`/wedding/${slug}/tables`)
}

async function deleteTable(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  // Désassigner les invités d'abord
  await supabase.from('guests').update({ table_id: null }).eq('table_id', id)
  await supabase.from('wedding_tables').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function assignGuest(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const guestId = formData.get('guest_id') as string
  const tableId = formData.get('table_id') as string | null
  await supabase.from('guests').update({ table_id: tableId || null }).eq('id', guestId)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function toggleReveal(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const current = formData.get('current') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const newVal = current ? null : new Date().toISOString()
  await supabase.from('weddings').update({ tables_revealed_at: newVal }).eq('id', wedding.id)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function updateRevealDate(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const datetime = formData.get('datetime') as string
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('weddings').update({ tables_revealed_at: datetime ? new Date(datetime).toISOString() : null }).eq('id', wedding.id)
  revalidatePath(`/wedding/${slug}/tables`)
}

async function updateTableName(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const capacity = parseInt(formData.get('capacity') as string) || 8
  await supabase.from('wedding_tables').update({ name: name.trim(), capacity }).eq('id', id)
  revalidatePath(`/wedding/${slug}/tables`)
}

export default async function TablesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, tables_revealed_at')
    .eq('slug', slug)
    .single()

  if (!wedding) redirect(`/wedding/${slug}`)

  const { data: tables } = await supabase
    .from('wedding_tables')
    .select('id, name, capacity')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, table_id, guest_type, rsvp_status')
    .eq('wedding_id', wedding.id)
    .order('last_name', { ascending: true })

  const totalSeats = (tables ?? []).reduce((s, t) => s + t.capacity, 0)
  const assignedCount = (guests ?? []).filter(g => g.table_id).length
  const unassignedGuests = (guests ?? []).filter(g => !g.table_id)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
               className="text-stone-400 uppercase mb-1">Plan de table</p>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
                className="text-[#2d3228] leading-none">{wedding.name}</h1>
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mt-1">
              {assignedCount} placé{assignedCount > 1 ? 's' : ''} · {unassignedGuests.length} sans table · {totalSeats} places au total
            </p>
          </div>

          {/* Révélation aux invités */}
          <div className="bg-white rounded-xl border border-stone-100 px-5 py-4 sm:min-w-[280px]">
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.16em' }}
               className="text-stone-400 uppercase mb-2">Visible par les invités</p>
            {wedding.tables_revealed_at ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-emerald-600">
                    {new Date(wedding.tables_revealed_at) <= new Date()
                      ? 'Révélé maintenant'
                      : `Révélé le ${new Date(wedding.tables_revealed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${new Date(wedding.tables_revealed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                    }
                  </p>
                </div>
                <form action={toggleReveal} className="inline">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="current" value={wedding.tables_revealed_at} />
                  <button type="submit"
                    className="text-xs text-red-400 hover:text-red-500 transition cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    Masquer aux invités
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" />
                  <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400">Non révélé</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <form action={toggleReveal} className="inline">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="current" value="" />
                    <button type="submit"
                      className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      Révéler maintenant
                    </button>
                  </form>
                  <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300">ou</span>
                  <form action={updateRevealDate} className="flex gap-1.5 items-center">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="datetime-local" name="datetime"
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1 outline-none focus:border-[#4a5240] transition bg-white text-stone-600"
                      style={{ fontWeight: 300 }} />
                    <button type="submit"
                      className="text-xs text-[#4a5240] border border-[#4a5240]/40 px-2.5 py-1 rounded-lg hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      Programmer
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Board interactif */}
        <SeatingBoard
          slug={slug}
          tables={tables ?? []}
          guests={guests ?? []}
          unassignedGuests={unassignedGuests}
          createTable={createTable}
          deleteTable={deleteTable}
          assignGuest={assignGuest}
          updateTableName={updateTableName}
        />

      </div>
    </div>
  )
}
