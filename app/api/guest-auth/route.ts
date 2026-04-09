import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { weddingId, weddingSlug, firstName, lastName, nickname } = await req.json()

  const supabase = await createSupabaseServerClient()

  // Chercher l'invité par prénom + nom (insensible à la casse)
  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, nickname')
    .eq('wedding_id', weddingId)

  if (!guests) {
    return NextResponse.json({ ok: false, message: 'Erreur de vérification.' })
  }

  const normalize = (s: string) => s.toLowerCase().trim()

  const found = guests.find(g => {
    const nameMatch =
      normalize(g.first_name) === normalize(firstName) &&
      normalize(g.last_name) === normalize(lastName)
    const nicknameMatch =
      nickname && g.nickname && normalize(g.nickname) === normalize(nickname)
    return nameMatch || nicknameMatch
  })

  if (!found) {
    return NextResponse.json({
      ok: false,
      message: 'Vous n\'êtes pas sur la liste des invités. Vérifiez l\'orthographe ou contactez les mariés.',
    })
  }

  // Poser un cookie avec l'identité de l'invité
  const cookieStore = await cookies()
  cookieStore.set(`guest_${weddingSlug}`, JSON.stringify({
    id: found.id,
    firstName: found.first_name,
    lastName: found.last_name,
  }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
