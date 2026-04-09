import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProgrammePDF from './ProgrammePDF'

export default async function GuestProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  if (!cookieStore.get(`guest_${slug}`)) redirect(`/invite/${slug}`)

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: steps } = await supabase
    .from('program_steps')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <a href={`/invite/${slug}`} className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            ← Retour
          </a>
          <ProgrammePDF slug={slug} weddingName={wedding.name} steps={steps ?? []} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-8">
          Programme de la journée
        </h1>

        {(!steps || steps.length === 0) ? (
          <div className="p-8 rounded-2xl bg-white/80 text-center">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}
               className="text-stone-400">Programme à venir…</p>
          </div>
        ) : (
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-200" />

            <div className="space-y-6">
              {steps.map((step, i) => {
                const mapsUrl = step.address
                  ? `https://maps.google.com/?q=${encodeURIComponent(step.address)}`
                  : null
                const appleMapsUrl = step.address
                  ? `https://maps.apple.com/?q=${encodeURIComponent(step.address)}`
                  : null

                return (
                  <div key={step.id} className="relative flex gap-6">
                    {/* Icône */}
                    <div className="relative z-10 w-16 h-16 flex-shrink-0 rounded-full bg-white border-2 border-[#4a5240] flex items-center justify-center text-2xl shadow-sm">
                      {step.icon || '✨'}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 bg-white/80 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                            className="text-[#2d3228]">
                          {step.title}
                        </h3>
                        {step.time && (
                          <span className="text-xs bg-[#f5f0e8] text-[#4a5240] px-2 py-1 rounded-full whitespace-nowrap"
                                style={{ fontWeight: 300 }}>
                            {step.time}
                          </span>
                        )}
                      </div>

                      {step.description && (
                        <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-500 mb-3">
                          {step.description}
                        </p>
                      )}

                      {step.address && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 w-full">
                            📍 {step.address}
                          </p>
                          <a href={mapsUrl!} target="_blank" rel="noopener noreferrer"
                             className="text-xs bg-[#4a5240] text-white px-3 py-1 rounded-full hover:bg-[#2d3228] transition"
                             style={{ fontWeight: 300 }}>
                            Google Maps
                          </a>
                          <a href={appleMapsUrl!} target="_blank" rel="noopener noreferrer"
                             className="text-xs border border-[#4a5240] text-[#4a5240] px-3 py-1 rounded-full hover:bg-[#4a5240] hover:text-white transition"
                             style={{ fontWeight: 300 }}>
                            Apple Maps
                          </a>
                        </div>
                      )}
                    </div>
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
