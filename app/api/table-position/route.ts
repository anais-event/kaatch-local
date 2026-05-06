import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const { tableId, x, y } = await req.json()
  if (!tableId || x == null || y == null) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  await supabase.from('seating_tables').update({ pos_x: x, pos_y: y }).eq('id', tableId)
  return NextResponse.json({ ok: true })
}
