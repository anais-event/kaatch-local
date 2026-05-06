import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const { weddingId, periodId, title, assigned_to, deadline } = await req.json()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('retro_custom_tasks')
    .insert({
      wedding_id: weddingId,
      period_id: periodId,
      title,
      assigned_to: assigned_to || null,
      deadline: deadline || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
