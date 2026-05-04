import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import Countdown from './Countdown'
import Memo from './Memo'
import PlanningWidget from './PlanningWidget'
import { isPaid } from '@/lib/plan'

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
    { label: 'Photo de couverture', done: !!wedding.cover_image_url, href: `/mariage/${slug}/edit` },
    { label: 'Date fixée', done: !!wedding.date, href: `/mariage/${slug}/edit` },
    { label: 'Lieu renseigné', done: !!wedding.location, href: `/mariage/${slug}/edit` },
    { label: 'Invités ajoutés', done: (guestCount ?? 0) > 0, href: `/mariage/${slug}/guests` },
    { label: 'Faire-parts envoyés', done: (guestCount ?? 0) > 0 && !!wedding.share_code, href: `/mariage/${slug}/partager` },
    { label: 'Programme créé', done: (programmeCount ?? 0) > 0, href: `/mariage/${slug}/programme` },
    { label: 'Plan de table', done: (tableCount ?? 0) > 0, href: `/mariage/${slug}/tables` },
    { label: 'Mot des mariés', done: !!(wedding.couple_message || (ruleCount ?? 0) > 0), href: `/mariage/${slug}/regles` },
    { label: 'Hébergements', done: (hebergementCount ?? 0) > 0, href: `/mariage/${slug}/hebergements` },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[42vh] min-h-[220px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />

        {/* Encadré central date + lieu */}
        {(dateFormatted || wedding.location) && (
          <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
            <div className="border border-white/30 backdrop-blur-sm bg-black/20 rounded-lg px-4 py-2.5 text-center text-white max-w-xs mx-4">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(1rem, 3vw, 1.4rem)', lineHeight: 1.1 }}>
                {wedding.name}
              </h2>
              {dateFormatted && (
                <p className="capitalize mt-1" style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.05em', opacity: 0.85 }}>
                  {dateFormatted}
                </p>
              )}
              {wedding.location && (
                <p style={{ fontWeight: 300, fontSize: '0.65rem', opacity: 0.7 }} className="mt-0.5">
                  {wedding.location}
                </p>
              )}
            </div>
          </div>
        )}

        <a href={`/mariage/${slug}/edit`}
           className="absolute top-4 right-4 text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg backdrop-blur transition"
           style={{ fontWeight: 300 }}>
          Modifier
        </a>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Countdown */}
        {wedding.date && (
          <div className="mb-8">
            <Countdown weddingDate={wedding.date} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Colonne principale ── */}
          <div className="flex-1 min-w-0">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <a href={`/mariage/${slug}/guests`} className="group bg-white rounded-xl border border-stone-100 p-4 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase mb-1">Invités</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{guestCount ?? 0}</p>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-1">{confirmedCount ?? 0} confirmés</p>
              </a>
              <a href={`/mariage/${slug}/budget`} className="group bg-white rounded-xl border border-stone-100 p-4 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase mb-1">Budget</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{budgetCount ?? 0}</p>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-1">postes</p>
              </a>
              <a href={`/mariage/${slug}/photos`} className="group bg-white rounded-xl border border-stone-100 p-4 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase mb-1">Photos</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{photoCount ?? 0}</p>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-1">partagées</p>
              </a>
              <a href={`/mariage/${slug}/messages`} className="group bg-white rounded-xl border border-stone-100 p-4 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase mb-1">Messages</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#2d3228]">{unreadMessages?.length ?? 0}</p>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-1">non lus</p>
              </a>
            </div>

            {/* Planning */}
            <div className="mb-8">
              <PlanningWidget slug={slug} weddingId={wedding.id} />
            </div>

            {/* Grille modules */}
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem' }}
               className="text-[#4a5240] mb-3">Modules</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

              {/* Invités */}
              <a href={`/mariage/${slug}/guests`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">👥</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Invités</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Liste & RSVPs</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Budget */}
              <a href={`/mariage/${slug}/budget`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">💰</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Budget</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Dépenses & suivi</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Programme */}
              <a href={`/mariage/${slug}/programme`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">📋</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Programme</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Déroulé de la journée</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Plan de table */}
              <a href={`/mariage/${slug}/tables`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">🪑</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Plan de table</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Placement des invités</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Hébergements */}
              <a href={`/mariage/${slug}/hebergements`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">🏨</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Hébergements</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Logements & nuitées</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Photos */}
              <a href={`/mariage/${slug}/photos`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">📷</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Photos</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Galerie partagée</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Messages */}
              <a href={`/mariage/${slug}/messages`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">💬</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Messages</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Questions des invités</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Règles & infos */}
              <a href={`/mariage/${slug}/regles`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">📜</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Infos & règles</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Mot des mariés</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Musique */}
              <a href={`/mariage/${slug}/musique`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">🎵</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Musique</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Playlist & ambiance</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Jeux & anim. */}
              <a href={`/mariage/${slug}/jeux`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">🎉</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Jeux &amp; anim.</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Idées pour la fête</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* QR Code */}
              <a href={`/mariage/${slug}/partager`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">📲</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">QR Code</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Accès rapide jour J</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

              {/* Livre d'Or */}
              <a href={`/mariage/${slug}/livre-dor`}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <span className="text-2xl mb-1">📖</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }} className="text-[#2d3228]">Livre d&apos;Or</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mb-3">Messages des invités</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto">Gérer →</p>
              </a>

            </div>
          </div>

          {/* ── Colonne droite : mémo ── */}
          <div className="w-full lg:w-64 shrink-0">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem' }}
               className="text-[#4a5240] mb-3">Notes & suivi</p>
            <Memo
              slug={slug}
              systemItems={systemChecklist}
              customItems={(todosData ?? []).map(t => ({ id: t.id, label: t.label, done: t.done }))}
            />

            {/* Infos rapides */}
            <div className="mt-4 bg-white rounded-xl border border-stone-100 divide-y divide-stone-50">
              <a href={`/mariage/${slug}/partager`} className="group flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition">
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
