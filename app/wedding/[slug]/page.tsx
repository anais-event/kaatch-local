import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'

export default async function WeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return <div className="p-8">Mariage introuvable</div>
  }

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[70vh] min-h-[400px] overflow-hidden">
        {wedding.cover_image_url ? (
          <img src={wedding.cover_image_url} alt="Photo de couverture" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#4a5240]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

        {/* Titre */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-3"
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.1, fontStyle: 'italic' }}>
            Mariage de
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', lineHeight: 1 }}>
            {wedding.name}
          </h2>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Infos */}
        <section id="infos">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Informations
          </h3>
          <div className="space-y-3">
            {dateFormatted && (
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-100">
                <div>
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }}
                     className="text-stone-400 uppercase mb-1">Date</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }}
                     className="text-stone-700 capitalize">{dateFormatted}</p>
                </div>
              </div>
            )}
            {wedding.location && (
              <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-stone-100">
                <div>
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }}
                     className="text-stone-400 uppercase mb-1">Lieu</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }}
                     className="text-stone-700">{wedding.location}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Compte à rebours */}
        {wedding.date && (
          <Countdown weddingDate={wedding.date} />
        )}

        {/* Programme */}
        <section id="programme">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Programme
          </h3>
          <div className="p-5 rounded-xl bg-white border border-stone-100 text-center">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}
               className="text-stone-400">
              Programme à venir…
            </p>
          </div>
        </section>

        {/* Lieux */}
        <section id="lieux">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Lieux
          </h3>
          <div className="p-5 rounded-xl bg-white border border-stone-100 text-center">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}
               className="text-stone-400">
              Carte & adresses à venir…
            </p>
          </div>
        </section>

        {/* Hébergements */}
        <section id="hebergements">
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">
            Hébergements
          </h3>
          <div className="p-5 rounded-xl bg-white border border-stone-100 text-center">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem' }}
               className="text-stone-400">
              Suggestions d'hébergements à venir…
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
