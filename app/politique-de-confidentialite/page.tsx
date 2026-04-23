export const metadata = {
  title: 'Politique de confidentialité — Kaatch',
  robots: { index: false },
}

export default function PolitiqueConfidentialite() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', color: '#2d3228' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <a href="/" className="text-sm text-[#2C3B2E] hover:underline mb-10 inline-block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>

        <h1 style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-stone-400 text-sm mb-10" style={{ fontWeight: 300 }}>Conforme au RGPD — En vigueur au 1er avril 2025</p>

        <div className="space-y-10 text-stone-600" style={{ fontSize: '0.9rem', lineHeight: 1.85, fontWeight: 300 }}>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>1. Responsable du traitement</h2>
            <p>
              Kaatch — <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a><br />
              SIRET : [à compléter]
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>2. Données collectées</h2>
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-stone-100">
                <p style={{ fontWeight: 500 }} className="text-[#2C3B2E] mb-1">Côté mariés (compte créé)</p>
                <p>Adresse email, nom du mariage, date et lieu, informations sur les invités (prénom, nom, email),
                contenu du programme, photos téléchargées.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-100">
                <p style={{ fontWeight: 500 }} className="text-[#2C3B2E] mb-1">Côté invités (sans compte)</p>
                <p>Prénom et nom (saisis pour accéder à l'espace), réponse RSVP, photos déposées,
                messages dans la messagerie. Aucun email n'est collecté côté invité.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-100">
                <p style={{ fontWeight: 500 }} className="text-[#2C3B2E] mb-1">Données de paiement</p>
                <p>Traitées exclusivement par Lemon Squeezy. Kaatch ne stocke aucune donnée bancaire.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>3. Finalités du traitement</h2>
            <ul className="space-y-2">
              {[
                'Fourniture du service (gestion du mariage, espace invités)',
                'Communication transactionnelle (confirmations, invitations)',
                'Amélioration de la plateforme (statistiques anonymisées)',
                'Respect des obligations légales et comptables',
              ].map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="text-[#2C3B2E] shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>4. Durée de conservation</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3"><span className="text-[#2C3B2E] shrink-0">·</span>
                <span><strong style={{ fontWeight: 500 }}>Données du compte marié :</strong> conservées tant que le compte est actif, puis 3 ans après la dernière connexion.</span>
              </li>
              <li className="flex items-start gap-3"><span className="text-[#2C3B2E] shrink-0">·</span>
                <span><strong style={{ fontWeight: 500 }}>Photos et messages :</strong> conservés tant que l'espace mariage existe. Suppression possible à tout moment.</span>
              </li>
              <li className="flex items-start gap-3"><span className="text-[#2C3B2E] shrink-0">·</span>
                <span><strong style={{ fontWeight: 500 }}>Données de paiement :</strong> 10 ans (obligation légale comptable).</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>5. Sous-traitants et transferts</h2>
            <p>Kaatch utilise les prestataires suivants, tous conformes au RGPD :</p>
            <ul className="mt-3 space-y-1">
              {[
                { name: 'Supabase', role: 'Hébergement des données (UE disponible)' },
                { name: 'Vercel', role: 'Hébergement de l\'application' },
                { name: 'Lemon Squeezy', role: 'Paiement en ligne' },
                { name: 'Resend', role: 'Envoi d\'emails transactionnels' },
                { name: 'Anthropic', role: 'IA (chatbot — aucune donnée personnelle transmise)' },
              ].map(p => (
                <li key={p.name} className="flex items-start gap-3">
                  <span className="text-[#2C3B2E] shrink-0 font-bold">·</span>
                  <span><strong style={{ fontWeight: 500 }}>{p.name}</strong> — {p.role}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>6. Vos droits (RGPD)</h2>
            <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="space-y-2">
              {[
                'Droit d\'accès à vos données',
                'Droit de rectification',
                'Droit à l\'effacement (« droit à l\'oubli »)',
                'Droit à la portabilité',
                'Droit d\'opposition au traitement',
                'Droit de retirer votre consentement à tout moment',
              ].map(d => (
                <li key={d} className="flex items-start gap-3">
                  <span className="text-[#2C3B2E] shrink-0">✓</span>{d}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Pour exercer ces droits : <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a>.
              Réponse sous 30 jours.
            </p>
            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#2C3B2E] hover:underline">
                CNIL
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>7. Cookies</h2>
            <p>
              Kaatch utilise uniquement des cookies fonctionnels nécessaires au bon fonctionnement
              du service (session, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
              Aucun consentement n'est requis pour ces cookies strictement nécessaires.
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
