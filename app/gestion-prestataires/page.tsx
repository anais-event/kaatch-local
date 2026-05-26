import type { Metadata } from 'next'
import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import PublicNav from '../_components/PublicNav'
import messages from '@/messages/fr.json'
import {
  Shield, Eye, EyeOff, Users, UtensilsCrossed, Camera, Music,
  Flower2, MapPin, ListChecks, Armchair, ClipboardList, Lock,
  Send, UserPlus, ToggleRight, Bell, ChevronRight, Sparkles,
  CheckCircle2, Heart, Handshake, CalendarHeart, NotebookPen, FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: "Gestion des prestataires mariage — Kaatch",
  description: "Invitez vos prestataires de mariage et donnez-leur accès uniquement aux informations dont ils ont besoin. Traiteur, photographe, DJ, fleuriste : chacun voit ce qui le concerne.",
  openGraph: {
    title: "Gestion des prestataires mariage — Kaatch",
    description: "Partagez les bonnes infos avec les bonnes personnes. Chaque prestataire accède uniquement à ce que vous autorisez.",
  },
}

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-body)'
const GREEN = '#2C3B2E'
const SAGE = '#4a5240'
const CREAM = '#f5f0e8'

const vendorTypes = [
  {
    icon: UtensilsCrossed,
    label: 'Traiteur',
    permissions: ['Nombre d\'invités', 'Allergies & régimes', 'Programme', 'Plan de table', 'Lieu'],
    color: '#d97706',
  },
  {
    icon: Camera,
    label: 'Photographe',
    permissions: ['Nombre d\'invités', 'Liste des noms', 'Programme', 'Lieu'],
    color: '#6366f1',
  },
  {
    icon: Music,
    label: 'DJ & musiciens',
    permissions: ['Nombre d\'invités', 'Programme', 'Playlist', 'Lieu'],
    color: '#ec4899',
  },
  {
    icon: Flower2,
    label: 'Fleuriste',
    permissions: ['Programme', 'Lieu'],
    color: '#14b8a6',
  },
]

const allPermissions = [
  { icon: Users, label: "Nombre d'invités", desc: "Combien de personnes seront présentes" },
  { icon: ClipboardList, label: "Liste des noms", desc: "Noms complets de chaque invité" },
  { icon: UtensilsCrossed, label: "Allergies & régimes", desc: "Restrictions alimentaires détaillées" },
  { icon: ListChecks, label: "Programme du jour", desc: "Déroulé complet avec horaires" },
  { icon: Music, label: "Playlist musicale", desc: "Morceaux choisis par moment" },
  { icon: Armchair, label: "Plan de table", desc: "Disposition et placement" },
  { icon: MapPin, label: "Lieu & adresse", desc: "Coordonnées et accès au lieu" },
]

const steps = [
  {
    icon: UserPlus,
    title: 'Ajoutez un prestataire',
    desc: "Indiquez le nom, le type (traiteur, photographe, DJ…) et son email. C'est tout.",
  },
  {
    icon: ToggleRight,
    title: 'Choisissez les accès',
    desc: "Activez ou désactivez chaque information : nombre d'invités, allergies, programme, plan de table, lieu… Vous gardez le contrôle total.",
  },
  {
    icon: Send,
    title: 'Envoyez le lien',
    desc: "Copiez le lien sécurisé ou envoyez-le directement. Votre prestataire accède instantanément à son espace dédié, sans créer de compte.",
  },
]

