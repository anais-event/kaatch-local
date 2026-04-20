import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function FairePartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, couple_message, cover_image_url')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-6 py-16"
         style={{ fontFamily: 'var(--font-lato)' }}>

      <div className="w-full max-w-sm">

        {/* Photo de couverture */}
        {wedding.cover_image_url && (
          <div className="rounded-2xl overflow-hidden mb-0 shadow-lg">
            <img src={wedding.cover_image_url} alt={wedding.name}
                 className="w-full object-cover" style={{ maxHeight: '260px', objectFit: 'cover' }} />
          </div>
        )}

        {/* Carte faire-part */}
        <div className={`bg-white shadow-xl px-8 py-10 text-center ${wedding.cover_image_url ? 'rounded-b-2xl' : 'rounded-2xl'}`}>

          {/* Ligne déco */}
          <div className="w-8 h-0.5 bg-[#4a5240] mx-auto mb-6" />

          <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '0.85rem',
                      fontStyle: 'italic', letterSpacing: '0.15em' }}
             className="text-stone-400 uppercase mb-3">
            Vous êtes invité(e) à notre mariage
          </p>

          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600,
                       fontSize: 'clamp(2rem, 8vw, 2.8rem)', lineHeight: 1.1 }}
              className="text-[#2d3228] mb-5">
            {wedding.name}
          </h1>

          {dateStr && (
            <p style={{ fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.04em' }}
               className="text-stone-500 capitalize mb-2">
              {dateStr}
            </p>
          )}

          {wedding.location && (
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mb-5">
              📍 {wedding.location}
            </p>
          )}

          {(dateStr || wedding.location) && <div className="w-8 h-px bg-stone-200 mx-auto mb-5" />}

          {wedding.couple_message ? (
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.1rem',
                        fontStyle: 'italic', lineHeight: 1.6 }}
               className="text-stone-600 mb-6">
              &ldquo;{wedding.couple_message}&rdquo;
            </p>
          ) : (
            <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
               className="text-stone-500 mb-6">
              Nous sommes tellement heureux de vous compter parmi nos invités.<br />
              Votre présence rendra ce jour encore plus inoubliable. 🌸
            </p>
          )}

          <a href={`/invite/${slug}`}
             className="inline-block text-xs text-[#4a5240] border border-[#4a5240]/40 px-5 py-2.5 rounded-full hover:bg-[#4a5240] hover:text-white transition"
             style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
            ← Retour
          </a>
        </div>

        {/* Footer Kaatch */}
        <p className="text-center mt-6 text-[10px] text-stone-400 tracking-widest uppercase"
           style={{ fontWeight: 300 }}>
          Envoyé avec ♥ via{' '}
          <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem' }}>Kaatch</span>
        </p>
      </div>
    </div>
  )
}
