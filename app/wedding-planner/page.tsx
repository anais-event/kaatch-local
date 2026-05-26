import type { Metadata } from 'next'
import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import PublicNav from '../_components/PublicNav'
import messages from '@/messages/fr.json'
import {
  Eye, Users, CalendarHeart, Handshake, NotebookPen, ClipboardList,
  ChevronRight, Sparkles, Heart, Shield, Clock, ListChecks,
  MessageCircle, ArrowRight, CheckCircle2, Smartphone, FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: "Wedding Planner & Coordinatrice Jour J — Kaatch, outil collaboratif mariage",
  description: "Kaatch est un outil collaboratif pour les wedding planners et coordinatrices jour J. Accédez aux infos de vos couples en temps réel : programme, invités, plan de table. Sans remplacer vos outils, en complément.",
  keywords: "wedding planner outil, coordinatrice jour J, logiciel wedding planner, gestion mariage professionnel, outil organisation mariage, coordination mariage, planification mariage collaboratif",
  openGraph: {
    title: "Wedding Planner & Coordinatrice Jour J — Kaatch",
    description: "Un espace dédié pour suivre les mariages de vos couples. Programme, invités, plan de table — tout en temps réel, sans compte à créer.",
    url: "https://kaatch.fr/wedding-planner",
    siteName: "Kaatch",
    locale: "fr_FR",
    type: "website",
  },
  alternates: {
    canonical: "https://kaatch.fr/wedding-planner",
  },
}

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-body)'
const GREEN = '#2C3B2E'
const SAGE = '#4a5240'
const CREAM = '#f5f0e8'

const accessFeatures = [
  {
    icon: Users,
    title: "Liste des invités",
    desc: "Nombre exact, noms, RSVP en cours — sans appeler les mariés pour savoir qui a confirmé.",
  },
  {
    icon: ListChecks,
    title: "Programme du jour J",
    desc: "Horaires, lieux, déroulé complet. Mis à jour par les mariés, visible instantanément.",
  },
  {
    icon: ClipboardList,
    title: "Plan de table",
    desc: "Placement, capacité par table. Utile quand le traiteur demande et que les mariés sont en lune de miel mentale.",
  },
  {
    icon: MessageCircle,
    title: "Messagerie interne",
    desc: "Communication directe via la plateforme. Plus besoin de jongler entre WhatsApp, mail et SMS.",
  },
  {
    icon: FileText,
    title: "Modèles de contrats",
    desc: "Un modèle de contrat adapté à chaque type de prestataire (traiteur, photographe, DJ, fleuriste...). Clauses essentielles pré-rédigées.",
  },
]

const whyItWorks = [
  {
    icon: Handshake,
    title: "Complémentaire, jamais concurrent",
    desc: "Kaatch gère la logistique côté couple. Vous gardez la main sur la coordination, la créa, la relation prestataires. Chacun son rôle.",
  },
  {
    icon: Clock,
    title: "Toujours à jour, sans relancer",
    desc: "Quand un invité confirme, quand un horaire change, quand le plan de table bouge — vous le voyez en temps réel. Fini les mails de suivi.",
  },
  {
    icon: Eye,
    title: "Lecture seule, zéro risque",
    desc: "Vous consultez, vous ne modifiez rien. Les mariés gardent le contrôle total de leur espace. Pas de mauvaise manip possible.",
  },
  {
    icon: Shield,
    title: "Accès sécurisé, sans compte",
    desc: "Un lien personnel, un espace dédié. Pas de mot de passe, pas de profil à créer. Vous cliquez, vous accédez.",
  },
]

const useCases = [
  {
    role: "Wedding planner",
    subtitle: "Accompagnement de A à Z",
    points: [
      "Suivre les confirmations RSVP au fil des semaines",
      "Accéder au programme pour coordonner les prestataires",
      "Consulter le plan de table avant les derniers ajustements",
      "Avoir le nombre exact d'invités pour les commandes",
    ],
  },
  {
    role: "Coordinatrice jour J",
    subtitle: "Prise en main le jour même",
    points: [
      "Visualiser le déroulé complet avec horaires et lieux",
      "Savoir qui est invité, qui a confirmé, qui est absent",
      "Accéder aux contacts utiles sans déranger les mariés",
      "Suivre le programme en temps réel depuis son téléphone",
    ],
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Kaatch pour les Wedding Planners et Coordinatrices Jour J",
  "url": "https://kaatch.fr/wedding-planner",
  "description": "Outil collaboratif pour wedding planners et coordinatrices jour J. Accédez aux informations de vos couples en temps réel.",
  "publisher": {
    "@type": "Organization",
    "name": "Kaatch",
    "url": "https://kaatch.fr",
  },
  "mainEntity": {
    "@type": "SoftwareApplication",
    "name": "Kaatch",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Accès prestataire gratuit, inclus dans tous les plans",
    },
  },
}

