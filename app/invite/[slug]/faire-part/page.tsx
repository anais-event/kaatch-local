import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies, headers } from 'next/headers'
import FairePartEnvelope from './FairePartEnvelope'
import { isPaid } from '@/lib/plan'

export default async function FairePartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, couple_message, cover_image_url, plan, faire_part_theme')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  // Read guest cookie to get their personal invite token for the QR code
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guestData = guestCookie ? JSON.parse(guestCookie.value) : null

  let inviteToken: string | null = null
  if (guestData?.id) {
    const { data: guestRow } = await supabase
      .from('guests').select('invite_token').eq('id', guestData.id).single()
    inviteToken = guestRow?.invite_token ?? null
  }

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`
  const personalUrl = inviteToken ? `${baseUrl}/i/${inviteToken}` : `${baseUrl}/invite/${slug}`

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <FairePartEnvelope
      weddingName={wedding.name}
      dateStr={dateStr}
      location={wedding.location}
      coupleMessage={wedding.couple_message}
      coverImageUrl={wedding.cover_image_url}
      slug={slug}
      personalUrl={personalUrl}
      paid={isPaid(wedding.plan)}
    theme={wedding.faire_part_theme ?? 'classique'}
    />
  )
}
