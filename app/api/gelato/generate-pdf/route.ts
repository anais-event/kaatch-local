import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  extractUniversSettings,
  generateFairePartBuffer,
  generateMenuBuffer,
  generateProgrammeBuffer,
  generatePlanTableBuffer,
} from '@/lib/pdf/generate'
import type { ProgrammeStep, TableInfo } from '@/lib/pdf/types'

function cleanName(n: string | null | undefined): string {
  if (!n) return ''
  return n.split(' ').filter(p => p && p !== 'null').join(' ')
}

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

  const univers     = extractUniversSettings(studioRow?.module_univers)
  const weddingInfo = { name: wedding.name ?? '', date: wedding.date ?? null, location: wedding.location ?? null }

  let buffer: Buffer
  let filename = productKey

  if (productKey === 'faire_part' || productKey === 'save_the_date') {
    const name = productKey === 'save_the_date' ? `Save the date · ${weddingInfo.name}` : weddingInfo.name
    buffer = await generateFairePartBuffer(univers, { ...weddingInfo, name })
    filename = productKey === 'save_the_date' ? 'save-the-date' : 'faire-part'

  } else if (productKey === 'menu') {
    buffer = await generateMenuBuffer(univers, weddingInfo)

  } else if (productKey === 'programme') {
    const { data: steps } = await supabase
      .from('program_steps')
      .select('title, time, description')
      .eq('wedding_id', weddingId)
      .order('position')

    const programmeSteps: ProgrammeStep[] = (steps ?? []).map(s => ({
      title: s.title,
      time: s.time ?? null,
      description: s.description ?? null,
    }))
    buffer = await generateProgrammeBuffer(univers, weddingInfo, programmeSteps)

  } else if (productKey === 'plan_table') {
    const [{ data: dbTables }, { data: guests }] = await Promise.all([
      supabase.from('seating_tables').select('id, name').eq('wedding_id', weddingId),
      supabase.from('guests').select('id, first_name, last_name').eq('wedding_id', weddingId),
    ])

    const tableIds = (dbTables ?? []).map(t => t.id)
    const { data: assignments } = tableIds.length
      ? await supabase.from('table_guests').select('guest_id, table_id').in('table_id', tableIds)
      : { data: [] }

    const tableList: TableInfo[] = (dbTables ?? []).map(t => ({
      id: t.id,
      name: t.name,
      guests: (assignments ?? [])
        .filter(a => a.table_id === t.id)
        .map(a => {
          const g = (guests ?? []).find(gg => gg.id === a.guest_id)
          return g ? [cleanName(g.first_name), cleanName(g.last_name)].filter(Boolean).join(' ') : ''
        })
        .filter(Boolean),
    }))

    buffer = await generatePlanTableBuffer(univers, weddingInfo, tableList)
    filename = 'plan-table'

  } else {
    return NextResponse.json({ error: `PDF download not supported for ${productKey}` }, { status: 400 })
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    },
  })
}
