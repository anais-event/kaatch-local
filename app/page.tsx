import ContactForm from './_components/ContactForm'
import PublicNav from './_components/PublicNav'
import ScrollReveal from './_components/ScrollReveal'
import FeaturesTrack from './_components/FeaturesTrack'
import EmailPopup from './_components/EmailPopup'

export const dynamic = 'force-dynamic'

const BODY   = 'var(--font-body)'   // Plus Jakarta Sans — TOUT
const SERIF  = 'var(--font-serif)'  // Instrument Serif — logo + Pourquoi Kaatch uniquement

const SAGE_DARK  = '#2d3228'
const SAGE       = '#4a5240'
const SAGE_MUTED = '#5e6654'
const TEXT       = '#2e2b27'
const TEXT_MID   = '#5a5549'
const TEXT_SOFT  = '#847d73'
const CREAM      = '#f5f0e8'
const CREAM_MID  = '#ece6db'
const WHITE      = '#fffdf9'

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kaatch",
    "url": "https://kaatch.fr",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "description": "Plateforme française d'organisation de mariage tout-en-un. Gestion des invités, faire-part animés, RSVP, plan de table, album photo partagé, playlist participative, livre d'or, messagerie interne, budget, programme du jour J et coordination des prestataires en temps réel.",
    "inLanguage": "fr",
    "offers": [
      { "@type": "Offer", "name": "Découverte", "price": "0", "priceCurrency": "EUR" },
      { "@type": "Offer", "name": "Mariage", "price": "45", "priceCurrency": "EUR" },
    ],
    "featureList": [
      "Gestion de la liste d'invités avec import Excel",
      "Faire-part interactifs et animés personnalisés par invité",
      "RSVP en temps réel",
      "Plan de table en glisser-déposer",
      "Album photo partagé",
      "Playlist participative",
      "Livre d'or numérique",
      "Messagerie interne",
      "Suivi de budget",
      "Programme du jour J",
      "Coordination des prestataires",
    ],
    "screenshot": "https://kaatch.fr/og-image.png",
    "creator": { "@type": "Organization", "name": "Kaatch", "url": "https://kaatch.fr", "email": "bonjour@kaatch.fr" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kaatch",
    "url": "https://kaatch.fr",
    "logo": "https://kaatch.fr/logo.png",
    "email": "bonjour@kaatch.fr",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Les invités doivent-ils créer un compte pour utiliser Kaatch ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Non. Chaque invité reçoit un lien unique. Aucune inscription, aucun mot de passe." },
      },
      {
        "@type": "Question",
        "name": "Combien coûte Kaatch ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Plan Découverte gratuit avec 30 invités. Plan Mariage à 45 euros, paiement unique, invités illimités." },
      },
      {
        "@type": "Question",
        "name": "Faut-il télécharger une application ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Non. Kaatch est accessible depuis n'importe quel navigateur, sur mobile comme sur ordinateur." },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kaatch",
    "url": "https://kaatch.fr",
    "inLanguage": "fr",
  },
]

