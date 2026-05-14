import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { extractUniversSettings, generateFairePartBuffer, generateMenuBuffer } from '@/lib/pdf/generate'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { weddingId, productKey } = await req.json() as { weddingId: string; productKey: string }

  const [{ data: wedding }, { data: studioRow }] = await Promise.all([
    supabase.from('weddings').select('id, name, date, location').eq('id', weddingId).eq('user_id', user.id).single(),
    supabase.from('studio_progress').select('module_univers').eq('wedding_id', weddingId).single(),
  ])

  if (!wedding) return NextResponse.json({ error: 'Mariage introuvable' }, { status: 404 })

  const univers = extractUniversSettings(studioRow?.module_univers)
  const weddingInfo = { name: wedding.name ?? '', date: wedding.date ?? null, location: wedding.location ?? null }

  let buffer: Buffer

  if (productKey === 'faire_part' || productKey === 'save_the_date') {
    const name = productKey === 'save_the_date' ? `Save the date · ${weddingInfo.name}` : weddingInfo.name
    buffer = await generateFairePartBuffer(univers, { ...weddingInfo, name })
  } else if (productKey === 'menu') {
    buffer = await generateMenuBuffer(univers, weddingInfo)
  } else {
    return NextResponse.json({ error: `PDF download not supported for ${productKey}` }, { status: 400 })
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${productKey}.pdf"`,
    },
  })
}
