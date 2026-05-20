import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import VendorNav from './VendorNav'
import { isPaid } from '@/lib/plan'

export default async function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const vendorCookie = cookieStore.get(`vendor_${slug}`)

  if (!vendorCookie) {
    redirect('/')
  }

  const vendor = JSON.parse(vendorCookie.value)
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, plan, is_suspended, date, location')
    .eq('slug', slug)
    .single()

  if (!wedding || !isPaid(wedding.plan) || wedding.is_suspended) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.6rem' }}
              className="text-[#2d3228] mb-3">Accès indisponible</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
             className="text-stone-500">
            Cet espace prestataire est temporairement indisponible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <VendorNav slug={slug} vendorName={vendor.name} vendorCategory={vendor.category} />
      <div className="pt-12 md:pt-0 md:ml-56 pb-8">
        {children}
      </div>
    </>
  )
}
