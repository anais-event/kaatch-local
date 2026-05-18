'use client'

import { useMemo, useState } from 'react'
import type { EstimateData } from './Step1QuickEstimate'

export interface PersonalizationData {
  [key: string]: {
    level: 'basique' | 'classique' | 'premium' | 'skip'
  }
}

interface Props {
  estimate: EstimateData
  onNext: (data: PersonalizationData) => void
  onBack: () => void
  initialData?: PersonalizationData
}

const lineItems = [
  {
    id: 'venue',
    label: 'Salle de réception',
    icon: '🏛️',
    description: 'Lieu principal du mariage',
    basique: 3500,
    classique: 6000,
    premium: 10000,
  },
  {
    id: 'catering',
    label: 'Traiteur & Menu',
    icon: '🍽️',
    description: 'Par personne',
    basique: 35,
    classique: 60,
    premium: 100,
  },
  {
    id: 'drinks',
    label: 'Boissons',
    icon: '🍾',
    description: 'Vin, bière, cocktails, alcools',
    basique: 8,
    classique: 15,
    premium: 25,
  },
  {
    id: 'photographer',
    label: 'Photographe',
    icon: '📸',
    description: '6-8 heures, album inclus',
    basique: 1200,
    classique: 1800,
    premium: 3000,
  },
  {
    id: 'videographer',
    label: 'Vidéographe',
    icon: '🎬',
    description: 'Film d\'environ 3-5 min',
    basique: 800,
    classique: 1500,
    premium: 2800,
  },
  {
    id: 'dj',
    label: 'DJ / Animations',
    icon: '🎵',
    description: 'Musique pour la soirée + animations',
    basique: 600,
    classique: 1200,
    premium: 2500,
  },
  {
    id: 'flowers',
    label: 'Fleurs & Décoration',
    icon: '🌹',
    description: 'Bouquets, déco tables, arche',
    basique: 400,
    classique: 1200,
    premium: 2500,
  },
  {
    id: 'stationery',
    label: 'Faire-part & Stationery',
    icon: '💌',
    description: 'Invitations, menus, programmes',
    basique: 150,
    classique: 400,
    premium: 800,
  },
  {
    id: 'rentals',
    label: 'Location (tentes, tables, chaises)',
    icon: '⛺',
    description: 'Si besoin extérieur ou complément',
    basique: 500,
    classique: 1200,
    premium: 2500,
  },
  {
    id: 'beauty',
    label: 'Coiffure & Maquillage',
    icon: '💄',
    description: 'Mariée + demoiselle d\'honneur',
    basique: 150,
    classique: 350,
    premium: 700,
  },
  {
    id: 'dress',
    label: 'Robe & Costumes',
    icon: '👰',
    description: 'Robe de mariée + costumes invités',
    basique: 800,
    classique: 1600,
    premium: 3000,
  },
  {
    id: 'cake',
    label: 'Gâteau & Desserts',
    icon: '🎂',
    description: 'Pièce montée, macarons, etc.',
    basique: 200,
    classique: 500,
    premium: 1200,
  },
  {
    id: 'transport',
    label: 'Transport & Voiture',
    icon: '🚗',
    description: 'Voiture mariée + navettes invités',
    basique: 300,
    classique: 700,
    premium: 1500,
  },
  {
    id: 'accommodation',
    label: 'Hébergement invités',
    icon: '🏨',
    description: 'Rooms pour invités de loin (optionnel)',
    basique: 0,
    classique: 800,
    premium: 2000,
  },
  {
    id: 'contingency',
    label: 'Imprévus & Marge',
    icon: '🎁',
    description: '10-15% du budget pour les surprises',
    basique: 500,
    classique: 1200,
    premium: 2500,
  },
]

export default function Step2Personalization({ estimate, onNext, onBack, initialData }: Props) {
  const [selections, setSelections] = useState<PersonalizationData>(
    initialData ?? Object.fromEntries(lineItems.map((item) => [item.id, { level: 'classique' }]))
  )

  const regionMultiplier = useMemo(() => {
    const city = estimate.city.toLowerCase()
    if (city.includes('paris')) return 1.32
    if (['ile-de-france', 'yvelines', 'essonne'].some((r) => city.includes(r))) return 1.28
    if (['alpes-maritimes', 'provence', 'var', 'bouches'].some((r) => city.includes(r))) return 1.18
    if (['lyon', 'toulouse', 'bordeaux'].some((c) => city.includes(c))) return 1.12
    return 1.0
  }, [estimate.city])

  const styleMultiplier = { basique: 0.8, classique: 1.0, premium: 1.4 }[estimate.style]

  const total = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const selection = selections[item.id]
      if (!selection || selection.level === 'skip') return sum

      let baseAmount = item[selection.level as 'basique' | 'classique' | 'premium']
      // Multiply per-person items by guest count
      if (['catering', 'drinks'].includes(item.id)) {
        baseAmount *= estimate.guestCount
      }

      return sum + baseAmount * regionMultiplier * styleMultiplier
    }, 0)
  }, [selections, estimate.guestCount, estimate.style, regionMultiplier, styleMultiplier])

  const handleNext = () => {
    onNext(selections)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Personnalisation
        </h2>
        <p className="text-stone-600">Précisez votre budget pour chaque poste</p>
        <p className="text-sm text-stone-500 mt-2">
          Région : <strong>{estimate.city}</strong> • Style : <strong>{estimate.style}</strong> • Invités :{' '}
          <strong>{estimate.guestCount}</strong>
        </p>
      </div>

      {/* Items grid */}
      <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
        {lineItems.map((item) => {
          const selection = selections[item.id]
          return (
            <div key={item.id} className="border border-stone-200 rounded-lg p-4 hover:bg-stone-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className="font-medium text-stone-800">{item.label}</h4>
                  </div>
                  <p className="text-xs text-stone-500">{item.description}</p>
                </div>
              </div>

              {/* Level buttons */}
              <div className="flex gap-2 mt-3">
                {(['basique', 'classique', 'premium'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelections({ ...selections, [item.id]: { level } })
                    }}
                    className={`flex-1 text-xs py-1.5 rounded transition ${
                      selection?.level === level
                        ? 'bg-[#4a5240] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelections({ ...selections, [item.id]: { level: 'skip' } })
                  }}
                  className={`flex-1 text-xs py-1.5 rounded transition ${
                    selection?.level === 'skip' ? 'bg-stone-400 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  —
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="bg-white border-2 border-stone-200 rounded-xl p-6 sticky bottom-0">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-stone-600 text-sm">Estimation totale</p>
            <p className="text-3xl font-light text-[#4a5240]">{Math.round(total).toLocaleString()}€</p>
            <p className="text-xs text-stone-500 mt-1">
              ≈ {Math.round(total / estimate.guestCount)}€ par invité
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition"
            >
              ← Retour
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#4a5240] text-white rounded-lg hover:bg-[#2d3228] transition"
            >
              Voir récap →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