const faqItems = [
  {
    q: "Est-ce que Kaatch remplace le travail d'une wedding planner ?",
    a: "Non. Kaatch est un outil de gestion pour les couples. Il centralise les infos pratiques (invités, programme, plan de table). Une wedding planner apporte l'accompagnement, la créativité, la coordination humaine — Kaatch ne fait rien de tout ça.",
  },
  {
    q: "Comment accéder à l'espace d'un couple ?",
    a: "Le couple vous ajoute comme prestataire depuis son espace Kaatch. Vous recevez un lien sécurisé et accédez directement aux informations partagées. Pas de compte à créer.",
  },
  {
    q: "Quelles informations sont visibles ?",
    a: "Le couple choisit exactement ce qu'il partage avec vous : nombre d'invités, noms, programme, plan de table, contacts, playlist... Chaque permission s'active ou se désactive individuellement.",
  },
  {
    q: "Puis-je modifier les informations du couple ?",
    a: "Non. L'accès est en lecture seule. Les mariés restent propriétaires de leurs données. Vous consultez, eux décident.",
  },
  {
    q: "Combien ça coûte pour un professionnel ?",
    a: "Rien. L'accès prestataire est gratuit et inclus dans tous les plans Kaatch. C'est le couple qui souscrit, pas vous.",
  },
  {
    q: "Et si mes couples n'utilisent pas Kaatch ?",
    a: "Aucun souci. Kaatch fonctionne indépendamment. Si un jour l'un de vos couples l'adopte, vous pourrez accéder à leur espace. Sinon, rien ne change pour vous.",
  },
  {
    q: "Kaatch propose des modèles de contrats ?",
    a: "Oui. Chaque type de prestataire (traiteur, photographe, DJ, fleuriste, vidéaste, lieu de réception) dispose d'un modèle de contrat avec les clauses essentielles pré-rédigées. Les mariés personnalisent et envoient directement depuis la plateforme.",
  },
]

