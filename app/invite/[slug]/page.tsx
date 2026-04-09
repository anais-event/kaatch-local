import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)

  const isPreview = !guestCookie

  if (isPreview) {
    // Vérifier que c'est bien le marié connecté (preview mode)
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const { data: wedding } = await supabase.from('weddings').select('share_code').eq('slug', slug).single()
      if (wedding?.share_code) redirect(`/p/${wedding.share_code}`)
      else redirect('/rejoindre')
    }
  }

  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: 'Prévisualisation' }

  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, cover_image_url, location')
    .eq('slug', slug)
    .single()

  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Hero */}
      <div className="relative w-full h-[50vh] min-h-[300px] overflow-hidden">
        {wedding.cover_image_url ? (
          <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#4a5240]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {dateFormatted && (
            <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-2"
               style={{ fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1 }}>
            {wedding.name}
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-300 mt-2">
            Bienvenue, {guest.firstName} 🎉
          </p>
        </div>
      </div>

      {/* Navigation onglets */}
      <div className="bg-[#f5f0e8] sticky top-0 z-10 border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-around px-4 pt-4 pb-0 overflow-x-auto">
          {[
            { label: 'Programme', href: `/invite/${slug}/programme` },
            { label: 'Photos', href: `/invite/${slug}/photos` },
            { label: 'Groupes', href: `/invite/${slug}/groupes` },
            { label: 'Contacts', href: `/invite/${slug}/contacts` },
          ].map((tab) => (
            <a key={tab.label} href={tab.href}
              className="pb-3 text-sm whitespace-nowrap px-2 border-b-2 border-transparent hover:border-[#4a5240] hover:text-[#4a5240] text-stone-400 transition-colors"
              style={{ fontWeight: 400, letterSpacing: '0.04em' }}>
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      {/* Infos rapides */}
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        {dateFormatted && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/80">
            <span className="text-2xl">📅</span>
            <div>
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-1">Date</p>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }}
                 className="text-stone-700 capitalize">{dateFormatted}</p>
            </div>
          </div>
        )}
        {wedding.location && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/80">
            <span className="text-2xl">📍</span>
            <div className="flex-1">
              <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                 className="text-stone-400 uppercase mb-1">Lieu</p>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.15rem' }}
                 className="text-stone-700">{wedding.location}</p>
            </div>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(wedding.location)}`}
               target="_blank" rel="noopener noreferrer"
               className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-full hover:bg-[#2d3228] transition whitespace-nowrap"
               style={{ fontWeight: 300 }}>
              GPS →
            </a>
          </div>
        )}

        {/* Raccourcis */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: '📋 Programme', href: `/invite/${slug}/programme` },
            { label: '📸 Photos', href: `/invite/${slug}/photos` },
            { label: '💬 Groupes', href: `/invite/${slug}/groupes` },
            { label: '📞 Contacts', href: `/invite/${slug}/contacts` },
          ].map(item => (
            <a key={item.label} href={item.href}
               className="p-4 rounded-2xl bg-white/80 text-center hover:shadow-md transition-shadow"
               style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
