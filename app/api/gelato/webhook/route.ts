import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyCouple } from '@/lib/email/notify-couple'

// Service role client — webhook runs outside user session
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Gelato status → our status
const STATUS_MAP: Record<string, string> = {
  created:               'pending',
  passed_to_production:  'in_production',
  printed:               'printed',
  shipped:               'shipped',
  delivered:             'delivered',
  canceled:              'canceled',
  failed:                'failed',
}

export async function POST(req: NextRequest) {
  // Optional: verify Gelato webhook signature
  const secret = process.env.GELATO_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('x-gelato-signature') ?? ''
    const body = await req.text()
    const { createHmac } = await import('crypto')
    const expected = createHmac('sha256', secret).update(body).digest('hex')
    if (sig !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    // Re-parse since we consumed the stream
    const event = JSON.parse(body)
    return handleEvent(event)
  }

  const event = await req.json()
  return handleEvent(event)
}

async function handleEvent(event: unknown) {
  const e = event as {
    type?: string
    data?: {
      id?: string
      orderReferenceId?: string
      status?: string
      trackingUrl?: string
      shipments?: { trackingUrl?: string }[]
    }
  }

  if (!e.data?.orderReferenceId) {
    return NextResponse.json({ ok: true })
  }

  const gelatoStatus = e.data.status ?? ''
  const ourStatus    = STATUS_MAP[gelatoStatus] ?? gelatoStatus
  const trackingUrl  = e.data.trackingUrl
    ?? e.data.shipments?.[0]?.trackingUrl
    ?? null

  // Update studio_orders
  const updateData: Record<string, unknown> = { status: ourStatus }
  if (trackingUrl) updateData.tracking_url = trackingUrl
  if (ourStatus === 'shipped') updateData.shipped_at = new Date().toISOString()

  const { data: order } = await supabaseAdmin
    .from('studio_orders')
    .update(updateData)
    .eq('order_reference', e.data.orderReferenceId)
    .select('wedding_id')
    .single()

  // Email notification if shipped
  if (ourStatus === 'shipped' && order?.wedding_id) {
    const { data: wedding } = await supabaseAdmin
      .from('weddings')
      .select('name, slug, notification_prefs, notification_email')
      .eq('id', order.wedding_id)
      .single()

    const prefs = (wedding?.notification_prefs ?? {}) as Record<string, boolean>

    if (prefs.order_shipped !== false) {
      // Get owner email
      const { data: ownerWedding } = await supabaseAdmin
        .from('weddings')
        .select('user_id')
        .eq('id', order.wedding_id)
        .single()

      let toEmail = wedding?.notification_email ?? null

      if (!toEmail && ownerWedding?.user_id) {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(ownerWedding.user_id)
        toEmail = user?.email ?? null
      }

      if (toEmail && wedding) {
        await notifyCouple({
          to:          toEmail,
          weddingName: wedding.name ?? '',
          slug:        wedding.slug,
          type:        'order_shipped',
          data:        trackingUrl ? { trackingUrl } : {},
        }).catch(console.error)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
