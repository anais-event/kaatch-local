import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_STUDIO_WEBHOOK_SECRET

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.order_id
  if (!orderId) return NextResponse.json({ error: 'No order_id in metadata' }, { status: 400 })

  const shipping = (session as unknown as { shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; postal_code?: string; country?: string } } }).shipping_details
  const shippingAddress = shipping ? {
    name: shipping.name,
    line1: shipping.address?.line1,
    line2: shipping.address?.line2,
    city: shipping.address?.city,
    postal_code: shipping.address?.postal_code,
    country: shipping.address?.country,
  } : null

  await supabase
    .from('studio_public_orders')
    .update({
      status: 'paid',
      email: session.customer_details?.email,
      stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      shipping_address: shippingAddress,
    })
    .eq('id', orderId)

  // TODO: envoyer email avec lien personnalisation
  // lien: `${BASE_URL}/studio/personnaliser/${orderId}`
  console.log(`Order ${orderId} paid. Perso link: ${BASE_URL}/studio/personnaliser/${orderId}`)

  return NextResponse.json({ received: true })
}
