import type { Metadata } from 'next'
import Link from 'next/link'
import PublicNav from '@/app/_components/PublicNav'

export const metadata: Metadata = {
  title: 'Outils gratuits pour organiser votre mariage | Kaatch',
  description: 'Calculateur de budget, checklist interactive, plan de table — des outils gratuits pour préparer votre mariage sereinement. Sans inscription.',
  openGraph: {
    title: 'Outils gratuits pour organiser votre mariage | Kaatch',
    description: 'Des outils pratiques et gratuits pour préparer votre mariage : budget, checklist, plan de table et plus encore.',
    url: 'https://kaatch.fr/outils',
    type: 'website',
  },
  alternates: {
    canonical: 'https://kaatch.fr/outils',
  },
}

const BODY = 'var(--font-body)'
const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

const tools = [
  {
    href: '/checklist-mariage',
    emoji: '✅',
    label: 'Checklist mariage',
    description: 'Toutes les étapes mois par mois, avec les détails auxquels on ne pense pas toujours. Cases cochées sauvegardées automatiquement.',
    cta: 'Ouvrir la checklist →',
    badge: 'Nouveau',
  },
  {
    href: '/budget-mariage',
    emoji: '💰',
    label: 'Calculateur de budget',
    description: 'Estimez le coût de votre mariage selon votre région, le nombre d\'invités et vos choix. Export PDF inclus.',
    cta: 'Calculer mon budget →',
    badge: null,
  },
]

const coming = [
  { emoji: '🪑', label: 'Plan de table', description: 'Glissez-déposez vos invités sur un plan de table visuel. Gratuit.' },
  { emoji: '📋', label: "Liste d'invités", description: 'Gérez votre liste, les RSVP et les régimes alimentaires en un seul tableau.' },
  { emoji: '📅', label: 'Programme mariage', description: 'Construisez le programme de votre journée et partagez-le avec vos invités.' },
]

export default function OutilsPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: BODY }}>
      <PublicNav active="outils" />

      <div className="pt-24 pb-20 px-5 md:px-10">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs text-stone-400 mb-3 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Kaatch
            </p>
            <h1 className="text-3xl md:text-4xl text-stone-800 mb-3" style={{ fontWeight: 300 }}>
              Outils gratuits
            </h1>
            <p className="text-stone-500 text-base leading-relaxed max-w-xl" style={{ fontWeight: 300 }}>
              Des outils pratiques pour préparer votre mariage — sans inscription, sans publicité, sans prise de tête.
            </p>
          </div>

          {/* Available tools */}
          <div className="space-y-4 mb-12">
            {tools.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:border-stone-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0">{tool.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-stone-800 text-base" style={{ fontWeight: 500 }}>
                          {tool.label}
                        </p>
                        {tool.badge && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${SAGE}18`, color: SAGE, fontWeight: 400 }}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-sm whitespace-nowrap shrink-0 mt-0.5 group-hover:underline"
                    style={{ color: SAGE, fontWeight: 400 }}
                  >
                    {tool.cta}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Coming soon */}
          <div>
            <p className="text-xs text-stone-400 mb-4 uppercase tracking-widest" style={{ fontWeight: 300 }}>
              Bientôt disponibles
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {coming.map(tool => (
                <div
                  key={tool.label}
                  className="bg-white/60 rounded-2xl border border-stone-100 p-5 opacity-70"
                >
                  <span className="text-2xl block mb-2">{tool.emoji}</span>
                  <p className="text-stone-700 text-sm mb-1" style={{ fontWeight: 500 }}>
                    {tool.label}
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed" style={{ fontWeight: 300 }}>
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Kaatch */}
          <div className="mt-12 rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
            <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
              Et si on allait plus loin ?
            </p>
            <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
              Kaatch, c'est tous ces outils et bien plus — avec un espace dédié pour vous et vos invités. Gratuit.
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
