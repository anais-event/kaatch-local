export const FREE_GUEST_LIMIT = 20

export function isPaid(plan: string | null | undefined): boolean {
  return plan === 'mariage' || plan === 'pro'
}

export function checkoutUrl(weddingId: string): string {
  const base = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? ''
  return `${base}?checkout[custom][wedding_id]=${weddingId}&checkout[custom][plan]=mariage`
}
