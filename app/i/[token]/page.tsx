import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import TokenAuthButton from './TokenAuthButton'

export default async function PersonalizedInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createSupabaseServerClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id, gender')
    .eq('invite_token', token)
    .single()

  if (!guest) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">Lien invalide</h1>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
            Ce lien d'invitation n'existe pas ou a expiré.
          </p>
        </div>
      </div>
    )
  }

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, name, cover_image_url, date, location, couple_message')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) redirect('/')

  // Déjà authentifié → espace invité directement
  const cookieStore = await cookies()
  const existingCookie = cookieStore.get(`guest_${wedding.slug}`)
  if (existingCookie) redirect(`/invite/${wedding.slug}`)

  const { data: rules } = await supabase
    .from('wedding_rules').select('text').eq('wedding_id', wedding.id).order('created_at')

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Salutation selon genre
  const salutation = guest.gender === 'F'
    ? `Chère ${guest.first_name},`
    : guest.gender === 'M'
    ? `Cher ${guest.first_name},`
    : `Cher(e) ${guest.first_name},`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          @page { margin: 1cm; size: A5 portrait; }
          .print-hero { height: 200px !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="max-w-md mx-auto">

          {/* Photo couverture */}
          <div className="print-hero relative w-full overflow-hidden" style={{ height: '52vh', minHeight: '260px' }}>
            {wedding.cover_image_url
              ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-[#2d3228]" />
            }
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
          </div>

          {/* Corps du faire-part */}
          <div className="bg-white -mt-5 rounded-t-3xl relative z-10 px-8 pt-10 pb-10">

            {/* Salutation */}
            <p className="text-center mb-8"
               style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem', fontWeight: 400, color: '#4a5240' }}>
              {salutation}
            </p>

            {/* Ornement */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-stone-300 text-xs tracking-widest">✦</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Noms */}
            <h1 className="text-center leading-none mb-3"
                style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.4rem, 9vw, 3.5rem)', color: '#2d3228' }}>
              {wedding.name}
            </h1>

            <p className="text-center mb-10" style={{ fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.2em', color: '#a8a29e' }}>
              vous invitent à célébrer leur mariage
            </p>

            {/* Date + Lieu — version élégante centrée */}
            <div className="text-center space-y-4 mb-10">
              {dateFormatted && (
                <p className="capitalize"
                   style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.15rem', color: '#4a5240', fontStyle: 'italic' }}>
                  {dateFormatted}
                </p>
              )}
              {wedding.location && (
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.22em', color: '#a8a29e' }} className="uppercase mb-2">
                    {wedding.location}
                  </p>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
                     target="_blank" rel="noopener noreferrer"
                     className="no-print inline-block text-xs border border-[#4a5240]/30 text-[#4a5240] px-3 py-1 rounded-full hover:bg-[#4a5240] hover:text-white transition"
                     style={{ fontWeight: 300 }}>
                    Voir sur la carte →
                  </a>
                </div>
              )}
            </div>

            {/* Ornement */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-stone-200 text-xs">✦</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Mot des mariés */}
            {wedding.couple_message && (
              <div className="mb-10">
                <p className="text-center whitespace-pre-wrap leading-loose"
                   style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.08rem', color: '#78716c', lineHeight: 1.9 }}>
                  {wedding.couple_message}
                </p>
              </div>
            )}

            {/* À noter */}
            {rules && rules.length > 0 && (
              <div className="mb-10">
                <p className="text-center mb-4" style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.25em', color: '#a8a29e' }}>
                  À NOTER
                </p>
                <ul className="space-y-2.5">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3"
                        style={{ fontWeight: 300, fontSize: '0.85rem', color: '#78716c', lineHeight: 1.6 }}>
                      <span style={{ color: '#4a5240' }} className="shrink-0 mt-0.5">—</span>
                      {rule.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA accès direct */}
            <div className="no-print">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-stone-200 text-xs">✦</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
              <TokenAuthButton token={token} firstName={guest.first_name} />
            </div>

          </div>

          {/* Footer */}
          <div className="no-print text-center py-5">
            <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em', color: '#d6d3d1' }}>
              Organisé avec <a href="/" style={{ color: '#4a5240' }}>Kaatch</a>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