export default function WeddingPlannerPage() {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
    <main style={{ fontFamily: BODY, fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <PublicNav />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-stone-200/60 rounded-full px-4 py-1.5 mb-6">
            <Heart className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: SAGE, letterSpacing: '0.05em' }} className="uppercase">
              Pour les professionnels du mariage
            </span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GREEN }} className="mb-5">
            Un outil qui travaille<br />
            <span style={{ fontWeight: 400, color: SAGE }}>
              avec vous, pas à votre place
            </span>
          </h1>

          <p style={{ fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.8 }} className="text-stone-500 max-w-xl mx-auto mb-4">
            Kaatch centralise la logistique des mariages pour les couples.
            En tant que wedding planner ou coordinatrice jour J, vous accédez
            aux informations de vos couples en temps réel — sans rien changer
            à votre façon de travailler.
          </p>

          <p style={{ fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-600 max-w-lg mx-auto mb-10">
            Si ça vous parle, on serait ravis de collaborer.
            Si vous préférez vos carnets et vos tableaux Excel, aucun problème
            — on comprend.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/prestataire/rejoindre"
                  className="inline-flex items-center gap-2 text-white rounded-xl px-7 py-3.5 hover:opacity-90 transition"
                  style={{ background: GREEN, fontWeight: 500, fontSize: '0.95rem' }}>
              Tester gratuitement
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/gestion-prestataires"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 hover:bg-white/60 transition border border-stone-200"
                  style={{ fontWeight: 400, fontSize: '0.9rem', color: SAGE }}>
              Comment ça marche pour les prestataires
            </Link>
          </div>
        </div>
      </section>

      {/* Ce que vous pouvez consulter */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3 text-center" style={{ fontWeight: 600 }}>
            Accès en temps réel
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-4">
            Les infos dont vous avez besoin, sans les demander
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-stone-400 text-center mb-14 max-w-lg mx-auto">
            Quand un couple utilise Kaatch, vous accédez à ce qu&apos;il choisit de partager
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {accessFeatures.map(f => (
              <div key={f.title} className="bg-[#f5f0e8]/50 rounded-2xl p-6 border border-stone-100 hover:shadow-md transition">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'white' }}>
                  <f.icon className="w-5 h-5 text-[#4a5240]" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1rem', color: GREEN }} className="mb-2">{f.title}</h3>
                <p style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }} className="text-stone-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi ça fonctionne */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3 text-center" style={{ fontWeight: 600 }}>
            Philosophie
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-4">
            Un outil qui vous respecte
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-stone-400 text-center mb-14 max-w-lg mx-auto">
            Kaatch ne prétend pas savoir mieux que vous comment organiser un mariage
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {whyItWorks.map(item => (
              <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-stone-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: CREAM }}>
                  <item.icon className="w-5 h-5 text-[#4a5240]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.95rem', color: GREEN }} className="mb-1.5">{item.title}</h3>
                  <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.7 }} className="text-stone-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cas d'usage concrets */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3 text-center" style={{ fontWeight: 600 }}>
            Cas concrets
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-4">
            Wedding planner ou coordinatrice jour J ?
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-stone-400 text-center mb-14 max-w-lg mx-auto">
            Deux métiers, deux usages — même accès
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map(uc => (
              <div key={uc.role} className="bg-[#f5f0e8]/50 rounded-2xl border border-stone-100 overflow-hidden">
                <div className="p-6 border-b border-stone-100" style={{ background: CREAM }}>
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em', color: GREEN }}>
                    {uc.role}
                  </h3>
                  <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 mt-1">{uc.subtitle}</p>
                </div>
                <div className="p-6 space-y-3">
                  {uc.points.map(point => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
                      <span style={{ fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.5 }} className="text-stone-600">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Le bon outil au bon moment */}
      <section className="py-20 px-6" style={{ background: GREEN }}>
        <div className="max-w-3xl mx-auto text-center">
          <CalendarHeart className="w-8 h-8 text-white/40 mx-auto mb-6" strokeWidth={1.5} />
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}
              className="text-white mb-5">
            On ne remplace pas votre expertise
          </h2>
          <p style={{ fontWeight: 300, fontSize: '1rem', lineHeight: 1.8 }} className="text-white/70 max-w-xl mx-auto mb-10">
            Vous savez calmer une belle-mère stressée, improviser un plan B
            sous la pluie, et garder le sourire à 23h quand le DJ ne trouve plus
            sa playlist. Aucune app ne fera jamais ça.
          </p>
          <p style={{ fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-white/80 max-w-lg mx-auto">
            Kaatch s&apos;occupe de la tuyauterie — les chiffres, les listes, les mises à jour.
            Vous, vous faites le vrai travail.
          </p>
        </div>
      </section>

      {/* Mobile-first */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 border border-stone-200/60 rounded-full px-4 py-1.5 mb-6">
                <Smartphone className="w-3.5 h-3.5 text-[#4a5240]" strokeWidth={1.5} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: SAGE, letterSpacing: '0.05em' }} className="uppercase">
                  Mobile first
                </span>
              </div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em', color: GREEN }}
                  className="mb-4">
                Consultez depuis votre téléphone, le jour J
              </h2>
              <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500 mb-4">
                Pas d&apos;application à télécharger. Kaatch fonctionne dans le navigateur,
                sur mobile comme sur ordinateur. Vous ouvrez votre lien, vous consultez.
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.8 }} className="text-stone-500">
                Le programme change à la dernière minute ? Le plan de table est ajusté ?
                Vous le voyez en direct, sans que personne n&apos;ait besoin de vous prévenir.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
              <div className="space-y-4">
                {[
                  { time: "14:30", label: "Cérémonie laïque", place: "Jardin du domaine" },
                  { time: "16:00", label: "Vin d'honneur", place: "Terrasse" },
                  { time: "19:30", label: "Dîner", place: "Grande salle" },
                  { time: "22:00", label: "Ouverture de bal", place: "Piste de danse" },
                  { time: "23:30", label: "Soirée dansante", place: "Piste de danse" },
                ].map((step, i) => (
                  <div key={step.time} className="flex items-center gap-4">
                    <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.9rem', color: GREEN, minWidth: '3.5rem' }}>
                      {step.time}
                    </span>
                    <div className="flex-1">
                      <p style={{ fontWeight: 500, fontSize: '0.85rem' }} className="text-stone-700">{step.label}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{step.place}</p>
                    </div>
                    {i === 0 && (
                      <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600" style={{ fontWeight: 500 }}>
                        En cours
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center mt-5" style={{ fontWeight: 300, fontSize: '0.68rem', color: '#9ca3af' }}>
                Aperçu du programme — consultation prestataire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3 text-center" style={{ fontWeight: 600 }}>
            Questions fréquentes
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.02em', color: GREEN }}
              className="text-center mb-12">
            Ce que les pros nous demandent
          </h2>

          <div className="divide-y divide-stone-100">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between gap-4 list-none" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.92rem', color: GREEN }}>
                  {q}
                  <span className="shrink-0 w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-open:rotate-45 transition-transform text-xs">+</span>
                </summary>
                <p className="mt-3 text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6 text-center" style={{ background: CREAM }}>
        <div className="max-w-xl mx-auto">
          <Sparkles className="w-6 h-6 text-[#4a5240]/40 mx-auto mb-4" strokeWidth={1.5} />
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em', color: GREEN }}
              className="mb-4">
            Envie de tester ?
          </h2>
          <p style={{ fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.7 }} className="text-stone-500 mb-8">
            L&apos;accès prestataire est gratuit. Si l&apos;un de vos couples utilise Kaatch,
            il vous ajoute en quelques clics et vous accédez immédiatement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/prestataire/rejoindre"
                  className="inline-flex items-center gap-2 text-white rounded-xl px-8 py-4 hover:opacity-90 transition"
                  style={{ background: GREEN, fontWeight: 500, fontSize: '0.95rem' }}>
              Rejoindre en tant que pro
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 hover:bg-white/60 transition border border-stone-300"
                  style={{ fontWeight: 400, fontSize: '0.88rem', color: SAGE }}>
              En savoir plus sur Kaatch
              <ArrowRight className="w-3.5 h-3.5" />
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
          L&apos;app de mariage qui pense à tout
        </p>
      </footer>
    </main>
    </NextIntlClientProvider>
  )
}
