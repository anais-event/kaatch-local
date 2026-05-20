import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'

export default async function VendorInvitesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}

  if (!hasPermission(permissions, 'guest_names') && !hasPermission(permissions, 'guest_allergies')) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-3">Accès non autorisé</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-500">
            Les mariés ne vous ont pas donné accès à la liste des invités.
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

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, guest_type, rsvp_status, dietary_restrictions, dietary_notes, table_id')
    .eq('wedding_id', wedding.id)
    .order('last_name', { ascending: true })

  const all = guests ?? []

  // Fetch table names
  const tableIds = [...new Set(all.map(g => g.table_id).filter(Boolean))]
  let tableMap: Record<string, string> = {}
  if (tableIds.length > 0) {
    const { data: tableRows } = await supabase
      .from('seating_tables')
      .select('id, name')
      .in('id', tableIds)
    for (const t of tableRows ?? []) tableMap[t.id] = t.name
  }

  const weddingDate = wedding.date ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null

  // Stats
  const totalGuests = all.length
  const confirmedCount = all.filter(g => g.rsvp_status === 'confirmed' || g.rsvp_status === 'present').length
  const typeCounts: Record<string, number> = {}
  for (const g of all) {
    const type = g.guest_type || 'Adulte'
    typeCounts[type] = (typeCounts[type] ?? 0) + 1
  }
  const withRestrictions = all.filter(g => g.dietary_restrictions || g.dietary_notes)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          ← Retour au tableau de bord
        </a>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                className="text-[#2d3228] mb-1">Liste des invités</h1>
            {weddingDate && (
              <p className="text-stone-400" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
                📅 {weddingDate}
              </p>
            )}
          </div>
          <button
            onClick={undefined}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition print:hidden"
            style={{ fontWeight: 400 }}
            data-print="true"
          >
            🖨️ Imprimer
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:grid-cols-4">
          <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-center">
            <p className="text-2xl text-[#2d3228]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{totalGuests}</p>
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>Total</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-center">
            <p className="text-2xl text-emerald-600" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{confirmedCount}</p>
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>Confirmés</p>
          </div>
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-center">
              <p className="text-2xl text-[#4a5240]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{count}</p>
              <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{type}</p>
            </div>
          ))}
        </div>

        {/* Main table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left px-4 py-3 text-stone-500" style={{ fontWeight: 400, fontSize: '0.78rem' }}>Nom</th>
                <th className="text-left px-4 py-3 text-stone-500" style={{ fontWeight: 400, fontSize: '0.78rem' }}>Type</th>
                <th className="text-left px-4 py-3 text-stone-500" style={{ fontWeight: 400, fontSize: '0.78rem' }}>Statut</th>
                {hasPermission(permissions, 'guest_allergies') && (
                  <th className="text-left px-4 py-3 text-stone-500" style={{ fontWeight: 400, fontSize: '0.78rem' }}>Restrictions</th>
                )}
                {hasPermission(permissions, 'seating_plan') && (
                  <th className="text-left px-4 py-3 text-stone-500" style={{ fontWeight: 400, fontSize: '0.78rem' }}>Table</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {all.map((g, i) => {
                const name = [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' ')
                const restriction = [g.dietary_restrictions, g.dietary_notes].filter(Boolean).join(' — ')
                const tableName = g.table_id ? tableMap[g.table_id] : null
                const statusMap: Record<string, { label: string; cls: string }> = {
                  confirmed: { label: 'Confirmé', cls: 'text-emerald-600 bg-emerald-50' },
                  present: { label: 'Présent', cls: 'text-emerald-600 bg-emerald-50' },
                  declined: { label: 'Décliné', cls: 'text-red-400 bg-red-50' },
                  absent: { label: 'Absent', cls: 'text-red-400 bg-red-50' },
                }
                const status = statusMap[g.rsvp_status] ?? { label: 'En attente', cls: 'text-amber-500 bg-amber-50' }
                return (
                  <tr key={g.id ?? i} className="hover:bg-stone-50/30 transition">
                    <td className="px-4 py-2.5 text-[#2d3228]" style={{ fontWeight: 400 }}>{name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>{g.guest_type || 'Adulte'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${status.cls}`} style={{ fontWeight: 300 }}>
                        {status.label}
                      </span>
                    </td>
                    {hasPermission(permissions, 'guest_allergies') && (
                      <td className="px-4 py-2.5">
                        {restriction ? (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                            {restriction}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>—</span>
                        )}
                      </td>
                    )}
                    {hasPermission(permissions, 'seating_plan') && (
                      <td className="px-4 py-2.5">
                        {tableName ? (
                          <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>{tableName}</span>
                        ) : (
                          <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {all.length === 0 && (
            <div className="py-12 text-center">
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300 }}
                 className="text-stone-300">Aucun invité</p>
            </div>
          )}
        </div>

        {/* Dietary summary */}
        {hasPermission(permissions, 'guest_allergies') && withRestrictions.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
                className="text-[#2d3228] mb-3">Récapitulatif restrictions alimentaires</h2>
            <div className="space-y-2">
              {withRestrictions.map((g, i) => {
                const name = [g.first_name, g.last_name].filter(v => v && v !== 'null').join(' ')
                const info = [g.dietary_restrictions, g.dietary_notes].filter(Boolean).join(' — ')
                const tableName = g.table_id ? tableMap[g.table_id] : null
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-[#2d3228] w-36 truncate" style={{ fontWeight: 400 }}>{name}</span>
                    <span className="text-orange-600 flex-1" style={{ fontWeight: 300 }}>{info}</span>
                    {tableName && (
                      <span className="text-[11px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full shrink-0" style={{ fontWeight: 300 }}>
                        {tableName}
                      </span>
                    )}
                    <span className="text-[11px] text-stone-400 shrink-0" style={{ fontWeight: 300 }}>{g.guest_type || 'Adulte'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
