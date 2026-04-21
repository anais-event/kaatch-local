import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('groupId')
  if (!groupId) return NextResponse.json([], { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('messages')
    .select('id, content, author_name, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const { groupId, weddingId, content, authorName } = await req.json()
  if (!groupId || !content?.trim()) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      group_id: groupId,
      wedding_id: weddingId,
      content: content.trim(),
      author_name: authorName || 'Invité',
    })
    .select('id, content, author_name, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
