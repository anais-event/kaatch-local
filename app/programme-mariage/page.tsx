import type { Metadata } from 'next'
import Link from 'next/link'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Programme mariage gratuit — Créer & partager le déroulé | Kaatch',
  description: "Créez le programme de votre mariage en ligne : cérémonie, vin d'honneur, dîner, soirée. Partagez-le avec vos invités en un lien. Outil gratuit, sans inscription.",
  keywords: [
    'programme mariage',
    'programme mariage gratuit',
    'déroulé mariage',
    'planning journée mariage',
    'programme cérémonie mariage',
    'ordre du jour mariage',
    'créer programme mariage',
    'programme mariage en ligne',
  ],
  openGraph: {
    title: 'Programme mariage gratuit — Créer & partager le déroulé | Kaatch',
    description: "Construisez le programme de votre journée et partagez-le avec vos invités en un lien. Gratuit, sans inscription.",
    url: 'https://kaatch.fr/programme-mariage',
    type: 'website',
    images: [{ url: 'https://kaatch.fr/og-image.png', width: 1200, height: 630, alt: 'Programme mariage — Kaatch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programme mariage gratuit',
    description: "Construisez et partagez le déroulé de votre journée. Gratuit, sans inscription.",
  },
  alternates: {
    canonical: 'https://kaatch.fr/programme-mariage',
  },
}

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

const FEATURES = [
  {
    emoji: '📅',
    title: 'Déroulé heure par heure',
    desc: "Construisez le programme de votre journée étape par étape : cérémonie, cocktail, vin d'honneur, dîner, soirée dansante.",
  },
  {
    emoji: '✏️',
    title: 'Éditeur simple et rapide',
    desc: "Ajoutez, réordonnez et modifiez chaque étape en quelques secondes. Glisser-déposer pour changer l'ordre du programme.",
  },
  {
    emoji: '📤',
    title: 'Partage avec les invités',
    desc: "Partagez le programme avec vos invités via un lien. Ils consultent le déroulé depuis leur téléphone, sans télécharger d'appli.",
  },
  {
    emoji: '🖨️',
    title: 'Export PDF & impression',
    desc: "Imprimez votre programme pour le poser sur les tables ou l'intégrer à votre livret de cérémonie. Export PDF en un clic.",
  },
  {
    emoji: '📍',
    title: 'Lieux et détails',
    desc: "Précisez le lieu de chaque étape, les informations pratiques, les coordonnées du prestataire — tout ce dont vos invités ont besoin.",
  },
  {
    emoji: '🔄',
    title: 'Mis à jour en temps réel',
    desc: "Modifiez le programme jusqu'au dernier moment. Vos invités voient la dernière version à chaque consultation du lien.",
  },
]

const FAQ = [
  {
    q: "Comment créer un programme de mariage en ligne ?",
    a: "Avec Kaatch, créez votre espace mariage gratuitement et accédez à l'éditeur de programme. Ajoutez vos étapes, personnalisez les horaires et les lieux, puis partagez avec vos invités en un seul lien.",
  },
  {
    q: "Comment partager le programme du mariage avec les invités ?",
    a: "Kaatch génère un espace invité personnalisé pour chaque mariage. Vos invités accèdent au programme depuis leur téléphone via le lien de partage — sans créer de compte.",
  },
  {
    q: "Peut-on modifier le programme après l'avoir partagé ?",
    a: "Oui. Vous pouvez modifier votre programme à tout moment. Vos invités verront toujours la version la plus à jour lorsqu'ils ouvriront leur lien.",
  },
  {
    q: "Comment imprimer le programme de mariage ?",
    a: "L'outil propose un export PDF optimisé pour l'impression, que vous pouvez intégrer à votre livret de cérémonie ou poser sur les tables.",
  },
]

const EXAMPLE_STEPS = [
  { time: '14h30', title: 'Cérémonie civile', location: 'Mairie du 6e', desc: "Les mariés échangent leurs vœux officiels." },
  { time: '16h00', title: 'Cérémonie laïque', location: 'Domaine des Roses', desc: "Discours des témoins et vœux personnels." },
  { time: '17h30', title: "Vin d'honneur", location: 'Terrasse du domaine', desc: "Cocktail, pièce montée et photos." },
  { time: '20h00', title: 'Dîner de gala', location: 'Grande salle', desc: "Repas assis, discours et animations." },
  { time: '23h00', title: 'Soirée dansante', location: 'Grande salle', desc: "Ouverture de bal et fête jusqu'au bout de la nuit." },
]

export default function ProgrammeMartagePage() {
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
              Programme de mariage
            </h1>
            <p className="text-stone-500 text-base leading-relaxed max-w-xl mb-6" style={{ fontWeight: 300 }}>
              Construisez le déroulé de votre journée, étape par étape. Partagez-le avec vos invités en un lien, imprimez-le ou intégrez-le à votre livret.
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

          {/* Example programme */}
          <div className="mb-12">
            <p className="text-xs text-stone-400 mb-4 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Exemple de programme
            </p>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {EXAMPLE_STEPS.map((step, i) => (
                <div
                  key={step.time}
                  className="flex gap-4 p-5"
                  style={{ borderBottom: i < EXAMPLE_STEPS.length - 1 ? '1px solid #f5f0e8' : undefined }}
                >
                  <div className="shrink-0 w-14 text-right">
                    <span className="text-sm" style={{ color: SAGE, fontWeight: 500 }}>{step.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-stone-800 text-sm mb-0.5" style={{ fontWeight: 500 }}>{step.title}</p>
                    <p className="text-stone-400 text-xs mb-1" style={{ fontWeight: 300 }}>📍 {step.location}</p>
                    <p className="text-stone-500 text-xs leading-relaxed" style={{ fontWeight: 300 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
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
              Et si tout était au même endroit ?
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch centralise programme, invités, photos, budget et messagerie — avec un espace dédié pour vos invités. Gratuit.
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
