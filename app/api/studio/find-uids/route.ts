import { NextResponse } from 'next/server'

const GELATO_API_BASE = 'https://product.gelatoapis.com/v3'

// Candidate UIDs to test — variations on format, paper, color
const CANDIDATES = [
  // Folded cards / chevalets A6
  'folded-cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver',
  'folded-cards_pf_a6_pt_350-gsm-coated-silk_cl_4-0_ver',
  'folded-cards_pf_a6-landscape_pt_350-gsm-coated-silk_cl_4-4_ver',
  'tent-cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver',
  'tent-cards_pf_a6_pt_300-gsm-coated-silk_cl_4-4_ver',

  // Folded cards / chevalets A5
  'folded-cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  'folded-cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver',
  'tent-cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',

  // Posters A2
  'posters_pf_a2_pt_200-gsm-silk_cl_4-0_ver',
  'posters_pf_a2_pt_200-gsm-coated-silk_cl_4-0_ver',
  'posters_pf_a2_pt_150-gsm-silk_cl_4-0_ver',
  'posters_pf_a2_pt_170-gsm-silk_cl_4-0_ver',

  // Envelopes C5 (for A5 faire-part)
  'envelopes_pf_c5_pt_90-gsm-offset_cl_4-0_ver',
  'envelopes_pf_c5_pt_100-gsm-offset_cl_4-0_ver',
  'envelopes_pf_c5_pt_90-gsm-offset_cl_0-0_ver',
  'envelopes_pf_c6_pt_90-gsm-offset_cl_0-0_ver',
]

export async function GET() {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'no key' }, { status: 500 })

  // Test 1: prices endpoint with country
  const priceTests = await Promise.all(
    CANDIDATES.slice(0, 4).map(async uid => {
      const r1 = await fetch(`${GELATO_API_BASE}/products/${uid}/prices?country=FR`, { headers: { 'X-API-KEY': apiKey } })
      const r2 = await fetch(`${GELATO_API_BASE}/products/${uid}`, { headers: { 'X-API-KEY': apiKey } })
      const r3 = await fetch(`${GELATO_API_BASE}/products/${uid}/prices?country=FR&currency=EUR`, { headers: { 'X-API-KEY': apiKey } })
      const body1 = await r1.text()
      const body2 = await r2.text()
      return { uid, prices_status: r1.status, product_status: r2.status, prices_eur_status: r3.status, body_prices: body1.slice(0, 200), body_product: body2.slice(0, 200) }
    })
  )

  // Test 2: catalog listing for folded-cards and posters
  const catFolded = await fetch(`${GELATO_API_BASE}/catalogs`, { headers: { 'X-API-KEY': apiKey } })
  const catBody = await catFolded.text()

  return NextResponse.json({ priceTests, catalogs: catBody.slice(0, 1000) })
}
