import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { guestId, tableId } = await req.json()
    if (!guestId) return NextResponse.json({ error: 'Missing guestId' }, { status: 400 })

    const supabase = await createSupabaseServerClient()

    // Verify session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { error } = await supabase
      .from('guests')
      .update({ table_id: tableId ?? null })
      .eq('id', guestId)

    if (error) {
      console.error('assignGuest error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('assignGuest exception:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
