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

  const [
    { count: guestCount },
    { count: confirmedCount },
    { count: programmeCount },
    { count: prestataireCount },
    { count: hebergementCount },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('programme_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_contacts').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('accommodations').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
  ])

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const modules = [
    {
      label: 'Programme',
      href: `/wedding/${slug}/programme`,
      value: programmeCount ?? 0,
      unit: (n: number) => n > 1 ? 'moments' : 'moment',
      empty: 'Aucun moment ajouté',
    },
    {
      label: 'Invités',
      href: `/wedding/${slug}/guests`,
      value: guestCount ?? 0,
      unit: (n: number) => n > 1 ? 'invités' : 'invité',
      sub: confirmedCount ? `${confirmedCount} confirmé${(confirmedCount ?? 0) > 1 ? 's' : ''}` : null,
      empty: 'Liste vide',
    },
    {
      label: 'Prestataires',
      href: `/wedding/${slug}/contacts`,
      value: prestataireCount ?? 0,
      unit: (n: number) => n > 1 ? 'contacts' : 'contact',
      empty: 'Aucun contact',
    },
    {
      label: 'Hébergements',
      href: `/wedding/${slug}/hebergements`,
      value: hebergementCount ?? 0,
      unit: (n: number) => n > 1 ? 'suggestions' : 'suggestion',
      empty: 'Aucun hébergement',
    },
    {
      label: 'Budget',
      href: null,
      value: null,
      soon: true,
    },
    {
      label: 'Invitations',
      href: null,
      value: null,
      soon: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[50vh] min-h-[280px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-2"
               style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontStyle: 'italic', lineHeight: 1.1 }}>
            Mariage de
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 5.5vw, 3.8rem)', lineHeight: 1 }}>
            {wedding.name}
          </h2>
        </div>
        {/* Lien modifier */}
        <a href={`/wedding/${slug}/edit`}
           className="absolute top-4 right-4 text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg backdrop-blur transition"
           style={{ fontWeight: 300 }}>
          Modifier la couverture
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Compte à rebours */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

        {/* Modules */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-4">Organisation</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {modules.map(m => (
              m.href ? (
                <a key={m.label} href={m.href}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-2 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                  <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.14em' }}
                     className="text-stone-400 uppercase">{m.label}</p>
                  <div className="flex items-end gap-2">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.2rem', lineHeight: 1 }}
                          className="text-[#2d3228]">{m.value}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.78rem' }}
                          className="text-stone-400 mb-1">{m.unit?.(m.value ?? 0)}</span>
                  </div>
                  {m.sub && (
                    <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-[#4a5240]">{m.sub}</p>
                  )}
                  <p style={{ fontWeight: 300, fontSize: '0.72rem' }}
                     className="text-stone-300 group-hover:text-[#4a5240] transition">
                    Gérer →
                  </p>
                </a>
              ) : (
                <div key={m.label}
                     className="bg-white/50 rounded-xl border border-dashed border-stone-200 p-5 flex flex-col gap-2">
                  <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.14em' }}
                     className="text-stone-300 uppercase">{m.label}</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.9rem' }}
                     className="text-stone-300">Bientôt disponible</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Infos pratiques */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-4">Infos pratiques</p>
          <div className="space-y-2">
            {[
              { label: 'Date', value: dateFormatted, href: `/wedding/${slug}/edit` },
              { label: 'Lieu', value: wedding.location, href: `/wedding/${slug}/edit` },
              { label: 'Lien invités', value: wedding.share_code ? `/p/${wedding.share_code}` : null, href: `/wedding/${slug}/partager`, cta: 'Partager' },
            ].filter(r => r.value).map(row => (
              <div key={row.label}
                   className="flex items-center justify-between px-5 py-4 rounded-xl bg-white border border-stone-100">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.16em' }}
                     className="text-stone-400 uppercase mb-0.5">{row.label}</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                     className="text-stone-700 capitalize">{row.value}</p>
                </div>
                <a href={row.href}
                   className="text-xs text-stone-400 hover:text-[#4a5240] transition"
                   style={{ fontWeight: 300 }}>
                  {row.cta ?? 'Modifier'}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
