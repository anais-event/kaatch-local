import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from('photo_likes')
    .select('id', { count: 'exact', head: true })
    .eq('photo_id', id)
  return NextResponse.json({ likes: count ?? 0 })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  await supabase.from('photo_likes').insert({ photo_id: id, guest_id: null })
  const { count } = await supabase
    .from('photo_likes')
    .select('id', { count: 'exact', head: true })
    .eq('photo_id', id)
  return NextResponse.json({ likes: count ?? 0 })
}
