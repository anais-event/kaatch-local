import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Kaatch vs Excel — Pourquoi arrêter le tableur pour organiser son mariage",
  description: "Comparaison honnête entre Kaatch et un tableau Excel pour organiser son mariage. RSVP, plan de table, budget, coordination prestataires : ce qu'un tableur ne saura jamais faire.",
  alternates: { canonical: "https://kaatch.fr/kaatch-vs-excel" },
  openGraph: {
    title: "Kaatch vs Excel — Organisation mariage",
    description: "Ce qu'Excel ne saura jamais faire pour votre mariage — et comment Kaatch s'en occupe.",
    url: "https://kaatch.fr/kaatch-vs-excel",
    siteName: "Kaatch",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "https://kaatch.fr/og-image.png", width: 1200, height: 630, alt: "Kaatch vs Excel" }],
  },
}

// ── Identité marketing Kaatch ──
const BODY    = "var(--font-body)"    // Plus Jakarta Sans — tout
const SERIF   = "var(--font-serif)"   // Instrument Serif — titres éditoriaux
const DISPLAY = "var(--font-display)" // Outfit — logo

const FOREST    = "#2C3B2E"
const SAGE      = "#4a5240"
const TEXT      = "#2e2b27"
const TEXT_MID  = "#5a5549"
const TEXT_SOFT = "#847d73"
const CLAY      = "#b08977" // ✗ doux, pas de rouge agressif

const rows = [
  { feature: "Gestion des invités",       excel: "Tableau à remplir et mettre à jour à la main",        kaatch: "Import Excel/CSV en un clic, tout se met à jour tout seul",        winner: "kaatch" },
  { feature: "RSVP en ligne",             excel: "Pas prévu pour ça",                                   kaatch: "Un lien personnel par invité, réponse en 2 clics",                winner: "kaatch" },
  { feature: "Faire-part numériques",     excel: "Impossible",                                          kaatch: "Faire-part animé, personnalisé au prénom de chaque invité",       winner: "kaatch" },
  { feature: "Plan de table",             excel: "Du copier-coller, tout à refaire au moindre changement", kaatch: "Glisser-déposer, lié aux RSVP, modifiable jusqu'à la veille",   winner: "kaatch" },
  { feature: "Suivi du budget",           excel: "Des formules à la main, et vite plusieurs versions",  kaatch: "Suivi en temps réel, devis PDF, acomptes suivis",                 winner: "kaatch" },
  { feature: "Album photo partagé",       excel: "Impossible",                                          kaatch: "QR code sur les tables, upload mobile, téléchargement groupé",    winner: "kaatch" },
  { feature: "Coordination prestataires", excel: "Des emails et des WhatsApp éparpillés partout",        kaatch: "Un espace dédié par prestataire, mis à jour en direct",          winner: "kaatch" },
  { feature: "Programme du jour J",       excel: "Un document figé, à envoyer par email",               kaatch: "Dans le téléphone de chaque invité, mis à jour en direct",       winner: "kaatch" },
  { feature: "Accès des invités",         excel: "Vos invités n'ouvrent pas votre fichier Excel",       kaatch: "Un espace invité complet, sans compte ni appli à installer",     winner: "kaatch" },
  { feature: "À deux, à quatre mains",    excel: "Des versions qui divergent, des fichiers par email",  kaatch: "Un seul espace partagé, toujours à jour pour vous deux",          winner: "kaatch" },
  { feature: "Prise en main",             excel: "Familier si vous aimez déjà les tableurs",            kaatch: "Pensé pour le mariage, pris en main en 10 minutes",               winner: "neutral" },
  { feature: "Prix",                      excel: "Gratuit avec Office, ou ~10 €/mois (Microsoft 365)",  kaatch: "Gratuit jusqu'à 30 invités, puis 45 € une fois pour toutes",      winner: "neutral" },
]

