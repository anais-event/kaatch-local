import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Coupon lancement -20€, expire le 31/05/2026
const LAUNCH_COUPON_ID = 'RJmSDmSI'
const LAUNCH_COUPON_EXPIRES = new Date('2026-06-01T00:00:00Z')

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const weddingId = searchParams.get('wedding_id')
  const slug = searchParams.get('slug')

  if (!weddingId || !slug) {
    return NextResponse.json({ error: 'wedding_id et slug requis' }, { status: 400 })
  }

  const origin = new URL(req.url).origin
  const isLaunchPeriod = new Date() < LAUNCH_COUPON_EXPIRES

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    ...(isLaunchPeriod ? { discounts: [{ coupon: LAUNCH_COUPON_ID }] } : {}),
    metadata: {
      wedding_id: weddingId,
      plan: 'mariage',
    },
    success_url: `${origin}/mariage/${slug}?payment=success`,
    cancel_url: `${origin}/mariage/${slug}?payment=cancelled`,
  })

  return NextResponse.redirect(session.url!)
}
