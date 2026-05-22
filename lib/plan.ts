export const FREE_GUEST_LIMIT = 30
export const FREE_PHOTO_LIMIT = 20
export const ESSENTIAL_PHOTO_LIMIT = 200

export type Plan = 'free' | 'essential' | 'premium'

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Découverte',
  essential: 'Mariage',
  premium: 'Premium',
}

export function normalizePlan(plan: string | null | undefined): Plan {
  if (plan === 'essential' || plan === 'mariage') return 'essential'
  if (plan === 'premium') return 'premium'
  if (plan === 'pro') return 'essential'
  return 'free'
}

const ESSENTIAL_FEATURES = [
  'dashboard', 'edit', 'guests', 'invitations',
  'photos', 'partager', 'programme', 'messagerie',
  'tables', 'budget', 'musique', 'livre-dor',
  'export-excel', 'import-csv', 'zip-photos',
  'hebergements', 'surprises', 'contacts',
]

const FREE_FEATURES = [
  'dashboard', 'edit', 'guests', 'invitations',
  'photos', 'partager', 'programme', 'messagerie',
]

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: FREE_FEATURES,
  essential: ESSENTIAL_FEATURES,
  premium: [...ESSENTIAL_FEATURES, 'premium-templates', 'print-stationery', 'custom-design'],
}

export function canAccess(plan: Plan, feature: string): boolean {
  return PLAN_FEATURES[plan].includes(feature)
}

export function getMaxGuests(plan: Plan): number {
  return plan === 'free' ? FREE_GUEST_LIMIT : Infinity
}

export function getMaxPhotos(plan: Plan): number {
  if (plan === 'free') return FREE_PHOTO_LIMIT
  return ESSENTIAL_PHOTO_LIMIT
}

export function getPlanLabel(plan: Plan): string {
  return PLAN_LABELS[plan]
}

export function isPaid(plan: string | null | undefined): boolean {
  const p = normalizePlan(plan)
  return p === 'essential' || p === 'premium'
}

export function checkoutUrl(weddingId: string, slug: string): string {
  return `/api/stripe/checkout?wedding_id=${weddingId}&slug=${slug}`
}
