import { createSupabaseServerClient } from '@/lib/supabase-server'
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
    .select('id, name, plan')
    .eq('slug', slug)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <WeddingNav slug={slug} weddingName={wedding?.name ?? ''} weddingId={wedding?.id ?? ''} userEmail={user?.email ?? ''} plan={wedding?.plan ?? null} />
      <div className="pt-12 pb-20 sm:pb-0">
        {children}
      </div>
      <BottomNav slug={slug} />
      <OnboardingModal slug={slug} />
      {/* Déconnexion en bas de page */}
      <footer className="py-8 text-center">
        <form action={logoutMaried}>
          <button type="submit"
            className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
            Se déconnecter
          </button>
        </form>
      </footer>
    </>
  )
}
