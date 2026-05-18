'use client'

import { useMemo, useState } from 'react'
import type { EstimateData } from './Step1QuickEstimate'

export interface PersonalizationData {
  [key: string]: {
    level: 'intimate' | 'convivial' | 'grandiose' | 'skip'
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
    intimate: 3500,
    convivial: 6000,
    grandiose: 10000,
  },
  {
    id: 'catering',
    label: 'Traiteur & Menu',
    icon: '🍽️',
    description: 'Par personne',
    intimate: 35,
    convivial: 60,
    grandiose: 100,
  },
  {
    id: 'drinks',
    label: 'Boissons',
    icon: '🍾',
    description: 'Vin, bière, cocktails, alcools',
    intimate: 8,
    convivial: 15,
    grandiose: 25,
  },
  {
    id: 'photographer',
    label: 'Photographe',
    icon: '📸',
    description: '6-8 heures, album inclus',
    intimate: 1200,
    convivial: 1800,
    grandiose: 3000,
  },
  {
    id: 'videographer',
    label: 'Vidéographe',
    icon: '🎬',
    description: 'Film d\'environ 3-5 min',
    intimate: 800,
    convivial: 1500,
    grandiose: 2800,
  },
  {
    id: 'dj',
    label: 'DJ / Animations',
    icon: '🎵',
    description: 'Musique pour la soirée + animations',
    intimate: 600,
    convivial: 1200,
    grandiose: 2500,
  },
  {
    id: 'flowers',
    label: 'Fleurs & Décoration',
    icon: '🌹',
    description: 'Bouquets, déco tables, arche',
    intimate: 400,
    convivial: 1200,
    grandiose: 2500,
  },
  {
    id: 'stationery',
    label: 'Faire-part & Stationery',
    icon: '💌',
    description: 'Invitations, menus, programmes',
    intimate: 150,
    convivial: 400,
    grandiose: 800,
  },
  {
    id: 'rentals',
    label: 'Location (tentes, tables, chaises)',
    icon: '⛺',
    description: 'Si besoin extérieur ou complément',
    intimate: 500,
    convivial: 1200,
    grandiose: 2500,
  },
  {
    id: 'beauty',
    label: 'Coiffure & Maquillage',
    icon: '💄',
    description: 'Mariée + demoiselle d\'honneur',
    intimate: 150,
    convivial: 350,
    grandiose: 700,
  },
  {
    id: 'dress',
    label: 'Robe & Costumes',
    icon: '👰',
    description: 'Robe de mariée + costumes invités',
    intimate: 800,
    convivial: 1600,
    grandiose: 3000,
  },
  {
    id: 'cake',
    label: 'Gâteau & Desserts',
    icon: '🎂',
    description: 'Pièce montée, macarons, etc.',
    intimate: 200,
    convivial: 500,
    grandiose: 1200,
  },
  {
    id: 'transport',
    label: 'Transport & Voiture',
    icon: '🚗',
    description: 'Voiture mariée + navettes invités',
    intimate: 300,
    convivial: 700,
    grandiose: 1500,
  },
  {
    id: 'accommodation',
    label: 'Hébergement invités',
    icon: '🏨',
    description: 'Rooms pour invités de loin (optionnel)',
    intimate: 0,
    convivial: 800,
    grandiose: 2000,
  },
  {
    id: 'contingency',
    label: 'Imprévus & Marge',
    icon: '🎁',
    description: '10-15% du budget pour les surprises',
    intimate: 500,
    convivial: 1200,
    grandiose: 2500,
  },
]

export default function Step2Personalization({ estimate, onNext, onBack, initialData }: Props) {
  const [selections, setSelections] = useState<PersonalizationData>(
    initialData ?? Object.fromEntries(lineItems.map((item) => [item.id, { level: 'convivial' }]))
  )

  const regionMultiplier = useMemo(() => {
    const city = estimate.city.toLowerCase()
    if (city.includes('paris')) return 1.32
    if (['ile-de-france', 'yvelines', 'essonne'].some((r) => city.includes(r))) return 1.28
    if (['alpes-maritimes', 'provence', 'var', 'bouches'].some((r) => city.includes(r))) return 1.18
    if (['lyon', 'toulouse', 'bordeaux'].some((c) => city.includes(c))) return 1.12
    return 1.0
  }, [estimate.city])

  const styleMultiplier = { intimate: 0.7, convivial: 1.0, grandiose: 1.5 }[estimate.style]

  const total = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const selection = selections[item.id]
      if (!selection || selection.level === 'skip') return sum

      let baseAmount = item[selection.level as 'intimate' | 'convivial' | 'grandiose']
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

          const featureButtons: { [key: string]: { label: string; href: string } } = {
            venue: { label: '✨ Plan de table 2D sur Kaatch', href: '/guide' },
            photographer: { label: '✨ Album partagé pour vos invités', href: '/guide' },
            dj: { label: '✨ Créer ma playlist sur Kaatch', href: '/guide' },
            stationery: { label: '✨ Studio créatif Kaatch', href: '/guide' },
            accommodation: { label: '✨ Suggérer des hébergements à mes invités', href: '/guide' },
          }
          const featureButton = featureButtons[item.id]

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
                {(['intimate', 'convivial', 'grandiose'] as const).map((level) => (
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

              {/* Feature button */}
              {featureButton && (
                <a
                  href={featureButton.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 px-3 py-1.5 bg-[rgba(74,82,64,0.1)] text-[#4a5240] text-xs rounded-full text-center hover:bg-[rgba(74,82,64,0.2)] transition font-medium"
                >
                  {featureButton.label}
                </a>
              )}
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
