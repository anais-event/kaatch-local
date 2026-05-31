import { createSupabaseServerClient } from '@/lib/supabase-server'
import { toDateLocale } from '@/lib/locale-map'
import { getTranslations, getLocale } from 'next-intl/server'
import PrintButton from './PrintButton'

export default async function ProgrammeRecapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const { data: steps } = await supabase
    .from('program_steps')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: true })

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString(toDateLocale(locale), {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Barre d'action (masquée à l'impression) */}
      <div className="print:hidden bg-white border-b border-stone-100 px-6 py-3 flex items-center justify-between">
        <a
          href={`/mariage/${slug}/programme`}
          className="text-sm text-stone-500 hover:text-[#4a5240] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        >
          ← Retour au programme
        </a>
        <PrintButton />
      </div>

      {/* Document imprimable */}
      <div className="max-w-2xl mx-auto px-8 py-12 print:px-6 print:py-10">

        {/* En-tête */}
        <div className="text-center mb-12 pb-8 border-b border-stone-200">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3" style={{ fontWeight: 300 }}>
            Programme de la journée
          </p>
          <h1 className="text-4xl text-[#2d3228] mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontStyle: 'italic' }}>
            {wedding.name}
          </h1>
          {dateFormatted && (
            <p className="text-stone-400 text-sm capitalize mt-2" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          {wedding.location && (
            <p className="text-stone-400 text-sm mt-1" style={{ fontWeight: 300 }}>
              {wedding.location}
            </p>
          )}
        </div>

        {/* Étapes */}
        {(steps ?? []).length === 0 ? (
          <p className="text-center text-stone-400 italic text-sm">Aucune étape dans le programme.</p>
        ) : (
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-100 print:hidden" />

            <div className="space-y-8">
              {(steps ?? []).map((step, i) => (
                <div key={step.id} className="flex gap-6 break-inside-avoid">
                  {/* Icône + heure */}
                  <div className="flex flex-col items-center shrink-0 w-16">
                    <div className="w-10 h-10 rounded-full bg-[#f5f0e8] border border-stone-200 flex items-center justify-center text-lg z-10 relative">
                      {step.icon ?? '✨'}
                    </div>
                    {step.time && (
                      <span className="text-xs text-[#4a5240] mt-1.5 tabular-nums" style={{ fontWeight: 400 }}>
                        {step.time}
                      </span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 pb-2">
                    <h2 className="text-lg font-light text-[#2d3228] mb-1 italic">{step.title}</h2>
                    {step.description && (
                      <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                        {step.description}
                      </p>
                    )}
                    {step.address && (
                      <p className="text-stone-400 text-xs mt-1.5 flex items-center gap-1" style={{ fontWeight: 300 }}>
                        <span>📍</span> {step.address}
                      </p>
                    )}
                    {/* Séparateur entre étapes sauf le dernier */}
                    {i < (steps ?? []).length - 1 && (
                      <div className="mt-6 border-b border-dashed border-stone-100" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-14 pt-6 border-t border-stone-100 text-center">
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
