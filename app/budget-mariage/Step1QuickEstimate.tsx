'use client'

import { useState } from 'react'

export interface EstimateData {
  guestCount: number
  city: string
  style: 'basique' | 'classique' | 'premium'
}

interface Props {
  onNext: (data: EstimateData) => void
  initialData?: EstimateData
}

const styleCards = [
  {
    id: 'basique',
    label: 'Basique',
    desc: 'Budget maîtrisé',
    emoji: '🌱',
    color: '#a8a29e',
  },
  {
    id: 'classique',
    label: 'Classique',
    desc: 'Confortable & sympa',
    emoji: '💚',
    color: '#4a5240',
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Haut de gamme',
    emoji: '✨',
    color: '#c9b59a',
  },
]

export default function Step1QuickEstimate({ onNext, initialData }: Props) {
  const [guestCount, setGuestCount] = useState(initialData?.guestCount ?? 100)
  const [city, setCity] = useState(initialData?.city ?? '')
  const [style, setStyle] = useState<EstimateData['style']>(initialData?.style ?? 'classique')
  const [citySuggestions, setCitySuggestions] = useState<Array<{ nom: string; code_postal: string }>>([])

  const handleCityChange = async (value: string) => {
    setCity(value)
    if (value.length > 2) {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=municipality&limit=5`,
        )
        const data = await res.json()
        setCitySuggestions(data.features.map((f: any) => ({ nom: f.properties.nom, code_postal: f.properties.postcode })))
      } catch {
        setCitySuggestions([])
      }
    }
  }

  const handleCitySelect = (nom: string) => {
    setCity(nom)
    setCitySuggestions([])
  }

  const handleNext = () => {
    if (city.trim()) {
      onNext({ guestCount, city: city.trim(), style })
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Estimation rapide
        </h2>
        <p className="text-stone-600">3 infos pour démarrer</p>
      </div>

      {/* Guests slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-medium text-stone-800">Nombre d'invités</label>
          <span className="text-2xl font-light text-[#4a5240]">{guestCount}</span>
        </div>
        <input
          type="range"
          min="10"
          max="300"
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="w-full accent-[#4a5240]"
          style={{ height: '4px' }}
        />
        <div className="flex justify-between text-xs text-stone-500">
          <span>10</span>
          <span>300+</span>
        </div>
      </div>

      {/* City autocomplete */}
      <div className="space-y-2 relative">
        <label className="block font-medium text-stone-800">Où aura lieu le mariage ?</label>
        <div className="relative">
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Commencez à taper une ville..."
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5240] focus:border-transparent"
          />
          {citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-10">
              {citySuggestions.map((s) => (
                <button
                  key={s.code_postal + s.nom}
                  onClick={() => handleCitySelect(s.nom)}
                  className="w-full text-left px-4 py-2 hover:bg-stone-50 border-b last:border-b-0 text-sm"
                >
                  <span className="font-medium">{s.nom}</span> <span className="text-stone-400">({s.code_postal})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Style cards */}
      <div className="space-y-3">
        <label className="block font-medium text-stone-800">Quel budget avez-vous en tête ?</label>
        <div className="grid grid-cols-3 gap-3">
          {styleCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setStyle(card.id as EstimateData['style'])}
              className={`p-4 rounded-xl border-2 transition ${
                style === card.id ? 'border-[#4a5240] bg-stone-50' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="text-3xl mb-2">{card.emoji}</div>
              <div className="font-medium text-sm text-stone-800">{card.label}</div>
              <div className="text-xs text-stone-500 mt-1">{card.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!city.trim()}
        className="w-full py-3 bg-[#4a5240] text-white rounded-lg font-medium hover:bg-[#2d3228] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Continuer vers la personnalisation →
      </button>
    </div>
  )
}
