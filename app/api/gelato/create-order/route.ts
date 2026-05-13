import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION GELATO
// Après avoir créé vos templates dans Gelato Studio (https://dashboard.gelato.com),
// renseignez les templateIds ci-dessous et ajoutez GELATO_API_KEY dans .env.local
// ─────────────────────────────────────────────────────────────────────────────
const GELATO_API_BASE = 'https://order.gelato.com/api/v4'

// Templates à créer dans Gelato Studio > Product Creator > Personalized Products
// Variables disponibles : {{nom_maries}}, {{date_mariage}}, {{lieu_mariage}},
//                         {{prenom_invite}}, {{nom_invite}}, {{numero_table}}
const DESIGN_TEMPLATES: Record<string, {
  menu?: string
  marquePlaces?: string
  fairesParts?: string
}> = {
  classique: {
    menu:        'GELATO_TEMPLATE_ID_CLASSIQUE_MENU',       // À remplir
    marquePlaces: 'GELATO_TEMPLATE_ID_CLASSIQUE_MARQUE',    // À remplir
    fairesParts:  'GELATO_TEMPLATE_ID_CLASSIQUE_FAIRE_PART',// À remplir
  },
  botanique: {
    menu:        'GELATO_TEMPLATE_ID_BOTANIQUE_MENU',
    marquePlaces: 'GELATO_TEMPLATE_ID_BOTANIQUE_MARQUE',
    fairesParts:  'GELATO_TEMPLATE_ID_BOTANIQUE_FAIRE_PART',
  },
  minimaliste: {
    menu:        'GELATO_TEMPLATE_ID_MINIMALISTE_MENU',
    marquePlaces: 'GELATO_TEMPLATE_ID_MINIMALISTE_MARQUE',
    fairesParts:  'GELATO_TEMPLATE_ID_MINIMALISTE_FAIRE_PART',
  },
}

type ShippingAddress = {
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postCode: string
  country: string
  email: string
  phone?: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GELATO_API_KEY manquante dans les variables d\'environnement' }, { status: 500 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const {
    weddingSlug,
    designId,
    quantities,    // { menus: number, marquePlaces: number, fairesParts: number }
    shipping,      // ShippingAddress
    selectedGuests, // string[] — IDs invités pour marque-places (optionnel)
  } = body as {
    weddingSlug: string
    designId: string
    quantities: { menus: number; marquePlaces: number; fairesParts: number }
    shipping: ShippingAddress
    selectedGuests?: string[]
  }

  // ── Récupération du mariage ──────────────────────────────────────────────
  const { data: wedding, error: wError } = await supabase
    .from('weddings')
    .select('id, name, date, location, bride_name, groom_name')
    .eq('slug', weddingSlug)
    .eq('user_id', user.id)
    .single()

  if (wError || !wedding) {
    return NextResponse.json({ error: 'Mariage introuvable' }, { status: 404 })
  }

  // ── Récupération des invités (pour marque-places) ────────────────────────
  let guests: { id: string; first_name: string; last_name: string; table_number: number | null }[] = []
  if (quantities.marquePlaces > 0) {
    const query = supabase
      .from('guests')
      .select('id, first_name, last_name, table_number')
      .eq('wedding_id', wedding.id)

    if (selectedGuests && selectedGuests.length > 0) {
      query.in('id', selectedGuests)
    }

    const { data: gData } = await query.order('last_name')
    guests = gData ?? []
  }

  const templates = DESIGN_TEMPLATES[designId]
  if (!templates) {
    return NextResponse.json({ error: 'Design inconnu' }, { status: 400 })
  }

  // Formatage de la date du mariage
  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à confirmer'

  const nomMaries = wedding.name || `${wedding.bride_name ?? ''} & ${wedding.groom_name ?? ''}`.trim()

  // ── Construction des items Gelato ────────────────────────────────────────
  const items: object[] = []
  let itemIndex = 1

  // — Menus —
  if (quantities.menus > 0 && templates.menu) {
    items.push({
      itemReferenceId: `item-menu-${itemIndex++}`,
      templateId: templates.menu,
      quantity: quantities.menus,
      personalization: {
        variables: [
          { name: 'nom_maries',    value: nomMaries },
          { name: 'date_mariage',  value: dateFormatted },
          { name: 'lieu_mariage',  value: wedding.location ?? '' },
        ],
      },
    })
  }

  // — Marque-places : un item par invité avec son nom et sa table —
  if (quantities.marquePlaces > 0 && templates.marquePlaces) {
    if (guests.length > 0) {
      // Mode VDP : un item par invité
      for (const guest of guests) {
        const fullName = [guest.first_name, guest.last_name]
          .filter(v => v && v !== 'null')
          .join(' ')
        items.push({
          itemReferenceId: `item-mp-${itemIndex++}`,
          templateId: templates.marquePlaces,
          quantity: 1,
          personalization: {
            variables: [
              { name: 'prenom_invite', value: guest.first_name ?? '' },
              { name: 'nom_invite',    value: guest.last_name ?? '' },
              { name: 'nom_complet',   value: fullName },
              { name: 'numero_table',  value: String(guest.table_number ?? '') },
              { name: 'nom_maries',    value: nomMaries },
              { name: 'date_mariage',  value: dateFormatted },
            ],
          },
        })
      }
    } else {
      // Fallback : quantité fixe sans personnalisation par invité
      items.push({
        itemReferenceId: `item-mp-${itemIndex++}`,
        templateId: templates.marquePlaces,
        quantity: quantities.marquePlaces,
        personalization: {
          variables: [
            { name: 'nom_maries',   value: nomMaries },
            { name: 'date_mariage', value: dateFormatted },
          ],
        },
      })
    }
  }

  // — Faire-parts —
  if (quantities.fairesParts > 0 && templates.fairesParts) {
    items.push({
      itemReferenceId: `item-fp-${itemIndex++}`,
      templateId: templates.fairesParts,
      quantity: quantities.fairesParts,
      personalization: {
        variables: [
          { name: 'nom_maries',   value: nomMaries },
          { name: 'date_mariage', value: dateFormatted },
          { name: 'lieu_mariage', value: wedding.location ?? '' },
        ],
      },
    })
  }

  if (items.length === 0) {
    return NextResponse.json({ error: 'Aucun produit sélectionné' }, { status: 400 })
  }

  // ── Payload Gelato v4 ────────────────────────────────────────────────────
  const orderPayload = {
    orderReferenceId: `kaatch-${wedding.id}-${Date.now()}`,
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

  // ── Envoi à Gelato ───────────────────────────────────────────────────────
  const response = await fetch(`${GELATO_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(orderPayload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Erreur Gelato:', response.status, errorData)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande Gelato', details: errorData },
      { status: response.status }
    )
  }

  const orderData = await response.json()

  // orderData.checkoutUrl : URL de paiement Gelato
  // orderData.id : identifiant commande Gelato
  return NextResponse.json({
    success: true,
    orderId: orderData.id,
    checkoutUrl: orderData.checkoutUrl,
  })
}