const painPoints = [
  {
    title: "Envoyer les réponses à votre place",
    text: "Un tableur, ça range. Ça n'envoie rien et ça ne reçoit rien. Quand tante Michèle confirme par SMS, c'est encore vous qui ouvrez le fichier et tapez la ligne. Multiplié par cent invités, ça fait beaucoup de soirées.",
  },
  {
    title: "Ouvrir la porte à vos invités",
    text: "Vos invités n'ont pas votre fichier Excel. Donc pas le programme, pas le plan d'accès, pas l'album photo. Chaque question devient un message de plus à gérer. Sur Kaatch, ils ont tout, sur leur téléphone, sans rien installer.",
  },
  {
    title: "Prévenir les prestataires en temps réel",
    text: "Vous décalez le cocktail de trente minutes dans votre tableau ? Le traiteur, lui, ne le sait pas. Il faut l'appeler, réexpliquer, vérifier. Sur Kaatch, il voit le changement au même moment que vous.",
  },
  {
    title: "Éviter les deux versions qui se contredisent",
    text: "Vous modifiez sur votre ordi, votre moitié sur le sien, et voilà deux fichiers qui ne racontent plus la même histoire. Le grand classique des préparatifs à deux. Kaatch, c'est un seul endroit, à jour pour vous deux.",
  },
]

const faqItems = [
  {
    q: "On peut vraiment organiser un mariage sans Excel ?",
    a: "Oui, promis. Excel fait un peu de tout, mais rien de spécifique au mariage : ni RSVP, ni faire-part, ni coordination en direct. Kaatch est pensé pour ça — c'est plus simple, et surtout beaucoup plus rapide au quotidien.",
  },
  {
    q: "Je peux récupérer ma liste Excel déjà commencée ?",
    a: "Bien sûr. On importe votre fichier Excel ou Google Sheets d'un clic : prénoms, noms, emails, téléphones, lien de parenté, régimes alimentaires… tout suit. Vous ne ressaisissez rien à la main.",
  },
  {
    q: "Mon partenaire ne veut pas lâcher son tableur 😅",
    a: "On comprend. Posez-lui juste la question : combien de soirées à mettre le fichier à jour ? Combien de fois deux versions différentes ? Kaatch, c'est un seul endroit, à jour pour vous deux, consultable depuis le canapé.",
  },
  {
    q: "On se marie dans 4 mois, c'est trop tard pour changer ?",
    a: "Pas du tout. Quatre mois, c'est encore plein de décisions à prendre. Basculer maintenant vous enlève des semaines de galère de fichier — et l'import de votre liste prend moins de cinq minutes.",
  },
]

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Kaatch vs Excel — Organiser son mariage sans tableur",
  "description": "Comparaison honnête entre Kaatch et Excel pour organiser son mariage.",
  "url": "https://kaatch.fr/kaatch-vs-excel",
  "inLanguage": "fr",
  "author": { "@type": "Organization", "name": "Kaatch", "url": "https://kaatch.fr" },
  "publisher": {
    "@type": "Organization",
    "name": "Kaatch",
    "url": "https://kaatch.fr",
    "logo": { "@type": "ImageObject", "url": "https://kaatch.fr/logo.png" },
  },
}

