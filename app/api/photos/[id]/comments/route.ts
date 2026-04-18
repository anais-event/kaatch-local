import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('photo_comments')
    .select('*')
    .eq('photo_id', id)
    .order('created_at', { ascending: true })
  return NextResponse.json(data ?? [])
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { author_name, content } = await req.json()
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('photo_comments')
    .insert({ photo_id: id, author_name, content })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
