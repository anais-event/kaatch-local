import { createServiceClient } from '@/lib/supabase-service'
import { buildSessionCookies } from '@/lib/guest-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { code } = await req.json()

  if (!code || typeof code !== 'string' || code.length < 4) {
    return NextResponse.json({ error: "Code invalide" }, { status: 400 })
  }

  // Validation du vendor_code via service_role (le code est l'autorisation).
  const supabase = createServiceClient()

  const { data: vendor } = await supabase
    .from('wedding_vendors')
    .select('id, name, category, permissions, is_suspended, wedding_id, weddings(slug)')
    .eq('vendor_code', code.trim().toUpperCase())
    .single()

  if (!vendor || !vendor.weddings) {
    return NextResponse.json({ error: "Code introuvable. Vérifiez auprès des mariés." }, { status: 404 })
  }

  if (vendor.is_suspended) {
    return NextResponse.json({ error: "Cet accès a été suspendu par les mariés." }, { status: 403 })
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

  return NextResponse.json({ redirect: `/vendor/${slug}` })
}
