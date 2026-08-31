import type { Metadata } from 'next'
import Link from 'next/link'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: "Liste d'invités mariage gratuite — Gérer RSVP & régimes | Kaatch",
  description: "Gérez votre liste d'invités mariage en ligne : RSVP, régimes alimentaires, coordonnées, statut invitation. Outil gratuit, sans inscription. Bientôt disponible.",
  keywords: [
    "liste invités mariage",
    "gestion invités mariage",
    "liste invités mariage gratuite",
    "rsvp mariage en ligne",
    "tableau invités mariage",
    "régimes alimentaires mariage",
    "liste convives mariage",
    "organiser liste invités",
  ],
  openGraph: {
    title: "Liste d'invités mariage gratuite — RSVP & régimes | Kaatch",
    description: "Gérez vos invités, les RSVP et les régimes alimentaires en un seul tableau. Gratuit, sans inscription.",
    url: 'https://kaatch.fr/liste-invites-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: "Liste invités mariage — Kaatch" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Liste d'invités mariage gratuite",
    description: "RSVP, régimes, coordonnées — tout en un tableau. Gratuit, sans inscription.",
  },
  alternates: {
    canonical: 'https://kaatch.fr/liste-invites-mariage',
  },
}

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

const FEATURES = [
  {
    emoji: '✅',
    title: 'Suivi des RSVP en temps réel',
    desc: "Visualisez d'un coup d'œil qui a confirmé, qui a décliné, qui n'a pas encore répondu. Relancez facilement les indécis.",
  },
  {
    emoji: '🥗',
    title: 'Régimes alimentaires',
    desc: "Notez les allergies, régimes végétariens, végans ou sans gluten de chaque invité. Exportez la liste pour votre traiteur.",
  },
  {
    emoji: '📇',
    title: 'Coordonnées centralisées',
    desc: "Email, téléphone, adresse — tout au même endroit. Plus de fichiers Excel dispersés entre vous et votre partenaire.",
  },
  {
    emoji: '📊',
    title: "Comptage automatique",
    desc: "Nombre total d'invités, adultes, enfants, confirmés, en attente — mis à jour en temps réel au fil de vos modifications.",
  },
  {
    emoji: '📤',
    title: 'Export tableur',
    desc: "Exportez votre liste en CSV ou Excel pour la partager avec votre wedding planner ou votre traiteur en un clic.",
  },
  {
    emoji: '🔗',
    title: 'Lien invitation personnalisé',
    desc: "Générez un lien unique par invité pour qu'il accède à son espace personnel, réponde au RSVP et retrouve toutes les infos.",
  },
]

const FAQ = [
  {
    q: "Comment créer une liste d'invités mariage gratuite ?",
    a: "Avec Kaatch, créez votre espace mariage gratuitement et accédez à la gestion complète de vos invités : ajout, RSVP, régimes alimentaires, envoi d'invitations personnalisées. Aucune carte bancaire requise.",
  },
  {
    q: "Comment gérer les RSVP de mon mariage ?",
    a: "Kaatch envoie à chaque invité un lien personnel. L'invité confirme ou décline sa présence directement depuis son téléphone. Vous voyez les réponses en temps réel dans votre tableau de bord.",
  },
  {
    q: "Comment noter les régimes alimentaires de mes invités ?",
    a: "Dans la fiche de chaque invité, un champ dédié permet de noter les allergies et régimes spéciaux. Vous pouvez ensuite exporter la liste complète pour la transmettre à votre traiteur.",
  },
  {
    q: "Combien d'invités peut-on gérer avec l'outil gratuit ?",
    a: "L'outil de gestion des invités est inclus gratuitement dans Kaatch, sans limite de nombre d'invités.",
  },
]

export default function ListeInvitesPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-body)' }}>
      <PublicNav />

      <div className="pt-24 pb-20 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>
              Outils gratuits · Kaatch
            </p>
            <h1
              className="text-[#2C3B2E] mb-4"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Liste d&apos;invités mariage
            </h1>
            <p className="text-stone-500 text-base leading-relaxed max-w-xl mb-6" style={{ fontWeight: 300 }}>
              Gérez tous vos invités en un seul endroit : RSVP, régimes alimentaires, coordonnées, statut d&apos;invitation. Sans Excel, sans prise de tête.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm"
                style={{ background: `${SAGE}18`, color: SAGE, fontWeight: 400 }}
              >
                Bientôt disponible
              </span>
              <Link
                href="/auth"
                className="inline-block px-5 py-2 rounded-xl text-sm text-white transition hover:opacity-90"
                style={{ background: SAGE, fontWeight: 400 }}
              >
                Créer mon espace mariage →
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 gap-4 mb-14">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <span className="text-2xl block mb-2">{f.emoji}</span>
                <p className="text-stone-800 text-sm mb-1" style={{ fontWeight: 500 }}>{f.title}</p>
                <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2
              className="text-[#2C3B2E] mb-6"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.01em' }}
            >
              Questions fréquentes
            </h2>
            <div className="space-y-5">
              {FAQ.map(item => (
                <div key={item.q} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <p className="text-stone-800 text-sm mb-2" style={{ fontWeight: 500 }}>{item.q}</p>
                  <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other tools */}
          <div className="mb-10">
            <p className="text-xs text-stone-400 mb-4 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Autres outils gratuits
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/checklist-mariage', emoji: '✅', label: 'Checklist mariage', desc: 'Toutes les étapes mois par mois' },
                { href: '/budget-mariage', emoji: '💰', label: 'Calculateur de budget', desc: 'Estimez le coût de votre mariage' },
                { href: '/plan-de-table-mariage', emoji: '🪑', label: 'Plan de table', desc: 'Glisser-déposer, export PDF' },
                { href: '/discours-mariage', emoji: '✨', label: 'Générateur de discours', desc: 'IA — témoin, vœux, parents' },
              ].map(t => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group flex items-start gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-stone-300 transition-all"
                >
                  <span className="text-xl shrink-0">{t.emoji}</span>
                  <div>
                    <p className="text-stone-800 text-sm group-hover:underline" style={{ fontWeight: 500 }}>{t.label}</p>
                    <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{t.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
            <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
              Prêts à tout gérer au même endroit ?
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch centralise invités, photos, programme, budget et messagerie — avec un espace dédié pour vos invités. Gratuit.
            </p>
            <Link
              href="/auth"
              className="inline-block px-6 py-3 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition"
              style={{ color: SAGE_DARK }}
            >
              Créer mon espace mariage →
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