export default function KaatchVsExcelPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: BODY, fontWeight: 300, color: TEXT }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }} />

      {/* Nav — FR-only, statique (pas de next-intl hors [locale]) */}
      <nav
        style={{ background: "#f5f0e8f5", backdropFilter: "blur(12px)" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60"
      >
        <div className="max-w-5xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Kaatch" width={30} height={30} className="rounded-lg" />
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em", color: FOREST }}>
              Kaatch
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/inspirations" className="text-sm transition hover:opacity-70" style={{ fontFamily: BODY, fontWeight: 500, color: "#44403c" }}>
              Inspirations
            </Link>
            <Link
              href="/auth"
              className="text-sm text-white px-4 py-2 rounded-full transition hover:bg-[#1a2419]"
              style={{ fontFamily: BODY, fontWeight: 500, background: FOREST }}
            >
              Mon espace
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-5 md:px-6 pt-28 md:pt-32 pb-24">

        {/* Hero */}
        <header className="mb-14 md:mb-20 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-5" style={{ color: TEXT_SOFT, fontWeight: 500 }}>
            Le match honnête
          </p>
          <h1
            style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(2.2rem, 6vw, 3.6rem)", color: FOREST, lineHeight: 1.1, letterSpacing: "-0.01em" }}
            className="mb-6"
          >
            Kaatch ou Excel<br />pour organiser votre mariage ?
          </h1>
          <p className="max-w-2xl mx-auto" style={{ fontSize: "1.08rem", lineHeight: 1.8, color: TEXT_MID, fontWeight: 300 }}>
            Excel, on l'adore pour les comptes et les listes de courses. Mais un mariage, c'est des centaines de petits détails qui bougent tout le temps — et là, le tableur montre vite ses limites. On vous explique, sans langue de bois. 🤍
          </p>
        </header>

        {/* Comparison table */}
        <section className="mb-16 md:mb-24">
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-[#f5f0e8]/60 border-b border-stone-100">
              <div className="p-4 text-[11px] uppercase tracking-wider" style={{ color: TEXT_SOFT, fontWeight: 600 }}>Pour…</div>
              <div className="p-4 text-[11px] uppercase tracking-wider border-l border-stone-100" style={{ color: TEXT_SOFT, fontWeight: 600 }}>Excel</div>
              <div className="p-4 text-[11px] uppercase tracking-wider border-l border-stone-100" style={{ color: SAGE, fontWeight: 700 }}>Kaatch</div>
            </div>
            {rows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-[1.1fr_1fr_1fr] border-b border-stone-100 last:border-0 ${i % 2 === 0 ? "" : "bg-[#f5f0e8]/30"}`}>
                <div className="p-4 text-sm" style={{ color: TEXT, fontWeight: 500 }}>{row.feature}</div>
                <div className="p-4 text-sm border-l border-stone-100 flex gap-1.5" style={{ color: TEXT_SOFT, fontWeight: 300 }}>
                  {row.winner === "kaatch" && <span className="shrink-0 mt-px" style={{ color: CLAY }}>✕</span>}
                  <span>{row.excel}</span>
                </div>
                <div className="p-4 text-sm border-l border-stone-100 flex gap-1.5" style={{ color: TEXT, fontWeight: 300 }}>
                  {row.winner === "kaatch" && <span className="shrink-0 mt-px" style={{ color: SAGE }}>✓</span>}
                  <span>{row.kaatch}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pain points */}
        <section className="mb-16 md:mb-24">
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.7rem, 4vw, 2.2rem)", color: FOREST, marginBottom: "1.75rem", lineHeight: 1.15 }}>
            Là où le tableur coince, vraiment
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-6 md:p-7 border border-stone-100 shadow-sm">
                <p style={{ fontWeight: 600, color: FOREST, marginBottom: "0.6rem", fontSize: "1.02rem" }}>{item.title}</p>
                <p style={{ color: TEXT_MID, fontSize: "0.92rem", lineHeight: 1.75, fontWeight: 300 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16 md:mb-24">
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.7rem, 4vw, 2.2rem)", color: FOREST, marginBottom: "1.75rem" }}>
            Les questions qu'on nous pose
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group">
                <summary className="cursor-pointer px-6 py-4 list-none flex items-center justify-between gap-4 hover:bg-[#f5f0e8]/50 transition-colors" style={{ fontWeight: 500, color: TEXT }}>
                  <span>{item.q}</span>
                  <span className="text-xl shrink-0 transition-transform group-open:rotate-45" style={{ color: SAGE }}>+</span>
                </summary>
                <div className="px-6 pb-5 pt-0.5" style={{ color: TEXT_MID, fontSize: "0.92rem", lineHeight: 1.75, fontWeight: 300 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-white rounded-3xl border border-stone-100 shadow-sm p-9 md:p-12">
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.6rem, 4vw, 2.1rem)", color: FOREST, marginBottom: "1rem" }}>
            On referme le tableur ?
          </h2>
          <p className="max-w-md mx-auto mb-8" style={{ color: TEXT_MID, fontSize: "0.95rem", lineHeight: 1.75, fontWeight: 300 }}>
            Le plan Découverte est gratuit jusqu'à 30 invités. On importe votre liste existante en cinq minutes, et c'est parti — sans carte bleue. 🤍
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 rounded-full text-white text-sm transition hover:opacity-90"
            style={{ background: FOREST, fontWeight: 500 }}
          >
            Créer mon espace gratuitement →
          </Link>
          <p className="mt-5 text-xs" style={{ color: TEXT_SOFT, fontWeight: 300 }}>
            Un doute ? Faites un tour par{" "}
            <Link href="/faq" className="underline hover:opacity-70 transition">la FAQ</Link>
            {" "}ou{" "}
            <Link href="/pricing" className="underline hover:opacity-70 transition">les tarifs</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
