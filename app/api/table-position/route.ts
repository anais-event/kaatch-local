import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const { tableId, x, y, shape } = await req.json()
  if (!tableId) return NextResponse.json({ error: 'missing tableId' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const patch: Record<string, unknown> = {}
  if (x != null && y != null) { patch.pos_x = x; patch.pos_y = y }
  if (shape) patch.shape = shape
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  await supabase.from('seating_tables').update(patch).eq('id', tableId)
  return NextResponse.json({ ok: true })
}
