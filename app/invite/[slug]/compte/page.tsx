import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

const PARTS_LABELS: Record<string, string> = {
  ceremonie: '💍 Cérémonie',
  vin_honneur: '🥂 Vin d\'honneur',
  reception: '🎉 Réception',
}
const ALL_PARTS = ['ceremonie', 'vin_honneur', 'reception']

export default async function ComptePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  if (!guestCookie) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8"
           style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}
             className="text-stone-400 mb-4">
            Vous n'êtes pas connecté(e) à cet espace.
          </p>
          <a href={`/p/${slug}`} className="text-sm text-[#4a5240] hover:underline">
            Rejoindre l'espace →
          </a>
        </div>
      </div>
    )
  }

  const guest = JSON.parse(guestCookie.value) as {
    firstName: string; lastName: string; id: string | null
  }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings')
    .select('id, name, date, location').eq('slug', slug).single()

  let guestData: { rsvp_status: string | null; invited_parts: string[] | null; guest_message: string | null } | null = null
  if (guest.id) {
    const { data } = await supabase.from('guests')
      .select('rsvp_status, invited_parts, guest_message')
      .eq('id', guest.id).single()
    guestData = data
  }

  const invitedParts = guestData?.invited_parts ?? ALL_PARTS
  const isPartial = invitedParts.length < 3
  const rsvp = guestData?.rsvp_status

  const dateStr = wedding?.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-lg mx-auto px-6 pt-8 pb-28">

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem' }}
            className="text-[#2d3228] mb-1">Mon compte</h1>
        <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400 mb-8">
          Vos informations pour le mariage {wedding?.name ?? ''}.
        </p>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase mb-3">Identité</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0"
                 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.5rem', color: '#4a5240' }}>
              {(guest.firstName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 400, fontSize: '1.1rem' }} className="text-[#2d3228]">{guestName || 'Invité(e)'}</p>
              <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mt-0.5">
                Invité(e) — aucun compte à créer
              </p>
            </div>
          </div>
        </div>

        {/* Mariage */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase mb-3">Mariage</p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}
             className="text-[#2d3228] mb-1">{wedding?.name}</p>
          {dateStr && (
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-500 capitalize mb-1">{dateStr}</p>
          )}
          {wedding?.location && (
            <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400">📍 {wedding.location}</p>
          )}
        </div>

        {/* Mon invitation */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase mb-3">Mon invitation</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {invitedParts.map(p => (
              <span key={p} className="text-xs bg-[#4a5240]/10 text-[#4a5240] px-3 py-1.5 rounded-full"
                    style={{ fontWeight: 300 }}>
                {PARTS_LABELS[p] ?? p}
              </span>
            ))}
          </div>
          {isPartial && (
            <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 italic">
              Votre invitation concerne une partie de la journée.
            </p>
          )}
        </div>

        {/* RSVP */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-4">
          <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase mb-3">Ma réponse</p>
          {rsvp === 'confirme' && (
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">✓</span>
              <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-600">
                Présence confirmée 🎉
              </p>
            </div>
          )}
          {rsvp === 'decline' && (
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-lg">✗</span>
              <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-600">
                Absence signalée
              </p>
            </div>
          )}
          {!rsvp && (
            <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400 italic">
              En attente de réponse
            </p>
          )}
          <a href={`/invite/${slug}`}
             className="inline-block mt-3 text-xs text-[#4a5240] hover:underline"
             style={{ fontWeight: 300 }}>
            Modifier ma réponse →
          </a>
        </div>

        {/* Message */}
        {guestData?.guest_message && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
            <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
               className="text-stone-400 uppercase mb-2">Mon message aux mariés</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', lineHeight: 1.65, fontWeight: 300 }}
               className="text-stone-600">
              « {guestData.guest_message} »
            </p>
          </div>
        )}

        {/* Déconnexion */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={{ fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase mb-3">Accès</p>
          <p style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.65 }} className="text-stone-500 mb-4">
            Aucun mot de passe à retenir. Votre accès est lié à votre prénom et au code du mariage.
            Pour rejoindre depuis un autre appareil, utilisez le même code.
          </p>
          <form action={async () => {
            'use server'
            const { cookies: getCookies } = await import('next/headers')
            const { redirect: doRedirect } = await import('next/navigation')
            const cookieStore2 = await getCookies()
            cookieStore2.delete(`guest_${slug}`)
            doRedirect('/rejoindre')
          }}>
            <button type="submit"
              className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              Se déconnecter de cet espace
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
