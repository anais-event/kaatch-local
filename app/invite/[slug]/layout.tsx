import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import GuestNav from './GuestNav'
import BottomNavGuest from './BottomNavGuest'

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

  // Si pas de cookie invité → vérifier si c'est un marié en prévisualisation
  if (isPreview) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Ni invité ni marié → rediriger vers l'entrée
      const { data: wedding } = await supabase
        .from('weddings').select('share_code').eq('slug', slug).single()
      if (wedding?.share_code) redirect(`/p/${wedding.share_code}`)
      else redirect('/rejoindre')
    }
  }

  return (
    <>
      <GuestNav slug={slug} isPreview={isPreview} />
      <div className="pt-12 pb-20 sm:pb-0">
        {children}
      </div>
      <BottomNavGuest slug={slug} />
    </>
  )
}
