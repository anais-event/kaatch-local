import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'
import EcheancesWidget from './EcheancesWidget'
import CreateModal from './CreateModal'
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
  ] = await Promise.all([
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id).eq('rsvp_status', 'confirme'),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('budget_items').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('wedding_todos').select('*').eq('wedding_id', wedding.id).order('created_at'),
    supabase.from('wedding_vendors').select('id, name, category').eq('wedding_id', wedding.id).limit(5),
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
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Cover banner */}
      <div className="relative w-full h-[140px] overflow-hidden rounded-b-3xl">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #6b7a5e 0%, #4a5240 100%)' }} />
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
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">À faire maintenant</h2>
                <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                {[
                  { label: `Relancer ${Math.max(0, (guestCount ?? 0) - (confirmedCount ?? 0))} invités sans réponse`, done: false },
                  { label: 'Valider le programme du jour J', done: false },
                  { label: 'Finaliser le plan de table', done: false },
                  { label: 'Confirmer les prestataires', done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300'}`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <p style={{ fontWeight: 400, fontSize: '0.95rem' }} className={task.done ? 'text-stone-400 line-through' : 'text-stone-700'}>{task.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers mouvements */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
                <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-4">
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Côté invités</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Léa a confirmé sa présence</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Camille a ajouté 8 photos</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Jules a laissé un message</li>
                  </ul>
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Côté prestataires</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Le traiteur a envoyé son devis</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Le photographe a validé l"horaire</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Accès rapides + Divers */}
          <div className="space-y-6">

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
  )
}
