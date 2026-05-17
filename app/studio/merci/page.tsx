import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  let orderId: string | null = null
  if (session_id) {
    const { data } = await supabase
      .from('studio_public_orders')
      .select('id')
      .eq('stripe_session_id', session_id)
      .single()
    orderId = data?.id ?? null
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5 py-10" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-lg text-center">

        <div className="w-16 h-16 rounded-full bg-[#e8f0e4] flex items-center justify-center mx-auto mb-7 text-3xl">
          🎉
        </div>

        <h1 className="mb-4" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, fontSize: '2.1rem', color: '#2d3228', lineHeight: 1.1 }}>
          Commande confirmée !
        </h1>

        <p className="mb-6" style={{ fontWeight: 300, fontSize: '0.95rem', color: '#78716c', lineHeight: 1.85 }}>
          Un email de confirmation arrive dans quelques minutes. Il contient un lien pour finaliser la personnalisation avant impression.
        </p>

        {orderId && (
          <Link
            href={`/studio/personnaliser/${orderId}`}
            className="inline-block mb-6 px-6 py-3 rounded-xl no-underline transition-all hover:opacity-90"
            style={{ background: '#4a5240', color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}
          >
            Personnaliser maintenant →
          </Link>
        )}

        <div className="bg-white rounded-xl p-5 border border-stone-100 mb-6">
          <p style={{ fontWeight: 300, fontSize: '0.82rem', color: '#78716c', lineHeight: 1.7 }}>
            <strong style={{ fontWeight: 500 }}>Prochaine étape :</strong> confirmez vos prénoms et la date sur le lien reçu par email (ou ci-dessus). L&apos;impression démarre ensuite sous 3 à 5 jours.
          </p>
        </div>

        <p className="mb-6" style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a8a29e', lineHeight: 1.7 }}>
          Des questions ? Écrivez-nous à{' '}
          <a href="mailto:bonjour@kaatch.fr" style={{ color: '#4a5240', fontWeight: 500 }}>bonjour@kaatch.fr</a>
        </p>

        <Link href="/" style={{ fontWeight: 400, fontSize: '0.82rem', color: '#78716c', textDecoration: 'underline' }}>
          Retour à l&apos;accueil
        </Link>

      </div>
    </main>
  )
}
