export const metadata = {
  title: 'Mentions légales — Kaatch',
  robots: { index: false },
}

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', color: '#2d3228' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <a href="/" className="text-sm text-[#2C3B2E] hover:underline mb-10 inline-block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>

        <h1 style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-10">
          Mentions légales
        </h1>

        <div className="space-y-10 text-stone-600" style={{ fontSize: '0.9rem', lineHeight: 1.85, fontWeight: 300 }}>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Éditeur du site</h2>
            <p>Le site kaatch.fr est édité par :</p>
            <p className="mt-2">
              <strong style={{ fontWeight: 500 }}>Kaatch</strong><br />
              Adresse : [à compléter]<br />
              SIRET : [à compléter]<br />
              Email : <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a><br />
              Directrice de la publication : Anaïs [à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Hébergeur</h2>
            <p>
              <strong style={{ fontWeight: 500 }}>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#2C3B2E] hover:underline">vercel.com</a>
            </p>
            <p className="mt-2">
              <strong style={{ fontWeight: 500 }}>Supabase Inc.</strong> (base de données)<br />
              970 Toa Payoh North, Singapore<br />
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#2C3B2E] hover:underline">supabase.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur le site kaatch.fr (textes, images, logo, design) sont
              la propriété exclusive de Kaatch et sont protégés par le droit de la propriété intellectuelle.
              Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <a href="/politique-de-confidentialite" className="text-[#2C3B2E] hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Contact</h2>
            <p>
              Pour toute question : <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a>
            </p>
          </section>

          <p className="text-stone-400 text-xs pt-4 border-t border-stone-200">
            Dernière mise à jour : avril 2025
          </p>
        </div>
      </div>
    </main>
  )
}
