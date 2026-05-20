import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'
import VendorTablesClient from './VendorTablesClient'

export default async function VendorTablesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}

  if (!hasPermission(permissions, 'seating_plan')) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-3">Accès non autorisé</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-500">
            Les mariés ne vous ont pas donné accès au plan de table.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: tablesData } = await supabase
    .from('seating_tables')
    .select('id, name, capacity')
    .eq('wedding_id', wedding.id)
    .order('name')

  const { data: allGuests } = await supabase
    .from('guests')
    .select('first_name, last_name, guest_type, dietary_restrictions, dietary_notes, table_id')
    .eq('wedding_id', wedding.id)

  const weddingDate = wedding.date ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <VendorTablesClient
      slug={slug}
      weddingDate={weddingDate}
      tables={(tablesData ?? []).map(t => ({ id: t.id, name: t.name, capacity: t.capacity }))}
      guests={(allGuests ?? []).map(g => ({
        name: [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '),
        type: g.guest_type || 'Adulte',
        restriction: [g.dietary_restrictions, g.dietary_notes].filter(Boolean).join(' — '),
        tableId: g.table_id,
      }))}
    />
  )
}
