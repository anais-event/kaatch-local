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
