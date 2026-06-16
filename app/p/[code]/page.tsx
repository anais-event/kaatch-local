import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GuestAuthForm from './GuestAuthForm'
import PrintButton from './PrintButton'

export default async function PublicPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, name, cover_image_url, date, location, couple_message')
    .eq('share_code', code.toUpperCase())
    .single()

  if (!wedding) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">Code introuvable</h1>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
             className="text-stone-400">Vérifiez le code avec les mariés.</p>
        </div>
      </div>
    )
  }

  const cookieStore = await cookies()
  const existingCookie = cookieStore.get(`guest_${wedding.slug}`)
  if (existingCookie) redirect(`/invite/${wedding.slug}`)

  const { data: rules } = await supabase
    .from('wedding_rules')
    .select('text')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const dateShort = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <>
      {/* CSS print — masque le formulaire, optimise pour A4 */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; size: A5 portrait; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

        {/* ─── FAIRE-PART ─── */}
        <div className="max-w-lg mx-auto">

          {/* Photo couverture pleine largeur */}
          <div className="relative w-full h-[55vh] min-h-[300px] overflow-hidden">
            {wedding.cover_image_url
              ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#2d3228]" />
            }
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/70" />

            <PrintButton />
          </div>

          {/* Corps du faire-part */}
          <div className="bg-white mx-4 sm:mx-0 -mt-6 rounded-t-2xl relative z-10 px-8 sm:px-12 pt-10 pb-8">

            {/* Ornement */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-stone-300 text-xs tracking-[0.3em]">✦</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Nous avons l'honneur… */}
            <p className="text-center text-stone-400 mb-4" style={{ fontWeight: 300, fontSize: '0.78rem', letterSpacing: '0.15em' }}>
              NOUS AVONS LA JOIE DE VOUS ANNONCER
            </p>

            {/* Noms */}
            <h1 className="text-center text-[#2d3228] mb-2 leading-none"
                style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.2rem, 8vw, 3.2rem)' }}>
              {wedding.name}
            </h1>

            <p className="text-center text-stone-400 mb-8" style={{ fontWeight: 300, fontSize: '0.78rem', letterSpacing: '0.12em' }}>
              ET VOUS INVITENT À CÉLÉBRER LEUR MARIAGE
            </p>

            {/* Date + Lieu */}
            <div className="space-y-3 mb-8">
              {dateFormatted && (
                <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-xl px-5 py-3.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#4a5240] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="text-stone-700 capitalize"
                     style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}>
                    {dateFormatted}
                  </p>
                </div>
              )}
              {wedding.location && (
                <div className="flex items-center gap-3 bg-[#f5f0e8] rounded-xl px-5 py-3.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#4a5240] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-700 truncate"
                       style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}>
                      {wedding.location}
                    </p>
                  </div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
                     target="_blank" rel="noopener noreferrer"
                     className="no-print text-xs text-[#4a5240] border border-[#4a5240]/40 px-2.5 py-1 rounded-lg hover:bg-[#4a5240] hover:text-white transition shrink-0"
                     style={{ fontWeight: 300 }}>
                    GPS →
                  </a>
                </div>
              )}
            </div>

            {/* Mot des mariés / texte d'invitation */}
            {wedding.couple_message && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-stone-200 text-xs">✦</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                <p className="text-center text-stone-600 leading-relaxed whitespace-pre-wrap"
                   style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  {wedding.couple_message}
                </p>
              </div>
            )}

            {/* NB — infos importantes */}
            {rules && rules.length > 0 && (
              <div className="mb-8 border border-stone-100 rounded-xl px-5 py-4">
                <p className="text-stone-400 mb-3" style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em' }}>
                  À NOTER
                </p>
                <ul className="space-y-2">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-stone-500"
                        style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.5 }}>
                      <span className="text-[#4a5240] shrink-0 mt-0.5">—</span>
                      {rule.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ornement bas */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-stone-200 text-xs">✦</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* ─── RSVP / Accès ─── */}
            <div className="no-print">
              <p className="text-center text-stone-400 mb-6"
                 style={{ fontWeight: 300, fontSize: '0.78rem', letterSpacing: '0.12em' }}>
                IDENTIFIEZ-VOUS POUR ACCÉDER À VOTRE ESPACE
              </p>
              <GuestAuthForm weddingId={wedding.id} weddingSlug={wedding.slug} code={code.toUpperCase()} />
            </div>

            {/* Version papier : remplace le formulaire */}
            <div className="print-only text-center space-y-2 py-4">
              {dateShort && (
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 300 }}
                   className="text-stone-500">{dateShort}</p>
              )}
              <p style={{ fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                 className="text-stone-400">Réponse souhaitée avant le</p>
            </div>
          </div>

          {/* Powered by Kaatch */}
          <div className="text-center py-6 no-print">
            <p style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
               className="text-stone-300">
              Organisé avec{' '}
              <a href="/" className="text-[#4a5240] hover:underline">Kaatch</a>
            </p>
          </div>

          {/* Version print footer */}
          <div className="print-only text-center mt-8 pt-4 border-t border-stone-100">
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em', color: '#a8a29e' }}>
              ORGANISÉ AVEC KAATCH
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
