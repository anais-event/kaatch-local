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
    { count: photoCount },
    { count: prestataireCount },
    { count: hebergementCount },
    { count: programmeCount },
    { data: unreadMessages },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_contacts').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('accommodations').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('programme_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('messages').select('id').eq('wedding_id', wedding.id).eq('read', false).limit(99),
  ])

  const unreadCount = unreadMessages?.length ?? 0

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[40vh] min-h-[220px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-1.5" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontStyle: 'italic', lineHeight: 1.1 }}>
            Mariage de
          </h1>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', lineHeight: 1 }}>
            {wedding.name}
          </h2>
        </div>
        <a href={`/wedding/${slug}/edit`}
           className="absolute top-4 right-4 text-xs text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg backdrop-blur transition"
           style={{ fontWeight: 300 }}>
          Modifier la couverture
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Compte à rebours */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

        {/* ── PRÉPARATIFS ── */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.22em' }}
             className="text-stone-400 uppercase mb-4">Préparatifs</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Invités */}
            <a href={`/wedding/${slug}/guests`}
               className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228]">Invités</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Faire-part & RSVP</p>
              </div>
              <div className="flex items-end gap-1.5 mt-1">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                      className="text-[#2d3228]">{guestCount ?? 0}</span>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-0.5">
                  {(guestCount ?? 0) > 1 ? 'invités' : 'invité'}
                </span>
              </div>
              {(confirmedCount ?? 0) > 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-[#4a5240]">
                  {confirmedCount} confirmé{(confirmedCount ?? 0) > 1 ? 's' : ''}
                </p>
              )}
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                 className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">Gérer →</p>
            </a>

            {/* Budget */}
            <a href={`/wedding/${slug}/budget`}
               className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228]">Budget</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Devis & acomptes</p>
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                 className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">Gérer →</p>
            </a>

            {/* Prestataires */}
            <a href={`/wedding/${slug}/contacts`}
               className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228]">Prestataires</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Sélection & contacts</p>
              </div>
              <div className="flex items-end gap-1.5 mt-1">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                      className="text-[#2d3228]">{prestataireCount ?? 0}</span>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-0.5">
                  {(prestataireCount ?? 0) > 1 ? 'contacts' : 'contact'}
                </span>
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                 className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">Gérer →</p>
            </a>

          </div>
        </div>

        {/* ── JOUR J ── */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.22em' }}
             className="text-stone-400 uppercase mb-4">Jour J</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Programme */}
            <a href={`/wedding/${slug}/programme`}
               className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all">
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228]">Programme</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Déroulé de la journée</p>
              </div>
              <div className="flex items-end gap-1.5 mt-1">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                      className="text-[#2d3228]">{programmeCount ?? 0}</span>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-0.5">
                  {(programmeCount ?? 0) > 1 ? 'étapes' : 'étape'}
                </span>
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                 className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">Gérer →</p>
            </a>

            {/* Photos — carte vedette col-span-1 mais visuellement différente */}
            <a href={`/wedding/${slug}/photos`}
               className="group relative sm:col-span-2 rounded-xl overflow-hidden border border-stone-100 hover:shadow-md transition-all"
               style={{ minHeight: '140px' }}>
              {/* Fond photo ou couleur */}
              {wedding.cover_image_url
                ? <img src={wedding.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 bg-[#2d3228]" />
              }
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/10" />
              <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                <div>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.4rem' }}
                     className="text-white">Photos</p>
                  <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-white/70">Album partagé avec les invités</p>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-end gap-1.5">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.5rem', lineHeight: 1 }}
                          className="text-white">{photoCount ?? 0}</span>
                    <span style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-white/70 mb-0.5">
                      {(photoCount ?? 0) > 1 ? 'photos' : 'photo'}
                    </span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: '0.75rem' }}
                     className="text-white/60 group-hover:text-white transition">Voir l'album →</p>
                </div>
              </div>
            </a>

            {/* Hébergements */}
            <a href={`/wedding/${slug}/hebergements`}
               className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1.5 hover:border-[#4a5240]/40 hover:shadow-sm transition-all sm:col-start-1">
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem' }}
                   className="text-[#2d3228]">Hébergements</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">Options aux alentours</p>
              </div>
              <div className="flex items-end gap-1.5 mt-1">
                <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }}
                      className="text-[#2d3228]">{hebergementCount ?? 0}</span>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mb-0.5">
                  {(hebergementCount ?? 0) > 1 ? 'options' : 'option'}
                </span>
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                 className="text-stone-300 group-hover:text-[#4a5240] transition mt-auto pt-1">Gérer →</p>
            </a>

          </div>
        </div>

        {/* ── INFOS PRATIQUES ── */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.22em' }}
             className="text-stone-400 uppercase mb-4">Infos pratiques</p>
          <div className="bg-white rounded-xl border border-stone-100 divide-y divide-stone-50">

            <a href={`/wedding/${slug}/edit`}
               className="group flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition">
              <div className="w-8 h-8 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#4a5240]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Date</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                   className={`capitalize ${dateFormatted ? 'text-stone-700' : 'text-stone-300 italic'}`}>
                  {dateFormatted ?? 'Non renseignée'}
                </p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">Modifier →</span>
            </a>

            <a href={`/wedding/${slug}/edit`}
               className="group flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition">
              <div className="w-8 h-8 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#4a5240]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Lieu</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                   className={`truncate ${wedding.location ? 'text-stone-700' : 'text-stone-300 italic'}`}>
                  {wedding.location ?? 'Non renseigné'}
                </p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">Modifier →</span>
            </a>

            <a href={`/wedding/${slug}/partager`}
               className="group flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition">
              <div className="w-8 h-8 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-[#4a5240]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }} className="text-stone-400 uppercase">Lien invités</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                   className={wedding.share_code ? 'text-[#4a5240]' : 'text-stone-300 italic'}>
                  {wedding.share_code ? `/p/${wedding.share_code}` : 'Non configuré'}
                </p>
              </div>
              <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 group-hover:text-[#4a5240] transition shrink-0">Voir →</span>
            </a>

          </div>
        </div>

      </div>
    </div>
  )
}
