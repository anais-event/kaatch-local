import { createSupabaseServerClient } from '@/lib/supabase-server'
import { toDateLocale } from '@/lib/locale-map'
import { getTranslations, getLocale } from 'next-intl/server'
import PrintButton from './PrintButton'

export default async function TablesRecapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const [{ data: tables }, { data: guests }] = await Promise.all([
    supabase
      .from('seating_tables')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('position_order')
      .order('created_at'),
    supabase
      .from('guests')
      .select('id, first_name, last_name, relation, rsvp_status, guest_type, table_id')
      .eq('wedding_id', wedding.id)
      .order('first_name'),
  ])

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString(toDateLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const unassigned = (guests ?? []).filter(g => !g.table_id)
  const totalGuests = (guests ?? []).length
  const totalSeated = totalGuests - unassigned.length

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Barre d'action (masquée à l'impression) */}
      <div className="print:hidden bg-white border-b border-stone-100 px-6 py-3 flex items-center justify-between">
        <a href={`/mariage/${slug}/tables`}
           className="text-sm text-stone-500 hover:text-[#4a5240] transition"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          ← Retour au plan de table
        </a>
        <PrintButton />
      </div>

      {/* Document imprimable */}
      <div className="max-w-3xl mx-auto px-8 py-10 print:px-6 print:py-8">

        {/* En-tête */}
        <div className="text-center mb-10 pb-8 border-b border-stone-200">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2" style={{ fontWeight: 300 }}>
            Plan de table
          </p>
          <h1 className="text-4xl text-[#2d3228] mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontStyle: 'italic' }}>
            Mariage de {wedding.name}
          </h1>
          {dateFormatted && (
            <p className="text-stone-400 text-sm capitalize" style={{ fontWeight: 300 }}>{dateFormatted}</p>
          )}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-light text-[#4a5240]">{totalGuests}</p>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5" style={{ fontWeight: 300 }}>invités</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-[#4a5240]">{(tables ?? []).length}</p>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5" style={{ fontWeight: 300 }}>tables</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-light text-[#4a5240]">{totalSeated}</p>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5" style={{ fontWeight: 300 }}>placés</p>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
          {(tables ?? []).map(table => {
            const tableGuests = (guests ?? []).filter(g => g.table_id === table.id)
            const isFull = tableGuests.length >= table.capacity
            return (
              <div key={table.id} className="border border-stone-200 rounded-xl overflow-hidden break-inside-avoid">
                {/* En-tête de table */}
                <div className="bg-[#4a5240] px-5 py-3 flex items-center justify-between">
                  <div>
                    {table.position_order > 0 && (
                      <p className="text-white/50 text-xs tracking-widest uppercase mb-0.5" style={{ fontWeight: 300 }}>
                        N°{table.position_order}
                      </p>
                    )}
                    <h2 className="text-white text-lg font-light italic">{table.name}</h2>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isFull ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-white/70'
                  }`} style={{ fontWeight: 300 }}>
                    {tableGuests.length} / {table.capacity}
                  </span>
                </div>
                {/* Invités */}
                <div className="px-5 py-3">
                  {tableGuests.length === 0 ? (
                    <p className="text-stone-300 italic text-sm py-2">Table vide</p>
                  ) : (
                    <ol className="space-y-1.5">
                      {tableGuests.map((g, i) => (
                        <li key={g.id} className="flex items-center gap-3 text-sm">
                          <span className="text-stone-300 text-xs w-5 text-right shrink-0" style={{ fontWeight: 300 }}>
                            {i + 1}.
                          </span>
                          <span className="flex-1 text-stone-700" style={{ fontWeight: 400 }}>
                            {g.first_name} {g.last_name ?? ''}
                          </span>
                          {g.relation && (
                            <span className="text-stone-400 text-xs shrink-0" style={{ fontWeight: 300 }}>
                              {g.relation}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                  {/* Places libres */}
                  {Array.from({ length: Math.max(0, table.capacity - tableGuests.length) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm mt-1.5">
                      <span className="w-5 text-right shrink-0" />
                      <span className="flex-1 text-stone-200 italic text-xs border-b border-dashed border-stone-100">
                        Place libre
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Invités sans table */}
        {unassigned.length > 0 && (
          <div className="mt-8 border border-amber-200 rounded-xl overflow-hidden break-inside-avoid">
            <div className="bg-amber-50 px-5 py-3 flex items-center gap-2">
              <span className="text-amber-500">⚠</span>
              <h2 className="text-amber-700 font-medium text-sm">Invités sans table ({unassigned.length})</h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {unassigned.map(g => (
                  <span key={g.id}
                    className="text-xs text-stone-600 bg-stone-100 rounded-full px-3 py-1"
                    style={{ fontWeight: 300 }}>
                    {g.first_name} {g.last_name ?? ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Index alphabétique */}
        {(guests ?? []).filter(g => g.table_id).length > 0 && (
          <div className="mt-8 break-inside-avoid">
            <h2 className="text-sm font-medium text-stone-500 uppercase tracking-widest mb-4" style={{ fontWeight: 400 }}>
              Index alphabétique
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              {(guests ?? [])
                .filter(g => g.table_id)
                .sort((a, b) => `${a.last_name ?? ''} ${a.first_name}`.localeCompare(`${b.last_name ?? ''} ${b.first_name}`, 'fr'))
                .map(g => {
                  const table = (tables ?? []).find(t => t.id === g.table_id)
                  return (
                    <div key={g.id} className="flex items-baseline gap-2 text-sm">
                      <span className="flex-1 text-stone-700" style={{ fontWeight: 400 }}>
                        {g.last_name ? `${g.last_name}, ${g.first_name}` : g.first_name}
                      </span>
                      <span className="text-stone-400 shrink-0 text-xs" style={{ fontWeight: 300 }}>
                        {table ? (table.position_order > 0 ? `N°${table.position_order}` : table.name) : '—'}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t border-stone-100 text-center">
          <p className="text-[10px] text-stone-200" style={{ fontWeight: 300 }}>
            Généré par Kaatch · {new Date().toLocaleDateString(toDateLocale(locale))}
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
