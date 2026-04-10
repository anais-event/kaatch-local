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

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Statistiques pour les cartes
  const [{ count: guestCount }, { count: programmeCount }, { count: prestataireCount }] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('programme_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_contacts').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
  ])

  const { count: confirmedCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('wedding_id', wedding.id)
    .eq('rsvp_status', 'confirme')

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const sections = [
    {
      label: 'Programme',
      href: `/wedding/${slug}/programme`,
      count: programmeCount ?? 0,
      unit: 'moment',
      desc: 'Étapes de la journée',
    },
    {
      label: 'Invités',
      href: `/wedding/${slug}/guests`,
      count: guestCount ?? 0,
      unit: 'invité',
      extra: confirmedCount ? `${confirmedCount} confirmé${confirmedCount > 1 ? 's' : ''}` : null,
      desc: 'Liste & RSVP',
    },
    {
      label: 'Prestataires',
      href: `/wedding/${slug}/contacts`,
      count: prestataireCount ?? 0,
      unit: 'contact',
      desc: 'Vos contacts',
    },
    {
      label: 'Budget',
      href: `/wedding/${slug}/budget`,
      count: null,
      desc: 'Suivi des dépenses',
      soon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[55vh] min-h-[320px] overflow-hidden">
        {wedding.cover_image_url ? (
          <img src={wedding.cover_image_url} alt="Photo de couverture" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#4a5240]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-3"
               style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.1, fontStyle: 'italic' }}>
            Mariage de
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.2rem, 6vw, 4rem)', lineHeight: 1 }}>
            {wedding.name}
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Compte à rebours */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

        {/* Cartes raccourcis */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.18em' }}
             className="text-stone-400 uppercase mb-4">Organiser</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sections.map(s => (
              <a key={s.label} href={s.soon ? '#' : s.href}
                 className={`bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1 transition-shadow hover:shadow-md ${s.soon ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
                   className="text-stone-400 uppercase">{s.label}</p>
                {s.count !== null ? (
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                     className="text-[#2d3228]">{s.count}</p>
                ) : (
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.95rem' }}
                     className="text-stone-300">Bientôt</p>
                )}
                <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400">{s.desc}</p>
                {s.extra && (
                  <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-[#4a5240]">{s.extra}</p>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Infos du mariage */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.18em' }}
             className="text-stone-400 uppercase mb-4">Infos</p>
          <div className="space-y-3">
            {dateFormatted && (
              <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-stone-100">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }}
                     className="text-stone-400 uppercase mb-1">Date</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}
                     className="text-stone-700 capitalize">{dateFormatted}</p>
                </div>
                <a href={`/wedding/${slug}/edit`}
                   className="text-xs text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
                  Modifier
                </a>
              </div>
            )}
            {wedding.location && (
              <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-stone-100">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }}
                     className="text-stone-400 uppercase mb-1">Lieu</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}
                     className="text-stone-700">{wedding.location}</p>
                </div>
                <a href={`/wedding/${slug}/edit`}
                   className="text-xs text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
                  Modifier
                </a>
              </div>
            )}
            <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-stone-100">
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.18em' }}
                   className="text-stone-400 uppercase mb-1">Lien d'invitation</p>
                <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
                   className="text-stone-500">/p/{wedding.share_code}</p>
              </div>
              <a href={`/wedding/${slug}/partager`}
                 className="text-xs text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
                Partager
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
