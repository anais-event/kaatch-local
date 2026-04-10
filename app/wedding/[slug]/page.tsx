import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'
import Checklist from './Checklist'

export default async function WeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [
    { count: guestCount },
    { count: confirmedCount },
    { count: photoCount },
    { count: prestataireCount },
    { count: hebergementCount },
    { count: programmeCount },
    { count: ruleCount },
    { data: todosData },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_contacts').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('accommodations').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('programme_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_rules').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_todos').select('*').eq('wedding_id', wedding.id).order('created_at'),
  ])

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  // Checklist système — auto-calculée
  const systemChecklist = [
    { label: 'Photo de couverture', done: !!wedding.cover_image_url, href: `/wedding/${slug}/edit` },
    { label: 'Date fixée', done: !!wedding.date, href: `/wedding/${slug}/edit` },
    { label: 'Lieu renseigné', done: !!wedding.location, href: `/wedding/${slug}/edit` },
    { label: 'Programme créé', done: (programmeCount ?? 0) > 0, href: `/wedding/${slug}/programme` },
    { label: 'Invités ajoutés', done: (guestCount ?? 0) > 0, href: `/wedding/${slug}/guests` },
    { label: 'Prestataires', done: (prestataireCount ?? 0) > 0, href: `/wedding/${slug}/contacts` },
    { label: 'Hébergements', done: (hebergementCount ?? 0) > 0, href: `/wedding/${slug}/hebergements` },
    { label: 'Mot des mariés', done: !!(wedding.couple_message || (ruleCount ?? 0) > 0), href: `/wedding/${slug}/regles` },
    { label: 'Lien partagé', done: !!wedding.share_code, href: `/wedding/${slug}/partager` },
  ]

  // Modules organisation
  const modules = [
    {
      label: 'Invités',
      sub: 'Liste & RSVP',
      href: `/wedding/${slug}/guests`,
      value: guestCount ?? 0,
      unit: (n: number) => n > 1 ? 'invités' : 'invité',
      badge: confirmedCount ? `${confirmedCount} confirmé${(confirmedCount ?? 0) > 1 ? 's' : ''}` : null,
    },
    {
      label: 'Photos',
      sub: 'Galerie partagée',
      href: `/wedding/${slug}/photos`,
      value: photoCount ?? 0,
      unit: (n: number) => n > 1 ? 'photos' : 'photo',
    },
    {
      label: 'Prestataires',
      sub: 'Vos contacts',
      href: `/wedding/${slug}/contacts`,
      value: prestataireCount ?? 0,
      unit: (n: number) => n > 1 ? 'contacts' : 'contact',
    },
    {
      label: 'Hébergements',
      sub: 'Suggestions',
      href: `/wedding/${slug}/hebergements`,
      value: hebergementCount ?? 0,
      unit: (n: number) => n > 1 ? 'options' : 'option',
    },
    { label: 'Budget', sub: 'Suivi des dépenses', href: `/wedding/${slug}/budget`, value: null, unit: null, badge: null },
    { label: 'Invitations', sub: 'Faire-parts digitaux', href: null, soon: true },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[35vh] min-h-[180px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-2" style={{ fontWeight: 300 }}>
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
        <a href={`/wedding/${slug}/edit`}
           className="absolute top-4 right-4 text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg backdrop-blur transition"
           style={{ fontWeight: 300 }}>
          Modifier la couverture
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">

        {/* 1. Checklist */}
        <Checklist
          slug={slug}
          systemItems={systemChecklist}
          customItems={(todosData ?? []).map(t => ({ id: t.id, label: t.label, done: t.done }))}
        />

        {/* 2. Organisation */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-4">Organisation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {modules.map(m => (
              m.href ? (
                <a key={m.label} href={m.href}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.01em' }}
                       className="text-[#2d3228]">{m.label}</p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{m.sub}</p>
                  </div>
                  <div className="flex items-end gap-1.5 mt-1">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                          className="text-[#2d3228]">{m.value}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.75rem' }}
                          className="text-stone-400 mb-0.5">{m.unit?.(m.value ?? 0)}</span>
                  </div>
                  {m.badge && (
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-[#4a5240]">{m.badge}</p>
                  )}
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                     className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">
                    Gérer →
                  </p>
                </a>
              ) : (
                <div key={m.label}
                     className="bg-white/40 rounded-xl border border-dashed border-stone-200 p-5 flex flex-col gap-1.5">
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-stone-300">{m.label}</p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300">{m.sub}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem' }}
                     className="text-stone-300 mt-1">Bientôt</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* 3. Infos pratiques */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-4">Infos pratiques</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Date',
                value: dateFormatted,
                empty: 'Non renseignée',
                href: `/wedding/${slug}/edit`,
              },
              {
                label: 'Lieu',
                value: wedding.location,
                empty: 'Non renseigné',
                href: `/wedding/${slug}/edit`,
              },
              {
                label: 'Lien invités',
                value: wedding.share_code ? `/p/${wedding.share_code}` : null,
                empty: 'Aucun lien',
                href: `/wedding/${slug}/partager`,
              },
            ].map(row => (
              <a key={row.label} href={row.href}
                 className="group bg-white rounded-xl border border-stone-100 px-5 py-4 flex flex-col gap-1 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.16em' }}
                   className="text-stone-400 uppercase">{row.label}</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem' }}
                   className={`capitalize leading-snug ${row.value ? 'text-stone-700' : 'text-stone-300 italic'}`}>
                  {row.value ?? row.empty}
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                   className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">
                  Modifier →
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* 4. Compte à rebours */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

      </div>
    </div>
  )
}
