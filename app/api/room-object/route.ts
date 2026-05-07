import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST — create object
export async function POST(req: Request) {
  const { weddingId, type, pos_x, pos_y, width, height, label } = await req.json()
  if (!weddingId || !type) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('room_objects')
    .insert({ wedding_id: weddingId, type, pos_x: pos_x ?? 400, pos_y: pos_y ?? 310, width: width ?? 120, height: height ?? 80, label: label ?? null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH — update position
export async function PATCH(req: Request) {
  const { id, pos_x, pos_y } = await req.json()
  if (!id || pos_x == null || pos_y == null) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  await supabase.from('room_objects').update({ pos_x, pos_y }).eq('id', id)
  return NextResponse.json({ ok: true })
}

// DELETE — remove object
export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  await supabase.from('room_objects').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
