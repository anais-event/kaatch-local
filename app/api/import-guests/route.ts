import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { weddingId, guests } = await req.json()

  if (!weddingId || !Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const rows = guests.map((g: Record<string, unknown>) => ({
    wedding_id: weddingId,
    first_name: g.first_name,
    last_name: (g.last_name as string) || null,
    email: (g.email as string) || null,
    telephone: (g.telephone as string) || null,
    relation: (g.relation as string) || null,
    guest_type: (g.guest_type as string) || 'adulte',
    rsvp_status: 'en_attente',
    metadata: g.metadata || null,
  }))

  const { error } = await supabase.from('guests').insert(rows)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: rows.length })
}
