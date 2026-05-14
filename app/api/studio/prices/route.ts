import { NextRequest, NextResponse } from 'next/server'

const GELATO_API_BASE = 'https://product.gelatoapis.com/v3'

const PRODUCT_UIDS: Record<string, { uid: string; packOf?: number }> = {
  save_the_date: { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver' },
  faire_part:    { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver' },
  menu:          { uid: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver' },
  marque_place:  { uid: 'pack_of_folded_cards_qt_10_pcs_pf_a6_upt_300-gsm-110lb-uncoated_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_hor', packOf: 10 },
  numero_table:  { uid: 'pack_of_folded_cards_qt_10_pcs_pf_a5_upt_350-gsm-130lb-coated-silk_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_ver', packOf: 10 },
  plan_ceremonie:{ uid: 'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated' },
  plan_table:    { uid: 'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated' },
  enveloppe:     { uid: 'blank-envelopes_pf_c5_pt_120-g-env' },
}

type GelatoPriceEntry = { quantity: number; price: number; currency: string }

async function fetchPrices(uid: string, apiKey: string): Promise<GelatoPriceEntry[] | null> {
  try {
    const res = await fetch(
      `${GELATO_API_BASE}/products/${uid}/prices?country=FR&currency=EUR`,
      { headers: { 'X-API-KEY': apiKey }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return (data.prices ?? data) as GelatoPriceEntry[]
  } catch {
    return null
  }
}

function pickUnitPrice(prices: GelatoPriceEntry[], qty: number, packOf = 1): number | null {
  if (!prices?.length) return null
  // For pack products: qty = number of pieces needed, pack contains `packOf` pieces
  // Gelato qty = number of packs
  const gelatoQty = packOf > 1 ? Math.ceil(qty / packOf) : qty
  const sorted = [...prices].sort((a, b) => a.quantity - b.quantity)
  const bracket = sorted.find(p => p.quantity >= gelatoQty) ?? sorted[sorted.length - 1]
  if (!bracket) return null
  // bracket.price = total price for that quantity of packs
  // unit price per piece = total / (bracket.quantity * packOf)
  const totalPieces = bracket.quantity * packOf
  return bracket.price / totalPieces
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY missing' }, { status: 500 })

  const country = req.nextUrl.searchParams.get('country') ?? 'FR'
  const qty = parseInt(req.nextUrl.searchParams.get('qty') ?? '50', 10)

  const entries = await Promise.all(
    Object.entries(PRODUCT_UIDS).map(async ([id, { uid, packOf = 1 }]) => {
      const prices = await fetchPrices(uid, apiKey)
      const unitPrice = prices ? pickUnitPrice(prices, qty, packOf) : null
      return [id, { unitPrice, currency: 'EUR', packOf }]
    })
  )

  return NextResponse.json({ country, qty, products: Object.fromEntries(entries) })
}
