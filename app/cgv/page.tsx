export const metadata = {
  title: 'Conditions générales de vente — Kaatch',
}

const DISPLAY = 'var(--font-display)'
const GREEN = '#2C3B2E'

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: GREEN, marginBottom: '0.75rem' }}>
        {n}. {title}
      </h2>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#44403c', fontWeight: 300 }}>
        {children}
      </div>
    </section>
  )
}

export default function CGV() {
  return (
    <main className="bg-[#f5f0e8] min-h-screen" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" style={{ fontSize: '0.82rem', color: '#78716c', fontWeight: 300 }} className="hover:text-[#2C3B2E] transition mb-10 inline-block">
          ← Retour à l'accueil
        </a>

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', color: GREEN, marginBottom: '0.5rem' }}>
          Conditions générales de vente
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#a8a29e', fontWeight: 300, marginBottom: '3rem' }}>
          Dernière mise à jour : avril 2026
        </p>

        <Section n="1" title="Objet">
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Cogitium</strong> (ci-après « Kaatch ») et toute personne physique ou morale (ci-après « le Client ») souhaitant acquérir un accès payant à la plateforme <strong>kaatch.fr</strong>.
          </p>
        </Section>

        <Section n="2" title="Offres disponibles">
          <p>Kaatch propose trois niveaux d'accès :</p>
          <ul className="mt-3 space-y-2 list-none">
            <li><strong>Gratuit</strong> — Accès limité (30 invités, 20 photos, 1 événement). Sans engagement, sans carte bleue.</li>
            <li><strong>Mariage (45 €)</strong> — Paiement unique. Accès complet pour un mariage, à vie : invités illimités, photos illimitées, plan de table, RSVP complet, sans branding Kaatch.</li>
            <li><strong>Pro (49 €/mois ou 399 €/an)</strong> — Accès multi-événements pour les professionnels de l'événementiel.</li>
          </ul>
          <p className="mt-3">Les prix sont indiqués en euros TTC. Kaatch se réserve le droit de modifier ses tarifs ; les modifications n'affectent pas les commandes déjà passées.</p>
        </Section>

        <Section n="3" title="Commande et paiement">
          <p>
            Le paiement est sécurisé via <strong>Lemon Squeezy</strong> (Stripe en sous-traitant). L'accès payant est activé automatiquement dès réception de la confirmation de paiement. Le Client reçoit une confirmation par email.
          </p>
          <p className="mt-3">
            Pour l'offre Mariage, le paiement unique confère un accès illimité dans le temps pour le mariage concerné. Il ne s'agit pas d'un abonnement.
          </p>
        </Section>

        <Section n="4" title="Droit de rétractation">
          <p>
            Conformément à l'article L.221-28 du Code de la consommation, <strong>le droit de rétractation ne s'applique pas</strong> aux contenus numériques dont l'exécution a commencé, avec l'accord exprès du consommateur, avant l'expiration du délai de rétractation de 14 jours.
          </p>
          <p className="mt-3">
            En validant son paiement et en accédant immédiatement aux fonctionnalités premium, le Client reconnaît et accepte expressément la renonciation à son droit de rétractation.
          </p>
          <p className="mt-3">
            Toutefois, si vous rencontrez un problème technique ou si le service ne correspond pas à la description, contactez-nous à <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a> — nous trouverons une solution.
          </p>
        </Section>

        <Section n="5" title="Disponibilité du service">
          <p>
            Kaatch s'engage à assurer la disponibilité du service avec un objectif de 99 % de temps de disponibilité hors maintenances planifiées. En cas d'interruption prolongée du service, le Client sera informé par email.
          </p>
          <p className="mt-3">
            Kaatch ne peut être tenu responsable des interruptions liées aux infrastructures tierces (Vercel, Supabase).
          </p>
        </Section>

        <Section n="6" title="Données et confidentialité">
          <p>
            Les données saisies sur la plateforme (noms d'invités, photos, informations du mariage) restent la propriété exclusive du Client. Kaatch s'engage à ne pas les utiliser à des fins commerciales. Voir notre{' '}
            <a href="/politique-de-confidentialite" className="underline hover:text-[#2C3B2E]">politique de confidentialité</a> pour le détail.
          </p>
        </Section>

        <Section n="7" title="Responsabilité">
          <p>
            Kaatch est une plateforme d'organisation. Sa responsabilité ne peut être engagée en cas de perte de données due à un cas de force majeure, de défaillance technique non imputable à Kaatch, ou d'utilisation inappropriée par le Client.
          </p>
          <p className="mt-3">
            La responsabilité de Kaatch est en tout état de cause limitée au montant payé par le Client pour l'accès au service.
          </p>
        </Section>

        <Section n="8" title="Droit applicable et litiges">
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort du siège de Cogitium seront saisis.
          </p>
          <p className="mt-3">
            Conformément à l'article L.612-1 du Code de la consommation, le Client peut recourir gratuitement à un médiateur de la consommation. Plateforme européenne de règlement des litiges :{' '}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2C3B2E]">ec.europa.eu/consumers/odr</a>.
          </p>
        </Section>

        <Section n="9" title="Contact">
          <p>
            Pour toute question relative à ces CGV :{' '}
            <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a>
          </p>
        </Section>
      </div>
    </main>
  )
}