export default function Home() {
  return (
    <main style={{ fontFamily: BODY, fontWeight: 300, color: TEXT, background: CREAM, overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── NAV ── */}
      <PublicNav />

      {/* ══════════════════════════════════════════════
          HERO — fond cream, aligné à gauche
      ══════════════════════════════════════════════ */}
      <header
        aria-label="Kaatch — organisation de mariage"
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(6rem, 10vw, 8rem) 2.5rem 4rem',
          maxWidth: '68rem', margin: '0 auto',
        }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.03em',
          color: SAGE, background: 'rgba(74,82,64,0.08)',
          padding: '0.35rem 0.9rem', borderRadius: 100, width: 'fit-content',
          marginBottom: '2rem',
          animation: 'fadeIn 0.5s ease both 0.1s',
          fontFamily: BODY,
        }}>
          Accès offert pour les 100 premiers couples
        </div>

        <h1 style={{
          fontFamily: BODY, fontWeight: 800,
          fontSize: 'clamp(2.6rem, 5.8vw, 4.8rem)',
          lineHeight: 1.08, color: SAGE_DARK,
          marginBottom: '1.8rem', maxWidth: '44rem',
          animation: 'fadeUp 0.6s ease both 0.15s',
          letterSpacing: '-0.02em',
        }}>
          Toute l&apos;organisation de votre mariage au même endroit.
        </h1>

        <p style={{
          fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7,
          color: TEXT_MID, maxWidth: '38rem', marginBottom: '1rem',
          animation: 'fadeUp 0.6s ease both 0.3s',
          fontFamily: BODY,
        }}>
          Préparer un mariage, c&apos;est pas de l&apos;impro. C&apos;est 1000 décisions,
          20 prestataires, des dizaines d&apos;invités, un peu de stress
          et beaucoup d&apos;argent. On a peur d&apos;oublier quelque chose,
          il faut penser à chaque détail, et l&apos;on peut vite se sentir dépassé.
        </p>
        <p style={{
          fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7,
          color: TEXT_MID, maxWidth: '38rem', marginBottom: '2.5rem',
          animation: 'fadeUp 0.6s ease both 0.4s',
          fontFamily: BODY,
        }}>
          Kaatch centralise tout — c&apos;est un peu comme ranger sa chambre.
          Une fois qu&apos;on y voit plus clair, l&apos;esprit s&apos;apaise, la fête approche,
          et vous pouvez vous reconcentrer sur l&apos;essentiel&nbsp;: vous.
        </p>

        <div style={{
          display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap',
          animation: 'fadeUp 0.6s ease both 0.55s',
        }}>
          <a href="/auth" style={{
            display: 'inline-flex', alignItems: 'center',
            fontFamily: BODY, fontSize: '0.88rem', fontWeight: 500,
            color: WHITE, background: SAGE,
            padding: '0.85rem 1.7rem', borderRadius: 8,
            textDecoration: 'none', border: 'none', cursor: 'pointer',
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = SAGE_DARK; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = SAGE; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Créer mon espace mariage
          </a>
          <a href="/rejoindre" style={{
            fontSize: '0.85rem', fontWeight: 400, color: TEXT_MID,
            textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.12)',
            paddingBottom: 2, transition: 'all 0.2s', fontFamily: BODY,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = SAGE; e.currentTarget.style.borderColor = SAGE }}
          onMouseLeave={e => { e.currentTarget.style.color = TEXT_MID; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
          >
            Invité(e) à un mariage ?
          </a>
        </div>

        <p style={{
          marginTop: '3rem', fontSize: '0.75rem', color: TEXT_SOFT,
          animation: 'fadeIn 0.5s ease both 0.8s', fontFamily: BODY,
        }}>
          Gratuit pour les 100 premiers couples.
          Ensuite&nbsp;: un seul paiement, pas d&apos;abonnement, pas de frais cachés.
        </p>
      </header>

      {/* ══════════════════════════════════════════════
          CONVERSATIONS — fond white
      ══════════════════════════════════════════════ */}
      <section
        aria-label="Les problèmes que Kaatch résout"
        style={{ padding: '5rem 2.5rem', background: WHITE }}
      >
        <div style={{ maxWidth: '62rem', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700,
            fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
            color: SAGE_DARK, textAlign: 'center', marginBottom: '0.6rem', lineHeight: 1.15,
          }}>
            Et pour gérer tout ça, on fait comment&nbsp;?
          </h2>
          <p style={{
            fontSize: '0.9rem', fontWeight: 300, color: TEXT_MID,
            textAlign: 'center', marginBottom: '3rem', fontFamily: BODY,
          }}>
            Encore un groupe WhatsApp&nbsp;? Un Drive&nbsp;? Un tableur&nbsp;? Ou alors...
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            <div style={{ background: CREAM, borderRadius: 18, padding: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: SAGE_MUTED, marginBottom: '1rem', textAlign: 'center', fontFamily: BODY }}>
                Côté invités
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { side: 'l', text: '"C\'est quoi le programme demain ?"' },
                  { side: 'l', text: '"Vous pouvez m\'envoyer les photos ?"' },
                  { side: 'r', text: '"Regarde dans le groupe WhatsApp"' },
                  { side: 'l', text: '"Lequel ? Y en a 4"' },
                  { side: 'sys', text: 'Jean-Pierre a quitté le groupe' },
                  { side: 'l', text: '"... mamie a encore envoyé un GIF de chat"' },
                ].map((b, i) => (
                  <div key={i} className="reveal" style={{
                    padding: b.side === 'sys' ? '0.2rem 0' : '0.7rem 1rem',
                    borderRadius: b.side === 'sys' ? 0 : 16,
                    borderBottomLeftRadius: b.side === 'l' ? 4 : undefined,
                    borderBottomRightRadius: b.side === 'r' ? 4 : undefined,
                    background: b.side === 'l' ? WHITE : b.side === 'r' ? SAGE : 'none',
                    color: b.side === 'r' ? WHITE : b.side === 'sys' ? TEXT_SOFT : TEXT,
                    fontSize: b.side === 'sys' ? '0.68rem' : '0.82rem',
                    lineHeight: 1.45, maxWidth: '85%',
                    alignSelf: b.side === 'l' ? 'flex-start' : b.side === 'r' ? 'flex-end' : 'center',
                    fontFamily: BODY,
                  }}>
                    {b.text}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: TEXT_SOFT, fontFamily: BODY }}>
                On exagère à peine.
              </p>
            </div>

            <div style={{ background: CREAM, borderRadius: 18, padding: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: SAGE_MUTED, marginBottom: '1rem', textAlign: 'center', fontFamily: BODY }}>
                Côté prestataires
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { side: 'l', text: '"Combien de végétariens finalement ?"' },
                  { side: 'r', text: '"Attends je vérifie... 6. Non 8. Non attends."' },
                  { side: 'l', text: '"Et les sans gluten ?"' },
                  { side: 'r', text: '"Je te renvoie le tableur ce soir"' },
                  { side: 'l', text: '"Celui de la semaine dernière était pas à jour"' },
                  { side: 'r', text: '"..."' },
                ].map((b, i) => (
                  <div key={i} className="reveal" style={{
                    padding: '0.7rem 1rem', borderRadius: 16,
                    borderBottomLeftRadius: b.side === 'l' ? 4 : undefined,
                    borderBottomRightRadius: b.side === 'r' ? 4 : undefined,
                    background: b.side === 'l' ? WHITE : SAGE,
                    color: b.side === 'r' ? WHITE : TEXT,
                    fontSize: '0.82rem', lineHeight: 1.45, maxWidth: '85%',
                    alignSelf: b.side === 'l' ? 'flex-start' : 'flex-end',
                    fontFamily: BODY,
                  }}>
                    {b.text}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: TEXT_SOFT, fontFamily: BODY }}>
                Spoiler&nbsp;: le tableur n&apos;a jamais été renvoyé.
              </p>
            </div>

          </div>

          <p className="reveal" style={{
            marginTop: '3rem', textAlign: 'center',
            fontSize: '1.15rem', fontWeight: 600, color: SAGE_DARK,
            lineHeight: 1.45, maxWidth: '34rem',
            marginLeft: 'auto', marginRight: 'auto', fontFamily: BODY,
          }}>
            Kaatch, c&apos;est la fin de ce bazar. Chacun accède à ce dont il a besoin,
            au même endroit, sans rien demander à personne.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TROIS PORTES — fond cream
      ══════════════════════════════════════════════ */}
      <section
        aria-label="Un mariage, trois portes d'entrée"
        style={{ padding: '5rem 2.5rem', background: CREAM }}
      >
        <div style={{ maxWidth: '62rem', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700,
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            color: SAGE_DARK, textAlign: 'center', marginBottom: '0.6rem', lineHeight: 1.15,
          }}>
            Un mariage, trois portes d&apos;entrée.
          </h2>
          <p style={{
            fontSize: '0.9rem', fontWeight: 300, color: TEXT_MID,
            textAlign: 'center', marginBottom: '3.5rem',
            maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto', fontFamily: BODY,
          }}>
            Les mariés profitent de leur journée. Les invités ont tout sous la main.
            Les prestataires bossent sans vous déranger.
          </p>

          {/* Orbital desktop / stack mobile */}
          <div className="orbits-wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', position: 'relative' }}>

            {/* Centre */}
            <div className="reveal" style={{
              background: SAGE, borderRadius: '50%',
              width: '10rem', height: '10rem',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 40px rgba(74,82,64,0.2)',
              justifySelf: 'center', alignSelf: 'center',
            }}>
              <span style={{ fontFamily: SERIF, fontSize: '1.6rem', color: WHITE, marginBottom: '0.2rem' }}>K</span>
              <h3 style={{ fontWeight: 600, fontSize: '0.88rem', color: WHITE, textAlign: 'center', fontFamily: BODY, margin: 0 }}>
                Les mariés
              </h3>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: '0.2rem', fontFamily: BODY }}>
                Organisent et profitent
              </p>
            </div>

            {/* Espace mariés */}
            <div className="reveal" style={{
              background: WHITE, borderRadius: 14, padding: '1.2rem 1.4rem',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{
                display: 'inline-block', fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: SAGE, background: 'rgba(74,82,64,0.08)',
                padding: '0.2rem 0.6rem', borderRadius: 3, marginBottom: '0.6rem', fontFamily: BODY,
              }}>
                Espace mariés
              </span>
              <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: BODY }}>
                Le cockpit — simple et complet
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {["Invitations animées et RSVP en direct", "Budget, prestataires, devis", "Programme du jour éditable", "Galerie photos avec modération", "Livre d'or, playlist, messagerie"].map(item => (
                  <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, paddingLeft: '0.7rem', position: 'relative', fontFamily: BODY }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.4rem', width: 3, height: 3, borderRadius: '50%', background: SAGE_MUTED, display: 'block' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Espace invités */}
            <div className="reveal" style={{
              background: WHITE, borderRadius: 14, padding: '1.2rem 1.4rem',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{
                display: 'inline-block', fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: SAGE, background: 'rgba(74,82,64,0.08)',
                padding: '0.2rem 0.6rem', borderRadius: 3, marginBottom: '0.6rem', fontFamily: BODY,
              }}>
                Espace invités
              </span>
              <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: BODY }}>
                Tout ce qu&apos;il faut, sans rien demander
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {["Faire-part personnel et RSVP en un clic", "Programme, contacts, hébergements", "Album photo partagé par QR code", "Livre d'or, messagerie entre invités", "Suggestions musicales par moment"].map(item => (
                  <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, paddingLeft: '0.7rem', position: 'relative', fontFamily: BODY }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.4rem', width: 3, height: 3, borderRadius: '50%', background: SAGE_MUTED, display: 'block' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Espace prestataires */}
            <div className="reveal" style={{
              background: WHITE, borderRadius: 14, padding: '1.2rem 1.4rem',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{
                display: 'inline-block', fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: SAGE, background: 'rgba(74,82,64,0.08)',
                padding: '0.2rem 0.6rem', borderRadius: 3, marginBottom: '0.6rem', fontFamily: BODY,
              }}>
                Espace prestataires
              </span>
              <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: BODY }}>
                Les infos utiles, toujours à jour
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {["Plan de table avec régimes alimentaires", "Nombre exact de couverts, en temps réel", "Programme et timing de la journée", "Export des données pour le traiteur", "Accès en lecture — sans interférer"].map(item => (
                  <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, paddingLeft: '0.7rem', position: 'relative', fontFamily: BODY }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.4rem', width: 3, height: 3, borderRadius: '50%', background: SAGE_MUTED, display: 'block' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — fond white, scroll horizontal
      ══════════════════════════════════════════════ */}
      <section
        id="fonctionnalites"
        aria-label="Fonctionnalités de Kaatch"
        style={{ padding: '5rem 0', background: WHITE }}
      >
        <div style={{ padding: '0 2.5rem', marginBottom: '2.5rem', maxWidth: '68rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700,
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            color: SAGE_DARK, marginBottom: '0.6rem', lineHeight: 1.15,
          }}>
            Tout ce que vous allez enfin arrêter de chercher.
          </h2>
          <p style={{ fontSize: '0.92rem', fontWeight: 300, color: TEXT_MID, maxWidth: '34rem', fontFamily: BODY }}>
            Chacune de ces fonctionnalités résout un problème que vous connaissez déjà
            — ou que vous découvrirez dans 3 mois.
          </p>
        </div>

        <FeaturesTrack />
      </section>

      {/* ══════════════════════════════════════════════
          TEASER — fond sage-dark
      ══════════════════════════════════════════════ */}
      <section
        aria-label="Ce qui vous attend encore"
        style={{ padding: '5rem 2.5rem', background: SAGE_DARK, color: CREAM, textAlign: 'center' }}
      >
        <h2 style={{
          fontFamily: BODY, fontWeight: 700,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          color: CREAM, marginBottom: '1.2rem', lineHeight: 1.15,
        }}>
          Ce n&apos;est pas tout. Loin de là.
        </h2>
        <p style={{
          fontSize: '0.92rem', fontWeight: 300,
          color: 'rgba(245,240,232,0.65)',
          maxWidth: '34rem', margin: '0 auto 2.5rem', lineHeight: 1.7, fontFamily: BODY,
        }}>
          Derrière votre espace mariage, il y a tout un monde de petites attentions
          que vos invités vont adorer — et que vous ne trouverez nulle part ailleurs.
        </p>

        <div style={{
          display: 'flex', gap: '0.8rem', justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: '1.5rem',
          maxWidth: '50rem', marginLeft: 'auto', marginRight: 'auto',
        }}>
          {[
            { label: "Livre d'or", blur: false },
            { label: "Playlist par moment", blur: false },
            { label: "Messagerie de groupe", blur: false },
            { label: "Idées surprises", blur: true },
            { label: "Jeux et animations", blur: true },
            { label: "Contacts utiles", blur: false },
            { label: "Hébergements", blur: false },
            { label: "Et d'autres choses encore", blur: true },
          ].map(pill => (
            <span key={pill.label} style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.78rem', fontWeight: 400,
              color: 'rgba(245,240,232,0.8)',
              background: 'rgba(245,240,232,0.08)',
              border: '1px solid rgba(245,240,232,0.1)',
              padding: '0.45rem 1rem', borderRadius: 100,
              fontFamily: BODY,
            }}>
              <span style={pill.blur ? { filter: 'blur(4px)', userSelect: 'none' } : {}}>
                {pill.label}
              </span>
            </span>
          ))}
        </div>

        <div style={{ width: '3rem', height: 1, background: 'rgba(245,240,232,0.15)', margin: '2rem auto' }} />

        <p style={{
          fontSize: '0.82rem', fontWeight: 300,
          color: 'rgba(245,240,232,0.5)',
          maxWidth: '30rem', margin: '0 auto 2.5rem', lineHeight: 1.7, fontFamily: BODY,
        }}>
          Et demain&nbsp;? Un studio créatif pour concevoir toute votre papeterie assortie,
          des suggestions de cadeaux, des mises en scène de tables...
          Et Kaatch s&apos;adaptera aussi aux baptêmes et aux événements d&apos;entreprise.
        </p>

        <a href="/auth" style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600,
          color: SAGE_DARK, background: CREAM,
          padding: '0.85rem 1.7rem', borderRadius: 8,
          textDecoration: 'none', transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = WHITE }}
        onMouseLeave={e => { e.currentTarget.style.background = CREAM }}
        >
          Découvrir tout ce qui vous attend
        </a>
        <p style={{ marginTop: '1.2rem', fontSize: '0.7rem', color: 'rgba(245,240,232,0.35)', fontFamily: BODY }}>
          Créez votre espace en 2 minutes pour voir l&apos;intérieur.
        </p>
      </section>

      {/* ══════════════════════════════════════════════
          POURQUOI KAATCH — fond sage-dark
          Instrument Serif UNIQUEMENT pour les h3
      ══════════════════════════════════════════════ */}
      <section
        aria-label="Pourquoi Kaatch"
        style={{ padding: '5rem 2.5rem', background: SAGE_DARK, color: CREAM }}
      >
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700, fontSize: '1.6rem',
            color: CREAM, marginBottom: '0.5rem', lineHeight: 1.15,
          }}>
            Pourquoi &quot;Kaatch&quot;&nbsp;?
          </h2>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
            color: 'rgba(245,240,232,0.7)',
            marginBottom: '2.5rem', lineHeight: 1.3,
          }}>
            Good catch. Catch up.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="reveal" style={{
              background: 'rgba(245,240,232,0.06)',
              border: '1px solid rgba(245,240,232,0.08)',
              borderRadius: 14, padding: '2rem', textAlign: 'left',
            }}>
              <h3 style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 400, color: CREAM, marginBottom: '0.5rem' }}>
                Good catch.
              </h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', lineHeight: 1.6, fontFamily: BODY }}>
                La bonne personne. Celle qu&apos;on ne laisse pas partir.
              </p>
            </div>
            <div className="reveal" style={{
              background: 'rgba(245,240,232,0.06)',
              border: '1px solid rgba(245,240,232,0.08)',
              borderRadius: 14, padding: '2rem', textAlign: 'left',
            }}>
              <h3 style={{ fontFamily: SERIF, fontSize: '1.5rem', fontWeight: 400, color: CREAM, marginBottom: '0.5rem' }}>
                Catch up.
              </h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', lineHeight: 1.6, fontFamily: BODY }}>
                Se retrouver. Enfin tous au même endroit.
              </p>
            </div>
          </div>

          <p className="reveal" style={{
            fontSize: '0.95rem', fontWeight: 300,
            color: 'rgba(245,240,232,0.7)',
            lineHeight: 1.75, maxWidth: '36rem', margin: '0 auto', fontFamily: BODY,
          }}>
            Un mariage, c&apos;est exactement ça. Le moment où tout le monde
            se retrouve pour célébrer votre <em>good catch</em>.
            Maintenant, on vous aide à <em>catch up</em>{' '}
            avec tous vos invités, chaque détail, chaque souvenir — sans rien oublier.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING — fond white
      ══════════════════════════════════════════════ */}
      <section
        id="tarifs"
        aria-label="Tarifs Kaatch"
        style={{ padding: '5rem 2.5rem', background: WHITE }}
      >
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700,
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            color: SAGE_DARK, marginBottom: '0.6rem', lineHeight: 1.15,
          }}>
            En ce moment, c&apos;est offert.
          </h2>
          <p style={{
            fontSize: '0.92rem', fontWeight: 300, color: TEXT_MID,
            marginBottom: '2.5rem', maxWidth: '36rem', lineHeight: 1.7, fontFamily: BODY,
          }}>
            Kaatch est en lancement. Les 100 premiers couples accèdent à tout,
            gratuitement, sans limite de temps. En échange, votre avis pour améliorer Kaatch.
            C&apos;est tout. Pas de piège.
          </p>

          {/* Offre de lancement */}
          <div className="reveal" style={{
            background: SAGE, borderRadius: 16, padding: '2.5rem',
            color: CREAM, marginBottom: '2rem', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-4rem', right: '-4rem',
              width: '12rem', height: '12rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }} />
            <span style={{
              display: 'inline-block', fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.12)',
              padding: '0.3rem 0.8rem', borderRadius: 4, marginBottom: '1rem', fontFamily: BODY,
            }}>
              Offre de lancement
            </span>
            <h3 style={{ fontWeight: 700, fontSize: '1.5rem', color: CREAM, marginBottom: '0.6rem', lineHeight: 1.25, fontFamily: BODY }}>
              Accès complet offert pour les 100 premiers couples.
            </h3>
            <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.75)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '28rem', fontFamily: BODY }}>
              Invités illimités, toutes les fonctionnalités, aucune restriction.
            </p>
            <a href="/auth" style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600,
              color: SAGE_DARK, background: CREAM,
              padding: '0.85rem 1.7rem', borderRadius: 8,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = WHITE }}
            onMouseLeave={e => { e.currentTarget.style.background = CREAM }}
            >
              Réserver ma place
            </a>
            <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)', fontFamily: BODY }}>
              Il reste quelques places — premier arrivé, premier servi.
            </p>
          </div>

          <p style={{
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: TEXT_SOFT,
            marginBottom: '1.2rem', fontFamily: BODY,
          }}>
            Ensuite, voici comment les offres seront articulées
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Essentiel', price: '0 €', sub: 'Pour tester, sans engagement', items: ["30 invités, 20 photos", "Faire-part digital et RSVP", "Programme du jour"] },
              { name: 'Mariage', price: '45 €', sub: 'Paiement unique', items: ["Invités illimités, 200 photos", "Faire-part animé, plan de table", "Budget, livre d'or, export"] },
              { name: 'Studio', price: '99 €', sub: 'Bientôt disponible', items: ["Tout le plan Mariage", "Papeterie assortie sur-mesure", "Templates exclusifs, support VIP"] },
            ].map(plan => (
              <div key={plan.name} style={{ background: CREAM, borderRadius: 12, padding: '1.4rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.2rem', fontFamily: BODY }}>
                  {plan.name}
                </h4>
                <p style={{ fontWeight: 700, fontSize: '1.4rem', color: SAGE_DARK, fontFamily: BODY }}>{plan.price}</p>
                <p style={{ fontSize: '0.68rem', color: TEXT_SOFT, marginBottom: '0.8rem', fontFamily: BODY }}>{plan.sub}</p>
                <ul style={{ listStyle: 'none' }}>
                  {plan.items.map(item => (
                    <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, marginBottom: '0.3rem', fontFamily: BODY }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ — fond cream, blocs TOUJOURS ouverts
      ══════════════════════════════════════════════ */}
      <section
        id="faq"
        aria-label="Questions fréquentes"
        style={{ padding: '5rem 2.5rem', background: CREAM }}
      >
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700, fontSize: '1.6rem',
            color: SAGE_DARK, marginBottom: '2.5rem', lineHeight: 1.15,
          }}>
            On répond avant que vous demandiez.
          </h2>

          {[
            {
              q: "Mes invités doivent créer un compte ?",
              a: "Non, jamais. Chaque invité reçoit un lien unique. Un clic et il accède à tout — sans mot de passe, sans inscription, sans application à télécharger.",
            },
            {
              q: "Et les prestataires ?",
              a: "Vous leur donnez un accès en lecture seule. Le traiteur voit les régimes alimentaires à jour, le photographe a le programme — et personne ne vous appelle à 23h pour \"juste une petite info\".",
            },
            {
              q: "On peut garder un faire-part papier ?",
              a: "Évidemment. Le lien Kaatch ou le QR code se glisse sur n'importe quel support — papier, e-mail, WhatsApp, pigeon voyageur. Le digital complète le papier, il ne le remplace pas.",
            },
            {
              q: "Nos données et nos photos sont en sécurité ?",
              a: "Tout est chiffré et hébergé en Europe. On ne revend rien, on ne partage rien. Vous restez propriétaires de tout ce que vous publiez.",
            },
            {
              q: "Et après le mariage ?",
              a: "Votre espace reste actif. Les photos, le livre d'or, la playlist — tout est téléchargeable quand vous voulez, même 5 ans après pour une bonne crise de nostalgie.",
            },
            {
              q: "C'est compliqué à mettre en place ?",
              a: "Vous créez votre espace en 2 minutes. Vous ajoutez vos invités. Vous envoyez les liens. C'est tout. Si vous savez envoyer un message, vous savez utiliser Kaatch.",
            },
            {
              q: "Kaatch fonctionne sur téléphone ?",
              a: "Oui, entièrement. L'espace mariés comme l'espace invités sont conçus mobile-first. Aucune application à télécharger — tout fonctionne depuis le navigateur.",
            },
          ].map((item, i) => (
            <div key={i} className="reveal" style={{
              padding: '1.3rem 0',
              borderBottom: `1px solid ${CREAM_MID}`,
            }}>
              <h3 style={{
                fontWeight: 500, fontSize: '0.95rem',
                color: SAGE_DARK, marginBottom: '0.5rem', fontFamily: BODY,
              }}>
                {item.q}
              </h3>
              <p style={{ fontSize: '0.86rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.7, fontFamily: BODY }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL — fond sage-dark
      ══════════════════════════════════════════════ */}
      <section
        style={{ padding: '5rem 2.5rem', textAlign: 'center', background: SAGE_DARK, color: CREAM }}
      >
        <h2 style={{
          fontFamily: BODY, fontWeight: 700,
          fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
          marginBottom: '0.8rem', color: CREAM, lineHeight: 1.15,
        }}>
          Prêts à tout centraliser&nbsp;?
        </h2>
        <p style={{
          fontSize: '0.88rem', fontWeight: 300,
          color: 'rgba(245,240,232,0.6)',
          marginBottom: '2rem', maxWidth: '28rem',
          marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6, fontFamily: BODY,
        }}>
          Créez votre espace en 2 minutes. C&apos;est gratuit pour les 100 premiers couples,
          et on est là si vous avez des questions.
        </p>
        <a href="/auth" style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: BODY, fontSize: '0.88rem', fontWeight: 600,
          color: SAGE_DARK, background: CREAM,
          padding: '0.85rem 1.7rem', borderRadius: 8,
          textDecoration: 'none', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = WHITE }}
        onMouseLeave={e => { e.currentTarget.style.background = CREAM }}
        >
          Créer mon espace mariage
        </a>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '4rem 2.5rem', background: CREAM, borderTop: `1px solid ${CREAM_MID}` }}>
        <div style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_SOFT, marginBottom: '1rem', fontFamily: BODY }}>
            Contact
          </p>
          <h2 style={{
            fontFamily: BODY, fontWeight: 700,
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.15,
          }}>
            Une question ? Une idée ?
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 300, color: TEXT_MID, marginBottom: '2rem', lineHeight: 1.7, fontFamily: BODY }}>
            On vous répond dans la journée.
          </p>
          <div style={{ background: WHITE, borderRadius: 16, padding: '2rem' }}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{
        padding: '2rem 2.5rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        fontSize: '0.72rem', color: TEXT_SOFT,
        background: CREAM, borderTop: `1px solid ${CREAM_MID}`,
        fontFamily: BODY,
      }}>
        <span>Kaatch — fait à Paris, avec des vrais humains dedans.</span>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Fonctionnalités', href: '#fonctionnalites' },
            { label: 'Tarifs', href: '#tarifs' },
            { label: 'Questions', href: '#faq' },
            { label: 'Mentions légales', href: '/mentions-legales' },
            { label: 'Confidentialité', href: '/politique-de-confidentialite' },
            { label: 'Contact', href: 'mailto:bonjour@kaatch.fr' },
            { label: 'Instagram', href: 'https://instagram.com/kaatch.fr' },
          ].map(l => (
            <a key={l.href} href={l.href}
               style={{ color: TEXT_SOFT, textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseEnter={e => { e.currentTarget.style.color = SAGE }}
               onMouseLeave={e => { e.currentTarget.style.color = TEXT_SOFT }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>

      {/* Email popup — apparaît après 12s si email pas encore capturé */}
      <EmailPopup />

      {/* Product Hunt badge */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: CREAM }}>
        <a href="https://www.producthunt.com/products/kaatch?embed=true&utm_source=embed&utm_medium=post_embed"
           target="_blank" rel="noopener noreferrer"
           style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${CREAM_MID}`, borderRadius: 12, padding: '0.6rem 1rem', background: WHITE, textDecoration: 'none', transition: 'border-color 0.2s' }}>
          <img src="https://ph-files.imgix.net/3fcc3c1c-fd88-4f87-a9fe-f2b47ec6f6e2.png?auto=format&fit=crop&w=80&h=80"
               alt="Kaatch sur Product Hunt" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontSize: '0.82rem', color: TEXT_MID, fontFamily: BODY, fontWeight: 400 }}>
            Retrouvez Kaatch sur{' '}
            <strong style={{ fontWeight: 600, color: '#FF6154' }}>Product Hunt</strong>
          </span>
        </a>
      </div>

    </main>
  )
}
