import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'
import Memo from './Memo'

export default async function WeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [
    { count: guestCount },
    { count: confirmedCount },
    { count: photoCount },
    { count: budgetCount },
    { count: hebergementCount },
    { count: programmeCount },
    { count: tableCount },
    { count: ruleCount },
    { data: todosData },
    { data: unreadMessages },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('budget_items').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('accommodations').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('programme_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('seating_tables').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_rules').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_todos').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('messages').select('id').eq('wedding_id', wedding.id).eq('read', false).limit(99),
  ])

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const systemChecklist = [
    { label: 'Photo de couverture', done: !!wedding.cover_image_url, href: `/wedding/${slug}/edit` },
    { label: 'Date fixée', done: !!wedding.date, href: `/wedding/${slug}/edit` },
    { label: 'Lieu renseigné', done: !!wedding.location, href: `/wedding/${slug}/edit` },
    { label: 'Invités ajoutés', done: (guestCount ?? 0) > 0, href: `/wedding/${slug}/guests` },
    { label: 'Faire-parts envoyés', done: (guestCount ?? 0) > 0 && !!wedding.share_code, href: `/wedding/${slug}/partager` },
    { label: 'Programme créé', done: (programmeCount ?? 0) > 0, href: `/wedding/${slug}/programme` },
    { label: 'Plan de table', done: (tableCount ?? 0) > 0, href: `/wedding/${slug}/tables` },
    { label: 'Mot des mariés', done: !!(wedding.couple_message || (ruleCount ?? 0) > 0), href: `/wedding/${slug}/regles` },
    { label: 'Hébergements', done: (hebergementCount ?? 0) > 0, href: `/wedding/${slug}/hebergements` },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[38vh] min-h-[200px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-1" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontStyle: 'italic', lineHeight: 1.1 }}>
            Mariage de
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.7rem, 4.5vw, 3rem)', lineHeight: 1 }}>
            {wedding.name}
          </h2>
        </div>
        <a href={`/wedding/${slug}/edit`}
           className="absolute top-4 right-4 text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg backdrop-blur transition"
           style={{ fontWeight: 300 }}>
          Modifier la couverture
        </a>
      </div>

      {/* Contenu principal — 2 colonnes */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start flex-col lg:flex-row">

          {/* ── Colonne gauche : modules ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* PRÉPARATIFS */}
            <div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.3rem', fontStyle: 'italic' }}
                 className="text-[#4a5240] mb-3">Préparatifs</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Invités */}
                <a href={`/wedding/${slug}/guests`}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Invités</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Faire-part & RSVP</p>
                  <div className="flex items-end gap-1 mt-auto">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{guestCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mb-0.5">invités</span>
                  </div>
                  {(confirmedCount ?? 0) > 0 && (
                    <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-emerald-600 mt-0.5">{confirmedCount} confirmé{(confirmedCount ?? 0) > 1 ? 's' : ''}</p>
                  )}
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">Gérer →</p>
                </a>

                {/* Plan de table */}
                <a href={`/wedding/${slug}/tables`}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Plan de table</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Placement & récap</p>
                  <div className="flex items-end gap-1 mt-auto">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{tableCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mb-0.5">table{(tableCount ?? 0) > 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">Gérer →</p>
                </a>

                {/* Budget */}
                <a href={`/wedding/${slug}/budget`}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Budget</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Devis, dépenses & prestataires</p>
                  <div className="flex items-end gap-1 mt-auto">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{budgetCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mb-0.5">poste{(budgetCount ?? 0) > 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">Gérer →</p>
                </a>

              </div>
            </div>

            {/* JOUR J */}
            <div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.3rem', fontStyle: 'italic' }}
                 className="text-[#4a5240] mb-3">Jour J</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Programme */}
                <a href={`/wedding/${slug}/programme`}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Programme</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Déroulé de la journée</p>
                  <div className="flex items-end gap-1 mt-auto">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{programmeCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mb-0.5">étape{(programmeCount ?? 0) > 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">Gérer →</p>
                </a>

                {/* Photos — vedette */}
                <a href={`/wedding/${slug}/photos`}
                   className="group relative sm:col-span-2 rounded-xl overflow-hidden border border-stone-100 hover:shadow-md transition-all"
                   style={{ minHeight: '130px' }}>
                  {wedding.cover_image_url
                    ? <img src={wedding.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : <div className="absolute inset-0 bg-[#2d3228]" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/30 to-black/10" />
                  <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                    <div>
                      <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.3rem' }} className="text-white">Photos</p>
                      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-white/70">Album partagé avec les invités</p>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-end gap-1.5">
                        <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.4rem', lineHeight: 1 }} className="text-white">{photoCount ?? 0}</span>
                        <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-white/70 mb-0.5">photo{(photoCount ?? 0) > 1 ? 's' : ''}</span>
                      </div>
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-white/60 group-hover:text-white transition">Voir l'album →</p>
                    </div>
                  </div>
                </a>

                {/* Hébergements */}
                <a href={`/wedding/${slug}/hebergements`}
                   className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all sm:col-start-1">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Hébergements</p>
                  <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Options aux alentours</p>
                  <div className="flex items-end gap-1 mt-auto">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{hebergementCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mb-0.5">option{(hebergementCount ?? 0) > 1 ? 's' : ''}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">Gérer →</p>
                </a>

              </div>
            </div>

            {/* Countdown */}
            {wedding.date && <Countdown weddingDate={wedding.date} />}

          </div>

          {/* ── Colonne droite : mémo ── */}
          <div className="w-full lg:w-64 shrink-0">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.3rem', fontStyle: 'italic' }}
               className="text-[#4a5240] mb-3">Notes & suivi</p>
            <Memo
              slug={slug}
              systemItems={systemChecklist}
              customItems={(todosData ?? []).map(t => ({ id: t.id, label: t.label, done: t.done }))}
            />

            {/* Infos rapides */}
            <div className="mt-4 bg-white rounded-xl border border-stone-100 divide-y divide-stone-50">
              <a href={`/wedding/${slug}/edit`} className="group flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Date</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '0.95rem' }}
                     className={`capitalize ${dateFormatted ? 'text-stone-700' : 'text-stone-300 italic'}`}>
                    {dateFormatted ?? 'Non renseignée'}
                  </p>
                </div>
                <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition">→</span>
              </a>
              <a href={`/wedding/${slug}/edit`} className="group flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition">
                <div className="min-w-0">
                  <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Lieu</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '0.95rem' }}
                     className={`truncate ${wedding.location ? 'text-stone-700' : 'text-stone-300 italic'}`}>
                    {wedding.location ?? 'Non renseigné'}
                  </p>
                </div>
                <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0 ml-2">→</span>
              </a>
              <a href={`/wedding/${slug}/partager`} className="group flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Lien invités</p>
                  <p style={{ fontWeight: 300, fontSize: '0.8rem' }}
                     className={wedding.share_code ? 'text-[#4a5240]' : 'text-stone-300 italic'}>
                    {wedding.share_code ? `Actif` : 'Non configuré'}
                  </p>
                </div>
                <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition">→</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
