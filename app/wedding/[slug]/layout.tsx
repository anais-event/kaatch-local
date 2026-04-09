import { createSupabaseServerClient } from '@/lib/supabase-server'
import WeddingNav from './WeddingNav'
import RealtimeNotifications from './RealtimeNotifications'

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
    </>
  )
}
