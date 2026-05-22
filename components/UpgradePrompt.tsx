'use client'
import { Plan, PLAN_LABELS } from '@/lib/plan'

interface UpgradePromptProps {
  feature: string
  currentPlan: Plan
  slug: string
}

const MESSAGES: Record<string, string> = {
  tables: "Organisez vos tables facilement",
  budget: "Gardez un oeil sur votre budget",
  musique: "Créez la playlist de votre soirée",
  'livre-dor': "Recueillez les mots de vos proches",
  'export-excel': "Exportez votre liste en un clic",
  'import-csv': "Importez vos invités depuis un fichier",
  'zip-photos': "Téléchargez toutes vos photos",
  hebergements: "Partagez les bons plans hébergement",
  surprises: "Préparez des surprises pour vos invités",
  contacts: "Centralisez les contacts utiles",
}

export default function UpgradePrompt({ feature, currentPlan, slug }: UpgradePromptProps) {
  const message = MESSAGES[feature] || "Cette fonctionnalité fait partie du plan Mariage"
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-10 max-w-md w-full">
        <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">🔒</span>
        </div>
        <h2
          className="text-[#2d3228] mb-3"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontWeight: 600,
            fontSize: '1.5rem',
            fontStyle: 'italic',
          }}
        >
          {message}
        </h2>
        <p
          className="text-stone-500 mb-6"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.7 }}
        >
          Passez au plan Mariage pour débloquer cette fonctionnalité.
          Moins cher qu{"'"}un bouquet de mariée 💐
        </p>
        <a
          href={`/mariage/${slug}/upgrade`}
          className="inline-block bg-[#4a5240] text-white px-7 py-3 rounded-2xl hover:bg-[#2d3228] transition text-sm"
          style={{ fontWeight: 500 }}
        >
          Voir les offres →
        </a>
        <p className="mt-4 text-xs text-stone-400" style={{ fontWeight: 300 }}>
          Plan actuel : {PLAN_LABELS[currentPlan]}
        </p>
      </div>
    </div>
  )
}
