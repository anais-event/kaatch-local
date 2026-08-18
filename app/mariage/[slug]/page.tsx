import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations, getLocale } from 'next-intl/server'
import { toDateLocale } from '@/lib/locale-map'
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
  UserPlus, StickyNote, FileText
} from 'lucide-react'
import TodoNow from './TodoNow'
import RecentActivitySection from './RecentActivitySection'

export default async function WeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  const t = await getTranslations('wedding.dashboard')
  const locale = await getLocale()

  if (!wedding) return <div className="p-8">{t('notFound')}</div>

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
    ? new Date(wedding.date).toLocaleDateString(toDateLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const paid = isPaid(wedding.plan)

  const vendorIcons: Record<string, typeof ChefHat> = {
    traiteur: ChefHat, photographe: Camera, dj: Music, fleuriste: Flower2,
  }

  const prepModules = [
    { href: 'guests',         icon: Users,      label: t('modGuests'),       sub: t('modGuestsSub') },
    { href: 'tables',         icon: LayoutGrid,  label: t('modTables'),       sub: t('modTablesSub') },
    { href: 'budget',         icon: Wallet,      label: t('modBudget'),       sub: t('modBudgetSub') },
    { href: 'retro-planning', icon: ListChecks,  label: t('modRetro'),        sub: t('modRetroSub') },
    { href: 'musique',        icon: Music,       label: t('modMusic'),        sub: t('modMusicSub') },
    { href: 'hebergements',   icon: BedDouble,   label: t('modAccom'),        sub: t('modAccomSub') },
    { href: 'prestataires',   icon: Contact,     label: t('modVendors'),      sub: t('modVendorsSub') },
    { href: 'studio',         icon: Palette,     label: t('modStudio'),       sub: t('modStudioSub') },
  ]

  const jourJModules = [
    { href: 'programme',   icon: Clock,          label: t('modProgramme'),    sub: t('modProgrammeSub') },
    { href: 'checklist',   icon: CheckSquare,    label: t('modChecklist'),    sub: t('modChecklistSub') },
    { href: 'photos',      icon: Camera,         label: t('modPhotos'),       sub: t('modPhotosSub') },
    { href: 'messagerie',  icon: MessageCircle,  label: t('modMessaging'),    sub: t('modMessagingSub') },
    { href: 'jeux',        icon: PartyPopper,    label: t('modGames'),        sub: t('modGamesSub') },
  ]

  const apresModules = [
    { href: 'livre-dor',   icon: BookOpen,       label: t('modGuestbook'),    sub: t('modGuestbookSub') },
  ]

  const outilsModules = [
    { href: 'partager',      icon: QrCode,   label: t('modQR'),           sub: t('modQRSub') },
    { href: 'invitations',   icon: Share2,   label: t('modExports'),      sub: t('modExportsSub') },
    { href: 'prestataires',  icon: FileText, label: t('modContracts'),    sub: t('modContractsSub') },
  ]

  const systemChecklist = [
    { label: t('checkCover'), done: !!wedding.cover_image_url, href: `/mariage/${slug}/edit` },
    { label: t('checkDate'), done: !!wedding.date, href: `/mariage/${slug}/edit` },
    { label: t('checkLocation'), done: !!wedding.location, href: `/mariage/${slug}/edit` },
    { label: t('checkGuests'), done: (guestCount ?? 0) > 0, href: `/mariage/${slug}/guests` },
    { label: t('checkProgramme'), done: false, href: `/mariage/${slug}/programme` },
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
                {t('addCoverPhoto')}
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
            {t('editPhoto')}
          </Link>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { value: guestCount ?? 0, label: t('statGuests'), href: 'guests' },
            { value: confirmedCount ?? 0, label: t('statConfirmed'), href: 'guests' },
            { value: photoCount ?? 0, label: t('statPhotos'), href: 'photos' },
            { value: budgetCount ?? 0, label: t('statExpenses'), href: 'budget' },
          ].map(s => (
            <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition group">
              <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
              <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Créer button — full width between stats and content */}
        <div className="mb-8">
          <CreateModal slug={slug} />
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">

          {/* LEFT: À faire + Derniers mouvements */}
          <div className="lg:col-span-2 space-y-6">

            {/* À faire maintenant */}
            <TodoNow slug={slug} tasks={[
              { label: t('todoPartner'), sub: t('todoPartnerSub'), done: false, href: `/mariage/${slug}/compte#partenaire` },
              { label: t('todoPhoto'), sub: t('todoPhotoSub'), done: !!wedding.cover_image_url, href: `/mariage/${slug}/edit` },
              { label: t('todoInfo'), sub: t('todoInfoSub'), done: !!wedding.date && !!wedding.location, href: `/mariage/${slug}/programme` },
              { label: t('todoGuests'), sub: t('todoGuestsSub'), done: (guestCount ?? 0) > 0, href: `/mariage/${slug}/guests` },
              { label: t('todoTables'), sub: t('todoTablesSub'), done: (tablesCount ?? 0) > 0, href: paid ? `/mariage/${slug}/tables` : `/mariage/${slug}/compte#formule` },
              { label: t('todoVendors'), sub: t('todoVendorsSub'), done: (vendors?.length ?? 0) > 0, href: `/mariage/${slug}/prestataires` },
              { label: t('todoTasks'), sub: t('todoTasksSub'), done: (todosData?.length ?? 0) > 0, href: `/mariage/${slug}/retro-planning` },
            ]} />

            {/* Derniers mouvements */}
            {(() => {
              const activity: { text: string; time: string; id: string }[] = []
              recentConfirmed?.forEach((g, idx) => {
                const name = [g.first_name, g.last_name].filter(Boolean).join(' ')
                activity.push({ text: `${name} ${t('actConfirmed')}`, time: g.created_at, id: `confirmed-${idx}` })
              })
              recentPhotos?.forEach((p, idx) => {
                const name = p.uploaded_by_name || t('actSomeone')
                activity.push({ text: `${name} ${t('actPhoto')}`, time: p.created_at, id: `photo-${idx}` })
              })
              recentGuestbook?.forEach((e, idx) => {
                activity.push({ text: `${e.author_name} ${t('actGuestbook')}`, time: e.created_at, id: `guestbook-${idx}` })
              })
              activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              const top = activity.slice(0, 5)
              return <RecentActivitySection activity={top} />
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
                        <span>📅</span> {t('noDate')}
                      </Link>
                    )}
                    {wedding.location && (
                      <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500 flex items-center gap-1.5">
                        <span className="text-[#4a5240]">📍</span> {wedding.location}
                      </p>
                    )}
                    {!wedding.location && (
                      <Link href={`/mariage/${slug}/edit`} style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 italic flex items-center gap-1.5 hover:text-[#4a5240] transition">
                        <span>📍</span> {t('noLocation')}
                      </Link>
                    )}
                  </div>
                </div>
                <Link href={`/mariage/${slug}/edit`}
                  className="shrink-0 p-2 rounded-xl bg-stone-50 hover:bg-[#4a5240]/10 transition"
                  title={t('editInfo')}>
                  <Settings className="w-4 h-4 text-stone-400 hover:text-[#4a5240]" />
                </Link>
              </div>
            </div>

            {/* Accès rapides */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800 mb-4">{t('quickAccess')}</h2>
              <div className="space-y-2.5">
                <Link href={`/mariage/${slug}/guests`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{t('quickGuests')}</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/rsvp`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{t('quickRSVP')}</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/budget`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{t('quickBudget')}</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
                <Link href={`/mariage/${slug}/programme`} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{t('quickProgramme')}</span>
                  <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                </Link>
              </div>
            </div>

            {/* Compte à rebours */}
            {wedding.date && (
              <div className="bg-gradient-to-br from-[#4a5240] to-[#2d3228] rounded-3xl p-6 text-white text-center">
                <p style={{ fontWeight: 500, fontSize: '0.85rem', opacity: 0.9 }} className="mb-3">{t('countdown')}</p>
                <Countdown weddingDate={wedding.date} small />
              </div>
            )}

          </div>

        </div>
      </div>
    </div>

    {/* Onboarding tour — fixed bottom-right widget */}
    <OnboardingTour slug={slug} guestCount={guestCount ?? 0} vendorCount={vendors?.length ?? 0} />
    </>
  )
}
