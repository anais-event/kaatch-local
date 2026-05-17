import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!) }
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_STUDIO_WEBHOOK_SECRET

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.order_id
  if (!orderId) return NextResponse.json({ error: 'No order_id in metadata' }, { status: 400 })

  const shipping = (session as unknown as { shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; postal_code?: string; country?: string } } }).shipping_details
  const shippingAddress = shipping ? {
    name: shipping.name,
    line1: shipping.address?.line1,
    line2: shipping.address?.line2,
    city: shipping.address?.city,
    postal_code: shipping.address?.postal_code,
    country: shipping.address?.country,
  } : null

  await supabase
    .from('studio_public_orders')
    .update({
      status: 'paid',
      email: session.customer_details?.email,
      stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      shipping_address: shippingAddress,
    })
    .eq('id', orderId)

  const persoLink = `${BASE_URL}/studio/personnaliser/${orderId}`
  const customerEmail = session.customer_details?.email
  const customerName = session.customer_details?.name ?? ''

  if (customerEmail) {
    await resend.emails.send({
      from: 'Kaatch Studio <bonjour@kaatch.fr>',
      to: customerEmail,
      subject: 'Votre commande est confirmée — finalisez votre papeterie',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e3dc">
    <div style="background:#2d3228;padding:32px 40px;text-align:center">
      <p style="color:#e8d9b8;font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px">Kaatch Studio</p>
      <h1 style="color:#fff;font-size:1.8rem;font-weight:400;margin:0;letter-spacing:-0.02em">Paiement confirmé ✓</h1>
    </div>
    <div style="padding:36px 40px">
      ${customerName ? `<p style="color:#78716c;font-size:0.95rem;margin:0 0 20px">Bonjour ${customerName},</p>` : ''}
      <p style="color:#2d3228;font-size:1rem;line-height:1.75;margin:0 0 24px">
        Votre commande a bien été reçue. Il reste une étape : nous avez besoin de vos informations pour personnaliser et lancer l'impression.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${persoLink}" style="display:inline-block;background:#4a5240;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-size:1rem;font-family:Georgia,serif;letter-spacing:0.02em">
          Personnaliser ma papeterie →
        </a>
      </div>
      <p style="color:#a8a29e;font-size:0.8rem;line-height:1.7;margin:24px 0 0">
        Ce lien est unique et personnel. Gardez-le précieusement.<br>
        L'impression démarrera après votre validation.
      </p>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e7e3dc">
        <p style="color:#b8b0a8;font-size:0.75rem;margin:0">
          Une question ? Répondez à cet email ou écrivez-nous à <a href="mailto:bonjour@kaatch.fr" style="color:#4a5240">bonjour@kaatch.fr</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    })
  }

  console.log(`Order ${orderId} paid. Perso link: ${persoLink}`)

  return NextResponse.json({ received: true })
}
