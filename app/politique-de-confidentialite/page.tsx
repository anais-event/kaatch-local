export const metadata = {
  title: 'Politique de confidentialité — Kaatch',
}

const DISPLAY = 'var(--font-geist-sans)'
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

export default function PolitiqueConfidentialite() {
  return (
    <main className="bg-[#f5f0e8] min-h-screen" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" style={{ fontSize: '0.82rem', color: '#78716c', fontWeight: 300 }} className="hover:text-[#2C3B2E] transition mb-10 inline-block">
          ← Retour à l'accueil
        </a>

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', color: GREEN, marginBottom: '0.5rem' }}>
          Politique de confidentialité
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#a8a29e', fontWeight: 300, marginBottom: '3rem' }}>
          Dernière mise à jour : avril 2026
        </p>

        <Section n="1" title="Responsable du traitement">
          <p>
            <strong>Cogitium</strong> — <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a><br />
            Adresse : [à compléter]
          </p>
        </Section>

        <Section n="2" title="Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong>Mariés :</strong> adresse email, nom du mariage, date, liste d'invités.</li>
            <li><strong>Invités :</strong> prénom, réponse RSVP, message de réponse, photos partagées.</li>
            <li><strong>Paiement :</strong> aucune donnée bancaire n'est stockée par Kaatch — le paiement est traité par Lemon Squeezy (Stripe).</li>
            <li><strong>Technique :</strong> logs de connexion, cookies de session.</li>
          </ul>
        </Section>

        <Section n="3" title="Finalités et base légale">
          <p>Les données sont utilisées pour :</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li>Fournir le service (base légale : exécution du contrat)</li>
            <li>Envoyer des notifications liées au mariage (base légale : intérêt légitime)</li>
            <li>Respecter nos obligations légales et comptables (base légale : obligation légale)</li>
          </ul>
          <p className="mt-3">Kaatch ne revend ni ne loue aucune donnée personnelle à des tiers.</p>
        </Section>

        <Section n="4" title="Durée de conservation">
          <p>
            Les données d'un mariage sont conservées <strong>3 ans</strong> après la date du mariage, puis supprimées automatiquement — sauf demande explicite de suppression anticipée.
          </p>
          <p className="mt-3">
            Les données de facturation sont conservées 10 ans conformément aux obligations comptables françaises.
          </p>
        </Section>

        <Section n="5" title="Sous-traitants (sous-processeurs)">
          <p>Kaatch fait appel aux prestataires suivants, tous conformes au RGPD :</p>
          <div className="mt-3 space-y-3">
            {[
              { name: 'Vercel Inc.', role: "Hébergement de l'application", country: 'États-Unis (DPA disponible)', link: 'https://vercel.com/legal/privacy-policy' },
              { name: 'Supabase Inc.', role: 'Base de données et authentification', country: 'Singapour / UE', link: 'https://supabase.com/privacy' },
              { name: 'Lemon Squeezy (Stripe)', role: 'Paiement en ligne', country: 'États-Unis (SCC)', link: 'https://www.lemonsqueezy.com/privacy' },
              { name: 'Resend', role: "Envoi d'emails transactionnels", country: 'États-Unis (DPA disponible)', link: 'https://resend.com/privacy' },
            ].map(s => (
              <div key={s.name} className="bg-white/70 rounded-xl px-4 py-3" style={{ fontSize: '0.83rem' }}>
                <p><strong>{s.name}</strong> — {s.role}</p>
                <p className="text-stone-500">{s.country} · <a href={s.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2C3B2E]">Politique de confidentialité</a></p>
              </div>
            ))}
          </div>
        </Section>

        <Section n="6" title="Vos droits (RGPD)">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong>Accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Rectification :</strong> corriger des données inexactes</li>
            <li><strong>Suppression :</strong> demander la suppression de votre compte et de vos données</li>
            <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Opposition :</strong> vous opposer à certains traitements fondés sur l'intérêt légitime</li>
          </ul>
          <p className="mt-3">
            Pour exercer vos droits : <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a>. Délai de réponse : 30 jours.
          </p>
          <p className="mt-3">
            En cas de réclamation non résolue, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2C3B2E]">CNIL</a>.
          </p>
        </Section>

        <Section n="7" title="Cookies">
          <p>
            Kaatch utilise uniquement des cookies <strong>techniques et fonctionnels</strong> (session utilisateur, préférences d'affichage). Ces cookies sont nécessaires au fonctionnement du service et ne requièrent pas de consentement au sens de l'article 82 de la loi Informatique et Libertés.
          </p>
          <p className="mt-3">
            Aucun cookie publicitaire ou de traçage tiers n'est utilisé. Aucune donnée n'est transmise à des régies publicitaires.
          </p>
        </Section>
      </div>
    </main>
  )
}
