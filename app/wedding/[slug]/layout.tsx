import { createSupabaseServerClient } from '@/lib/supabase-server'
import WeddingNav from './WeddingNav'

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
    .select('name')
    .eq('slug', slug)
    .single()

  return (
    <>
      <WeddingNav slug={slug} weddingName={wedding?.name ?? ''} />
      <div className="pt-12">
        {children}
      </div>
    </>
  )
}
