import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { firstName, lastName } = await req.json()
  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ ok: false, message: 'Prénom et nom requis.' })
  }

  const supabase = await createSupabaseServerClient()
  const normalize = (s: string) => s.toLowerCase().trim()

  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, wedding_id')

  if (!guests) return NextResponse.json({ ok: false, message: 'Erreur de vérification.' })

  const matches = guests.filter(g =>
    normalize(g.first_name) === normalize(firstName) &&
    normalize(g.last_name) === normalize(lastName)
  )

  if (matches.length === 0) {
    return NextResponse.json({
      ok: false,
      message: "Nom introuvable sur une liste d'invités. Vérifiez l'orthographe ou demandez le code aux mariés.",
    })
  }

  if (matches.length > 1) {
    return NextResponse.json({
      ok: false,
      message: 'Plusieurs mariages correspondent à ce nom. Utilisez le code du mariage pour vous identifier.',
    })
  }

  const guest = matches[0]

  const { data: wedding } = await supabase
    .from('weddings')
    .select('slug')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) return NextResponse.json({ ok: false, message: 'Mariage introuvable.' })

  const cookieStore = await cookies()
  cookieStore.set(`guest_${wedding.slug}`, JSON.stringify({
    id: guest.id,
    firstName: guest.first_name,
    lastName: guest.last_name,
  }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true, slug: wedding.slug })
}
