import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { slug, name, author, weddingId } = await req.json()
  if (!name?.trim() || !weddingId) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from('message_groups').select('id').eq('wedding_id', weddingId).eq('name', name).single()
  if (existing) return NextResponse.json(existing)

  const { data: group } = await supabase
    .from('message_groups').insert({ wedding_id: weddingId, name, created_by: author }).select('id').single()

  // Notif @ToutLeMonde
  const { data: general } = await supabase
    .from('message_groups').select('id').eq('wedding_id', weddingId).eq('name', '@ToutLeMonde').single()
  if (general && group) {
    await supabase.from('messages').insert({
      group_id: general.id,
      wedding_id: weddingId,
      content: `📢 ${author} vient de créer le groupe ${name}. Rejoignez-le !`,
      author_name: 'Kaatch',
    })
  }

  return NextResponse.json(group)
}
