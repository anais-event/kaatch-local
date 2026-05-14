import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  extractUniversSettings,
  generateFairePartBuffer,
  generateMarquePlaceBuffer,
  generateMenuBuffer,
  generateProgrammeBuffer,
  generatePlanTableBuffer,
  generateNumeroTableBuffer,
} from '@/lib/pdf/generate'
import type { ProgrammeStep, TableInfo } from '@/lib/pdf/types'

const GELATO_API_BASE = 'https://order.gelato.com/api/v4'

const PRODUCT_UIDS: Record<string, string> = {
  faire_part:    'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  save_the_date: 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
  menu:          'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-0_ver',
  marque_place:  'folded-cards_pf_a6_pt_350-gsm-coated-silk_cl_4-4_ver',
  programme:     'multipage-brochures_pf_a5_pt_130-gsm-silk_cl_4-4_ver',
  plan_table:    'posters_pf_a2_pt_200-gsm-silk_cl_4-0_ver',
  numeros_table: 'folded-cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver',
}

async function uploadPDF(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  buffer: Buffer,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from('wedding-pdfs')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload PDF failed: ${error.message}`)
  const { data } = supabase.storage.from('wedding-pdfs').getPublicUrl(path)
  return data.publicUrl
}

function cleanName(n: string | null | undefined): string {
  if (!n) return ''
  return n.split(' ').filter(p => p && p !== 'null').join(' ')
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY manquante' }, { status: 500 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { weddingId, weddingSlug, shipping } = body as {
    weddingId: string
    weddingSlug: string
    shipping: {
      firstName: string; lastName: string
      addressLine1: string; addressLine2?: string
      city: string; postCode: string; country: string
      email: string; phone?: string
    }
  }

  // ── Fetch all data in parallel ────────────────────────────────────────────────
  const [
    { data: wedding },
    { data: studioRow },
    { data: guests },
    { data: dbTables },
    { data: programmeSteps },
  ] = await Promise.all([
    supabase.from('weddings').select('id, name, date, location').eq('id', weddingId).eq('user_id', user.id).single(),
    supabase.from('studio_progress').select('module_collection, module_univers, module_reception, module_destinataires').eq('wedding_id', weddingId).single(),
    supabase.from('guests').select('id, first_name, last_name').eq('wedding_id', weddingId),
    supabase.from('seating_tables').select('id, name').eq('wedding_id', weddingId),
    supabase.from('program_steps').select('id, title, time, description').eq('wedding_id', weddingId).order('position'),
  ])

  if (!wedding) return NextResponse.json({ error: 'Mariage introuvable' }, { status: 404 })

  const univers    = extractUniversSettings(studioRow?.module_univers)
  const coll       = (studioRow?.module_collection ?? {}) as Record<string, { checked: boolean; printQty?: number; qty: number; download?: boolean }>
  const recep      = (studioRow?.module_reception  ?? {}) as Record<string, { enabled: boolean; qty: number }>
  const dest       = (studioRow?.module_destinataires ?? {}) as { selection?: Record<string, Record<string, boolean>> }
  const destSel    = dest.selection ?? {}

  const weddingInfo = { name: wedding.name ?? '', date: wedding.date ?? null, location: wedding.location ?? null }

  // ── Guest table assignments ───────────────────────────────────────────────────
  const tableIds = (dbTables ?? []).map(t => t.id)
  const { data: assignments } = tableIds.length
    ? await supabase.from('table_guests').select('guest_id, table_id').in('table_id', tableIds)
    : { data: [] }

  const tableNameMap = new Map((dbTables ?? []).map(t => [t.id, t.name]))
  const guestTableMap = new Map((assignments ?? []).map(a => [a.guest_id, tableNameMap.get(a.table_id) ?? null]))

  const ts     = Date.now()
  const prefix = `${weddingId}/${ts}`
  const items: object[] = []
  let idx = 1

  // ── Helper: check if guest selected for product in destinataires ──────────────
  function guestSelectedFor(guestId: string, productKey: string): boolean {
    // If no destinataires configured, include all guests
    if (Object.keys(destSel).length === 0) return true
    return !!(destSel[`guest:${guestId}`]?.[productKey])
  }

  // ── Faire-part ────────────────────────────────────────────────────────────────
  if (coll.faire_part?.checked && !coll.faire_part?.download) {
    const qty = coll.faire_part.printQty ?? coll.faire_part.qty ?? 0
    if (qty > 0) {
      const buf = await generateFairePartBuffer(univers, weddingInfo)
      const url = await uploadPDF(supabase, buf, `${prefix}/faire-part.pdf`)
      items.push({ itemReferenceId: `fp-${idx++}`, productUid: PRODUCT_UIDS.faire_part, files: [{ type: 'default', url }], quantity: qty })
    }
  }

  // ── Save the date ─────────────────────────────────────────────────────────────
  if (coll.save_the_date?.checked && !coll.save_the_date?.download) {
    const qty = coll.save_the_date.printQty ?? coll.save_the_date.qty ?? 0
    if (qty > 0) {
      const buf = await generateFairePartBuffer(univers, { ...weddingInfo, name: `Save the date · ${weddingInfo.name}` })
      const url = await uploadPDF(supabase, buf, `${prefix}/save-the-date.pdf`)
      items.push({ itemReferenceId: `std-${idx++}`, productUid: PRODUCT_UIDS.save_the_date, files: [{ type: 'default', url }], quantity: qty })
    }
  }

  // ── Menu ──────────────────────────────────────────────────────────────────────
  if (coll.menu?.checked && !coll.menu?.download) {
    const qty = coll.menu.printQty ?? coll.menu.qty ?? 0
    if (qty > 0) {
      const buf = await generateMenuBuffer(univers, weddingInfo)
      const url = await uploadPDF(supabase, buf, `${prefix}/menu.pdf`)
      items.push({ itemReferenceId: `menu-${idx++}`, productUid: PRODUCT_UIDS.menu, files: [{ type: 'default', url }], quantity: qty })
    }
  }

  // ── Marque-places : 1 PDF par invité SÉLECTIONNÉ dans destinataires ──────────
  if (coll.marque_place?.checked && !coll.marque_place?.download) {
    const guestList = (guests ?? []).filter(g => guestSelectedFor(g.id, 'marque_place'))

    for (const guest of guestList) {
      const buf  = await generateMarquePlaceBuffer(univers, {
        id: guest.id,
        firstName: cleanName(guest.first_name),
        lastName:  cleanName(guest.last_name),
        tableName: guestTableMap.get(guest.id) ?? null,
      })
      const name = `${guest.first_name}-${guest.last_name}`.replace(/\s+/g, '-').toLowerCase()
      const url  = await uploadPDF(supabase, buf, `${prefix}/mp-${name}-${guest.id}.pdf`)
      items.push({ itemReferenceId: `mp-${idx++}`, productUid: PRODUCT_UIDS.marque_place, files: [{ type: 'default', url }], quantity: 1 })
    }
  }

  // ── Programme (depuis module_reception) ──────────────────────────────────────
  if (recep.programme?.enabled) {
    const qty   = recep.programme.qty ?? 0
    const steps: ProgrammeStep[] = (programmeSteps ?? []).map(s => ({
      title: s.title,
      time: s.time ?? null,
      description: s.description ?? null,
    }))
    if (qty > 0) {
      const buf = await generateProgrammeBuffer(univers, weddingInfo, steps)
      const url = await uploadPDF(supabase, buf, `${prefix}/programme.pdf`)
      items.push({ itemReferenceId: `prog-${idx++}`, productUid: PRODUCT_UIDS.programme, files: [{ type: 'default', url }], quantity: qty })
    }
  }

  // ── Plan de table ─────────────────────────────────────────────────────────────
  if (recep.planTable?.enabled) {
    const qty = recep.planTable.qty ?? 0
    if (qty > 0 && (dbTables ?? []).length > 0) {
      const tableList: TableInfo[] = (dbTables ?? []).map(t => ({
        id: t.id,
        name: t.name,
        guests: (assignments ?? [])
          .filter(a => a.table_id === t.id)
          .map(a => {
            const g = (guests ?? []).find(gg => gg.id === a.guest_id)
            return g ? [cleanName(g.first_name), cleanName(g.last_name)].filter(Boolean).join(' ') : ''
          })
          .filter(Boolean),
      }))
      const buf = await generatePlanTableBuffer(univers, weddingInfo, tableList)
      const url = await uploadPDF(supabase, buf, `${prefix}/plan-table.pdf`)
      items.push({ itemReferenceId: `pt-${idx++}`, productUid: PRODUCT_UIDS.plan_table, files: [{ type: 'default', url }], quantity: qty })
    }
  }

  // ── Numéros de table : 1 PDF par table ────────────────────────────────────────
  if (recep.numerosTable?.enabled) {
    for (const table of (dbTables ?? [])) {
      const buf = await generateNumeroTableBuffer(univers, table.name)
      const url = await uploadPDF(supabase, buf, `${prefix}/numero-${table.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      items.push({ itemReferenceId: `nt-${idx++}`, productUid: PRODUCT_UIDS.numeros_table, files: [{ type: 'default', url }], quantity: 1 })
    }
  }

  if (items.length === 0) {
    return NextResponse.json({ error: 'Aucun produit à commander (vérifiez votre sélection)' }, { status: 400 })
  }

  // ── Gelato order ──────────────────────────────────────────────────────────────
  const orderPayload = {
    orderReferenceId: `kaatch-${weddingId}-${ts}`,
    customerReferenceId: user.id,
    currency: 'EUR',
    items,
    shipmentMethodUid: 'normal',
    shippingAddress: {
      firstName:    shipping.firstName,
      lastName:     shipping.lastName,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2 ?? '',
      city:         shipping.city,
      postCode:     shipping.postCode,
      country:      shipping.country || 'FR',
      email:        shipping.email || user.email,
      phone:        shipping.phone ?? '',
    },
  }

  const response = await fetch(`${GELATO_API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify(orderPayload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error('Gelato error:', response.status, err)
    return NextResponse.json({ error: 'Erreur Gelato', details: err }, { status: response.status })
  }

  const order = await response.json()

  // ── Persister la commande en BDD ──────────────────────────────────────────────
  await supabase.from('studio_orders').insert({
    wedding_id:   weddingId,
    user_id:      user.id,
    gelato_order_id: order.id ?? null,
    status:       'pending',
    item_count:   items.length,
    order_reference: `kaatch-${weddingId}-${ts}`,
    shipping_address: shipping,
  })

  return NextResponse.json({ success: true, orderId: order.id, checkoutUrl: order.checkoutUrl })
}
