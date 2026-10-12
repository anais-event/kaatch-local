import { createServiceClient } from '@/lib/supabase-service'
import { buildSessionCookies } from '@/lib/guest-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  // Validation du token prestataire via service_role (le token est l'autorisation).
  const supabase = createServiceClient()

  const { data: vendor } = await supabase
    .from('wedding_vendors')
    .select('id, name, category, permissions, is_suspended, wedding_id, weddings(slug)')
    .eq('invite_token', token)
    .single()

  if (!vendor || !vendor.weddings) {
    return NextResponse.redirect(new URL('/', _req.url))
  }

  if (vendor.is_suspended) {
    return NextResponse.redirect(new URL('/', _req.url))
  }

  const slug = (vendor.weddings as unknown as { slug: string }).slug

  // Cookie de session prestataire SIGNÉ (donc infalsifiable) : permissions incluses.
  const cookieStore = await cookies()
  for (const c of buildSessionCookies('vendor', slug, {
    id: vendor.id,
    name: vendor.name,
    category: vendor.category,
    permissions: vendor.permissions ?? {},
  }, 60 * 60 * 24 * 90)) {
    cookieStore.set(c.name, c.value, c.options)
  }

  return NextResponse.redirect(new URL(`/vendor/${slug}`, _req.url))
}
