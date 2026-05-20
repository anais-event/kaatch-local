import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/vendor-permissions'
import type { VendorPermissions } from '@/lib/vendor-permissions'

export default async function VendorProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)
  if (!vendorCookie) redirect('/')

  const vendor = JSON.parse(vendorCookie.value)
  const permissions: VendorPermissions = vendor.permissions ?? {}

  if (!hasPermission(permissions, 'programme')) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.4rem' }}
              className="text-[#2d3228] mb-3">Accès non autorisé</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-500">
            Les mariés ne vous ont pas donné accès au programme.
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

  const { data: steps } = await supabase
    .from('program_steps')
    .select('id, title, description, address, time, icon, position')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: true })

  const weddingDate = wedding.date ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          ← Retour au tableau de bord
        </a>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
            className="text-[#2d3228] mb-1">Programme du jour J</h1>
        {weddingDate && (
          <p className="text-stone-400 mb-6" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
            📅 {weddingDate}
          </p>
        )}

        {(!steps || steps.length === 0) ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300 }}
               className="text-stone-300">Programme non encore défini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={step.id ?? i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-4">
                <div className="text-right shrink-0 w-14">
                  <p className="text-sm text-[#4a5240]" style={{ fontWeight: 500 }}>{step.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2d3228]" style={{ fontWeight: 400, fontSize: '0.95rem' }}>{step.title}</p>
                  {step.description && (
                    <p className="text-stone-400 mt-1" style={{ fontWeight: 300, fontSize: '0.82rem' }}>{step.description}</p>
                  )}
                  {step.address && (
                    <p className="text-stone-400 mt-1" style={{ fontWeight: 300, fontSize: '0.78rem' }}>📍 {step.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
