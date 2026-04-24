import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Authentifie un invité directement via son token personnel — pas besoin de formulaire
export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ ok: false })

  const supabase = await createSupabaseServerClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id')
    .eq('invite_token', token)
    .single()

  if (!guest) return NextResponse.json({ ok: false })

  const { data: wedding } = await supabase
    .from('weddings')
    .select('slug')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) return NextResponse.json({ ok: false })

  const cookieStore = await cookies()
  cookieStore.set(`guest_${wedding.slug}`, JSON.stringify({
    id: guest.id,
    firstName: guest.first_name,
    lastName: guest.last_name,
  }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
  })

  return NextResponse.json({ ok: true, slug: wedding.slug })
}
