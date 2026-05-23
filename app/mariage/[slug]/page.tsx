import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'
import EcheancesWidget from './EcheancesWidget'
import CreateModal from './CreateModal'
import OnboardingTour from './OnboardingTour'
import { isPaid } from '@/lib/plan'
import Link from 'next/link'
import {
  Users, CheckCircle2, Clock, MessageCircle, Camera, Zap,
  Plus, Settings, Eye, LayoutGrid, Wallet, ListChecks, Music,
  BedDouble, Contact, CheckSquare, Palette, PartyPopper,
  BookOpen, QrCode, Share2, ChefHat, Flower2, Hourglass,
  UserPlus, StickyNote
} from 'lucide-react'

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
    { data: todosData },
    { data: vendors },
    { count: programCount },
    { count: tablesCount },
    { data: recentPhotos },
    { data: recentConfirmed },
    { data: recentGuestbook },
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('budget_items').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_todos').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('wedding_vendors').select('id, name, category').eq('wedding_id', wedding.id).limit(5),
    supabase.from('program_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('tables').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('photos').select('uploaded_by_name, created_at').eq('wedding_id', wedding.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('guests').select('first_name, last_name, created_at').eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme').order('created_at', { ascending: false }).limit(3),
    supabase.from('guestbook_entries').select('author_name, created_at').eq('wedding_id', wedding.id).order('created_at', { ascending: false }).limit(2),
  ])

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const paid = isPaid(wedding.plan)

  const vendorIcons: Record<string, typeof ChefHat> = {
    traiteur: ChefHat, photographe: Camera, dj: Music, fleuriste: Flower2,
  }

  const prepModules = [
    { href: 'guests',         icon: Users,      label: "Invités",        sub: "Liste, RSVP, faire-parts" },
    { href: 'tables',         icon: LayoutGrid,  label: "Plan de table",  sub: "Placement" },
    { href: 'budget',         icon: Wallet,      label: "Budget",         sub: "Dépenses et suivi" },
    { href: 'retro-planning', icon: ListChecks,  label: "Rétro-planning", sub: "Avant le jour J" },
    { href: 'musique',        icon: Music,       label: "Musique",        sub: "Playlist" },
    { href: 'hebergements',   icon: BedDouble,   label: "Hébergements",   sub: "Logements" },
    { href: 'prestataires',   icon: Contact,     label: "Prestataires",   sub: "Contacts et suivi" },
    { href: 'studio',         icon: Palette,     label: "Studio",         sub: "Papeterie" },
  ]

  const jourJModules = [
    { href: 'programme',   icon: Clock,          label: "Programme",    sub: "Déroulé du jour" },
    { href: 'checklist',   icon: CheckSquare,    label: "Checklist J",  sub: "Qui fait quoi" },
    { href: 'photos',      icon: Camera,         label: "Photos",       sub: "Galerie partagée" },
    { href: 'messagerie',  icon: MessageCircle,  label: "Messagerie",   sub: "Groupes" },
    { href: 'jeux',        icon: PartyPopper,    label: "Jeux",         sub: "Animations" },
  ]

  const apresModules = [
    { href: 'livre-dor',   icon: BookOpen,       label: "Livre d'or",   sub: "Messages" },
  ]

  const outilsModules = [
    { href: 'partager',     icon: QrCode,  label: "QR Code et partage",   sub: "Lien invités" },
    { href: 'invitations',  icon: Share2,  label: "Exports documents",    sub: "PDF, Excel" },
  ]

  const systemChecklist = [
    { label: "Photo de couverture", done: !!wedding.cover_image_url, href: `/mariage/${slug}/edit` },
    { label: "Date fixée", done: !!wedding.date, href: `/mariage/${slug}/edit` },
    { label: "Lieu renseigné", done: !!wedding.location, href: `/mariage/${slug}/edit` },
    { label: "Invités ajoutés", done: (guestCount ?? 0) > 0, href: `/mariage/${slug}/guests` },
    { label: "Programme créé", done: false, href: `/mariage/${slug}/programme` },
  ]

  return (
    <>
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Cover banner */}
      <div className="relative w-full h-[160px] overflow-hidden rounded-b-3xl group">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6b7a5e 0%, #4a5240 100%)' }}>
              <Link href={`/mariage/${slug}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition"
                style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                <Camera className="w-4 h-4" />
                Ajouter une photo de couverture
              </Link>
            </div>
        }
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-5 left-6 z-10 text-white">
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2rem', lineHeight: 1.1 }}>
            {wedding.name}
          </h1>
          {dateFormatted && (
            <p className="capitalize mt-1" style={{ fontWeight: 300, fontSize: '0.85rem', opacity: 0.9 }}>
              {dateFormatted} {wedding.location && <span>• 📍 {wedding.location}</span>}
            </p>
          )}
        </div>
        {/* Edit cover button */}
        {wedding.cover_image_url && (
          <Link href={`/mariage/${slug}/edit`}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition opacity-0 group-hover:opacity-100"
            style={{ fontWeight: 400, fontSize: '0.75rem' }}>
            <Camera className="w-3.5 h-3.5" />
            Modifier la photo
          </Link>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Quick stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: guestCount ?? 0, label: "Invités", href: 'guests' },
            { value: confirmedCount ?? 0, label: "Confirmés", href: 'guests' },
            { value: photoCount ?? 0, label: "Photos", href: 'photos' },
            { value: budgetCount ?? 0, label: "Dépenses", href: 'budget' },
          ].map(s => (
            <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition group">
              <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
              <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">

          {/* LEFT: À faire + Derniers mouvements */}
          <div className="lg:col-span-2 space-y-6">

            {/* À faire maintenant */}
            {(() => {
              const pending = (guestCount ?? 0) - (confirmedCount ?? 0)
              const tasks = [
                { label: `Relancer ${Math.max(0, pending)} invité${pending > 1 ? 's' : ''} sans réponse`, done: pending === 0 && (guestCount ?? 0) > 0, href: `/mariage/${slug}/guests` },
                { label: 'Créer le programme du jour J', done: (programCount ?? 0) > 0, href: `/mariage/${slug}/programme` },
                { label: 'Finaliser le plan de table', done: (tablesCount ?? 0) > 0, href: `/mariage/${slug}/tables` },
                { label: 'Renseigner vos prestataires', done: (vendors?.length ?? 0) > 0, href: `/mariage/${slug}/prestataires` },
              ]
              return (
                <div className="bg-white rounded-3xl border border-stone-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">À faire maintenant</h2>
                    <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task, i) => (
                      <Link key={i} href={task.href} className="flex items-start gap-3 group">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 group-hover:border-[#4a5240]'}`}>
                          {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <p style={{ fontWeight: 400, fontSize: '0.95rem' }} className={task.done ? 'text-stone-400 line-through' : 'text-stone-700 group-hover:text-[#4a5240]'}>{task.label}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Derniers mouvements */}
            {(() => {
              const activity: { text: string; time: string }[] = []
              recentConfirmed?.forEach(g => {
                const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
                activity.push({ text: `${name} a confirmé sa présence`, time: g.created_at })
              })
              recentPhotos?.forEach(p => {
                const name = p.uploaded_by_name || 'Quelqu\'un'
                activity.push({ text: `${name} a ajouté une photo`, time: p.created_at })
              })
              recentGuestbook?.forEach(e => {
                activity.push({ text: `${e.author_name} a laissé un message dans le livre d\'or`, time: e.created_at })
              })
              activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              const top = activity.slice(0, 5)
              return (
                <div className="bg-white rounded-3xl border border-stone-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
                    <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
                  </div>
                  {top.length === 0 ? (
                    <p style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-stone-400 italic">
                      Aucune activité récente — invitez vos premiers invités !
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {top.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4a5240]/30 shrink-0" />
                          <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">{item.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })()}

          </div>

          {/* RIGHT: Infos mariage + Accès rapides + Divers */}
          <div className="space-y-6">

            {/* Pastille infos mariage */}
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.2 }} className="text-[#2d3228] truncate">
                    {wedding.name}
                  </p>
                  <div className="mt-2 space-y-1">
                    {wedding.date && (
                      <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500 flex items-center gap-1.5">
                        <span className="text-[#4a5240]">📅</span>
                        <span className="capitalize">{dateFormatted}</span>
                      </p>
                    )}
                    {!wedding.date && (
                      <Link href={`/mariage/${slug}/edit`} style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 italic flex items-center gap-1.5 hover:text-[#4a5240] transition">
                        <span>📅</span> Date non renseignée
                      </Link>
                    )}
                    {wedding.location && (
                      <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500 flex items-center gap-1.5">
                        <span className="text-[#4a5240]">📍</span> {wedding.location}
                      </p>
                    )}
                    {!wedding.location && (
                      <Link href={`/mariage/${slug}/edit`} style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 italic flex items-center gap-1.5 hover:text-[#4a5240] transition">
                        <span>📍</span> Lieu non renseigné
                      </Link>
                    )}
                  </div>
                </div>
                <Link href={`/mariage/${slug}/edit`}
                  className="shrink-0 p-2 rounded-xl bg-stone-50 hover:bg-[#4a5240]/10 transition"
                  title="Modifier les infos">
                  <Settings className="w-4 h-4 text-stone-400 hover:text-[#4a5240]" />
                </Link>
              </div>
            </div>

            {/* Accès rapides */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800 mb-4">Accès rapides</h2>
              <div className="space-y-2.5">
                <Link href={`/mariage/${slug}/guests`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">Liste invités</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/rsvp`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">Gérer RSVP</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/budget`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">Budget</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/programme`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">Programme</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
              </div>
            </div>

            {/* Compte à rebours */}
            {wedding.date && (
              <div className="bg-gradient-to-br from-[#4a5240] to-[#2d3228] rounded-3xl p-6 text-white text-center">
                <p style={{ fontWeight: 500, fontSize: '0.85rem', opacity: 0.9 }} className="mb-3">Compte à rebours</p>
                <Countdown weddingDate={wedding.date} small />
              </div>
            )}

            {/* Créer button — opens modal */}
            <CreateModal slug={slug} />

          </div>

        </div>
      </div>
    </div>

    {/* Onboarding tour — fixed bottom-right widget */}
    <OnboardingTour slug={slug} guestCount={guestCount ?? 0} vendorCount={vendors?.length ?? 0} />
    </>
  )
}
