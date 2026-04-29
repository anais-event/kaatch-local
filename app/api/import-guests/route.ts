import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { isPaid, FREE_GUEST_LIMIT } from '@/lib/plan'

export async function POST(req: Request) {
  const body = await req.json()
  const weddingId: string = body.weddingId
  let guestsToImport: Record<string, string>[] = body.guests

  if (!weddingId || !Array.isArray(guestsToImport) || guestsToImport.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('plan').eq('id', weddingId).single()

  let skipped = 0
  if (!isPaid(wedding?.plan)) {
    const { count } = await supabase
      .from('guests').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId)
    const remaining = FREE_GUEST_LIMIT - (count ?? 0)
    if (remaining <= 0) {
      return NextResponse.json({ imported: 0, skipped: guestsToImport.length, limit_reached: true })
    }
    if (guestsToImport.length > remaining) {
      skipped = guestsToImport.length - remaining
      guestsToImport = guestsToImport.slice(0, remaining)
    }
  }

  const rows = guestsToImport.map((g) => ({
    wedding_id: weddingId,
    first_name: g.first_name,
    last_name: g.last_name || null,
    email: g.email || null,
    telephone: g.telephone || null,
    relation: g.relation || null,
    guest_type: g.guest_type || 'adulte',
    gender: g.gender || null,
    rsvp_status: 'confirme',
  }))

  const { error } = await supabase.from('guests').insert(rows)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: rows.length, skipped, limit_reached: skipped > 0 })
}
