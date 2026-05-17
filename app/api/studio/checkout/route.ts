import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!) }
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'
const GELATO_API_BASE = 'https://product.gelatoapis.com/v3'

const PRODUCT_UIDS: Record<string, { uid: string; packOf?: number; name: string }> = {
  save_the_date: { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',                                                                                         name: 'Save the date'      },
  faire_part:    { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',                                                                                         name: 'Faire-part'         },
  menu:          { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver',                                                                                         name: 'Menu'               },
  marque_place:  { uid: 'pack_of_folded_cards_qt_10_pcs_pf_a6_upt_300-gsm-110lb-uncoated_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_hor', packOf: 10,        name: 'Marque-place'       },
  numero_table:  { uid: 'pack_of_folded_cards_qt_10_pcs_pf_a5_upt_350-gsm-130lb-coated-silk_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_ver', packOf: 10,    name: 'Numéro de table'    },
  plan_ceremonie:{ uid: 'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated',                                                     name: 'Plan de cérémonie'  },
  plan_table:    { uid: 'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated',                                                     name: 'Plan de table'      },
}

const AMBIANCE_LABELS: Record<string, string> = {
  campagne: 'Maison de campagne', classique: 'Classique intemporel',
  boheme: 'Bohème chaleureux', romance: 'Modern Romance', artdeco: 'Art Déco prestige',
}

type GelatoPriceEntry = { quantity: number; price: number; currency: string }

async function fetchUnitPriceCents(uid: string, qty: number, packOf = 1, apiKey: string): Promise<number> {
  try {
    const res = await fetch(
      `${GELATO_API_BASE}/products/${uid}/prices?country=FR&currency=EUR`,
      { headers: { 'X-API-KEY': apiKey } }
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    const prices = (data.prices ?? data) as GelatoPriceEntry[]
    if (!prices?.length) throw new Error()
    const gelatoQty = packOf > 1 ? Math.ceil(qty / packOf) : qty
    const sorted = [...prices].sort((a, b) => a.quantity - b.quantity)
    const bracket = sorted.find(p => p.quantity >= gelatoQty) ?? sorted[sorted.length - 1]
    const totalPieces = bracket.quantity * packOf
    return Math.round((bracket.price / totalPieces) * 100)
  } catch {
    return 0
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY missing' }, { status: 500 })

  const { ambianceId, quantities, weddingInfo, personalization } = await req.json() as {
    ambianceId: string
    quantities: Record<string, number>
    weddingInfo?: { name1: string; name2: string; date: string; lieu: string }
    personalization?: {
      guestList: string[]
      tables: string[]
      coupleMessage: string
      dressCode: string
      menuVege: boolean
    }
  }

  const activeProducts = Object.entries(quantities).filter(([, qty]) => qty > 0)
  if (activeProducts.length === 0) {
    return NextResponse.json({ error: 'Aucun produit' }, { status: 400 })
  }

  // Fetch real prices from Gelato in parallel
  const lineItems = await Promise.all(
    activeProducts.map(async ([id, qty]) => {
      const product = PRODUCT_UIDS[id]
      if (!product) return null
      const unitCents = await fetchUnitPriceCents(product.uid, qty, product.packOf, apiKey)
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: `Ambiance ${AMBIANCE_LABELS[ambianceId] ?? ambianceId}`,
          },
          unit_amount: unitCents,
        },
        quantity: qty,
      }
    })
  )

  const validItems = lineItems.filter(Boolean) as NonNullable<typeof lineItems[0]>[]
  if (validItems.length === 0) return NextResponse.json({ error: 'Prix indisponibles' }, { status: 400 })

  const totalCents = validItems.reduce((s, l) => s + l.price_data.unit_amount * l.quantity, 0)

  const { data: order } = await supabase
    .from('studio_public_orders')
    .insert({
      ambiance_id: ambianceId,
      products: activeProducts.map(([id]) => id),
      quantities,
      total_cents: totalCents,
      status: 'pending_payment',
      wedding_info: weddingInfo ?? null,
      personalization: personalization ?? null,
    })
    .select('id')
    .single()

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: validItems,
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
