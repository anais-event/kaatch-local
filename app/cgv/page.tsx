export const metadata = {
  title: 'Conditions Générales de Vente — Kaatch',
  robots: { index: false },
}

export default function CGV() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', color: '#2d3228' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">

        <a href="/" className="text-sm text-[#2C3B2E] hover:underline mb-10 inline-block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>

        <h1 style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-2">
          Conditions Générales de Vente
        </h1>
        <p className="text-stone-400 text-sm mb-10" style={{ fontWeight: 300 }}>En vigueur au 1er avril 2025</p>

        <div className="space-y-10 text-stone-600" style={{ fontSize: '0.9rem', lineHeight: 1.85, fontWeight: 300 }}>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
              Kaatch (ci-après « le Prestataire ») et tout utilisateur qui souscrit à une offre payante
              sur le site kaatch.fr (ci-après « le Client »).
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>2. Offres et tarifs</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-100">
                <p style={{ fontWeight: 600 }} className="text-[#2C3B2E] mb-1">Offre Gratuite — 0 €</p>
                <p>Accès limité : 1 événement, 30 invités, 20 photos, RSVP basique.
                Disponible sans engagement, sans carte bancaire.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-100">
                <p style={{ fontWeight: 600 }} className="text-[#2C3B2E] mb-1">Offre Mariage — 45 € (prix de lancement, tarif normal : 65 €)</p>
                <p>Paiement unique, accès à vie pour 1 mariage. Inclut : invités et photos illimités,
                RSVP complet, plan de table, budget, site personnalisé, sans branding Kaatch.
                Accès activé immédiatement après confirmation du paiement.</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-stone-100">
                <p style={{ fontWeight: 600 }} className="text-[#2C3B2E] mb-1">Offre Pro — 49 €/mois ou 399 €/an</p>
                <p>Accès à un nombre illimité de mariages, tableau de bord multi-événements,
                support prioritaire, accès anticipé aux nouvelles fonctionnalités.
                Abonnement résiliable à tout moment avec prise d'effet à la fin de la période en cours.</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-400">
              Tous les prix sont indiqués en euros TTC. Kaatch se réserve le droit de modifier ses tarifs
              à tout moment, sans que cela affecte les commandes déjà validées.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>3. Paiement</h2>
            <p>
              Le paiement est traité de manière sécurisée par <strong style={{ fontWeight: 500 }}>Lemon Squeezy</strong>.
              Les données bancaires ne sont jamais stockées sur les serveurs de Kaatch.
              Le paiement est exigible immédiatement à la commande.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>4. Droit de rétractation</h2>
            <p>
              Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation
              ne s'applique pas aux contenus numériques fournis immédiatement après la commande,
              avec l'accord exprès du consommateur. En procédant au paiement, le Client reconnaît
              que l'accès à la plateforme est immédiat et renonce à son droit de rétractation.
            </p>
            <p className="mt-2">
              Toutefois, si vous n'êtes pas satisfait(e), contactez-nous dans les 7 jours suivant votre achat
              à <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a> et
              nous étudierons votre demande avec bienveillance.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>5. Disponibilité du service</h2>
            <p>
              Kaatch s'engage à assurer la disponibilité de la plateforme 24h/24, 7j/7,
              sauf maintenance programmée ou événement de force majeure. En cas d'interruption
              prolongée (plus de 72h consécutives), le Client sera informé par email.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>6. Responsabilité</h2>
            <p>
              Kaatch est un outil d'organisation mis à disposition des utilisateurs. Kaatch ne peut
              être tenu responsable des contenus publiés par les utilisateurs (photos, messages),
              ni des interactions entre invités sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>7. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties
              s'efforceront de trouver une solution amiable. À défaut, les tribunaux français
              seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-[#2C3B2E] mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>8. Contact</h2>
            <p>
              Pour toute question relative à une commande : <a href="mailto:bonjour@kaatch.fr" className="text-[#2C3B2E] hover:underline">bonjour@kaatch.fr</a>
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
