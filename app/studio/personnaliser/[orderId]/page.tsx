import { createClient } from '@supabase/supabase-js'
import PersonnaliserForm from './PersonnaliserForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function PersonnaliserPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  const { data: order, error } = await supabase
    .from('studio_public_orders')
    .select('id, ambiance_id, products, quantities, total_cents, wedding_info, personalization, status')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5" style={{ fontFamily: 'var(--font-lato)' }}>
        <div className="max-w-sm text-center">
          <div className="text-4xl mb-5">🔍</div>
          <h1 className="mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '1.8rem', color: '#2d3228' }}>Commande introuvable</h1>
          <p style={{ fontWeight: 300, fontSize: '0.88rem', color: '#78716c', lineHeight: 1.7 }}>Ce lien ne correspond à aucune commande. Vérifiez votre email ou contactez-nous.</p>
          <p className="mt-4" style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a8a29e' }}>
            <a href="mailto:bonjour@kaatch.fr" style={{ color: '#4a5240', fontWeight: 500 }}>bonjour@kaatch.fr</a>
          </p>
        </div>
      </main>
    )
  }

  return <PersonnaliserForm order={order} />
}
