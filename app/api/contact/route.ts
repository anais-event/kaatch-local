import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { name, message } = await req.json()
    const supabase = await createSupabaseServerClient()
    await supabase.from('contact_messages').insert({ name, message })
  } catch {
    // Silently swallow errors — never break the UX
  }
  return NextResponse.json({ ok: true })
}
