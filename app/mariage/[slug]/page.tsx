import { createSupabaseServerClient } from '@/lib/supabase-server'
import Countdown from './Countdown'
import Memo from './Memo'
import EcheancesWidget from './EcheancesWidget'
import { isPaid } from '@/lib/plan'
import Link from 'next/link'
import {
  Users, LayoutGrid, Wallet, ListChecks, Music, BedDouble,
  Contact, CheckSquare, Palette, Clock, Camera, BookOpen,
  MessageCircle, PartyPopper, QrCode, Share2, UserPlus,
  StickyNote, Hourglass, ChefHat, Flower2, CalendarHeart,
  Send
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
      <div className="relative w-full h-[120px] overflow-hidden rounded-b-2xl">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: `center ${wedding.cover_position_y ?? 50}%` }} />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #6b7a5e 0%, #4a5240 100%)' }} />
        }
        <div className="absolute inset-0 bg-black/25" />
        <Link
          href={`/mariage/${slug}/edit`}
          className="absolute top-3 right-3 z-10 bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full border-none cursor-pointer hover:bg-white/30 transition"
          style={{ fontSize: '0.68rem', fontWeight: 300 }}
        >
          <Camera className="w-3 h-3 inline mr-1 -mt-0.5" />
          Modifier
        </Link>
        <div className="absolute bottom-4 left-5 z-10 text-white">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.25rem', lineHeight: 1.1 }}>
            {wedding.name}
          </h2>
          {dateFormatted && (
            <p className="capitalize mt-0.5" style={{ fontWeight: 300, fontSize: '0.72rem', opacity: 0.85 }}>
              {dateFormatted}
              {wedding.location && (
                <span className="ml-2 opacity-80">
                  📍 {wedding.location}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-2.5 mt-4">
          {[
            { href: 'guests', value: guestCount ?? 0,     label: "Invités" },
            { href: 'guests', value: confirmedCount ?? 0,  label: "Confirmés" },
            { href: 'photos', value: photoCount ?? 0,      label: "Photos" },
            { href: 'budget', value: budgetCount ?? 0,     label: "Postes budget" },
          ].map(s => (
            <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
               className="flex-1 bg-white/70 rounded-xl py-2.5 text-center hover:bg-white transition">
              <p style={{ fontWeight: 500, fontSize: '1.25rem', lineHeight: 1 }} className="text-stone-800">{s.value}</p>
              <p style={{ fontWeight: 300, fontSize: '0.62rem' }} className="text-stone-400 mt-0.5">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 mt-5 pb-24">

          {/* LEFT COLUMN */}
          <div className="space-y-4">

            {/* Prochaines tâches */}
            <EcheancesWidget slug={slug} weddingId={wedding.id} />

            {/* PRÉPARER */}
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.04em' }} className="text-stone-400 uppercase mb-2">
                Préparer
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {prepModules.map(m => (
                  <Link key={m.href} href={`/mariage/${slug}/${m.href}`}
                     className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 hover:bg-stone-50 transition group">
                    <m.icon className="w-4 h-4 text-[#4a5240] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-700 leading-tight truncate">{m.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-300 leading-tight truncate">{m.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* LE JOUR J ET APRÈS */}
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.04em' }} className="text-stone-400 uppercase mb-2">
                Le jour J et après
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {jourJModules.map(m => (
                  <Link key={m.href} href={`/mariage/${slug}/${m.href}`}
                     className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 hover:bg-stone-50 transition group">
                    <m.icon className="w-4 h-4 text-[#4a5240] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-700 leading-tight truncate">{m.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-300 leading-tight truncate">{m.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ET APRÈS */}
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.04em' }} className="text-stone-400 uppercase mb-2">
                Et après
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {apresModules.map(m => (
                  <Link key={m.href} href={`/mariage/${slug}/${m.href}`}
                     className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 hover:bg-stone-50 transition group">
                    <m.icon className="w-4 h-4 text-[#4a5240] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-700 leading-tight truncate">{m.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-300 leading-tight truncate">{m.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* OUTILS */}
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.65rem', letterSpacing: '0.04em' }} className="text-stone-400 uppercase mb-2">
                Outils
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {outilsModules.map(m => (
                  <Link key={m.href} href={`/mariage/${slug}/${m.href}`}
                     className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 hover:bg-stone-50 transition group">
                    <m.icon className="w-4 h-4 text-[#4a5240] shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-700 leading-tight truncate">{m.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.58rem' }} className="text-stone-300 leading-tight truncate">{m.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">

            {/* Countdown */}
            {wedding.date && (
              <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 mb-3" style={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  <Hourglass className="w-4 h-4 text-[#4a5240]" strokeWidth={1.5} />
                  <span className="text-stone-700">Compte à rebours</span>
                </p>
                <Countdown weddingDate={wedding.date} small />
              </div>
            )}

            {/* Gérer à deux */}
            <Link href={`/mariage/${slug}/compte`}
               className="flex items-center gap-2.5 bg-white rounded-xl border border-stone-100 px-3 py-2.5 hover:bg-stone-50 transition cursor-pointer">
              <UserPlus className="w-4 h-4 text-[#4a5240] shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p style={{ fontWeight: 500, fontSize: '0.75rem' }} className="text-stone-700">Gérer à deux</p>
                <p style={{ fontWeight: 300, fontSize: '0.6rem' }} className="text-stone-400">Inviter votre moitié</p>
              </div>
              <span className="text-stone-300 text-sm">›</span>
            </Link>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <StickyNote className="w-4 h-4 text-[#4a5240]" strokeWidth={1.5} />
                <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-700">Notes</p>
              </div>
              <Memo
                slug={slug}
                systemItems={systemChecklist}
                customItems={(todosData ?? []).map(t => ({ id: t.id, label: t.label, done: t.done }))}
              />
            </div>

            {/* Prestataires widget */}
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Contact className="w-4 h-4 text-[#4a5240]" strokeWidth={1.5} />
                <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-700">Prestataires</p>
              </div>
              <div className="space-y-0">
                {(vendors && vendors.length > 0) ? vendors.map(v => {
                  const Icon = vendorIcons[v.category?.toLowerCase() ?? ''] ?? Contact
                  return (
                    <div key={v.id} className="flex items-center justify-between py-1.5" style={{ fontSize: '0.72rem', lineHeight: 2 }}>
                      <span className="flex items-center gap-1.5 text-stone-600">
                        <Icon className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
                        {v.name || v.category}
                      </span>
                    </div>
                  )
                }) : (
                  <>
                    {["Traiteur", "Photographe", "DJ", "Fleuriste"].map(cat => {
                      const Icon = vendorIcons[cat.toLowerCase()] ?? Contact
                      return (
                        <div key={cat} className="flex items-center justify-between py-1.5" style={{ fontSize: '0.72rem', lineHeight: 2 }}>
                          <span className="flex items-center gap-1.5 text-stone-600">
                            <Icon className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
                            {cat}
                          </span>
                          <Link href={`/mariage/${slug}/prestataires`} style={{ fontSize: '0.6rem', fontWeight: 300 }} className="text-stone-300 hover:text-[#4a5240] transition">
                            + Ajouter
                          </Link>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>

            {/* CTA upgrade */}
            {!paid && (
              <div className="bg-[#f5f0e8] border border-[#e0dbd0] rounded-2xl p-4 text-center">
                <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-stone-500 mb-3">
                  Débloquez toutes les fonctionnalités
                </p>
                <Link href={`/mariage/${slug}/upgrade`}
                   className="inline-block bg-[#4a5240] text-white rounded-full px-5 py-2 hover:bg-[#2d3228] transition"
                   style={{ fontSize: '0.75rem', fontWeight: 400 }}>
                  Voir les offres
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
