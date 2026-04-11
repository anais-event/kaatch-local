import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function PersonalizedInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createSupabaseServerClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id')
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
    .select('id, slug, name, cover_image_url, date, location, couple_message, share_code')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) redirect('/')

  const { data: rules } = await supabase
    .from('wedding_rules').select('text').eq('wedding_id', wedding.id).order('created_at')

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const isMasc = guest.first_name?.slice(-1).toLowerCase() !== 'e' // heuristique simple
  const salutation = `Cher${isMasc ? '' : 'e'} ${guest.first_name},`

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-lg mx-auto">

        {/* Photo couverture */}
        <div className="relative w-full h-[55vh] min-h-[300px] overflow-hidden">
          {wedding.cover_image_url
            ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[#2d3228]" />
          }
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/70" />
        </div>

        {/* Corps */}
        <div className="bg-white mx-4 sm:mx-0 -mt-6 rounded-t-2xl relative z-10 px-8 sm:px-12 pt-10 pb-8">

          {/* Salutation personnalisée */}
          <p className="text-center text-stone-500 mb-6"
             style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 400 }}>
            {salutation}
          </p>

          {/* Ornement */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-300 text-xs tracking-[0.3em]">✦</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <p className="text-center text-stone-400 mb-4" style={{ fontWeight: 300, fontSize: '0.78rem', letterSpacing: '0.15em' }}>
            NOUS AVONS LA JOIE DE VOUS ANNONCER
          </p>

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
                   className="text-xs text-[#4a5240] border border-[#4a5240]/40 px-2.5 py-1 rounded-lg hover:bg-[#4a5240] hover:text-white transition shrink-0"
                   style={{ fontWeight: 300 }}>
                  GPS →
                </a>
              </div>
            )}
          </div>

          {/* Mot des mariés */}
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

          {/* À noter */}
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

          {/* CTA RSVP */}
          {wedding.share_code && (
            <a href={`/p/${wedding.share_code}`}
               className="block w-full text-center bg-[#4a5240] text-white py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
               style={{ fontWeight: 300, letterSpacing: '0.08em' }}>
              Répondre à l'invitation →
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }} className="text-stone-300">
            Organisé avec{' '}
            <a href="/" className="text-[#4a5240] hover:underline">Kaatch</a>
          </p>
        </div>

      </div>
    </div>
  )
}
