import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ ok: false, message: 'Code manquant.' })

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, name')
    .eq('share_code', code.toUpperCase())
    .single()

  if (!wedding) {
    return NextResponse.json({ ok: false, message: 'Code introuvable. Vérifiez avec les mariés.' })
  }

  return NextResponse.json({ ok: true, wedding })
}
