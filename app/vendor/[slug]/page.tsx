import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'
import VendorDashboardClient from './VendorDashboardClient'

export default async function VendorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Fetch all data based on permissions
  let guestCount = 0
  let confirmedCount = 0
  let pendingCount = 0
  let declinedCount = 0
  let guestNames: { name: string; rsvp: string }[] = []
  let dietaryInfo: { name: string; info: string; table: string | null }[] = []
  let menuBreakdown: { type: string; count: number }[] = []
  let programSteps: { title: string; time: string; location: string; description: string }[] = []
  let songs: { title: string; artist: string; moment: string }[] = []
  let tables: { name: string; capacity: number; guests: string[] }[] = []

  if (hasPermission(permissions, 'guest_count') || hasPermission(permissions, 'guest_names') || hasPermission(permissions, 'guest_allergies')) {
    const { data: guests } = await supabase
      .from('guests')
      .select('first_name, last_name, rsvp_status, guest_type, dietary_restrictions, dietary_notes, table_id')
      .eq('wedding_id', wedding.id)

    const all = guests ?? []
    guestCount = all.length
    confirmedCount = all.filter(g => g.rsvp_status === 'confirmed' || g.rsvp_status === 'present').length
    pendingCount = all.filter(g => !g.rsvp_status || g.rsvp_status === 'pending').length
    declinedCount = all.filter(g => g.rsvp_status === 'declined' || g.rsvp_status === 'absent').length

    if (hasPermission(permissions, 'guest_names')) {
      guestNames = all.map(g => ({
        name: [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '),
        rsvp: g.rsvp_status ?? 'pending',
      })).filter(g => g.name)
    }

    if (hasPermission(permissions, 'guest_allergies')) {
      // Menu breakdown by guest_type
      const typeCounts: Record<string, number> = {}
      for (const g of all) {
        const type = g.guest_type || 'Adulte'
        typeCounts[type] = (typeCounts[type] ?? 0) + 1
      }
      menuBreakdown = Object.entries(typeCounts).map(([type, count]) => ({ type, count }))

      // Fetch table names for cross-referencing
      const tableIds = [...new Set(all.map(g => g.table_id).filter(Boolean))]
      let tableMap: Record<string, string> = {}
      if (tableIds.length > 0) {
        const { data: tableRows } = await supabase
          .from('seating_tables')
          .select('id, name')
          .in('id', tableIds)
        for (const t of tableRows ?? []) tableMap[t.id] = t.name
      }

      // Dietary restrictions detail with table assignment
      dietaryInfo = all
        .filter(g => g.dietary_restrictions || g.dietary_notes)
        .map(g => ({
          name: [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '),
          info: [g.dietary_restrictions, g.dietary_notes].filter(Boolean).join(' — '),
          table: g.table_id ? (tableMap[g.table_id] ?? null) : null,
        }))
    }
  }

  if (hasPermission(permissions, 'programme')) {
    const { data } = await supabase
      .from('program_steps')
      .select('title, time, address, description')
      .eq('wedding_id', wedding.id)
      .order('position', { ascending: true })
    programSteps = (data ?? []).map(s => ({ title: s.title, time: s.time, description: s.description ?? '', location: s.address ?? '' }))
  }

  if (hasPermission(permissions, 'playlist')) {
    const { data } = await supabase
      .from('playlist_songs')
      .select('title, artist, moment')
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: true })
    songs = (data ?? []).map(s => ({ ...s, moment: s.moment ?? '' }))
  }

  if (hasPermission(permissions, 'seating_plan')) {
    const { data: tablesData } = await supabase
      .from('seating_tables')
      .select('id, name, capacity')
      .eq('wedding_id', wedding.id)
      .order('name')

    if (tablesData && tablesData.length > 0) {
      const { data: seatedGuests } = await supabase
        .from('guests')
        .select('first_name, last_name, table_id')
        .eq('wedding_id', wedding.id)
        .not('table_id', 'is', null)

      tables = tablesData.map(t => ({
        name: t.name,
        capacity: t.capacity,
        guests: (seatedGuests ?? [])
          .filter(g => g.table_id === t.id)
          .map(g => [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' '))
          .filter(Boolean),
      }))
    }
  }

  const weddingDate = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <VendorDashboardClient
      slug={slug}
      vendor={vendor}
      wedding={{ name: wedding.name, date: weddingDate, location: wedding.location }}
      permissions={permissions}
      data={{
        guestCount,
        confirmedCount,
        pendingCount,
        declinedCount,
        guestNames,
        dietaryInfo,
        menuBreakdown,
        programSteps,
        songs,
        tables,
      }}
    />
  )
}
