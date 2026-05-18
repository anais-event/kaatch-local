import Image from 'next/image'
import ContactForm from './_components/ContactForm'
import PublicNav from './_components/PublicNav'
import ForumEmbed from './_components/ForumEmbed'
import ScrollReveal from './_components/ScrollReveal'
import FeatureTicker from './_components/FeatureTicker'

const DISPLAY = 'var(--font-display)'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

function FAQ() {
  const items = [
    {
      q: "Mes invités doivent-ils créer un compte ?",
      a: "Non, jamais. Chaque invité reçoit un lien unique à son prénom. Il accède directement à son espace — RSVP, programme, album photo — sans inscription, sans mot de passe.",
    },
    {
      q: "Que se passe-t-il après le mariage ? Mes données sont conservées ?",
      a: "Vos données (photos, messages, liste d'invités) restent accessibles aussi longtemps que votre espace est actif. Vous pouvez tout télécharger à tout moment.",
    },
    {
      q: "Puis-je passer du plan gratuit au plan Mariage plus tard ?",
      a: "Oui, à tout moment. Vos données et votre espace sont entièrement conservés. Vous n'avez pas à recommencer de zéro.",
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "Kaatch est sécurisé, les données sont chiffrées et ne sont jamais revendues ni partagées. Vous restez propriétaire de tout ce que vous publiez.",
    },
    {
      q: "Kaatch fonctionne-t-il sur téléphone ?",
      a: "Oui, entièrement. L'espace mariés comme l'espace invités sont conçus mobile-first. Aucune application à télécharger — tout fonctionne depuis le navigateur.",
    },
  ]

  return (
    <section className="py-28 px-10 bg-white border-t border-stone-100">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontFamily: DISPLAY, fontWeight: 500 }}>FAQ</p>
        <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-12">
          Les questions qu&apos;on nous pose souvent.
        </h2>
        <div className="divide-y divide-stone-100">
          {items.map((item, i) => (
            <details key={i} className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 list-none" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.95rem', color: '#2C3B2E' }}>
                {item.q}
                <span className="shrink-0 w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400 group-open:rotate-45 transition-transform text-xs">+</span>
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

export default function Home() {
  const backstage = [
    { icon: '📋', label: "Rétro-planning", detail: "Toutes les étapes de J-12 mois au jour J, dans l'ordre." },
    { icon: '💌', label: "Faire-parts & RSVP", detail: "Lien personnel par invité, réponses qui tombent en direct." },
    { icon: '🪑', label: "Plan de table", detail: "Glisser-déposer, ajusté jusqu'à la veille." },
    { icon: '💰', label: "Budget global", detail: "Devis, dépenses, prestataires — tout sous les yeux." },
    { icon: '🤝', label: "Prestataires", detail: "Coordonnées, contrats, paiements — finis les mails fouillés." },
    { icon: '📅', label: "Programme jour J", detail: "Le déroulé de la journée. Vos témoins respirent." },
    { icon: '🎵', label: "Playlist & animations", detail: "Construire la bande-son, des idées pour animer la soirée." },
  ]

  const scene = [
    { icon: '🔗', label: "Lien magique", detail: "Pas de compte à créer. Le lien dans le faire-part, et ils sont chez vous." },
    { icon: '📅', label: "Programme du jour", detail: "Sans avoir à déranger qui que ce soit." },
    { icon: '📝', label: "Livre d'or", detail: "Mots doux, vidéos, souvenirs — le tout depuis leur téléphone." },
    { icon: '🏠', label: "Hébergements", detail: "Vos suggestions de logements, en un clic." },
    { icon: '💬', label: "Messagerie", detail: "Discussion directe entre invités." },
    { icon: '📸', label: "Album partagé", detail: "Toutes les photos, au même endroit, pour tout le monde." },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kaatch',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    url: 'https://kaatch.fr',
    description: "Application d'organisation de mariage : invitations personnalisées, RSVP, plan de table, album photo partagé.",
    offers: { '@type': 'Offer', price: '45', priceCurrency: 'EUR', description: 'Plan Mariage — paiement unique' },
    inLanguage: 'fr',
  }

  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── NAV ── */}
      <PublicNav />

      {/* ── HERO ── */}
      <section className="hero-gradient pt-16 md:min-h-screen grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 md:px-20 py-16 md:py-24 max-w-xl mx-auto md:mx-0 md:ml-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-7" style={{ fontWeight: 500 }}>
            La solution qui vous simplifie la vie
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-7">
            Tout pour l&apos;organisation de votre mariage.{' '}
            <span style={{ color: '#4a5240' }}>Au même endroit.</span>
          </h1>
          <div className="text-stone-600 mb-10" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
            <p>
              Préparer un mariage, c&apos;est pas de l&apos;impro. C&apos;est 1000 décisions, 20 prestataires,
              des dizaines d&apos;invités, un peu de stress et beaucoup d&apos;argent. On a peur d&apos;oublier
              quelque chose, il faut penser à chaque détail, et l&apos;on peut vite se sentir dépassé.
            </p>
            <p className="mt-4">
              Kaatch centralise tout — c&apos;est un peu comme ranger sa chambre. Une fois qu&apos;on y voit
              plus clair, l&apos;esprit s&apos;apaise, la fête approche, et vous pouvez vous reconcentrer
              sur l&apos;essentiel&nbsp;: Vous.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/auth"
               className="inline-block bg-[#2C3B2E] text-white px-8 py-4 rounded-2xl hover:bg-[#1a2419] transition text-sm text-center"
               style={{ fontWeight: 500, letterSpacing: '0.01em' }}>
              Je me connecte à mon espace →
            </a>
            <a href="/rejoindre"
               className="inline-block border border-stone-300 text-stone-500 px-8 py-4 rounded-2xl hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition text-sm text-center"
               style={{ fontWeight: 400 }}>
              Invité(e) à un mariage ? →
            </a>
          </div>
        </div>

        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(30,28,24,0.12)' }} />
          <div className="absolute bottom-14 left-10 bg-white/95 backdrop-blur-sm px-6 py-5 max-w-[240px]"
               style={{ borderRadius: 16, boxShadow: '0 8px 32px rgba(44,59,46,0.18), 0 2px 8px rgba(44,59,46,0.08)' }}>
            <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: '#2C3B2E', marginBottom: 4 }}>
              Emma &amp; Luc
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#78716c' }}>
              127 invités · 12 tables · 1 seule app. 0 stress.
            </p>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <FeatureTicker />

      {/* ── POURQUOI KAATCH ── */}
      <section className="py-16 md:py-28 px-6 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-5" style={{ fontWeight: 500 }}>
            Pourquoi &quot;Kaatch&quot; ?
          </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal delay={100}>
            <div>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}
                  className="text-[#2C3B2E] mb-6">
                Good catch. Catch up.
              </h2>
              <p className="text-stone-600 mb-5" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
                En anglais, &quot;catch&quot; veut dire deux choses.
              </p>
              <div className="mb-5 flex flex-col gap-3">
                <p style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, color: '#2C3B2E' }}>Good catch&nbsp;:</span>{' '}
                  <span className="text-stone-600">La bonne personne. Celle qu&apos;on ne laisse pas partir.</span>
                </p>
                <p style={{ fontSize: '1rem', lineHeight: 1.7 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, color: '#2C3B2E' }}>Catch up&nbsp;:</span>{' '}
                  <span className="text-stone-600">Se retrouver. Enfin tous au même endroit.</span>
                </p>
              </div>
              <p className="text-stone-600" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
                Un mariage, c&apos;est exactement ça. Le moment où tout le monde se retrouve pour célébrer votre{' '}
                <em style={{ color: '#2C3B2E' }}>good catch</em>.
                Maintenant, on vous aide à <em style={{ color: '#2C3B2E' }}>catch up</em>{' '}
                avec tous vos invités, chaque détail, chaque souvenir — sans rien oublier.
              </p>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
            <div className="flex flex-col gap-5">
              <div className="bg-[#f5f0e8] rounded-2xl p-7" style={{ boxShadow: SHADOW }}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
                   className="text-[#2C3B2E] mb-2">Good catch.</p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7 }}>
                  La bonne personne. Celle qu&apos;on ne laisse pas partir.
                </p>
              </div>
              <div className="bg-[#f5f0e8] rounded-2xl p-7" style={{ boxShadow: SHADOW }}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
                   className="text-[#2C3B2E] mb-2">Catch up.</p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7 }}>
                  Se retrouver. Enfin tous au même endroit.
                </p>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── FORUM EMBED ── */}
      <ForumEmbed />

      {/* ── 1 MARIAGE, 2 ACCÈS ── */}
      <section id="comment-ca-marche" className="py-16 md:py-28 px-6 md:px-10 bg-[#f5f0e8] border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>1 mariage · 2 accès</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] max-w-2xl">
              Le backstage et la scène. Chacun son espace, le même mariage.
            </h2>
            <p className="mt-4 text-stone-600 max-w-xl" style={{ fontSize: '0.95rem', lineHeight: 1.85 }}>
              Un seul mariage. Deux portes d&apos;entrée : une pour vous (les régisseurs), une pour vos invités (les spectateurs ravis).
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal delay={0}>
            <div className="bg-white rounded-[28px] overflow-hidden" style={{ boxShadow: SHADOW }}>
              <div className="h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80&auto=format&fit=crop"
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#2C3B2E]" style={{ fontWeight: 600 }}>Backstage</span>
                  <span className="text-xs text-stone-400">— pour les mariés</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}
                    className="text-[#2C3B2E] mb-5">
                  Tout ce qu&apos;il faut pour une organisation simple et efficace.
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {backstage.map(b => (
                    <div key={b.label} className="flex items-start gap-2.5 bg-[#f5f0e8] rounded-xl px-3.5 py-3">
                      <span className="text-base mt-0.5 shrink-0">{b.icon}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.78rem', fontFamily: DISPLAY }} className="text-[#2C3B2E]">{b.label}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.7rem', lineHeight: 1.5 }} className="text-stone-500 mt-0.5">{b.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Scène — invités */}
            <ScrollReveal delay={150}>
            <div className="rounded-[28px] overflow-hidden" style={{ background: '#2C3B2E', boxShadow: '0 8px 40px rgba(44,59,46,0.25), 0 2px 8px rgba(44,59,46,0.12)' }}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80&auto=format&fit=crop"
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0" style={{ background: 'rgba(44,59,46,0.25)' }} />
              </div>
              <div className="p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/80" style={{ fontWeight: 600 }}>La scène</span>
                  <span className="text-xs text-white/50">— pour les invités</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}
                    className="mb-4">
                  Un lien dans le faire-part. Et ils sont chez vous.
                </h3>
                <p className="text-white/65 text-sm mb-5" style={{ lineHeight: 1.7 }}>
                  Pas de compte à créer. Vos invités cliquent sur leur lien personnel — papier ou numérique, vous choisissez — et accèdent à tout.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {scene.map(s => (
                    <div key={s.label} className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                         style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-base mt-0.5 shrink-0">{s.icon}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.78rem', fontFamily: DISPLAY }}>{s.label}</p>
                        <p style={{ fontWeight: 300, fontSize: '0.7rem', lineHeight: 1.5 }} className="text-white/55 mt-0.5">{s.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-white/40 text-xs italic" style={{ lineHeight: 1.6 }}>
                  Vous préférez un faire-part papier ? Aucun problème — le lien Kaatch peut y figurer aussi.
                </p>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── L'ALBUM ── */}
      <section className="py-16 md:py-28 px-6 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: SHADOW, height: 400 }}>
            <img
              src="/On the spot.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Le plus croustillant</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] mb-5">
              L&apos;album photo partagé entre tout le monde.
            </h2>
            <p className="text-stone-600 mb-4" style={{ fontSize: '1rem', lineHeight: 1.85 }}>
              Plus de Google Drive perdus, plus de groupes Facebook saturés, plus de centaines de messages WhatsApp avec le fameux &quot;tu m&apos;enverras les photos hein ?&quot;.
            </p>
            <p className="text-stone-600" style={{ fontSize: '1rem', lineHeight: 1.85 }}>
              Un QR code sur les tables, les invités déposent leurs photos en deux 2 clics. Tout atterrit au même endroit, vous décidez ce que vous gardez. Et dans dix ans, c&apos;est toujours là.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {['Sans groupe Facebook', 'Sans Google Drive', 'Sans WhatsApp galère', 'Sans relancer personne'].map(t => (
                <span key={t} className="px-4 py-2 rounded-full border border-stone-200 bg-[#f5f0e8] text-sm text-stone-600" style={{ fontWeight: 300 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section id="offres" className="relative py-16 md:py-28 px-6 md:px-10 bg-white border-t border-stone-100 overflow-hidden">
        {/* Decorative number */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none hidden md:block"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(200px, 22vw, 320px)',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(44,59,46,0.06)',
            letterSpacing: '-0.05em',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          45€
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="mb-14">
            <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Offres</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.7rem, 3vw, 2.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] mb-3">
              Aucune mauvaise surprise.
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85 }} className="text-stone-500">
              Un tarif unique, un seul paiement. Pas d&apos;abonnement caché. Prix en euros.
            </p>
          </div>

          <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start flex overflow-x-auto gap-5 snap-x snap-mandatory pb-4 -mx-2 px-2">

            {/* Gratuit */}
            <div className="bg-[#f5f0e8] rounded-2xl p-8 flex flex-col min-w-[280px] snap-start md:min-w-0" style={{ boxShadow: SHADOW }}>
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3" style={{ fontWeight: 500 }}>Gratuit</p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.6rem', lineHeight: 1, letterSpacing: '-0.03em' }}
                   className="text-[#2C3B2E]">0</p>
                <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400 mt-2">Pour découvrir</p>
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {["1 mariage", "jusqu'à 20 invités", 'RSVP basique', 'Suivi budget', "Livre d'or"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-stone-600" style={{ fontWeight: 300 }}>
                    <span className="text-[#2C3B2E] mt-0.5 shrink-0 font-bold">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/auth"
                 className="w-full text-center border-2 border-stone-300 text-stone-500 px-6 py-3 rounded-2xl hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition text-sm"
                 style={{ fontWeight: 500 }}>
                Commencer gratuitement
              </a>
            </div>

            {/* Mariage */}
            <div className="rounded-2xl flex flex-col min-w-[280px] snap-start md:min-w-0 overflow-hidden"
                 style={{ background: '#2C3B2E', boxShadow: '0 8px 40px rgba(44,59,46,0.25), 0 2px 8px rgba(44,59,46,0.12)' }}>
              <div className="flex justify-center pt-5">
                <span className="bg-[#f5f0e8] text-[#2C3B2E] text-xs px-4 py-1.5 rounded-full whitespace-nowrap border border-[#2C3B2E]/20"
                      style={{ fontWeight: 600 }}>
                  ✦ Prix de lancement
                </span>
              </div>
              <div className="px-8 pb-8 pt-4 flex flex-col flex-1">
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
                {[
                  'Invités illimités',
                  'Faire-part animé personnalisé',
                  'Espace invités complet',
                  'Plan de table',
                  'Photos illimitées + téléchargement',
                  'Programme jour J',
                  'RSVP complet',
                ].map(f => (
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
            </div>

            {/* Pro */}
            <div className="bg-[#f5f0e8] rounded-2xl p-8 flex flex-col min-w-[280px] snap-start md:min-w-0" style={{ boxShadow: SHADOW }}>
              <div className="mb-4">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-3" style={{ fontWeight: 500 }}>👔 Planificateur Pro</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-3">
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.01em' }}
                   className="text-[#2C3B2E]">
                  Professionnels ?
                </p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7 }}>
                  Parlons-en 😊
                </p>
                <p className="text-stone-400 text-xs max-w-[180px] mx-auto" style={{ lineHeight: 1.6 }}>
                  Wedding planners, organisateurs d&apos;événements — on a pensé à vous.
                </p>
              </div>
              <a href="mailto:bonjour@kaatch.fr?subject=Kaatch%20Pro%20%E2%80%94%20Parlons-en"
                 className="w-full text-center bg-[#2C3B2E] text-white px-6 py-3 rounded-2xl hover:bg-[#1a2419] transition text-sm"
                 style={{ fontWeight: 500 }}>
                bonjour@kaatch.fr →
              </a>
            </div>

          </div>

          <p className="text-center mt-10 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Aucune carte bleue requise pour le plan gratuit · Paiement sécurisé · Accès immédiat · Prix en euros
          </p>
        </div>
      </section>

      {/* ── STUDIO CRÉATIF ── */}
      <section id="studio" className="py-16 md:py-28 px-6 md:px-10 bg-[#f5f0e8] border-t border-stone-100 overflow-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <ScrollReveal>
          <div className="mb-14 md:mb-20">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4" style={{ fontWeight: 500 }}>Studio Créatif</p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
                className="text-[#2C3B2E] mb-5 max-w-2xl">
              La papeterie de votre mariage,{' '}
              <span style={{ color: '#4a5240', fontStyle: 'italic' }}>créée automatiquement.</span>
            </h2>
            <p className="text-stone-600 max-w-xl" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
              Choisissez une ambiance, on génère vos faire-parts, menus, marque-places et plan de table.
              Imprimés et livrés. Vous n&apos;avez rien d&apos;autre à faire.
            </p>
          </div>
          </ScrollReveal>

          {/* 3 étapes */}
          <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-5 mb-16 md:mb-20">
            {[
              { n: '01', title: 'Choisissez votre ambiance', desc: "Bohème, classique, champêtre, art déco… 5 univers graphiques créés par nos designers." },
              { n: '02', title: 'On génère tout', desc: "Faire-part, menu, marque-place, plan de table — générés automatiquement depuis votre liste d'invités." },
              { n: '03', title: 'Imprimé et livré chez vous', desc: "Impression professionnelle, papier premium, livraison en 5–7 jours ouvrés." },
            ].map(step => (
              <div key={step.n} className="bg-white rounded-2xl p-7 border border-stone-100" style={{ boxShadow: SHADOW }}>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '2.2rem', letterSpacing: '-0.04em', color: 'rgba(74,82,64,0.15)' }}
                   className="mb-3 leading-none">{step.n}</p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}
                   className="text-[#2C3B2E] mb-2">{step.title}</p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          {/* Ambiances carousel */}
          <ScrollReveal delay={150}>
          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-5" style={{ fontWeight: 500 }}>5 ambiances disponibles</p>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 snap-x snap-mandatory">
            {[
              { name: 'Bohème', tag: 'Nature & liberté', color: '#e8e0d4', text: '#5c4f3a', accent: '#a8936a' },
              { name: 'Classique', tag: 'Élégance intemporelle', color: '#e8eae5', text: '#2d3228', accent: '#4a5240' },
              { name: 'Champêtre', tag: 'Douceur & fleurs', color: '#eee8e0', text: '#4a3728', accent: '#8b6e5c' },
              { name: 'Art Déco', tag: 'Glamour des années 20', color: '#1e1a14', text: '#e8d9b8', accent: '#c8a84b' },
              { name: 'Minimaliste', tag: 'Épuré & moderne', color: '#f0eeec', text: '#1c1c1c', accent: '#888888' },
            ].map(a => (
              <div key={a.name} className="shrink-0 snap-start rounded-2xl p-7 flex flex-col justify-between"
                   style={{ background: a.color, width: 200, height: 260, boxShadow: SHADOW }}>
                <div>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em', color: a.text }}>{a.name}</p>
                  <p style={{ fontSize: '0.72rem', color: a.text, opacity: 0.6, fontWeight: 300, marginTop: 4 }}>{a.tag}</p>
                </div>
                <div style={{ width: 32, height: 3, background: a.accent, borderRadius: 2 }} />
              </div>
            ))}
          </div>
          </ScrollReveal>

          {/* Produits */}
          <ScrollReveal delay={200}>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 mb-14">
            {[
              { icon: '💌', name: 'Faire-part',      desc: 'Animé + PDF haute résolution. Lien partageable ou impression papier.' },
              { icon: '🍽️', name: 'Menu',             desc: 'Format A5, généré depuis votre programme et vos choix de repas.' },
              { icon: '📋', name: 'Programme jour J', desc: 'Le déroulé complet, mis en page automatiquement depuis votre planning.' },
              { icon: '🪧', name: 'Marque-places',    desc: "Un par invité, générés en masse depuis votre liste. Zéro saisie manuelle." },
              { icon: '🗺️', name: 'Plan de table',    desc: 'Toutes vos tables et vos invités, mis en page proprement.' },
              { icon: '🔢', name: 'Numéros de table', desc: "Chevalet A5 avec le numéro de chaque table. Imprimé, prêt à poser." },
            ].map(p => (
              <div key={p.name} className="bg-white rounded-2xl p-6 border border-stone-100" style={{ boxShadow: SHADOW }}>
                <span className="text-2xl block mb-3">{p.icon}</span>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}
                   className="text-[#2C3B2E] mb-2">{p.name}</p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7, fontWeight: 300 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={250}>
          <div className="rounded-[28px] overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #4a5240 0%, #2d3228 100%)', boxShadow: '0 8px 40px rgba(44,59,46,0.25)' }}>
            <div className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-white/60 text-xs tracking-[0.2em] uppercase mb-3" style={{ fontWeight: 500 }}>Prix de lancement</p>
                <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
                   className="text-white mb-3">
                  Votre collection de papeterie,{' '}
                  <span style={{ fontWeight: 300, fontSize: '1.1rem', opacity: 0.8 }}>au prix d&apos;un menu.</span>
                </p>
                <p className="text-white/65 text-sm" style={{ fontWeight: 300, lineHeight: 1.7 }}>
                  Impression professionnelle incluse · Livraison 5–7 jours · Papier premium 300g/m²
                </p>
              </div>
              <a href="/budget-mariage"
                 className="shrink-0 bg-white text-[#2C3B2E] px-8 py-4 rounded-2xl hover:bg-[#f5f0e8] transition text-sm text-center whitespace-nowrap"
                 style={{ fontWeight: 600, minWidth: 200 }}>
                Créer ma papeterie →
              </a>
            </div>
          </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── CTA FINAL ── */}
      <section className="py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-5" style={{ fontWeight: 500 }}>Pensé avec amour</p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-6">
            Pour simplifier le plus beau jour d&apos;une vie.
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.9 }} className="text-stone-500 mb-10">
            Vous célébrez votre <em>good catch</em>. On s&apos;occupe du reste — pour que vous, vos témoins et vos
            invités restiez ensemble, présents, et profitiez vraiment.
          </p>
          <a href="/auth"
             className="inline-block bg-[#2C3B2E] text-white rounded-2xl hover:bg-[#1a2419] transition text-sm"
             style={{ fontWeight: 500, letterSpacing: '0.01em', padding: '1rem 3.5rem' }}>
            Je me connecte à mon espace →
          </a>
          <p className="mt-6 text-sm text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#2C3B2E] transition">Invité(e) à un mariage ? Rejoindre →</a>
          </p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-16 md:py-24 px-6 md:px-10 bg-[#f5f0e8] border-t border-stone-200">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>Contact</p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
              className="text-[#2C3B2E] mb-2">
            Une question ? Une idée ? Un commentaire ? Une suggestion ?
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
      <footer className="border-t border-stone-200 py-12 px-6 md:px-10 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}
                    className="text-[#2C3B2E] block mb-2">Kaatch</span>
              <p className="text-xs text-stone-400" style={{ fontWeight: 300, lineHeight: 1.7 }}>
                L&apos;app qui remplace les listes, les WhatsApp galère, et les tableurs Excel.
                Pour les mariés qui veulent se concentrer sur leur mariage, pas sur son organisation.
              </p>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { label: "Comment ça marche", href: '#comment-ca-marche' },
                { label: 'Studio Créatif', href: '#studio' },
                { label: 'Offres', href: '#offres' },
                { label: 'Inspirations', href: '/inspirations' },
                { label: 'Espace invités', href: '/rejoindre' },
              ].map(l => (
                <a key={l.href} href={l.href}
                   className="text-sm text-stone-400 hover:text-[#2C3B2E] transition" style={{ fontWeight: 300 }}>
                  {l.label}
                </a>
              ))}
            </div>
            <a href="/auth" className="text-sm text-[#2C3B2E] hover:underline shrink-0" style={{ fontWeight: 400 }}>Connexion →</a>
          </div>
          <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
              © 2026 Kaatch —{' '}
              <a href="mailto:bonjour@kaatch.fr" className="hover:text-[#2C3B2E] transition">bonjour@kaatch.fr</a>
              <span className="hidden sm:inline"> · Aucun groupe WhatsApp n&apos;a été maltraité dans la fabrication de ce site.</span>
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {/* Réseaux sociaux */}
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/kaatch.fr" target="_blank" rel="noopener noreferrer"
                   aria-label="Instagram" className="text-stone-400 hover:text-[#2C3B2E] transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/kaatch.fr" target="_blank" rel="noopener noreferrer"
                   aria-label="Facebook" className="text-stone-400 hover:text-[#2C3B2E] transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://www.pinterest.fr/kaatchfr" target="_blank" rel="noopener noreferrer"
                   aria-label="Pinterest" className="text-stone-400 hover:text-[#2C3B2E] transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </a>
              </div>
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
        </div>
      </footer>
    </main>
  )
}
