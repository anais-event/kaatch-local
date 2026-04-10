import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GuestAuthForm from './GuestAuthForm'

export default async function PublicPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, slug, name, cover_image_url, date')
    .eq('share_code', code.toUpperCase())
    .single()

  if (!wedding) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">Code introuvable</h1>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
             className="text-stone-400">Vérifiez le code avec les mariés.</p>
        </div>
      </div>
    )
  }

  const cookieStore = await cookies()
  const existingCookie = cookieStore.get(`guest_${wedding.slug}`)
  if (existingCookie) redirect(`/invite/${wedding.slug}`)

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Hero */}
      <div className="relative w-full h-[40vh] min-h-[260px] overflow-hidden">
        {wedding.cover_image_url ? (
          <img src={wedding.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#4a5240]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
          {dateFormatted && (
            <p className="text-xs tracking-[0.3em] uppercase text-stone-300 mb-2"
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {dateFormatted}
            </p>
          )}
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 6vw, 3rem)' }}>
            {wedding.name}
          </h1>
        </div>
      </div>

      {/* Formulaire identification */}
      <div className="max-w-sm mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-2">
            Qui êtes-vous ?
          </h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-400">
            Identifiez-vous pour accéder au mariage.
          </p>
        </div>

        <GuestAuthForm weddingId={wedding.id} weddingSlug={wedding.slug} code={code.toUpperCase()} />
      </div>
    </div>
  )
}
