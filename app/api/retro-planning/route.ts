import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { weddingId, taskKey, done } = await req.json()
  if (!weddingId || !taskKey) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('retro_planning').upsert({
    wedding_id: weddingId,
    task_key: taskKey,
    done,
    done_at: done ? new Date().toISOString() : null,
  }, { onConflict: 'wedding_id,task_key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const { weddingId, taskKey, deadline, assigned_to } = await req.json()
  if (!weddingId || !taskKey) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('retro_planning')
    .select('id')
    .eq('wedding_id', weddingId)
    .eq('task_key', taskKey)
    .maybeSingle()

  const update: Record<string, unknown> = {}
  if (deadline !== undefined) update.deadline = deadline || null
  if (assigned_to !== undefined) update.assigned_to = assigned_to || null

  if (existing) {
    await supabase.from('retro_planning').update(update).eq('wedding_id', weddingId).eq('task_key', taskKey)
  } else {
    await supabase.from('retro_planning').insert({ wedding_id: weddingId, task_key: taskKey, done: false, ...update })
  }

  return NextResponse.json({ ok: true })
}
