import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notifyCouple } from '@/lib/email/notify-couple'

export async function POST(req: NextRequest) {
  const { guestId, slug } = await req.json() as { guestId: string; slug: string }
  if (!guestId || !slug) return NextResponse.json({ ok: true })

  const supabase = await createSupabaseServerClient()

  const [{ data: guest }, { data: wedding }] = await Promise.all([
    supabase.from('guests').select('first_name, last_name, rsvp_status').eq('id', guestId).single(),
    supabase.from('weddings').select('name, slug, notification_prefs, notification_email').eq('slug', slug).single(),
  ])

  if (!guest || !wedding) return NextResponse.json({ ok: true })

  const prefs = (wedding.notification_prefs ?? {}) as Record<string, boolean>
  if (!prefs.new_rsvp) return NextResponse.json({ ok: true })

  const toEmail = wedding.notification_email || null
  if (!toEmail) return NextResponse.json({ ok: true })

  const guestName = [guest.first_name, guest.last_name]
    .filter(v => v && v !== 'null').join(' ')

  const rsvpLabels: Record<string, string> = {
    confirme: 'Présent(e) ✓',
    decline:  'Absent(e)',
  }

  await notifyCouple({
    to: toEmail,
    weddingName: wedding.name ?? '',
    slug,
    type: 'new_rsvp',
    data: {
      guestName,
      rsvpStatus: rsvpLabels[guest.rsvp_status ?? ''] ?? guest.rsvp_status ?? '',
    },
  }).catch(console.error)

  return NextResponse.json({ ok: true })
}
