'use client'

import { useMemo } from 'react'
import type { EstimateData } from './Step1QuickEstimate'
import type { PersonalizationData } from './Step2Personalization'

interface Props {
  estimate: EstimateData
  selections: PersonalizationData
  onBack: () => void
}

const lineItems = [
  { id: 'venue', label: 'Salle', basique: 3500, classique: 6000, premium: 10000 },
  { id: 'catering', label: 'Traiteur', basique: 35, classique: 60, premium: 100 },
  { id: 'drinks', label: 'Boissons', basique: 8, classique: 15, premium: 25 },
  { id: 'photographer', label: 'Photographe', basique: 1200, classique: 1800, premium: 3000 },
  { id: 'videographer', label: 'Vidéographe', basique: 800, classique: 1500, premium: 2800 },
  { id: 'dj', label: 'DJ', basique: 600, classique: 1200, premium: 2500 },
  { id: 'flowers', label: 'Fleurs', basique: 400, classique: 1200, premium: 2500 },
  { id: 'stationery', label: 'Faire-part', basique: 150, classique: 400, premium: 800 },
  { id: 'rentals', label: 'Location', basique: 500, classique: 1200, premium: 2500 },
  { id: 'beauty', label: 'Coiffure', basique: 150, classique: 350, premium: 700 },
  { id: 'dress', label: 'Robe & costumes', basique: 800, classique: 1600, premium: 3000 },
  { id: 'cake', label: 'Gâteau', basique: 200, classique: 500, premium: 1200 },
  { id: 'transport', label: 'Transport', basique: 300, classique: 700, premium: 1500 },
  { id: 'accommodation', label: 'Hébergement', basique: 0, classique: 800, premium: 2000 },
  { id: 'contingency', label: 'Imprévus', basique: 500, classique: 1200, premium: 2500 },
]

export default function Step3Recap({ estimate, selections, onBack }: Props) {
  const regionMultiplier = useMemo(() => {
    const city = estimate.city.toLowerCase()
    if (city.includes('paris')) return 1.32
    if (['ile-de-france', 'yvelines', 'essonne'].some((r) => city.includes(r))) return 1.28
    if (['alpes-maritimes', 'provence', 'var', 'bouches'].some((r) => city.includes(r))) return 1.18
    if (['lyon', 'toulouse', 'bordeaux'].some((c) => city.includes(c))) return 1.12
    return 1.0
  }, [estimate.city])

  const styleMultiplier = { basique: 0.8, classique: 1.0, premium: 1.4 }[estimate.style]

  const breakdown = useMemo(() => {
    return lineItems
      .map((item) => {
        const selection = selections[item.id]
        if (!selection || selection.level === 'skip') return null

        let amount = item[selection.level as 'basique' | 'classique' | 'premium']
        if (['catering', 'drinks'].includes(item.id)) {
          amount *= estimate.guestCount
        }
        amount = amount * regionMultiplier * styleMultiplier

        return { ...item, level: selection.level, amount }
      })
      .filter((x) => x !== null)
  }, [selections, estimate.guestCount, estimate.style, regionMultiplier, styleMultiplier])

  const total = useMemo(() => breakdown.reduce((sum, item) => sum + (item?.amount ?? 0), 0), [breakdown])

  const perGuest = Math.round(total / estimate.guestCount)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Votre estimation
        </h2>
        <p className="text-stone-600">
          Mariage de {estimate.guestCount} invités à {estimate.city}
        </p>
      </div>

      {/* Main total */}
      <div className="bg-gradient-to-br from-[#f5f0e8] to-white border-2 border-[#4a5240] rounded-2xl p-8">
        <div className="text-center space-y-3">
          <p className="text-stone-600">Budget total estimé</p>
          <p className="text-5xl font-light text-[#4a5240]">{Math.round(total).toLocaleString()}€</p>
          <p className="text-lg text-stone-600">
            ≈ <span className="font-medium">{perGuest}€</span> par invité
          </p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="space-y-3">
        <h3 className="font-medium text-stone-800">Détail des coûts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-300">
                <th className="text-left py-2 px-3 font-medium">Poste</th>
                <th className="text-left py-2 px-3 font-medium">Niveau</th>
                <th className="text-right py-2 px-3 font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-2.5 px-3">{item.label}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded capitalize">{item.level}</span>
                  </td>
                  <td className="text-right py-2.5 px-3 font-medium text-[#4a5240]">{Math.round(item.amount)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-700">
        <p className="font-medium mb-2">💡 Rappel</p>
        <p>
          C'est une <strong>estimation indicative</strong>. Votre budget réel peut varier selon vos prestataires, la saisonnalité
          (+20-30% mai-septembre) et les imprévus. Prévoir 10-15% de marge est sage.
        </p>
      </div>

      {/* Sharing & CTA */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => {
              const text = `Mon mariage : ~${Math.round(total)}€ pour ${estimate.guestCount} invités (${perGuest}€/personne)`
              navigator.clipboard.writeText(text)
              alert('Copié !')
            }}
            className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition text-sm font-medium"
          >
            📋 Copier
          </button>
          <button
            onClick={() => {
              const text = `Mon mariage : ~${Math.round(total)}€ pour ${estimate.guestCount} invités (${perGuest}€/personne) via le calculateur Kaatch`
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`
              window.open(url, '_blank')
            }}
            className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition text-sm font-medium"
          >
            💬 WhatsApp
          </button>
        </div>

        {/* Kaatch CTA */}
        <div className="bg-white border-2 border-[#4a5240] rounded-xl p-6 space-y-4">
          <div>
            <h4 className="font-medium text-stone-800 mb-2">Prêt à passer à l'action ?</h4>
            <p className="text-sm text-stone-700">
              Avec Kaatch, transformez cette estimation en plan d'action. Budgétez, suivez vos dépenses, et organisez chaque détail au
              même endroit.
            </p>
          </div>
          <a
            href="/dashboard"
            className="block text-center py-3 bg-[#4a5240] text-white rounded-lg font-medium hover:bg-[#2d3228] transition"
          >
            ✨ Créer mon mariage sur Kaatch
          </a>
          <p className="text-xs text-center text-stone-500">Ou continuer à explorer sans compte</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition"
        >
          ← Modifier
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition ml-auto"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
