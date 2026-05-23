import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { code } = await req.json()

  if (!code || typeof code !== 'string' || code.length < 4) {
    return NextResponse.json({ error: "Code invalide" }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

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

  const cookieStore = await cookies()
  cookieStore.set(`vendor_${slug}`, JSON.stringify({
    id: vendor.id,
    name: vendor.name,
    category: vendor.category,
    permissions: vendor.permissions ?? {},
  }), { maxAge: 60 * 60 * 24 * 90, path: '/' })

  return NextResponse.json({ redirect: `/vendor/${slug}` })
}
