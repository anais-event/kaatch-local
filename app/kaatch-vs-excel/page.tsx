import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kaatch vs Excel — Pourquoi arrêter le tableur pour organiser son mariage",
  description: "Comparaison détaillée entre Kaatch et un tableau Excel pour organiser son mariage. RSVP, plan de table, budget, coordination prestataires : ce que Excel ne peut pas faire.",
  openGraph: {
    title: "Kaatch vs Excel — Organisation mariage",
    description: "Ce que Excel ne peut pas faire pour votre mariage — et comment Kaatch le remplace.",
    url: "https://kaatch.fr/kaatch-vs-excel",
    siteName: "Kaatch",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "https://kaatch.fr/og-image.png", width: 1200, height: 630, alt: "Kaatch vs Excel" }],
  },
}

const CREAM = "#f5f0e8"
const GREEN = "#4a5240"
const GREEN_DARK = "#2d3228"

const rows = [
  {
    feature: "Gestion des invités",
    excel: "Tableau manuel, mise à jour à la main",
    kaatch: "Import Excel/CSV, mise à jour automatique",
    winner: "kaatch",
  },
  {
    feature: "RSVP en ligne",
    excel: "Impossible nativement",
    kaatch: "Lien personnel par invité, réponse en 2 clics",
    winner: "kaatch",
  },
  {
    feature: "Faire-part numériques",
    excel: "Impossible",
    kaatch: "Faire-part animé personnalisé au prénom de chaque invité",
    winner: "kaatch",
  },
  {
    feature: "Plan de table",
    excel: "Copier-coller laborieux, tout refaire à chaque changement",
    kaatch: "Glisser-déposer, lié aux RSVP, modifiable à la veille",
    winner: "kaatch",
  },
  {
    feature: "Suivi budget",
    excel: "Formules manuelles, versions multiples qui divergent",
    kaatch: "Suivi en temps réel, devis PDF, acomptes trackés",
    winner: "kaatch",
  },
  {
    feature: "Album photo partagé",
    excel: "Impossible",
    kaatch: "QR code sur les tables, upload mobile, téléchargement ZIP",
    winner: "kaatch",
  },
  {
    feature: "Coordination prestataires",
    excel: "Emails et WhatsApp séparés, informations éparpillées",
    kaatch: "Lien de partage dédié, mises à jour en temps réel",
    winner: "kaatch",
  },
  {
    feature: "Programme jour J",
    excel: "Document statique à envoyer par email",
    kaatch: "Accessible depuis le téléphone de chaque invité, mis à jour en direct",
    winner: "kaatch",
  },
  {
    feature: "Accès invités",
    excel: "Impossible — les invités n'accèdent pas au fichier",
    kaatch: "Espace invité complet, sans compte ni application",
    winner: "kaatch",
  },
  {
    feature: "Collaboration à deux",
    excel: "Versions qui divergent, envoi de fichiers par email",
    kaatch: "Tableau de bord partagé en temps réel",
    winner: "kaatch",
  },
  {
    feature: "Courbe d'apprentissage",
    excel: "Familier si vous connaissez déjà Excel",
    kaatch: "Interface pensée pour le mariage, prise en main en 10 min",
    winner: "neutral",
  },
  {
    feature: "Prix",
    excel: "Gratuit (si vous avez déjà Office) ou ~10€/mois (Microsoft 365)",
    kaatch: "Inclus jusqu'à 30 invités (plan Découverte), puis 45 euros paiement unique (plan Mariage)",
    winner: "neutral",
  },
]

