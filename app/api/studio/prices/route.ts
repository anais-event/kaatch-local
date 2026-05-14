import { NextRequest, NextResponse } from 'next/server'

const GELATO_API_BASE = 'https://product.gelatoapis.com/v3'

// Map our product IDs to Gelato product UIDs
const PRODUCT_UIDS: Record<string, string> = {
  save_the_date: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  faire_part:    'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  menu:          'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver',
  marque_place:  'folded-cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver',
  numero_table:  'folded-cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  plan_ceremonie:'posters_pf_a2_pt_200-gsm-silk_cl_4-0_ver',
  plan_table:    'posters_pf_a2_pt_200-gsm-silk_cl_4-0_ver',
  enveloppe:     'envelopes_pf_c5_pt_90-gsm-offset_cl_4-0_ver',
}

type GelatoPriceEntry = { quantity: number; price: number; currency: string }

async function fetchProductPrice(
  productUid: string,
  country: string,
  apiKey: string
): Promise<GelatoPriceEntry[] | null> {
  try {
    const res = await fetch(
      `${GELATO_API_BASE}/products/${productUid}/prices?country=${country}`,
      { headers: { 'X-API-KEY': apiKey }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    // Gelato returns an array of { quantity, price, currency }
    return (data.prices ?? data) as GelatoPriceEntry[]
  } catch {
    return null
  }
}

function pickPrice(prices: GelatoPriceEntry[], qty: number): number | null {
  if (!prices?.length) return null
  // Find exact match, or closest quantity bracket above
  const sorted = [...prices].sort((a, b) => a.quantity - b.quantity)
  const match = sorted.find(p => p.quantity >= qty) ?? sorted[sorted.length - 1]
  // Return unit price (Gelato may return total or unit — divide if total)
  return match ? match.price / (match.quantity > 1 ? match.quantity : 1) : null
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GELATO_API_KEY missing' }, { status: 500 })
  }

  const country = req.nextUrl.searchParams.get('country') ?? 'FR'
  const qty = parseInt(req.nextUrl.searchParams.get('qty') ?? '50', 10)

  const entries = await Promise.all(
    Object.entries(PRODUCT_UIDS).map(async ([id, uid]) => {
      const prices = await fetchProductPrice(uid, country, apiKey)
      return [id, { prices, unitPrice: prices ? pickPrice(prices, qty) : null }]
    })
  )

  return NextResponse.json({
    country,
    qty,
    products: Object.fromEntries(entries),
  })
}
