import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'

const PRODUCTS = [
  { id: 'save_the_date', name: 'Save the date',     cents: 250  },
  { id: 'faire_part',    name: 'Faire-part',        cents: 350  },
  { id: 'menu',          name: 'Menu',              cents: 280  },
  { id: 'marque_place',  name: 'Marque-place',      cents: 180  },
  { id: 'numero_table',  name: 'Numéro de table',   cents: 450  },
  { id: 'plan_ceremonie',name: 'Plan de cérémonie', cents: 1800 },
  { id: 'plan_table',    name: 'Plan de table',     cents: 1800 },
]

const AMBIANCE_LABELS: Record<string, string> = {
  boheme: 'Bohème', classique: 'Classique', champetre: 'Champêtre',
  'art-deco': 'Art Déco', minimaliste: 'Minimaliste',
}

export async function POST(req: NextRequest) {
  const { ambianceId, quantities } = await req.json() as {
    ambianceId: string
    quantities: Record<string, number>
  }

  const lineItems = PRODUCTS
    .filter(p => (quantities[p.id] ?? 0) > 0)
    .map(p => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: p.name,
          description: `Ambiance ${AMBIANCE_LABELS[ambianceId] ?? ambianceId}`,
        },
        unit_amount: p.cents,
      },
      quantity: quantities[p.id],
    }))

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'Aucun produit' }, { status: 400 })
  }

  const totalCents = lineItems.reduce((s, l) => s + l.price_data.unit_amount * l.quantity, 0)

  const { data: order } = await supabase
    .from('studio_public_orders')
    .insert({
      ambiance_id: ambianceId,
      products: PRODUCTS.filter(p => (quantities[p.id] ?? 0) > 0).map(p => p.id),
      quantities,
      total_cents: totalCents,
      status: 'pending_payment',
    })
    .select('id')
    .single()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${BASE_URL}/studio/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/studio`,
    customer_creation: 'always',
    shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU'] },
    metadata: { order_id: order?.id ?? '' },
    locale: 'fr',
  })

  if (order?.id) {
    await supabase
      .from('studio_public_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)
  }

  return NextResponse.json({ url: session.url })
}
