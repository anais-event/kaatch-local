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

  // Test fine-art A2 UIDs (hor confirmed, test ver)
  const a2Candidates = [
    'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated',
    'fine_arts_poster_geo_simplified_product_12-0_ver_a2_200-gsm-80lb-enhanced-uncoated',
  ]
  const priceTests = await Promise.all(
    a2Candidates.map(async uid => {
      const r1 = await fetch(`${GELATO_API_BASE}/products/${uid}/prices?country=FR`, { headers: { 'X-API-KEY': apiKey } })
      const body1 = await r1.text()
      const parsed = r1.ok ? JSON.parse(body1) : null
      // Get first 3 price entries
      const prices = parsed?.prices?.slice(0, 5) ?? parsed?.slice(0, 5) ?? null
      return { uid, status: r1.status, prices }
    })
  )

  // Full catalog list
  const catRes = await fetch(`${GELATO_API_BASE}/catalogs`, { headers: { 'X-API-KEY': apiKey } })
  const catData = await catRes.json()
  const allUids = (catData.data ?? []).map((c: { catalogUid: string; title: string }) => `${c.catalogUid} — ${c.title}`)

  // Search A2 in multiple catalogs
  const interestingCats = ['framed-posters', 'hanging-posters', 'fine-art', 'fine-art-framed-poster', 'mounted-framed-posters']
  const catProducts: Record<string, unknown> = {}
  for (const cat of interestingCats) {
    const r = await fetch(`${GELATO_API_BASE}/catalogs/${cat}/products?limit=100`, { headers: { 'X-API-KEY': apiKey } })
    if (r.ok) {
      const d = await r.json()
      const all = (d.products ?? d.data ?? []) as { productUid?: string; uid?: string; title?: string; name?: string }[]
      // Filter to A2 only
      const a2 = all.filter(p => {
        const uid = p.productUid ?? p.uid ?? ''
        return uid.includes('a2') || uid.includes('A2') || (p.title ?? p.name ?? '').toLowerCase().includes('a2')
      })
      catProducts[cat] = {
        total: all.length,
        a2Results: a2.map(p => ({ uid: p.productUid ?? p.uid, title: p.title ?? p.name })),
        sample5: all.slice(0, 3).map(p => ({ uid: p.productUid ?? p.uid, title: p.title ?? p.name })),
      }
    } else {
      catProducts[cat] = { status: r.status }
    }
  }

  return NextResponse.json({ allCatalogs: allUids, catProducts })
}
