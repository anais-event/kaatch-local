import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createSupabaseServerClient()

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

  const cookieStore = await cookies()
  cookieStore.set(`vendor_${slug}`, JSON.stringify({
    id: vendor.id,
    name: vendor.name,
    category: vendor.category,
    permissions: vendor.permissions ?? {},
  }), { maxAge: 60 * 60 * 24 * 90, path: '/' })

  return NextResponse.redirect(new URL(`/vendor/${slug}`, _req.url))
}
