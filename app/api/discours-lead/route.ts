import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string }
    if (!email || !email.includes('@')) {
      return new Response('Email invalide', { status: 400 })
    }
    const supabase = await createSupabaseServerClient()
    await supabase.from('discours_leads').insert({ email: email.trim().toLowerCase() })
    return new Response('ok')
  } catch {
    return new Response('ok')
  }
}
