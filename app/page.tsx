import KaatchChatLanding from './_components/KaatchChatLanding'
import ContactForm from './_components/ContactForm'
function FAQ() {
  const items = [
    {
      q: 'Mes invités doivent-ils créer un compte ?',
      a: 'Non, jamais. Chaque invité reçoit un lien unique à son prénom. Il accède directement à son espace — RSVP, programme, album photo — sans inscription, sans mot de passe.',
    },
    {
      q: 'Que se passe-t-il après le mariage ? Mes données sont conservées ?',
      a: 'Vos données (photos, messages, liste d'invités) restent accessibles aussi longtemps que votre espace est actif. Vous pouvez tout télécharger à tout moment.',
    },
    {
      q: 'Puis-je passer du plan gratuit au plan Mariage plus tard ?',
      a: 'Oui, à tout moment. Vos données et votre espace sont entièrement conservés. Vous n'avez pas à recommencer de zéro.',
    },
    {
      q: 'Mes données sont-elles sécurisées ?',
      a: 'Kaatch est hébergé en Europe, les données sont chiffrées et ne sont jamais revendues ni partagées. Vous restez propriétaire de tout ce que vous publiez.',
    },
    {
      q: 'Kaatch fonctionne-t-il sur téléphone ?',
      a: 'Oui, entièrement. L'espace mariés comme l'espace invités sont conçus mobile-first. Aucune application à télécharger — tout fonctionne depuis le navigateur.',
    },
  ]

  return (
    <section className="py-28 px-10 bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 500 }}>FAQ</p>
        <h2 style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-12">
          Les questions qu'on nous pose souvent.
        </h2>
        <div className="divide-y divide-stone-100">
          {items.map((item, i) => (
            <details key={i} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 list-none" style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 600, fontSize: '0.95rem', color: '#2C3B2E' }}>
                {item.q}
                <span className="shrink-0 w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-open:rotate-45 transition-transform text-xs">
                  +
                </span>
              </summary>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// Police display moderne : Geist Sans (= Inter/Satoshi déjà chargé dans layout.tsx)
const DISPLAY = 'var(--font-geist-sans)'
// Couleur titres accroche
const GREEN = '#2C3B2E'
// Shadow douce réutilisable
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

export default function Home() {
  const steps = [
    {
      n: '01',
      title: 'Un espace créé en deux minutes',
      desc: 'Les prénoms, la date, le lieu, une photo de couverture — et c\'est parti. Aucun paramétrage complexe, aucun manuel à lire.',
    },
    {
      n: '02',
      title: 'Un mariage organisé sur mesure',
      sub: [
        { icon: '💌', label: 'Invités & faire-parts', detail: 'Liste, RSVP, faire-parts personnalisés à chaque prénom' },
        { icon: '🪑', label: 'Plan de table', detail: 'Glisse-dépose, récap imprimable, mise à jour instantanée' },
        { icon: '💰', label: 'Budget', detail: 'Devis, dépenses, prestataires — tout au même endroit' },
        { icon: '📅', label: 'Programme & Jour J', detail: 'Déroulé de la journée visible par les invités en temps réel' },
      ],
    },
    {
      n: '03',
      title: 'Chaque invité reçoit son lien personnel',
      desc: 'Chaque invité accède à un espace à son prénom — RSVP, programme, messagerie, album. Sans créer de compte. Sans appeler les mariés pour savoir où se garer.',
    },
    {
      n: '04',
      title: 'Le jour J, on lève les yeux',
      desc: 'Un QR code posé sur les tables, les invités déposent leurs photos, le programme est accessible depuis leur téléphone. Tout le monde profite.',
    },
    {
      n: '05',
      title: 'Après le mariage, tout reste',
      desc: 'Photos, messages, souvenirs — tout est centralisé, consultable, téléchargeable. Pour toujours.',
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kaatch',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    url: 'https://kaatch.fr',
    description: 'Application d\'organisation de mariage : invitations personnalisées, RSVP, plan de table, album photo partagé.',
    offers: {
      '@type': 'Offer',
      price: '45',
      priceCurrency: 'EUR',
      description: 'Plan Mariage — paiement unique',
    },
    inLanguage: 'fr',
  }

  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-8 md:px-10 h-16 flex items-center justify-between">
          <a href="/" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}
             className="text-[#2C3B2E]">
            Kaatch
          </a>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Comment ça marche', href: '#comment' },
              { label: 'Offres', href: '#offres' },
              { label: 'Guide', href: '/guide' },
              { label: 'Tarifs', href: '/pricing' },
            ].map(l => (
              <a key={l.href} href={l.href}
                 className="text-sm text-stone-500 hover:text-[#2C3B2E] transition" style={{ fontWeight: 400 }}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth" className="text-sm text-stone-500 hover:text-[#2C3B2E] transition hidden sm:block" style={{ fontWeight: 400 }}>
              Connexion
            </a>
            <a href="/auth"
               className="text-sm bg-[#2C3B2E] text-white px-5 py-2.5 rounded-2xl hover:bg-[#1a2419] transition"
               style={{ fontWeight: 500 }}>
              Mon espace
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 min-h-screen grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-10 md:px-20 py-24 max-w-xl mx-auto md:mx-0 md:ml-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-7" style={{ fontWeight: 500 }}>
            Organisation de mariage
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-7">
            Combien de groupes WhatsApp pour ce mariage ?
          </h1>
          <p className="text-stone-600 mb-10" style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
            Les infos éparpillées, les tableurs jamais à jour, les invités qui n'ont pas vu le message…
            <br />
            Kaatch regroupe tout — pour les mariés, et pour les invités.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/auth"
               className="inline-block bg-[#2C3B2E] text-white px-8 py-4 rounded-2xl hover:bg-[#1a2419] transition text-sm text-center"
               style={{ fontWeight: 500, letterSpacing: '0.01em' }}>
              Mon espace →
            </a>
            <a href="#video"
               className="inline-block border border-stone-300 text-stone-500 px-8 py-4 rounded-2xl hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition text-sm text-center"
               style={{ fontWeight: 400 }}>
              ▶ Voir la démo
            </a>
          </div>
          <p className="mt-4 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#2C3B2E] transition">Invité(e) à un mariage ? →</a>
          </p>
          <p className="mt-10 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Aucune carte bleue demandée. L'espace est prêt en 2 minutes.
          </p>
        </div>

        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(30,28,24,0.12)' }} />
          {/* Carte Emma & Luc */}
          <div className="absolute bottom-14 left-10 bg-white/95 backdrop-blur-sm px-6 py-5 max-w-[240px]"
               style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(44,59,46,0.18), 0 2px 8px rgba(44,59,46,0.08)' }}>
            <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: '#2C3B2E', marginBottom: 4 }}>
              Emma & Luc 💍
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#78716c' }}>
              127 invités · 12 tables · 3 groupes WhatsApp de moins
            </p>
          </div>
        </div>
      </section>

      {/* ── VIDÉO DÉMO ── */}
      <section id="video" className="py-28 px-10 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>En action</p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-10">
            Kaatch en 2 minutes
          </h2>
          {/* Placeholder démo — à remplacer par votre vidéo Loom/YouTube */}
          <div className="relative w-full rounded-2xl overflow-hidden"
               style={{ paddingBottom: '56.25%', background: 'linear-gradient(135deg, #2C3B2E 0%, #1a2419 100%)', boxShadow: SHADOW }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
              {/* Icône play */}
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-3xl ml-1">▶</span>
              </div>
              <div className="text-center">
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: 8 }}>
                  Démo disponible sur demande
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  Créez un espace gratuit et découvrez toutes les fonctionnalités en 2 minutes.
                </p>
              </div>
              <a href="/auth"
                 className="inline-block bg-white text-[#2C3B2E] px-7 py-3 rounded-2xl hover:bg-[#f5f0e8] transition text-sm"
                 style={{ fontWeight: 600 }}>
                Essayer gratuitement →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 BÉNÉFICES ── */}
      <section className="py-28 px-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20">
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Ce que ça change</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] max-w-xl">
              Un mariage mérite mieux qu'un tableur partagé.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                photo: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80&auto=format&fit=crop',
                title: 'Des invitations qui font leur effet',
                desc: 'Chaque invité reçoit un faire-part avec son prénom et un lien unique. Il confirme sa présence en un clic, les réponses apparaissent en temps réel.',
              },
              {
                photo: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80&auto=format&fit=crop',
                title: 'Un plan de table sans prise de tête',
                desc: "Glisser les invités sur leurs tables, ajuster jusqu'au dernier moment. Le récap est prêt à imprimer. Fini le tableur partagé que personne n'arrive à modifier.",
              },
              {
                photo: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80&auto=format&fit=crop',
                title: 'Un album qui se remplit tout seul',
                desc: "Les invités déposent leurs photos depuis leur téléphone. Tout se retrouve au même endroit, sans courir après les AirDrops et les Google Drive partagés.",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="rounded-2xl overflow-hidden h-56 mb-6"
                     style={{ boxShadow: SHADOW }}>
                  <img src={item.photo} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}
                    className="text-[#2C3B2E] mb-3">{item.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.85 }} className="text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment" className="py-28 px-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 items-start">
          <div className="md:sticky md:top-24">
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Comment ça marche</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] mb-6">
              Simple comme bonjour.
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85 }} className="text-stone-500">
              Aucune formation, aucun manuel. On commence et on comprend. Les invités aussi — sans même créer un compte.
            </p>
            <div className="mt-10">
              <a href="/auth"
                 className="inline-block bg-[#2C3B2E] text-white px-9 py-4 rounded-2xl hover:bg-[#1a2419] transition text-sm"
                 style={{ fontWeight: 500 }}>
                Commencer →
              </a>
            </div>
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-7">
                <div className="flex flex-col items-center shrink-0">
                  {/* Numéro grand, vert foncé */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                       style={{ background: '#2C3B2E', boxShadow: SHADOW }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1rem', color: 'white', letterSpacing: '-0.01em' }}>
                      {step.n}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 mt-3 min-h-[2.5rem]"
                         style={{ background: 'linear-gradient(to bottom, #2C3B2E30, transparent)' }} />
                  )}
                </div>
                <div className="flex-1 pb-2 pt-2">
                  <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}
                      className="text-[#2C3B2E] mb-3">{step.title}</h3>
                  {'desc' in step && step.desc && (
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.85 }} className="text-stone-500">{step.desc}</p>
                  )}
                  {'sub' in step && step.sub && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {step.sub.map((s) => (
                        <div key={s.label} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-4"
                             style={{ boxShadow: SHADOW }}>
                          <span className="text-lg mt-0.5">{s.icon}</span>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: DISPLAY }} className="text-[#2C3B2E] mb-0.5">{s.label}</p>
                            <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-stone-500">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section id="offres" className="py-28 px-10 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Offres</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] mb-3">
              Aucune mauvaise surprise.
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85 }} className="text-stone-500">
              Un tarif unique, un seul paiement. Aucun abonnement caché. Prix en euros.
            </p>
          </div>

          <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start flex overflow-x-auto gap-5 snap-x snap-mandatory pb-4 -mx-2 px-2">

            {/* Gratuit */}
            <div className="bg-[#f5f0e8] rounded-2xl p-8 flex flex-col min-w-[280px] snap-start md:min-w-0"
                 style={{ boxShadow: SHADOW }}>
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3" style={{ fontWeight: 500 }}>Gratuit</p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.6rem', lineHeight: 1, letterSpacing: '-0.03em' }}
                   className="text-[#2C3B2E]">0</p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mt-2">Pour découvrir</p>
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {['1 événement', '30 invités maximum', '20 photos', 'RSVP basique', 'Gestion budget'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                    <span className="text-[#2C3B2E] mt-0.5 shrink-0 font-bold">✓</span>{f}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-xs text-stone-400 italic" style={{ fontWeight: 300 }}>
                  <span className="mt-0.5 shrink-0 text-stone-300">·</span>Logo Kaatch visible <span className="not-italic">(mais discret !&nbsp;😉)</span>
                </li>
              </ul>
              <a href="/auth"
                 className="w-full text-center border-2 border-stone-300 text-stone-500 px-6 py-3 rounded-2xl hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition text-sm"
                 style={{ fontWeight: 500 }}>
                Commencer gratuitement
              </a>
            </div>

            {/* Mariage — mis en avant */}
            <div className="rounded-2xl p-8 flex flex-col relative min-w-[280px] snap-start md:min-w-0"
                 style={{ background: '#2C3B2E', boxShadow: '0 8px 40px rgba(44,59,46,0.25), 0 2px 8px rgba(44,59,46,0.12)' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#f5f0e8] text-[#2C3B2E] text-xs px-4 py-1.5 rounded-full whitespace-nowrap border border-[#2C3B2E]/20"
                      style={{ fontWeight: 600 }}>
                  ✦ Prix de lancement — jusqu'au 31 mai
                </span>
              </div>
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-white/70 mb-3" style={{ fontWeight: 500 }}>💍 Mariage</p>
                <div className="flex items-end gap-3">
                  <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.6rem', lineHeight: 1, letterSpacing: '-0.03em' }}
                     className="text-white">45</p>
                  <p style={{ fontWeight: 300, fontSize: '0.9rem', textDecoration: 'line-through' }}
                     className="text-white/55 mb-1">65</p>
                </div>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-white/65 mt-2">Paiement unique · 1 mariage</p>
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {['Invités illimités', 'Photos illimitées', 'RSVP complet', 'Invitation à plusieurs moments de la fête', 'Plan de table', 'Gestion budget', 'Site personnalisé', 'Sans branding Kaatch'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/85" style={{ fontWeight: 300 }}>
                    <span className="text-white/80 mt-0.5 shrink-0 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/auth"
                 className="w-full text-center bg-white text-[#2C3B2E] px-6 py-3 rounded-2xl hover:bg-[#f5f0e8] transition text-sm"
                 style={{ fontWeight: 600 }}>
                Créer mon espace →
              </a>
            </div>

            {/* Pro */}
            <div className="bg-[#f5f0e8] rounded-2xl p-8 flex flex-col min-w-[280px] snap-start md:min-w-0"
                 style={{ boxShadow: SHADOW }}>
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3" style={{ fontWeight: 500 }}>👔 Planificateur Pro</p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.6rem', lineHeight: 1, letterSpacing: '-0.03em' }}
                   className="text-[#2C3B2E]">
                  49<span style={{ fontSize: '1.1rem', fontWeight: 400 }} className="text-stone-400">/mois</span>
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mt-2">ou 399/an — 2 mois offerts</p>
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {['Mariages illimités', 'Tout ce qui est dans Mariage', 'Dashboard multi-événements', 'Support prioritaire', 'Accès anticipé aux nouvelles features'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                    <span className="text-[#2C3B2E] mt-0.5 shrink-0 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/auth"
                 className="w-full text-center bg-[#2C3B2E] text-white px-6 py-3 rounded-2xl hover:bg-[#1a2419] transition text-sm"
                 style={{ fontWeight: 500 }}>
                Essayer Pro →
              </a>
            </div>

          </div>

          <p className="text-center mt-10 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Aucune carte bleue requise pour le plan gratuit · Paiement sécurisé · Accès immédiat · Prix en euros
          </p>
          <div className="mt-10 text-center border-t border-stone-200 pt-10">
            <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '1rem' }}
               className="text-stone-500 mb-2">
              Vous êtes wedding planner ou professionnel de l'événementiel ?
            </p>
            <a href="mailto:bonjour@kaatch.fr?subject=Kaatch%20Pro%20%E2%80%94%20Parlons-en"
               className="text-sm text-[#2C3B2E] hover:underline"
               style={{ fontWeight: 400 }}>
              Parlons-en → bonjour@kaatch.fr
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── CTA FINAL ── */}
      <section className="py-32 px-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-5" style={{ fontWeight: 500 }}>Alors ?</p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-6">
            Votre mariage mérite mieux que trois groupes WhatsApp.
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.9 }} className="text-stone-500 mb-10">
            L'espace est prêt en deux minutes. Les invités n'ont pas besoin de créer un compte.
            Et quelques groupes WhatsApp de moins, ça ne fait pas de mal.
          </p>
          <a href="/auth"
             className="inline-block bg-[#2C3B2E] text-white px-14 py-4.5 rounded-2xl hover:bg-[#1a2419] transition text-sm"
             style={{ fontWeight: 500, letterSpacing: '0.01em', padding: '1rem 3.5rem' }}>
            Mon espace →
          </a>
          <p className="mt-6 text-sm text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#2C3B2E] transition">Invité(e) à un mariage ? Rejoindre →</a>
          </p>
        </div>
      </section>

      {/* ── CHATBOT ── */}
      <KaatchChatLanding />

      {/* ── CONTACT ── */}
      <section className="py-24 px-10 bg-[#f5f0e8] border-t border-stone-200">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Contact</p>
          <h2
            style={{ fontFamily: 'var(--font-geist-sans)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-2"
          >
            Une question ?
          </h2>
          <p className="text-stone-500 mb-10" style={{ fontSize: '0.95rem', lineHeight: 1.8, fontWeight: 300 }}>
            On vous répond dans la journée.
          </p>
          <div className="bg-white/70 rounded-2xl p-8 shadow-sm border border-stone-100">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 py-12 px-10 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}
                  className="text-stone-500">Kaatch</span>
            <div className="flex items-center gap-5 flex-wrap justify-center">
              {[
                { label: 'Comment ça marche', href: '#comment' },
                { label: 'Offres', href: '#offres' },
                { label: 'Guide', href: '/guide' },
                { label: 'Espace invités', href: '/rejoindre' },
              ].map(l => (
                <a key={l.href} href={l.href}
                   className="text-sm text-stone-400 hover:text-[#2C3B2E] transition" style={{ fontWeight: 300 }}>
                  {l.label}
                </a>
              ))}
            </div>
            <a href="/auth" className="text-sm text-[#2C3B2E] hover:underline" style={{ fontWeight: 400 }}>Connexion →</a>
          </div>
          {/* Barre légale */}
          <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
              © 2025 Kaatch — <a href="mailto:bonjour@kaatch.fr" className="hover:text-[#2C3B2E] transition">bonjour@kaatch.fr</a>
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: 'Mentions légales', href: '/mentions-legales' },
                { label: 'CGV', href: '/cgv' },
                { label: 'Confidentialité', href: '/politique-de-confidentialite' },
              ].map(l => (
                <a key={l.href} href={l.href}
                   className="text-xs text-stone-400 hover:text-[#2C3B2E] transition" style={{ fontWeight: 300 }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
