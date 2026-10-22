import { createServiceClient } from '@/lib/supabase-service'
import { buildSessionCookies } from '@/lib/guest-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Validation du token côté serveur via service_role (le token est l'autorisation).
  const supabase = createServiceClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id, weddings(slug)')
    .eq('invite_token', token)
    .single()

  if (!guest || !guest.weddings) {
    return NextResponse.redirect(new URL('/rejoindre', _req.url))
  }

  const slug = (guest.weddings as unknown as { slug: string }).slug

  // Cookie de session signé (payload + signature HMAC) — Route Handler
  const cookieStore = await cookies()
  for (const c of buildSessionCookies('guest', slug, {
    id: guest.id,
    firstName: guest.first_name,
    lastName: guest.last_name ?? '',
  }, 60 * 60 * 24 * 90)) {
    cookieStore.set(c.name, c.value, c.options)
  }

  // Marquer l'invitation comme ouverte
  try {
    await supabase.from('guests')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', guest.id)
      .is('invited_at', null)
  } catch {}

  return NextResponse.redirect(new URL(`/invite/${slug}/faire-part`, _req.url))
}
