import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { done } = await req.json()
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('wedding_todos').update({ done }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  await supabase.from('wedding_todos').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
