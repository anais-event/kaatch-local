import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'
import { getGuestSession } from '@/lib/guest-session'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { toDateLocale } from '@/lib/locale-map'
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

  const locale = await getLocale()

  if (!wedding) return <div className="p-8">Not found</div>

  // Session invité vérifiée (cookie signé) ; le token n'est lu que pour SA propre ligne,
  // côté serveur via service_role (invite_token n'est plus lisible par anon).
  const guestData = await getGuestSession(slug)

  let inviteToken: string | null = null
  let rsvpStatus: string | null = null
  let plusOneAllowed = false
  let plusOneCount = 0
  let dietary: string | null = null
  if (guestData?.id) {
    const service = createServiceClient()
    const { data: guestRow } = await service
      .from('guests')
      .select('invite_token, rsvp_status, plus_one, plus_one_count, dietary_restrictions')
      .eq('id', guestData.id)
      .eq('wedding_id', wedding?.id ?? '')
      .single()
    inviteToken = guestRow?.invite_token ?? null
    rsvpStatus = guestRow?.rsvp_status ?? null
    plusOneAllowed = guestRow?.plus_one ?? false
    plusOneCount = guestRow?.plus_one_count ?? 0
    dietary = guestRow?.dietary_restrictions ?? null
  }

  const h = await headers()
  const host = h.get('host') ?? 'kaatch.fr'
  const baseUrl = `https://${host}`
  const personalUrl = inviteToken ? `${baseUrl}/i/${inviteToken}` : `${baseUrl}/invite/${slug}`

  const dateStr = wedding.date
    ? new Date(wedding.date).toLocaleDateString(toDateLocale(locale), {
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
      guestId={guestData?.id ?? null}
      inviteToken={inviteToken}
      rsvpStatus={rsvpStatus}
      plusOneAllowed={plusOneAllowed}
      plusOneCount={plusOneCount}
      dietary={dietary}
    />
  )
}