const faqItems = [
  {
    q: "Peut-on vraiment se passer d'Excel pour organiser un mariage ?",
    a: "Oui. Excel est un outil généraliste qui n'a pas été conçu pour gérer des RSVP, envoyer des faire-part, ou coordonner des prestataires en temps réel. Pour ces tâches spécifiques, un outil dédié comme Kaatch est structurellement plus adapté — et plus rapide à utiliser.",
  },
  {
    q: "Est-ce qu'on peut importer notre liste Excel dans Kaatch ?",
    a: "Oui. Kaatch accepte l'import direct depuis Excel ou Google Sheets. Tous les champs sont importés : prénom, nom, email, téléphone, lien de parenté, régime alimentaire. Vous n'avez pas à tout ressaisir à la main.",
  },
  {
    q: "Mon partenaire veut garder Excel. Comment le convaincre ?",
    a: "Posez-lui cette question : combien d'heures par semaine passez-vous à mettre à jour le fichier ? Et combien de fois avez-vous eu deux versions différentes ? Kaatch centralise tout en temps réel — un seul outil, toujours à jour, accessible depuis le téléphone.",
  },
  {
    q: "On se marie dans 4 mois. C'est trop tard pour changer ?",
    a: "Non. Quatre mois, c'est encore beaucoup de décisions à prendre. Changer maintenant vous évite des semaines de gestion de fichier. L'import de votre liste existante prend moins de 5 minutes.",
  },
]

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Kaatch vs Excel — Organiser son mariage sans tableur",
  "description": "Comparaison détaillée entre Kaatch et Excel pour organiser son mariage.",
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
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: "var(--font-lato)", fontWeight: 300, color: GREEN_DARK }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: GREEN_DARK }}>
            Kaatch
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/inspirations" className="text-sm text-stone-500 hover:text-stone-700 transition" style={{ fontWeight: 300 }}>
              Inspirations
            </Link>
            <Link href="/auth" className="text-sm px-4 py-2 rounded-xl text-white transition hover:opacity-90"
              style={{ background: GREEN, fontWeight: 500 }}>
              Mon espace
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">

        {/* Hero */}
        <div className="mb-16 text-center">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-4" style={{ fontWeight: 400 }}>Comparatif</p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 400, color: GREEN_DARK, lineHeight: 1.15 }}
            className="mb-6">
            Kaatch vs Excel<br />pour organiser son mariage
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.85, fontWeight: 300 }}>
            Excel est l'outil de référence pour beaucoup de choses. L'organisation d'un mariage n'en fait pas partie. Voici pourquoi — et ce que Kaatch fait différemment.
          </p>
        </div>

        {/* Comparison table */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-100">
              <div className="p-4 text-xs font-medium text-stone-400 uppercase tracking-wider">Fonctionnalité</div>
              <div className="p-4 text-xs font-medium text-stone-400 uppercase tracking-wider border-l border-stone-100">Excel</div>
              <div className="p-4 text-xs font-medium uppercase tracking-wider border-l border-stone-100" style={{ color: GREEN, fontWeight: 600 }}>Kaatch</div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-stone-100 last:border-0 ${i % 2 === 0 ? "" : "bg-stone-50/50"}`}>
                <div className="p-4 text-sm font-medium text-stone-700">{row.feature}</div>
                <div className="p-4 text-sm text-stone-500 border-l border-stone-100" style={{ fontWeight: 300 }}>
                  {row.winner === "kaatch" && <span className="text-red-400 mr-1">✗</span>}
                  {row.excel}
                </div>
                <div className="p-4 text-sm border-l border-stone-100" style={{ color: GREEN_DARK, fontWeight: 300 }}>
                  {row.winner === "kaatch" && <span className="mr-1" style={{ color: GREEN }}>✓</span>}
                  {row.kaatch}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Excel fails section */}
        <section className="mb-20">
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.9rem", fontWeight: 400, color: GREEN_DARK, marginBottom: "1.5rem" }}>
            Ce qu'Excel ne peut structurellement pas faire
          </h2>
          <div className="space-y-4">
            {[
              { title: "Envoyer des RSVP automatiques", text: "Excel stocke des données. Il ne les envoie pas, ne les reçoit pas, et ne met pas à jour un tableau quand un invité répond depuis son téléphone. Le RSVP manuel par email ou téléphone prend des heures que vous n'avez pas." },
              { title: "Donner accès aux invités", text: "Vos invités n'ont pas accès à votre fichier Excel. Ils n'ont donc pas accès au programme, aux informations pratiques, à l'album photo ou au livre d'or. Chaque échange nécessite un email ou un message séparé." },
              { title: "Coordonner les prestataires en temps réel", text: "Si vous changez l'heure du cocktail dans votre tableau, votre traiteur ne le sait pas. Vous devez l'appeler, lui envoyer un email, puis vérifier qu'il a bien reçu et compris. Avec Kaatch, la modification est visible instantanément dans l'espace du prestataire." },
              { title: "Gérer les versions multiples", text: "Deux personnes qui travaillent sur le même fichier Excel depuis deux appareils différents créent inévitablement deux versions qui divergent. C'est l'un des litiges les plus courants dans les préparatifs de mariage en couple." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                <p style={{ fontFamily: "var(--font-lato)", fontWeight: 600, color: GREEN_DARK, marginBottom: "0.5rem" }}>{item.title}</p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.8, fontWeight: 300 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.9rem", fontWeight: 400, color: GREEN_DARK, marginBottom: "1.5rem" }}>
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group">
                <summary className="cursor-pointer px-6 py-4 font-medium text-stone-800 list-none flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors" style={{ fontWeight: 500 }}>
                  <span>{item.q}</span>
                  <span className="text-[#4a5240] text-xl shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-stone-600 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-white rounded-2xl border border-stone-100 shadow-sm p-10">
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.8rem", fontWeight: 400, color: GREEN_DARK, marginBottom: "1rem" }}>
            Prêt à fermer le tableur ?
          </h2>
          <p className="text-stone-500 mb-8 text-sm" style={{ fontWeight: 300, lineHeight: 1.8 }}>
            Plan Découverte inclus jusqu'à 30 invités. Import de votre liste existante en 5 minutes. Aucune carte bleue requise.
          </p>
          <Link href="/auth"
            className="inline-block px-8 py-4 rounded-full text-white text-sm transition hover:opacity-90"
            style={{ background: GREEN, fontWeight: 500 }}>
            Créer mon espace gratuitement →
          </Link>
          <p className="mt-4 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Vous pouvez aussi consulter{" "}
            <Link href="/faq" className="underline hover:text-stone-600 transition">la FAQ</Link>
            {" "}ou{" "}
            <Link href="/pricing" className="underline hover:text-stone-600 transition">les tarifs</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
