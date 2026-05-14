import Link from 'next/link'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-lato)'

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  await searchParams

  return (
    <main style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>

        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f0e4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '2rem' }}>
          🎉
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.1rem', color: '#2d3228', marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Commande confirmée !
        </h1>

        <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.98rem', color: '#78716c', lineHeight: 1.85, marginBottom: 28 }}>
          Vous allez recevoir un email de confirmation dans quelques minutes.
          Si votre commande inclut des produits personnalisés, un lien vous sera envoyé pour
          renseigner les noms de vos invités — l&apos;impression démarrera après votre validation.
        </p>

        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 32, border: '1px solid #e7e3dc' }}>
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: '0.82rem', color: '#a8a29e', lineHeight: 1.7 }}>
            Des questions ? Écrivez-nous à{' '}
            <a href="mailto:bonjour@kaatch.fr" style={{ color: '#4a5240', fontWeight: 500 }}>bonjour@kaatch.fr</a>
            {' '}— nous répondons dans la journée.
          </p>
        </div>

        <Link
          href="/"
          style={{ display: 'inline-block', background: '#2d3228', color: '#fff', borderRadius: 12, padding: '13px 30px', fontFamily: BODY, fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}
        >
          Retour à l&apos;accueil →
        </Link>

      </div>
    </main>
  )
}
