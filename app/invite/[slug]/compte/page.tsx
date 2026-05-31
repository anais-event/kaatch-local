import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { getTranslations, getLocale } from 'next-intl/server'
import { toDateLocale } from '@/lib/locale-map'

const ALL_PARTS = ['ceremonie', 'vin_honneur', 'reception']

export default async function ComptePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const t = await getTranslations('invite.account')
  const locale = await getLocale()

  const PARTS_LABELS: Record<string, string> = {
    ceremonie: '💍 ' + t('partCeremony'),
    vin_honneur: '🥂 ' + t('partCocktail'),
    reception: '🎉 ' + t('partReception'),
  }

  if (!guestCookie) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8"
           style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}
             className="text-stone-400 mb-4">
            {t('notConnected')}
          </p>
          <a href={`/p/${slug}`} className="text-sm text-[#4a5240] hover:underline">
            {t('joinSpace')}
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
    ? new Date(wedding.date).toLocaleDateString(toDateLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const labelStyle = { fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.28em', color: '#b8b4ac', textTransform: 'uppercase' as const }
  const bodyStyle = { fontWeight: 300, fontSize: '0.82rem' }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
      <div className="max-w-lg mx-auto px-6 pt-8 pb-28">

        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.28em', color: '#b8b4ac', textTransform: 'uppercase', marginBottom: 6 }}>
          {t('title')}
        </p>
        <p style={{ fontWeight: 300, fontSize: '0.82rem', color: '#a09d95', marginBottom: 28 }}>
          {t('subtitle', { name: wedding?.name ?? '' })}
        </p>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
          <p style={labelStyle} className="mb-3">{t('identity')}</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#4a5240]/10 flex items-center justify-center shrink-0"
                 style={{ fontSize: '1.1rem', color: '#4a5240', fontWeight: 300 }}>
              {(guest.firstName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 300, fontSize: '0.9rem', color: '#3a3a37' }}>{guestName || t('guest')}</p>
              <p style={{ fontWeight: 300, fontSize: '0.75rem', color: '#a09d95', marginTop: 2 }}>
                {t('noAccountNeeded')}
              </p>
            </div>
          </div>
        </div>

        {/* Mariage */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
          <p style={labelStyle} className="mb-3">{t('wedding')}</p>
          <p style={{ fontWeight: 300, fontSize: '0.9rem', color: '#3a3a37', marginBottom: 4 }}>{wedding?.name}</p>
          {dateStr && (
            <p style={{ ...bodyStyle, color: '#5a5855' }} className="capitalize mb-1">{dateStr}</p>
          )}
          {wedding?.location && (
            <p style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a09d95' }}>{wedding.location}</p>
          )}
        </div>

        {/* Mon invitation */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
          <p style={labelStyle} className="mb-3">{t('myInvitation')}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {invitedParts.map(p => (
              <span key={p} style={{ fontWeight: 300, fontSize: '0.72rem', background: '#f5f0e8', color: '#4a5240', padding: '4px 12px', borderRadius: 100 }}>
                {PARTS_LABELS[p] ?? p}
              </span>
            ))}
          </div>
          {isPartial && (
            <p style={{ fontWeight: 300, fontSize: '0.75rem', color: '#a09d95' }}>
              {t('partialInvite')}
            </p>
          )}
        </div>

        {/* RSVP */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
          <p style={labelStyle} className="mb-3">{t('myResponse')}</p>
          {rsvp === 'confirme' && (
            <p style={{ fontWeight: 300, fontSize: '0.85rem', color: '#3a3a37' }}>{t('confirmed')}</p>
          )}
          {rsvp === 'decline' && (
            <p style={{ fontWeight: 300, fontSize: '0.85rem', color: '#3a3a37' }}>{t('declined')}</p>
          )}
          {!rsvp && (
            <p style={{ fontWeight: 300, fontSize: '0.85rem', color: '#a09d95' }}>{t('pending')}</p>
          )}
          <a href={`/invite/${slug}`}
             style={{ fontWeight: 300, fontSize: '0.72rem', color: '#c0bdb8', display: 'inline-block', marginTop: 10 }}>
            {t('editResponse')}
          </a>
        </div>

        {/* Message */}
        {guestData?.guest_message && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-3">
            <p style={labelStyle} className="mb-3">{t('myMessage')}</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem', color: '#5a5855', lineHeight: 1.6 }}>
              {guestData.guest_message}
            </p>
          </div>
        )}

        {/* Déconnexion */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p style={labelStyle} className="mb-3">{t('access')}</p>
          <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.65, color: '#a09d95', marginBottom: 14 }}>
            {t('accessInfo')}
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
              {t('logout')}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
