import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GELATO_ORDER_BASE = 'https://order.gelatoapis.com/v4'

// Map product IDs → Gelato UIDs (same as prices route)
const PRODUCT_UIDS: Record<string, string> = {
  save_the_date: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  faire_part:    'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  menu:          'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver',
  marque_place:  'pack_of_folded_cards_qt_10_pcs_pf_a6_upt_300-gsm-110lb-uncoated_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_hor',
  numero_table:  'pack_of_folded_cards_qt_10_pcs_pf_a5_upt_350-gsm-130lb-coated-silk_cl_4-4_ft_crease-ver_ct_none_prt_none_sft_none_ver',
  plan_ceremonie:'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated',
  plan_table:    'fine_arts_poster_geo_simplified_product_12-0_hor_a2_200-gsm-80lb-enhanced-uncoated',
  enveloppe:     'blank-envelopes_pf_c5_pt_120-g-env',
}

// Pack-of-10 products need quantity in packs, not pieces
const PACK_OF: Record<string, number> = {
  marque_place: 10,
  numero_table: 10,
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY missing' }, { status: 500 })

  const formData = await req.formData()
  const orderId = formData.get('orderId') as string
  if (!orderId) return NextResponse.json({ error: 'orderId manquant' }, { status: 400 })

  // Fetch order from DB
  const { data: order, error } = await supabase
    .from('studio_public_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  if (order.status !== 'paid') return NextResponse.json({ error: 'Commande non payée' }, { status: 400 })

  const weddingInfo = (order.wedding_info ?? {}) as Record<string, string>
  const existingPerso = (order.personalization ?? {}) as Record<string, unknown>

  const personalization = {
    prenom1: (formData.get('prenom1') as string) || weddingInfo.name1 || '',
    prenom2: (formData.get('prenom2') as string) || weddingInfo.name2 || '',
    date:    (formData.get('date')    as string) || weddingInfo.date   || '',
    lieu:    (formData.get('lieu')    as string) || weddingInfo.lieu   || '',
    message: (formData.get('message') as string) || (existingPerso.coupleMessage as string) || '',
    guestList: existingPerso.guestList ?? [],
    tables:    existingPerso.tables    ?? [],
    dressCode: existingPerso.dressCode ?? '',
    menuVege:  existingPerso.menuVege  ?? false,
  }

  // Save personalization to DB
  await supabase
    .from('studio_public_orders')
    .update({ personalization, status: 'personalizing' })
    .eq('id', orderId)

  // Generate PDFs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'
  const pdfRes = await fetch(`${baseUrl}/api/studio/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
  const pdfData = pdfRes.ok ? await pdfRes.json() : {}
  const pdfUrls = (pdfData.urls ?? {}) as Record<string, string>

  const quantities = order.quantities as Record<string, number>
  const shipping = order.shipping_address as {
    name?: string; line1?: string; line2?: string;
    city?: string; postal_code?: string; country?: string
  } | null

  if (!shipping?.name || !shipping?.line1 || !shipping?.city || !shipping?.postal_code || !shipping?.country) {
    return NextResponse.json({ error: 'Adresse de livraison manquante' }, { status: 400 })
  }

  const items = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const uid = PRODUCT_UIDS[productId]
      if (!uid) return null
      const packOf = PACK_OF[productId] ?? 1
      const gelatoQty = packOf > 1 ? Math.ceil(qty / packOf) : qty
      const fileUrl = pdfUrls[productId]
      if (!fileUrl) return null
      return {
        productUid: uid,
        quantity: gelatoQty,
        files: [{ type: 'default', url: fileUrl }],
      }
    })
    .filter(Boolean)

  if (items.length === 0) {
    await supabase.from('studio_public_orders').update({ status: 'perso_done', notes: 'PDFs manquants' }).eq('id', orderId)
    return NextResponse.json({ ok: true, warning: 'PDFs non générés, traitement manuel' })
  }

  const gelatoPayload = {
    orderType: 'order', // PDFs présents → commande réelle
    orderReferenceId: orderId,
    customerReferenceId: order.email ?? orderId,
    currency: 'EUR',
    items,
    shippingAddress: {
      firstName: shipping.name.split(' ')[0] ?? shipping.name,
      lastName: shipping.name.split(' ').slice(1).join(' ') || '-',
      addressLine1: shipping.line1,
      addressLine2: shipping.line2 ?? '',
      city: shipping.city,
      postCode: shipping.postal_code,
      country: shipping.country,
      email: order.email ?? '',
    },
    metadata: [{ key: 'kaatch_order_id', value: orderId }],
  }

  const gelatoRes = await fetch(`${GELATO_ORDER_BASE}/orders`, {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(gelatoPayload),
  })

  if (!gelatoRes.ok) {
    const errBody = await gelatoRes.text()
    console.error('Gelato order error:', errBody)
    // Don't fail the user — save state and alert manually
    await supabase
      .from('studio_public_orders')
      .update({ status: 'perso_done', notes: `Gelato error: ${errBody.slice(0, 500)}` })
      .eq('id', orderId)
    return NextResponse.json({ ok: true, warning: 'Gelato non joignable, traitement manuel' })
  }

  const gelatoOrder = await gelatoRes.json()

  await supabase
    .from('studio_public_orders')
    .update({
      status: 'sent_to_gelato',
      gelato_order_id: gelatoOrder.id ?? gelatoOrder.orderId ?? null,
    })
    .eq('id', orderId)

  return NextResponse.json({ ok: true })
}
