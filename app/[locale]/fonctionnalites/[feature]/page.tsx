import { notFound } from 'next/navigation'

const features = {
  'faire-part-rsvp': {
    title: 'Faire-parts & RSVP',
    subtitle: 'Invitations animées et réponses en direct',
    description: 'Créez des faire-parts numériques personnalisés et élégants. Suivez les RSVP en temps réel, gérez les régimes alimentaires, et maintenez une liste d\'invités à jour.',
    icon: '💌',
  },
  'plan-de-table': {
    title: 'Plan de table',
    subtitle: 'Glisser-déposer, ajusté jusqu\'à la veille',
    description: 'Organisez vos invités facilement avec notre outil de plan de table intuitif. Glissez-déposez les invités entre les tables, prévisualisez l\'arrangement, et modifiez jusqu\'à la dernière minute.',
    icon: '🪑',
  },
  'album-photo': {
    title: 'Album photo partagé',
    subtitle: 'Toutes les photos, un seul endroit',
    description: 'Créez un album photo partagé où tous vos invités peuvent contribuer. Les photos sont centralisées, facilement accessibles, et peuvent être téléchargées collectivement en ZIP.',
    icon: '📸',
  },
  'programme-jour-j': {
    title: 'Programme jour J',
    subtitle: 'Le déroulé complet pour vos invités',
    description: 'Planifiez chaque moment de votre mariage. Créez un programme détaillé que vos invités peuvent consulter, imprimable et optimisé pour mobile.',
    icon: '📅',
  },
  'espace-invites': {
    title: 'Espace invités',
    subtitle: 'Sans compte, sans friction',
    description: 'Donnez à vos invités accès à toutes les informations sans qu\'ils aient besoin de créer un compte. Un lien personnalisé, c\'est tout ce qu\'il faut.',
    icon: '🔗',
  },
  'livre-dor': {
    title: 'Livre d\'or',
    subtitle: 'Mots doux et souvenirs pour toujours',
    description: 'Créez un espace pour que vos invités laissent des messages de félicitations et de vœux. Conservez ces souvenirs précieux pour l\'éternité.',
    icon: '📝',
  },
  'gestion-prestataires': {
    title: 'Gestion des prestataires',
    subtitle: 'Tous vos fournisseurs au même endroit',
    description: 'Centralisez tous vos contacts de prestataires. Stockez leurs coordonnées, budgets, dates de prestation, et notes importantes en un seul endroit.',
    icon: '👥',
  },
}

export function generateStaticParams() {
  return Object.keys(features).map(feature => ({ feature }))
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ locale: string; feature: string }>
}) {
  const { feature } = await params
  const featureData = features[feature as keyof typeof features]

  if (!featureData) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] pt-24">
      <div className="max-w-4xl mx-auto px-5 md:px-10">
        <div className="mb-12">
          <div className="text-5xl mb-4">{featureData.icon}</div>
          <h1
            className="text-4xl md:text-5xl mb-4 text-[#2d3228]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            {featureData.title}
          </h1>
          <p
            className="text-xl text-stone-600 mb-6"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            {featureData.subtitle}
          </p>
          <p
            className="text-lg text-stone-700 leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            {featureData.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-8 md:p-12 shadow-sm">
          <div
            className="text-center text-stone-400"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
          >
            Contenu détaillé de la fonctionnalité à venir...
          </div>
        </div>
      </div>
    </main>
  )
}
