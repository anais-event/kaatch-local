export const metadata = {
  title: 'Mentions légales — Kaatch',
}

const DISPLAY = 'var(--font-geist-sans)'
const GREEN = '#2C3B2E'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: GREEN, marginBottom: '0.75rem' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#44403c', fontWeight: 300 }}>
        {children}
      </div>
    </section>
  )
}

export default function MentionsLegales() {
  return (
    <main className="bg-[#f5f0e8] min-h-screen" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" style={{ fontSize: '0.82rem', color: '#78716c', fontWeight: 300 }} className="hover:text-[#2C3B2E] transition mb-10 inline-block">
          ← Retour à l'accueil
        </a>

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', color: GREEN, marginBottom: '0.5rem' }}>
          Mentions légales
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#a8a29e', fontWeight: 300, marginBottom: '3rem' }}>
          Dernière mise à jour : avril 2026
        </p>

        <Section title="Éditeur du site">
          <p>Le site <strong>kaatch.fr</strong> est édité par :</p>
          <p className="mt-3">
            <strong>Cogitium</strong><br />
            Forme juridique : [à compléter — ex. auto-entrepreneur / SAS / SARL]<br />
            SIRET : [à compléter]<br />
            Adresse : [à compléter]<br />
            Email : <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a>
          </p>
        </Section>

        <Section title="Directeur de la publication">
          <p>Le directeur de la publication est le représentant légal de Cogitium.</p>
        </Section>

        <Section title="Hébergement">
          <p>
            Le site est hébergé par :<br /><br />
            <strong>Vercel Inc.</strong><br />
            340 Pine Street, Suite 701 — San Francisco, CA 94104, États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2C3B2E]">vercel.com</a>
          </p>
          <p className="mt-4">
            La base de données est gérée par :<br /><br />
            <strong>Supabase Inc.</strong><br />
            970 Toa Payoh North — Singapour<br />
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2C3B2E]">supabase.com</a>
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L'ensemble des contenus présents sur le site kaatch.fr (textes, images, logos, structure) sont la propriété exclusive de Cogitium, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </Section>

        <Section title="Données personnelles">
          <p>
            Les données collectées via kaatch.fr sont traitées conformément au Règlement (UE) 2016/679 (RGPD). Pour plus d'informations, consultez notre{' '}
            <a href="/politique-de-confidentialite" className="underline hover:text-[#2C3B2E]">politique de confidentialité</a>.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Le site utilise des cookies techniques nécessaires à son bon fonctionnement (session, préférences). Aucun cookie publicitaire ou de traçage tiers n'est déposé sans votre consentement. Consultez notre{' '}
            <a href="/politique-de-confidentialite" className="underline hover:text-[#2C3B2E]">politique de confidentialité</a> pour en savoir plus.
          </p>
        </Section>

        <Section title="Droit applicable">
          <p>
            Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pour toute question relative au site ou à vos données :{' '}
            <a href="mailto:bonjour@kaatch.fr" className="underline hover:text-[#2C3B2E]">bonjour@kaatch.fr</a>
          </p>
        </Section>
      </div>
    </main>
  )
}
