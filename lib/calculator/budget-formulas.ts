/**
 * Budget mariage - Formules de calcul
 * Coûts réels marché français 2024-2025
 */

export type WeddingLevel = 'simple' | 'classique' | 'premium'
export type Region = 'province' | 'grandes-villes' | 'paris'

export interface CostBreakdown {
  perGuestCosts: Record<string, number>
  fixedCosts: Record<string, number>
  regionMultiplier: number
  totalPerGuest: number
  totalFixed: number
  grandTotal: number
  grandTotalPerGuest: number
}

// Coûts par invité (base province)
const PER_GUEST_COSTS: Record<WeddingLevel, Record<string, number>> = {
  simple: {
    'Lieu de réception': 35,
    'Traiteur (repas + boissons)': 75,
    'Décoration & fleurs': 15,
    'Animation / DJ': 8,
    'Divers': 12,
  },
  classique: {
    'Lieu de réception': 70,
    'Traiteur (repas + boissons)': 120,
    'Décoration & fleurs': 30,
    'Animation / DJ': 15,
    'Divers': 20,
  },
  premium: {
    'Lieu de réception': 130,
    'Traiteur (repas + boissons)': 200,
    'Décoration & fleurs': 60,
    'Animation / DJ': 25,
    'Divers': 35,
  },
}

// Coûts fixes
const FIXED_COSTS: Record<WeddingLevel, Record<string, number>> = {
  simple: {
    'Tenues (robe + costume)': 1500,
    'Photographe + vidéaste': 1200,
    'Alliances': 600,
    'Coiffure & maquillage': 300,
    'Voyage de noces': 2500,
  },
  classique: {
    'Tenues (robe + costume)': 3000,
    'Photographe + vidéaste': 2500,
    'Alliances': 1500,
    'Coiffure & maquillage': 600,
    'Voyage de noces': 5000,
  },
  premium: {
    'Tenues (robe + costume)': 6000,
    'Photographe + vidéaste': 4500,
    'Alliances': 3500,
    'Coiffure & maquillage': 1200,
    'Voyage de noces': 10000,
  },
}

// Multiplicateurs régionaux
const REGION_MULTIPLIERS: Record<Region, number> = {
  province: 1.0,
  'grandes-villes': 1.15,
  paris: 1.25,
}

export function calculateBudget(
  guestCount: number,
  level: WeddingLevel,
  region: Region,
  includeHoneymoon: boolean
): CostBreakdown {
  const perGuestBase = PER_GUEST_COSTS[level]
  const fixedBase = { ...FIXED_COSTS[level] }

  // Exclure le voyage de noces s'il n'est pas inclus
  if (!includeHoneymoon) {
    delete fixedBase['Voyage de noces']
  }

  const regionMultiplier = REGION_MULTIPLIERS[region]

  // Calcul
  const totalPerGuestBase = Object.values(perGuestBase).reduce((a, b) => a + b, 0)
  const totalFixedBase = Object.values(fixedBase).reduce((a, b) => a + b, 0)

  const totalPerGuest = totalPerGuestBase * regionMultiplier
  const totalFixed = totalFixedBase * regionMultiplier

  const grandTotal = totalPerGuest * guestCount + totalFixed

  return {
    perGuestCosts: perGuestBase,
    fixedCosts: fixedBase,
    regionMultiplier,
    totalPerGuest: Math.round(totalPerGuest),
    totalFixed: Math.round(totalFixed),
    grandTotal: Math.round(grandTotal),
    grandTotalPerGuest: Math.round(grandTotal / guestCount),
  }
}

export function getBudgetColor(total: number): { bg: string; text: string; label: string } {
  if (total < 15000) {
    return {
      bg: 'from-green-50 to-emerald-50',
      text: 'text-green-700',
      label: 'Mariage malin et maîtrisé 👏',
    }
  }
  if (total < 35000) {
    return {
      bg: 'from-blue-50 to-cyan-50',
      text: 'text-blue-700',
      label: 'Budget dans la moyenne française',
    }
  }
  if (total < 60000) {
    return {
      bg: 'from-amber-50 to-orange-50',
      text: 'text-orange-700',
      label: 'Beau projet, à structurer pour pas déraper',
    }
  }
  return {
    bg: 'from-red-50 to-rose-50',
    text: 'text-red-700',
    label: 'Mariage haut de gamme — la planification sera votre meilleure amie',
  }
}

export function getBreakdownData(
  breakdown: CostBreakdown,
  guestCount: number
) {
  return [
    {
      name: 'Repas & boissons',
      value: breakdown.perGuestCosts['Traiteur (repas + boissons)'] * breakdown.regionMultiplier * guestCount,
      color: '#4a5240',
    },
    {
      name: 'Photographe & vidéo',
      value: breakdown.fixedCosts['Photographe + vidéaste'],
      color: '#6b7a5a',
    },
    {
      name: 'Venue',
      value: breakdown.perGuestCosts['Lieu de réception'] * breakdown.regionMultiplier * guestCount,
      color: '#7a8a6a',
    },
    {
      name: 'Tenues',
      value: breakdown.fixedCosts['Tenues (robe + costume)'],
      color: '#8a9a7a',
    },
    {
      name: 'Décoration & fleurs',
      value: breakdown.perGuestCosts['Décoration & fleurs'] * breakdown.regionMultiplier * guestCount,
      color: '#9aaa8a',
    },
    {
      name: 'Autres',
      value:
        (breakdown.perGuestCosts['Animation / DJ'] +
          breakdown.perGuestCosts['Divers']) *
          breakdown.regionMultiplier *
          guestCount +
        breakdown.fixedCosts['Alliances'] +
        breakdown.fixedCosts['Coiffure & maquillage'] +
        (breakdown.fixedCosts['Voyage de noces'] || 0),
      color: '#aabaaa',
    },
  ].filter((item) => item.value > 0)
}
