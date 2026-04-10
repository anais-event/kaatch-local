import { createSupabaseServerClient } from '@/lib/supabase-server'
import WeddingNav from './WeddingNav'
import RealtimeNotifications from './RealtimeNotifications'
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
    .select('id, name')
    .eq('slug', slug)
    .single()

  return (
    <>
      <WeddingNav slug={slug} weddingName={wedding?.name ?? ''} weddingId={wedding?.id ?? ''} />
      <div className="pt-12">
        {children}
      </div>
      {wedding?.id && (
        <RealtimeNotifications slug={slug} weddingId={wedding.id} />
      )}
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
