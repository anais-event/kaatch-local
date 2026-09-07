import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { guestId, status } = await req.json()
    if (!guestId || !['confirme', 'decline'].includes(status)) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
    }
    const supabase = await createSupabaseServerClient()
    await supabase.from('guests').update({ rsvp_status: status }).eq('id', guestId)
    return NextResponse.json({ ok: true, status })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
