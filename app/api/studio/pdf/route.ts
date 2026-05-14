import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Document, Page, Text, View, StyleSheet, renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import React, { type JSXElementConstructor, type ReactElement } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AMBIANCE_COLORS: Record<string, { bg: string; accent: string; text: string; card: string }> = {
  boheme:      { bg: '#e4ddd3', accent: '#a8936a', text: '#5c4f3a', card: '#ede6db' },
  classique:   { bg: '#e5e8e2', accent: '#4a5240', text: '#2d3228', card: '#eef0eb' },
  champetre:   { bg: '#ece6dc', accent: '#8b6e5c', text: '#4a3728', card: '#f5efe5' },
  'art-deco':  { bg: '#1a1610', accent: '#c8a84b', text: '#e8d9b8', card: '#252018' },
  minimaliste: { bg: '#eeeceb', accent: '#888888', text: '#1c1c1c', card: '#fafaf9' },
}

// A5 portrait: 419.53 × 595.28 pt
// A6 landscape: 419.53 × 297.64 pt
// A2 landscape: 1683.78 × 1190.55 pt

function makeStyles(c: typeof AMBIANCE_COLORS[string]) {
  return StyleSheet.create({
    page: { backgroundColor: c.bg, padding: 0, fontFamily: 'Times-Roman' },
    inner: { margin: 32, flex: 1, backgroundColor: c.card, borderRadius: 8, padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    rule: { width: 36, height: 1.5, backgroundColor: c.accent, marginVertical: 16 },
    eyebrow: { fontSize: 7, color: c.text, opacity: 0.45, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Helvetica', marginBottom: 4 },
    names: { fontSize: 28, color: c.text, fontFamily: 'Times-Roman', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.25 },
    date: { fontSize: 9, color: c.text, opacity: 0.5, fontFamily: 'Helvetica', letterSpacing: 3, marginTop: 4 },
    lieu: { fontSize: 8, color: c.text, opacity: 0.38, fontFamily: 'Helvetica', marginTop: 4 },
    message: { fontSize: 9, color: c.text, opacity: 0.55, fontFamily: 'Helvetica', textAlign: 'center', lineHeight: 1.7, marginTop: 20, maxWidth: 260 },
    tableNum: { fontSize: 72, color: c.text, fontFamily: 'Times-Roman', fontStyle: 'italic', textAlign: 'center', lineHeight: 1 },
    tableLabel: { fontSize: 8, color: c.text, opacity: 0.45, letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Helvetica', marginTop: 6 },
    menuSection: { width: '100%', marginBottom: 16 },
    menuLabel: { fontSize: 7, color: c.accent, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    menuLine: { height: 6, backgroundColor: c.text, opacity: 0.08, borderRadius: 2 },
  })
}

type Perso = { prenom1: string; prenom2: string; date: string; lieu: string; message: string }

// ── Faire-part / Save the date (A5 portrait) ─────────────────────────────────
function FairePartPDF({ perso, c }: { perso: Perso; c: ReturnType<typeof AMBIANCE_COLORS[string]['bg'] extends string ? () => typeof AMBIANCE_COLORS[string] : never> }) {
  const s = makeStyles(c as typeof AMBIANCE_COLORS[string])
  const dateStr = perso.date ? new Date(perso.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    React.createElement(Document, null,
      React.createElement(Page, { size: 'A5', style: s.page },
        React.createElement(View, { style: s.inner },
          React.createElement(Text, { style: s.eyebrow }, 'Faire-part de mariage'),
          React.createElement(View, { style: s.rule }),
          React.createElement(Text, { style: s.names }, `${perso.prenom1}\n& ${perso.prenom2}`),
          React.createElement(View, { style: s.rule }),
          React.createElement(Text, { style: s.date }, dateStr.toUpperCase()),
          React.createElement(Text, { style: s.lieu }, perso.lieu || ''),
          perso.message ? React.createElement(Text, { style: s.message }, perso.message) : null
        )
      )
    )
  )
}

// ── Menu (A5 portrait) ────────────────────────────────────────────────────────
function MenuPDF({ perso, c }: { perso: Perso; c: typeof AMBIANCE_COLORS[string] }) {
  const s = makeStyles(c)
  const dateStr = perso.date ? new Date(perso.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    React.createElement(Document, null,
      React.createElement(Page, { size: 'A5', style: s.page },
        React.createElement(View, { style: { ...s.inner, justifyContent: 'flex-start', paddingTop: 40 } },
          React.createElement(Text, { style: s.eyebrow }, 'Menu'),
          React.createElement(Text, { style: { ...s.names, fontSize: 20 } }, `${perso.prenom1} & ${perso.prenom2}`),
          React.createElement(View, { style: s.rule }),
          React.createElement(Text, { style: s.date }, dateStr.toUpperCase()),
          React.createElement(View, { style: { marginTop: 28, width: '100%' } },
            ...(['Entrée', 'Plat', 'Fromages', 'Dessert'] as const).map(label =>
              React.createElement(View, { key: label, style: s.menuSection },
                React.createElement(Text, { style: s.menuLabel }, label),
                React.createElement(View, { style: { ...s.menuLine, width: '75%' } })
              )
            )
          )
        )
      )
    )
  )
}

// ── Marque-place (A6 landscape) ───────────────────────────────────────────────
function MarquePlacePDF({ perso, c }: { perso: Perso; c: typeof AMBIANCE_COLORS[string] }) {
  const s = makeStyles(c)
  return (
    React.createElement(Document, null,
      React.createElement(Page, { size: [419.53, 297.64], style: s.page },
        React.createElement(View, { style: { ...s.inner, justifyContent: 'center' } },
          React.createElement(Text, { style: { ...s.names, fontSize: 22 } }, `${perso.prenom1} & ${perso.prenom2}`),
          React.createElement(View, { style: s.rule }),
          React.createElement(Text, { style: s.eyebrow }, 'Invité(e)'),
        )
      )
    )
  )
}

// ── Numéro de table (A5 landscape) ────────────────────────────────────────────
function NumeroTablePDF({ tableNum, c }: { tableNum: number; c: typeof AMBIANCE_COLORS[string] }) {
  const s = makeStyles(c)
  return (
    React.createElement(Document, null,
      React.createElement(Page, { size: [595.28, 419.53], style: s.page },
        React.createElement(View, { style: { ...s.inner, justifyContent: 'center' } },
          React.createElement(Text, { style: s.tableNum }, String(tableNum)),
          React.createElement(Text, { style: s.tableLabel }, 'Table'),
        )
      )
    )
  )
}

// ── Plan poster (A2 landscape) ────────────────────────────────────────────────
function PlanPosterPDF({ perso, type, c }: { perso: Perso; type: 'ceremonie' | 'table'; c: typeof AMBIANCE_COLORS[string] }) {
  const s = makeStyles(c)
  const dateStr = perso.date ? new Date(perso.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  return (
    React.createElement(Document, null,
      React.createElement(Page, { size: [1683.78, 1190.55], style: s.page },
        React.createElement(View, { style: { ...s.inner, justifyContent: 'flex-start', paddingTop: 80 } },
          React.createElement(Text, { style: s.eyebrow }, type === 'ceremonie' ? 'Plan de cérémonie' : 'Plan de table'),
          React.createElement(Text, { style: { ...s.names, fontSize: 48 } }, `${perso.prenom1} & ${perso.prenom2}`),
          React.createElement(View, { style: { ...s.rule, width: 60, marginVertical: 24 } }),
          React.createElement(Text, { style: { ...s.date, fontSize: 12 } }, dateStr.toUpperCase()),
          React.createElement(Text, { style: { ...s.lieu, fontSize: 11 } }, perso.lieu || ''),
          React.createElement(View, { style: { marginTop: 60, padding: 48, borderWidth: 1, borderColor: c.accent, borderStyle: 'dashed', borderRadius: 8, opacity: 0.4 } },
            React.createElement(Text, { style: { ...s.eyebrow, opacity: 1 } }, type === 'ceremonie' ? 'Plan de placement — à renseigner' : 'Plan des tables — à renseigner')
          )
        )
      )
    )
  )
}

// ── Generate + upload all PDFs for an order ───────────────────────────────────
async function generateAndUpload(
  orderId: string,
  productId: string,
  perso: Perso,
  ambianceId: string,
  qty: number
): Promise<string | null> {
  const c = AMBIANCE_COLORS[ambianceId] ?? AMBIANCE_COLORS.classique
  let element: React.ReactElement | null = null

  switch (productId) {
    case 'faire_part':
    case 'save_the_date':
      element = React.createElement(FairePartPDF, { perso, c })
      break
    case 'menu':
      element = React.createElement(MenuPDF, { perso, c })
      break
    case 'marque_place':
      element = React.createElement(MarquePlacePDF, { perso, c })
      break
    case 'numero_table':
      // Generate one PDF per table (qty = number of tables)
      element = React.createElement(NumeroTablePDF, { tableNum: 1, c })
      break
    case 'plan_ceremonie':
      element = React.createElement(PlanPosterPDF, { perso, type: 'ceremonie', c })
      break
    case 'plan_table':
      element = React.createElement(PlanPosterPDF, { perso, type: 'table', c })
      break
    default:
      return null
  }

  if (!element) return null

  try {
    const buffer = await renderToBuffer(element as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>)
    const path = `studio/${orderId}/${productId}.pdf`
    const { error } = await supabase.storage
      .from('wedding-photos')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
    if (error) { console.error('Upload error', productId, error); return null }
    const { data } = supabase.storage.from('wedding-photos').getPublicUrl(path)
    return data.publicUrl
  } catch (e) {
    console.error('PDF gen error', productId, e)
    return null
  }
}

export async function POST(req: NextRequest) {
  const { orderId } = await req.json() as { orderId: string }
  if (!orderId) return NextResponse.json({ error: 'orderId manquant' }, { status: 400 })

  const { data: order, error } = await supabase
    .from('studio_public_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  const perso = (order.personalization ?? {}) as Perso
  const quantities = (order.quantities ?? {}) as Record<string, number>
  const ambianceId = order.ambiance_id as string

  const results = await Promise.all(
    Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(async ([productId, qty]) => {
        const url = await generateAndUpload(orderId, productId, perso, ambianceId, qty)
        return [productId, url] as [string, string | null]
      })
  )

  const urls = Object.fromEntries(results.filter(([, url]) => url !== null))

  // Save PDF URLs to order
  await supabase
    .from('studio_public_orders')
    .update({ personalization: { ...perso, pdf_urls: urls } })
    .eq('id', orderId)

  return NextResponse.json({ urls })
}
