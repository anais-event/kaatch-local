import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GuestNav from './GuestNav'
import BottomNavGuest from './BottomNavGuest'
import { NotificationBadgesProvider } from './NotificationBadges'
import { isPaid } from '@/lib/plan'

export default async function InviteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const isPreview = !guestCookie

  const supabase = await createSupabaseServerClient()

  // Toujours vérifier l'auth (utile pour distinguer mariés vs invités)
  const { data: { user } } = await supabase.auth.getUser()

  // Pas de cookie ET pas connecté → entrée non autorisée
  if (isPreview && !user) {
    const { data: weddingEntry } = await supabase
      .from('weddings').select('share_code').eq('slug', slug).single()
    if (weddingEntry?.share_code) redirect(`/p/${weddingEntry.share_code}`)
    else redirect('/rejoindre')
  }

  const { data: wedding } = await supabase
    .from('weddings').select('id, plan').eq('slug', slug).single()
  const weddingId = wedding?.id ?? ''

  // Espace invités verrouillé si plan gratuit — SAUF pour les mariés connectés (aperçu)
  if (!isPaid(wedding?.plan) && !user) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">💍</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-3">Bientôt disponible</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
             className="text-stone-500">
            Les mariés finalisent la configuration de votre espace. Vous recevrez bientôt votre invitation personnalisée.
          </p>
        </div>
      </div>
    )
  }

  return (
    <NotificationBadgesProvider slug={slug} weddingId={weddingId}>
      <GuestNav slug={slug} isPreview={isPreview} />
      <div className="pt-12 pb-20 sm:pb-0">
        {children}
      </div>
      <BottomNavGuest slug={slug} />
    </NotificationBadgesProvider>
  )
}