export default function GestionPrestatairesPage() {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
    <main style={{ fontFamily: BODY, fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-stone-200/60 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: SAGE, letterSpacing: '0.05em' }} className="uppercase">
              Accès sécurisé & contrôlé
            </span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GREEN }} className="mb-5">
            Partagez les bonnes infos<br />
            <span style={{ fontWeight: 400, color: SAGE }}>avec les bonnes personnes</span>
          </h1>

          <p style={{ fontWeight: 300, fontSize: '1.1rem', lineHeight: 1.7 }} className="text-stone-500 max-w-xl mx-auto mb-10">
            Chaque prestataire accède uniquement aux informations dont il a besoin.
            Plus de mails à rallonge, plus de fichiers Excel partagés.
            Tout est centralisé, sécurisé, et à jour en temps réel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/prestataire/rejoindre"
                  className="inline-flex items-center gap-2 text-white rounded-xl px-7 py-3.5 hover:opacity-90 transition"
                  style={{ background: GREEN, fontWeight: 500, fontSize: '0.95rem' }}>
              Vous êtes prestataire ? Rejoindre
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/#fonctionnalites"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 hover:bg-white/60 transition border border-stone-200"
                  style={{ fontWeight: 400, fontSize: '0.9rem', color: SAGE }}>
              Voir toutes les fonctionnalités
            </Link>
          </div>
        </div>
      </section>

      {/* Visual demo — Permission toggles */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-stone-100 shadow-lg overflow-hidden">

            {/* Header card */}
            <div className="p-6 md:p-8 border-b border-stone-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f0eee6' }}>
                  <Camera className="w-5 h-5 text-[#4a5240]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p style={{ fontWeight: 500, fontSize: '1rem' }} className="text-stone-800">Marie Dupont — Photographe</p>
                  <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mt-0.5">marie@studio-photo.fr</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 500 }}>
                  Lien envoyé
                </span>
              </div>
            </div>

            {/* Permission grid */}
            <div className="p-6 md:p-8">
              <p style={{ fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase mb-4">
                Informations partagées
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPermissions.map((p, i) => {
                  const active = i <= 3
                  return (
                    <div key={p.label}
                         className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${active ? 'bg-emerald-50/70 border border-emerald-100' : 'bg-stone-50 border border-stone-100 opacity-50'}`}>
                      <p.icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600' : 'text-stone-300'}`} strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className={active ? 'text-stone-700' : 'text-stone-400'}>{p.label}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className={active ? 'text-stone-400' : 'text-stone-300'}>{p.desc}</p>
                      </div>
                      <div className={`w-8 h-5 rounded-full relative transition ${active ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition ${active ? 'left-3.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="text-center mt-4" style={{ fontWeight: 300, fontSize: '0.72rem', color: '#9ca3af' }}>
            Exemple d'interface — chaque toggle active ou désactive l'accès en un clic
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-4">
            Comment ça marche
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-stone-400 text-center mb-14 max-w-lg mx-auto">
            Trois étapes, zéro prise de tête
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: CREAM }}>
                  <step.icon className="w-6 h-6 text-[#4a5240]" strokeWidth={1.5} />
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4a5240] text-white mb-3" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontWeight: 500, fontSize: '1rem' }} className="text-stone-800 mb-2">{step.title}</h3>
                <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.6 }} className="text-stone-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modèles de contrats */}
      <section className="py-20 px-6" style={{ background: CREAM }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 border border-stone-200/60 rounded-full px-4 py-1.5 mb-6">
                <FileText className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: SAGE, letterSpacing: '0.05em' }} className="uppercase">
                  Contrats inclus
                </span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em', color: GREEN }}
                  className="mb-4">
                Un modèle de contrat par prestataire
              </h2>
              <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500 mb-4">
                Traiteur, photographe, DJ, fleuriste, vidéaste, décorateur — chaque
                type de prestataire a ses spécificités. Kaatch propose un modèle
                de contrat adapté à chaque métier.
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500">
                Les clauses essentielles sont déjà rédigées. Vous personnalisez,
                vous envoyez. Plus besoin de partir d&apos;une page blanche.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <p style={{ fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase mb-4">
                Modèles disponibles
              </p>
              <div className="space-y-3">
                {[
                  { emoji: '🍽️', label: 'Contrat traiteur', detail: 'Menu, allergies, nombre de couverts, acompte' },
                  { emoji: '📸', label: 'Contrat photographe', detail: 'Durée, livrables, droits, délai de retouche' },
                  { emoji: '🎵', label: 'Contrat DJ / musiciens', detail: 'Horaires, matériel, playlist, pauses' },
                  { emoji: '💐', label: 'Contrat fleuriste', detail: 'Compositions, livraison, montage, récupération' },
                  { emoji: '🎥', label: 'Contrat vidéaste', detail: 'Durée, format, délai de livraison, rushes' },
                  { emoji: '🏰', label: 'Contrat lieu de réception', detail: 'Horaires, capacité, état des lieux, caution' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#f5f0e8]/50 border border-stone-100">
                    <span className="text-base shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-stone-700">{item.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">{item.detail}</p>
                    </div>
                    <FileText className="w-3.5 h-3.5 text-stone-300 shrink-0" strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chaque prestataire voit ce qui le concerne */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-4">
            Chaque prestataire voit ce qui le concerne
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-stone-400 text-center mb-14 max-w-lg mx-auto">
            Des permissions par défaut intelligentes, ajustables en un clic
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vendorTypes.map(v => (
              <div key={v.label} className="bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${v.color}12` }}>
                    <v.icon className="w-4.5 h-4.5" style={{ color: v.color }} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-stone-800">{v.label}</h3>
                </div>
                <div className="space-y-1.5">
                  {v.permissions.map(p => (
                    <div key={p} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2} />
                      <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-600">{p}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 mt-3 italic">
                  Permissions par défaut — modifiables à tout moment
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="py-20 px-6" style={{ background: GREEN }}>
        <div className="max-w-3xl mx-auto text-center">
          <Lock className="w-8 h-8 text-white/40 mx-auto mb-6" strokeWidth={1.5} />
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}
              className="text-white mb-5">
            Vos données restent les vôtres
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Shield, title: 'Lien unique sécurisé', desc: "Chaque prestataire reçoit un lien personnel. Personne d'autre ne peut y accéder." },
              { icon: EyeOff, title: 'Accès révocable', desc: "Suspendez ou supprimez l'accès d'un prestataire à tout moment, en un clic." },
              { icon: Eye, title: 'Lecture seule', desc: "Les prestataires peuvent consulter mais ne peuvent rien modifier dans votre mariage." },
            ].map(item => (
              <div key={item.title} className="text-left">
                <item.icon className="w-5 h-5 text-white/60 mb-3" strokeWidth={1.5} />
                <h3 style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-white mb-1.5">{item.title}</h3>
                <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-12">
            Questions fréquentes
          </h2>

          {[
            {
              q: "Mon prestataire doit-il créer un compte ?",
              a: "Non. Il reçoit un lien sécurisé et accède directement à son espace dédié, sans inscription ni mot de passe.",
            },
            {
              q: "Puis-je modifier les accès après avoir envoyé le lien ?",
              a: "Oui. Vous pouvez activer ou désactiver chaque permission à tout moment. Le changement est instantané.",
            },
            {
              q: "Combien de prestataires puis-je ajouter ?",
              a: "Autant que vous le souhaitez. Traiteur, photographe, DJ, fleuriste, décorateur, wedding planner… tous vos prestataires au même endroit.",
            },
            {
              q: "Que voit exactement un prestataire ?",
              a: "Uniquement les informations que vous avez activées pour lui. Par exemple, un traiteur verra le nombre d'invités et les allergies, mais pas la playlist.",
            },
            {
              q: "Est-ce que c'est inclus dans l'offre gratuite ?",
              a: "L'ajout de prestataires est disponible dès l'offre Découverte. Les permissions avancées sont accessibles avec les offres Mariage et Premium.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-stone-200/60 py-5">
              <h3 style={{ fontWeight: 500, fontSize: '0.92rem' }} className="text-stone-800 mb-2">{q}</h3>
              <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }} className="text-stone-500">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wedding Planners & Coordinatrices */}
      <section className="py-24 px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f5f0e8] rounded-full px-4 py-1.5 mb-6">
                <Heart className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: SAGE, letterSpacing: '0.05em' }} className="uppercase">
                  Pour les pros du mariage
                </span>
              </div>

              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: GREEN }}
                  className="mb-3">
                Wedding planners,<br />
                <span style={{ fontWeight: 400, color: SAGE }}>
                  coordinatrices jour J
                </span>
              </h2>

              <p style={{ fontWeight: 300, fontSize: '1rem', lineHeight: 1.8 }} className="text-stone-500 mb-6">
                Vous avez vos outils, vos habitudes, votre façon de travailler — et
                c&apos;est très bien comme ça. Kaatch ne remplace rien de tout ça.
              </p>

              <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500 mb-6">
                En revanche, si vos couples utilisent Kaatch pour gérer leur mariage,
                vous pouvez accéder aux infos qui vous concernent — programme, nombre
                d&apos;invités, plan de table, contacts — sans passer par 14 mails et un
                fichier Excel de 47 onglets.
              </p>

              <p style={{ fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-600">
                Si ça vous parle, on serait ravis de collaborer.
                Si vous préférez vos carnets et vos tableaux, aucun souci — on
                comprend tout à fait.
              </p>
            </div>

            {/* Right — benefits cards */}
            <div className="space-y-4">
              {[
                {
                  icon: CalendarHeart,
                  title: "Un accès dédié, sans compte",
                  desc: "Vos couples vous ajoutent en un clic. Vous recevez un lien sécurisé, vous consultez ce qui vous concerne. Terminé.",
                },
                {
                  icon: Handshake,
                  title: "Complémentaire, pas concurrent",
                  desc: "Kaatch gère la logistique côté couple. Vous gardez la main sur la coordination, la créa, les prestataires. Chacun son métier.",
                },
                {
                  icon: NotebookPen,
                  title: "Toujours à jour, en temps réel",
                  desc: "Si le nombre d'invités change à J-3, vous le voyez immédiatement. Plus besoin de demander.",
                },
                {
                  icon: Eye,
                  title: "Lecture seule, zéro risque",
                  desc: "Vous consultez, vous ne modifiez pas. Les mariés gardent le contrôle total de leur espace.",
                },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 bg-[#f5f0e8]/60 rounded-2xl p-5 border border-stone-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'white' }}>
                    <item.icon className="w-5 h-5 text-[#4a5240]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-stone-800 mb-1">{item.title}</h3>
                    <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.6 }} className="text-stone-500">{item.desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/prestataire/rejoindre"
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 hover:opacity-90 transition text-white"
                      style={{ background: SAGE, fontWeight: 500, fontSize: '0.88rem' }}>
                  Tester en tant que pro
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/wedding-planner"
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 hover:bg-white/60 transition border border-stone-200"
                      style={{ fontWeight: 400, fontSize: '0.85rem', color: SAGE }}>
                  En savoir plus
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center" style={{ background: CREAM }}>
        <div className="max-w-xl mx-auto">
          <Sparkles className="w-6 h-6 text-[#4a5240]/40 mx-auto mb-4" strokeWidth={1.5} />
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="mb-4">
            Prêts à simplifier la coordination ?
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.6 }} className="text-stone-500 mb-8">
            Créez votre espace mariage gratuitement et invitez vos prestataires en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth"
                  className="inline-flex items-center gap-2 text-white rounded-xl px-8 py-4 hover:opacity-90 transition"
                  style={{ background: GREEN, fontWeight: 500, fontSize: '0.95rem' }}>
              Créer mon espace mariage
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/prestataire/rejoindre"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 hover:bg-white/60 transition border border-stone-300"
                  style={{ fontWeight: 400, fontSize: '0.88rem', color: SAGE }}>
              Je suis prestataire
            </Link>
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="py-8 px-6 border-t border-stone-200/60 text-center">
        <Link href="/" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: SAGE }}>
          Kaatch
        </Link>
        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-2">
          L'app de mariage qui pense à tout
        </p>
      </footer>
    </main>
    </NextIntlClientProvider>
  )
}
