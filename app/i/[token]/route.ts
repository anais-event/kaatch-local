import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    : await createSupabaseServerClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id, weddings(slug)')
    .eq('invite_token', token)
    .single()

  if (!guest || !guest.weddings) {
    return NextResponse.redirect(new URL('/rejoindre', _req.url))
  }

  const slug = (guest.weddings as unknown as { slug: string }).slug

  // Écriture cookie — autorisée dans une Route Handler
  const cookieStore = await cookies()
  cookieStore.set(`guest_${slug}`, JSON.stringify({
    firstName: guest.first_name,
    lastName: guest.last_name ?? '',
    id: guest.id,
  }), { maxAge: 60 * 60 * 24 * 90, path: '/' })

  // Marquer l'invitation comme ouverte
  try {
    await supabase.from('guests')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', guest.id)
      .is('invited_at', null)
  } catch {}

  return NextResponse.redirect(new URL(`/invite/${slug}/faire-part`, _req.url))
}
