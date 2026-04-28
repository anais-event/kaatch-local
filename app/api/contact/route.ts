import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    const supabase = await createSupabaseServerClient()
    await supabase.from('contact_messages').insert({ name, email, message })

    await resend.emails.send({
      from: 'Kaatch <notifications@kaatch.fr>',
      to: 'contact-formulaire@kaatch.fr',
      subject: `💌 Nouveau message de ${name}`,
      html: `<p><strong>De :</strong> ${name} (${email})</p><p><strong>Message :</strong></p><p style="white-space:pre-wrap">${message}</p>`,
      replyTo: email,
    })
  } catch {
    // Never break the UX
  }
  return NextResponse.json({ ok: true })
}
