export const FREE_GUEST_LIMIT = 20

export function isPaid(plan: string | null | undefined): boolean {
  return plan === 'mariage' || plan === 'pro'
}

export function checkoutUrl(weddingId: string, slug: string): string {
  return `/api/stripe/checkout?wedding_id=${weddingId}&slug=${slug}`
}
