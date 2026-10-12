import { createServiceClient } from '@/lib/supabase-service'
import { buildSessionCookies } from '@/lib/guest-session'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Authentifie un invité directement via son token personnel — pas besoin de formulaire
export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ ok: false })

  // Validation du token via service_role (le token est l'autorisation).
  const supabase = createServiceClient()

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
  for (const c of buildSessionCookies('guest', wedding.slug, {
    id: guest.id,
    firstName: guest.first_name,
    lastName: guest.last_name,
  }, 60 * 60 * 24 * 30)) {
    cookieStore.set(c.name, c.value, c.options)
  }

  return NextResponse.json({ ok: true, slug: wedding.slug })
}
