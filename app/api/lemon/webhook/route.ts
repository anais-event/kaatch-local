import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Client admin (service role) pour bypasser le RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

  // Vérifier la signature (sécurité)
  if (secret && !verifySignature(rawBody, signature, secret)) {
    console.error('Lemon Squeezy: signature invalide')
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const eventName = event?.meta?.event_name
  console.log('Lemon Squeezy event:', eventName)

  // On écoute uniquement les commandes confirmées
  if (eventName === 'order_created' || eventName === 'subscription_created') {
    const customData = event?.meta?.custom_data ?? {}
    const weddingId = customData?.wedding_id as string | undefined
    const planType = (customData?.plan ?? 'mariage') as 'mariage' | 'pro'

    if (!weddingId) {
      console.error('Lemon Squeezy: wedding_id manquant dans custom_data')
      return NextResponse.json({ error: 'missing wedding_id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('weddings')
      .update({ plan: planType })
      .eq('id', weddingId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Mariage ${weddingId} passé au plan ${planType}`)
  }

  return NextResponse.json({ received: true })
}
