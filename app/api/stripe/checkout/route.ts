import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const weddingId = searchParams.get('wedding_id')
  const slug = searchParams.get('slug')

  if (!weddingId || !slug) {
    return NextResponse.json({ error: 'wedding_id et slug requis' }, { status: 400 })
  }

  const origin = new URL(req.url).origin

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: {
      wedding_id: weddingId,
      plan: 'mariage',
    },
    success_url: `${origin}/wedding/${slug}?payment=success`,
    cancel_url: `${origin}/wedding/${slug}?payment=cancelled`,
  })

  return NextResponse.redirect(session.url!)
}
