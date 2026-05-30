import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import AuthIntlProvider from '@/app/_components/AuthIntlProvider'
import WeddingNav from './WeddingNav'
import BottomNav from './BottomNav'
import OnboardingModal from './OnboardingModal'
import { logoutMaried } from './logout-action'

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, plan, couple_id, co_owner_email')
    .eq('slug', slug)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  // Accès réservé au propriétaire ou au co-owner invité
  if (user && wedding && user.id !== wedding.couple_id && user.email !== wedding.co_owner_email) {
    redirect('/dashboard')
  }

  const t = await getTranslations('common')

  return (
    <AuthIntlProvider>
      <WeddingNav slug={slug} weddingName={wedding?.name ?? ''} weddingId={wedding?.id ?? ''} userEmail={user?.email ?? ''} plan={wedding?.plan ?? null} />
      <div className="sidebar-main pt-12 md:pt-0 pb-20 md:pb-0 md:ml-56">
        {children}
      </div>
      <BottomNav slug={slug} />
      <OnboardingModal slug={slug} />
      {/* Déconnexion en bas de page */}
      <footer className="py-8 text-center md:ml-56">
        <form action={logoutMaried}>
          <button type="submit"
            className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
            {t('auth.logout')}
          </button>
        </form>
      </footer>
    </AuthIntlProvider>
  )
}
