import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'

export default async function VendorLieuxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}

  if (!hasPermission(permissions, 'programme') && !hasPermission(permissions, 'location')) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-3">Accès non autorisé</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-500">
            Les mariés ne vous ont pas donné accès aux lieux.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Get program steps with addresses
  const { data: steps } = await supabase
    .from('program_steps')
    .select('title, time, address, description, position')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: true })

  const allSteps = steps ?? []

  // Group by unique address
  const locationMap = new Map<string, { address: string; steps: { title: string; time: string; description: string }[] }>()

  // Add main wedding location if exists
  if (wedding.location && hasPermission(permissions, 'location')) {
    locationMap.set(wedding.location.toLowerCase().trim(), {
      address: wedding.location,
      steps: [],
    })
  }

  for (const step of allSteps) {
    if (!step.address) continue
    const key = step.address.toLowerCase().trim()
    if (!locationMap.has(key)) {
      locationMap.set(key, { address: step.address, steps: [] })
    }
    locationMap.get(key)!.steps.push({
      title: step.title,
      time: step.time,
      description: step.description ?? '',
    })
  }

  const locations = Array.from(locationMap.values())
  const weddingDate = wedding.date ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          ← Retour au tableau de bord
        </a>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
            className="text-[#2d3228] mb-1">Lieux et adresses</h1>
        {weddingDate && (
          <p className="text-stone-400 mb-6" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
            📅 {weddingDate}
          </p>
        )}

        {locations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300 }}
               className="text-stone-300">Aucun lieu renseigné</p>
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((loc, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-lg mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2d3228]" style={{ fontWeight: 400, fontSize: '1rem' }}>{loc.address}</p>
                    {loc.steps.length === 0 && (
                      <p className="text-xs text-stone-400 mt-1" style={{ fontWeight: 300 }}>Lieu principal du mariage</p>
                    )}
                  </div>
                </div>

                {loc.steps.length > 0 && (
                  <div className="ml-8 border-l-2 border-stone-100 pl-4 space-y-2">
                    {loc.steps.map((step, j) => (
                      <div key={j} className="flex gap-3 items-start">
                        <span className="text-xs text-[#4a5240] shrink-0 w-12 text-right pt-0.5" style={{ fontWeight: 500 }}>
                          {step.time}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>{step.title}</p>
                          {step.description && (
                            <p className="text-xs text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>{step.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
