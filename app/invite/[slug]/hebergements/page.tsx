import { createSupabaseServerClient } from '@/lib/supabase-server'

const TYPE_ICONS: Record<string, string> = {
  hotel: '🏨',
  gite: '🏡',
  airbnb: '🏠',
  camping: '⛺',
  autre: '📍',
}

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Hôtel',
  gite: 'Gîte / Chambre d\'hôtes',
  airbnb: 'Airbnb / Location',
  camping: 'Camping',
  autre: 'Autre',
}

export default async function GuestHebergementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: accommodations } = await supabase
    .from('accommodations')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="mb-6">
          <a href={`/invite/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.5rem' }}
            className="text-[#2d3228] mb-2">
          Hébergements
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400 mb-8">
          Les coups de cœur des mariés pour vous loger à proximité.
        </p>

        {accommodations && accommodations.length > 0 ? (
          <div className="space-y-4">
            {accommodations.map(acc => (
              <div key={acc.id} className="bg-white/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {acc.type && (
                        <span className="text-xl">{TYPE_ICONS[acc.type] ?? '📍'}</span>
                      )}
                      <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.1rem' }}
                         className="text-stone-800">{acc.name}</p>
                      {acc.type && (
                        <span className="text-[10px] bg-[#f5f0e8] text-[#4a5240] px-2 py-0.5 rounded-full"
                              style={{ fontWeight: 300 }}>
                          {TYPE_LABELS[acc.type] ?? acc.type}
                        </span>
                      )}
                    </div>
                    {acc.address && (
                      <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400 mt-1">
                        📍 {acc.address}
                      </p>
                    )}
                    {acc.price_range && (
                      <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400">
                        💶 {acc.price_range}
                      </p>
                    )}
                    {acc.note && (
                      <p style={{ fontWeight: 300, fontSize: '0.88rem' }}
                         className="text-[#4a5240] mt-2 bg-[#f5f0e8] rounded-xl px-3 py-2">
                        ✨ {acc.note}
                      </p>
                    )}
                  </div>
                  {acc.url && (
                    <a href={acc.url} target="_blank" rel="noopener noreferrer"
                       className="shrink-0 bg-[#4a5240] text-white px-4 py-2 rounded-full text-xs hover:bg-[#2d3228] transition"
                       style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
                      Voir →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/60 rounded-3xl">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.1rem' }}
               className="text-stone-400 mb-2">
              Aucune recommandation pour l'instant
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300">
              Les mariés n'ont pas encore ajouté d'hébergements.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
