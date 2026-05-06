import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import Countdown from './Countdown'
import Memo from './Memo'
import EcheancesWidget from './EcheancesWidget'
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

  const modules = [
    // Préparatifs
    { href: 'guests',          emoji: '👥', label: 'Invités',        sub: 'Liste & RSVPs' },
    { href: 'tables',          emoji: '🪑', label: 'Plan de table',  sub: 'Placement' },
    { href: 'budget',          emoji: '💰', label: 'Budget',         sub: 'Dépenses & suivi' },
    { href: 'regles',          emoji: '📜', label: 'Mot des mariés', sub: 'Message & infos' },
    { href: 'retro-planning',  emoji: '🗓️', label: 'Rétro-planning', sub: 'Avant le jour J' },
    // Jour J
    { href: 'checklist',       emoji: '✅', label: 'Checklist J',    sub: 'Qui fait quoi' },
    { href: 'programme',       emoji: '📋', label: 'Programme',      sub: 'Déroulé du jour' },
    { href: 'jeux',            emoji: '🎉', label: 'Jeux',           sub: 'Animations' },
    { href: 'musique',         emoji: '🎵', label: 'Musique',        sub: 'Playlist' },
    { href: 'hebergements',    emoji: '🏨', label: 'Hébergements',   sub: 'Logements' },
    { href: 'partager',        emoji: '📲', label: 'QR Code',        sub: 'Accès invités' },
    // Autres
    { href: 'photos',          emoji: '📷', label: 'Photos',         sub: 'Galerie partagée' },
    { href: 'livre-dor',       emoji: '📖', label: "Livre d'Or",     sub: 'Messages' },
    { href: 'messagerie',      emoji: '💬', label: 'Messagerie',     sub: 'Questions invités' },
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

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: 'guests',   label: 'Invités',   value: guestCount ?? 0,              sub: `${confirmedCount ?? 0} conf.` },
            { href: 'budget',   label: 'Budget',    value: budgetCount ?? 0,             sub: 'postes' },
            { href: 'photos',   label: 'Photos',    value: photoCount ?? 0,              sub: 'partagées' },
            { href: 'messages', label: 'Messages',  value: unreadMessages?.length ?? 0,  sub: 'non lus' },
          ].map(s => (
            <a key={s.href} href={`/mariage/${slug}/${s.href}`}
               className="bg-white rounded-xl border border-stone-100 p-3 text-center hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem', lineHeight: 1 }} className="text-[#2d3228]">{s.value}</p>
              <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase mt-1">{s.label}</p>
              <p style={{ fontWeight: 300, fontSize: '0.6rem' }} className="text-stone-300 mt-0.5">{s.sub}</p>
            </a>
          ))}
        </div>

        {/* Échéances rétro-planning */}
        <EcheancesWidget slug={slug} weddingId={wedding.id} />

        {/* Modules */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-3">Rubriques</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {modules.map(m => (
              <a key={m.href} href={`/mariage/${slug}/${m.href}`}
                 className="group bg-white rounded-xl border border-stone-100 px-3 py-3 flex flex-col items-center text-center hover:border-[#4a5240]/30 hover:shadow-sm transition-all gap-1.5">
                <span className="text-xl">{m.emoji}</span>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-700 leading-tight">{m.label}</p>
                <p style={{ fontWeight: 300, fontSize: '0.6rem' }} className="text-stone-300 leading-tight hidden sm:block">{m.sub}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Countdown */}
        {wedding.date && <Countdown weddingDate={wedding.date} small />}

        {/* Notes & suivi */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase mb-3">Notes & suivi</p>
          <Memo
            slug={slug}
            systemItems={systemChecklist}
            customItems={(todosData ?? []).map(t => ({ id: t.id, label: t.label, done: t.done }))}
          />
        </div>

      </div>
    </div>
  )
}
