import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Countdown from './Countdown'

async function logout(formData: FormData) {
  'use server'
  const { cookies } = await import('next/headers')
  const { redirect } = await import('next/navigation')
  const cookieStore = await cookies()
  const slug = formData.get('slug') as string
  cookieStore.delete(`guest_${slug}`)
  redirect('/rejoindre')
}

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const isPreview = !guestCookie

  if (isPreview) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const { data: wedding } = await supabase.from('weddings').select('share_code').eq('slug', slug).single()
      if (wedding?.share_code) redirect(`/p/${wedding.share_code}`)
      else redirect('/rejoindre')
    }
  }

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: 'Prévisualisation' }
  const guestName = [guest.firstName, guest.lastName].filter(Boolean).join(' ')

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, cover_image_url, location, couple_message')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: rules } = await supabase
    .from('wedding_rules').select('text').eq('wedding_id', wedding.id).order('created_at', { ascending: true })

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const raccourcis = [
    { label: 'Programme', sub: 'Déroulé de la journée', href: `/invite/${slug}/programme` },
    { label: 'Photos', sub: 'Galerie partagée', href: `/invite/${slug}/photos` },
    { label: 'Messagerie', sub: 'Groupes & échanges', href: `/invite/${slug}/groupes` },
    { label: 'Prestataires', sub: 'Contacts utiles', href: `/invite/${slug}/contacts` },
  ]

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[50vh] min-h-[280px] overflow-hidden">
        {wedding.cover_image_url
          ? <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-[#2d3228]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.35em] uppercase text-white/60 mb-2" style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1 }}>
            {wedding.name}
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-white/70 mt-2">
            Bienvenue, {guestName}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Le mot des mariés */}
        {(wedding.couple_message || (rules && rules.length > 0)) && (
          <div className="bg-white rounded-xl border border-stone-100 p-6 space-y-4">
            <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
               className="text-stone-400 uppercase">Le mot des mariés</p>
            {wedding.couple_message && (
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.75 }}
                 className="text-stone-700 whitespace-pre-wrap">
                {wedding.couple_message}
              </p>
            )}
            {rules && rules.length > 0 && (
              <ul className="space-y-1.5 pt-3 border-t border-stone-100">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-500" style={{ fontWeight: 300 }}>
                    <span className="text-[#4a5240] mt-0.5 shrink-0">—</span>
                    {rule.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Infos pratiques */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-3">Infos pratiques</p>
          <div className="grid grid-cols-1 gap-2">
            {dateFormatted && (
              <div className="bg-white rounded-xl border border-stone-100 px-5 py-4">
                <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.16em' }}
                   className="text-stone-400 uppercase mb-0.5">Date</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                   className="text-stone-700 capitalize">{dateFormatted}</p>
              </div>
            )}
            {wedding.location && (
              <div className="bg-white rounded-xl border border-stone-100 px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.16em' }}
                     className="text-stone-400 uppercase mb-0.5">Lieu</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.05rem' }}
                     className="text-stone-700">{wedding.location}</p>
                </div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="text-xs text-[#4a5240] border border-[#4a5240] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] hover:text-white transition shrink-0"
                   style={{ fontWeight: 300 }}>
                  GPS →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Raccourcis */}
        <div>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-3">Navigation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {raccourcis.map(item => (
              <a key={item.label} href={item.href}
                 className="group bg-white rounded-xl border border-stone-100 p-5 flex flex-col gap-1 hover:border-[#4a5240]/30 hover:shadow-sm transition-all">
                <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-[#2d3228]">{item.label}</p>
                <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{item.sub}</p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                   className="text-stone-300 group-hover:text-[#4a5240] transition mt-2">
                  Accéder →
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Compte à rebours */}
        {wedding.date && <Countdown weddingDate={wedding.date} />}

        {/* Déconnexion */}
        {!isPreview && (
          <div className="text-center pt-4 pb-8">
            <form action={logout}>
              <input type="hidden" name="slug" value={slug} />
              <button type="submit"
                className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                Se déconnecter
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
