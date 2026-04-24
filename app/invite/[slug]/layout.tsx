import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GuestNav from './GuestNav'
import BottomNavGuest from './BottomNavGuest'
import { NotificationBadgesProvider } from './NotificationBadges'

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

  // Si pas de cookie invité → vérifier si c'est un marié en prévisualisation
  if (isPreview) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Ni invité ni marié → rediriger vers l'entrée
      const { data: wedding } = await supabase
        .from('weddings').select('share_code').eq('slug', slug).single()
      if (wedding?.share_code) redirect(`/p/${wedding.share_code}`)
      else redirect('/rejoindre')
    }
  }

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('slug', slug).single()
  const weddingId = wedding?.id ?? ''

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
