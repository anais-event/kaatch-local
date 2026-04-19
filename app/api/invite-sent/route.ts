import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { guestId } = await req.json()
    if (!guestId) return NextResponse.json({ error: 'Missing guestId' }, { status: 400 })
    const supabase = await createSupabaseServerClient()
    await supabase.from('guests').update({ invite_sent_at: new Date().toISOString() }).eq('id', guestId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
