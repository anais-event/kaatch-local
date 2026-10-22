import Link from 'next/link'

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'

// ── Étapes (section visible + HowTo JSON-LD, texte identique) ──
export const STEPS = [
  {
    name: "Listez tous vos invités",
    text: "Rassemblez la liste complète des personnes présentes, idéalement après les réponses RSVP. Notez les cas particuliers : couples, enfants, personnes à mobilité réduite, invités qui ne se connaissent pas.",
  },
  {
    name: "Créez vos tables",
    text: "Définissez le nombre de tables, leur capacité et leur forme (ronde ou rectangulaire) en fonction de votre salle. Comptez en général 8 à 10 places par table ronde, 6 à 8 par table rectangulaire.",
  },
  {
    name: "Placez d'abord les familles proches et les cas particuliers",
    text: "Commencez par la table d'honneur, les familles des deux côtés, puis les invités avec contraintes (mobilité, régimes, enfants). Ce sont les placements les plus structurants, le reste s'organise autour.",
  },
  {
    name: "Équilibrez l'ambiance de chaque table",
    text: "Mélangez légèrement les groupes pour que chaque table soit vivante, sans séparer les couples. Éloignez les personnes en froid et intercalez des tables neutres entre les groupes incompatibles.",
  },
  {
    name: "Relisez, ajustez, puis exportez en PDF",
    text: "Vérifiez qu'aucun invité n'est oublié ou isolé. L'outil sauvegarde chaque modification automatiquement : ajustez par glisser-déposer jusqu'au dernier moment, puis exportez le plan en PDF pour l'imprimer ou l'envoyer à votre traiteur.",
  },
]

// ── Capacité des tables ──
const TABLE_CAPACITY = [
  { label: "Table ronde", value: "8 à 10 personnes", note: "La plus courante : elle favorise les échanges entre tous les convives." },
  { label: "Table rectangulaire", value: "6 à 8 personnes", note: "Idéale pour les salles étroites et les tablées en longueur ou en U." },
  { label: "Table des enfants", value: "6 à 8 enfants", note: "À placer dans le champ de vision des parents, avec de quoi les occuper." },
]

// ── Erreurs fréquentes ──
const MISTAKES = [
  "Imprimer les cartons trop tôt : il y a presque toujours des désistements de dernière minute. Attendez le plus longtemps possible.",
  "Séparer les couples ou les binômes : sur un tableur, on déplace une personne et on oublie l'autre. Gardez les paires ensemble.",
  "Sur-remplir ou sous-remplir les tables : en dessous de 6 convives une table paraît vide, au-dessus de 12 les conversations deviennent difficiles.",
  "Oublier les contraintes : mobilité réduite près des accès, régimes alimentaires pour le traiteur, enfants visibles depuis leurs parents.",
  "Mettre les groupes en tension face à face : éloignez-les et intercalez des tables neutres (amis, collègues).",
]

// ── FAQ (section visible + FAQPage JSON-LD, texte identique) ──
export const FAQ_ITEMS = [
  {
    q: "Comment faire le plan de table d'un mariage ?",
    a: "La méthode en 5 étapes : (1) listez tous vos invités, idéalement après les RSVP, (2) créez vos tables selon la capacité et la forme adaptées à votre salle, (3) placez d'abord la table d'honneur, les familles proches et les cas particuliers (mobilité, régimes, enfants), (4) équilibrez l'ambiance de chaque table sans séparer les couples, (5) relisez, ajustez par glisser-déposer et exportez en PDF. Évitez de regrouper tous vos amis proches à une seule table : mélangez légèrement pour que chaque table soit animée.",
  },
  {
    q: "Combien d'invités par table à un mariage ?",
    a: "La configuration classique : 8 à 10 personnes pour une table ronde, 6 à 8 pour une table rectangulaire. En dessous de 6, une table peut paraître vide et l'ambiance est difficile à lancer. Au-dessus de 12, les conversations deviennent difficiles d'un bout à l'autre. Pour les enfants, prévoyez 6 à 8 places maximum par table, visible depuis les tables des parents. Ces repères dépendent de votre salle et de l'ambiance souhaitée.",
  },
  {
    q: "Dans quel ordre placer les tables à un mariage ?",
    a: "La table des mariés (table d'honneur allongée ou ronde centrale) est au centre ou face à la salle. Autour : les familles proches des deux côtés, puis les amis, puis les collègues et connaissances. Les enfants sont souvent regroupés à une table avec vue dégagée pour les parents. Il n'y a pas de règle absolue — l'important est que chaque convive se sente bien placé.",
  },
  {
    q: "Plan de table imposé ou placement libre : que choisir ?",
    a: "Le plan de table imposé (chaque invité a une place assignée) évite les hésitations à l'entrée en salle et facilite le service du traiteur : c'est le choix le plus courant au-delà de 30 ou 40 convives. Le placement libre convient aux réceptions intimes et décontractées. Une solution intermédiaire : assigner les tables mais laisser le choix de la chaise à l'intérieur de chaque table.",
  },
  {
    q: "Faut-il faire son plan de table sur Excel ?",
    a: "Excel ou un tableur dépanne, mais montre vite ses limites : pas de glisser-déposer visuel, les couples finissent séparés quand on déplace une seule ligne, et comparer deux versions d'une disposition est laborieux. Un outil de plan de table en ligne affiche la salle visuellement, déplace les invités par glisser-déposer et sauvegarde chaque changement automatiquement.",
  },
  {
    q: "Comment gérer les conflits familiaux dans le plan de table ?",
    a: "Placez les groupes incompatibles aux extrémités opposées de la salle, avec entre eux un tampon de tables neutres (amis, collègues). Évitez les longues tables qui mettent tout le monde en face à face. Pour placer vos proches, demandez l'avis de votre partenaire, et inversement. Si la tension est forte, confiez la gestion de l'entrée en salle à un témoin.",
  },
  {
    q: "Quand faut-il faire le plan de table ?",
    a: "En général entre un mois et deux semaines avant le mariage, une fois la majorité des réponses RSVP reçues. Préparez la structure des tables à l'avance, mais attendez le plus longtemps possible avant d'imprimer les cartons et le plan définitif : les désistements et ajouts de dernière minute sont fréquents.",
  },
  {
    q: "Comment gérer les désistements de dernière minute ?",
    a: "Pour une ou deux absences, inutile de tout remanier : laissez simplement la table un peu moins remplie. En cas d'annulations plus nombreuses, regroupez deux tables en une pour garder une ambiance homogène. Un outil en ligne permet de réorganiser le plan en quelques glisser-déposer, sans tout recommencer.",
  },
  {
    q: "Peut-on modifier le plan de table après l'avoir créé ?",
    a: "Oui, à tout moment. L'outil sauvegarde automatiquement chaque modification dans votre navigateur. Vous déplacez les invités d'une table à l'autre par glisser-déposer, ajoutez ou supprimez des tables, et exportez le plan en PDF quand vous le souhaitez.",
  },
  {
    q: "Le plan de table est-il gratuit et sans inscription ?",
    a: "Entièrement gratuit, sans inscription ni carte bancaire. Vos données (invités, tables, placements) restent dans votre navigateur. Pour collaborer avec votre partenaire, synchroniser votre liste d'invités et partager le plan avec votre wedding planner, Kaatch propose un espace mariage complet et gratuit.",
  },
]

export const PLAN_DE_TABLE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Plan de table mariage Kaatch",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "description": "Outil gratuit de plan de table mariage en ligne — ajoutez vos invités, créez vos tables, placez chacun par glisser-déposer. Sauvegarde automatique, export PDF, sans inscription.",
      "url": "https://kaatch.fr/plan-de-table-mariage",
    },
    {
      "@type": "HowTo",
      "name": "Comment faire un plan de table de mariage",
      "description": "Méthode en 5 étapes pour créer le plan de table de votre mariage et placer vos invités.",
      "step": STEPS.map((s, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": s.name,
        "text": s.text,
      })),
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Kaatch", "item": "https://kaatch.fr" },
        { "@type": "ListItem", "position": 2, "name": "Outils gratuits", "item": "https://kaatch.fr/outils" },
        { "@type": "ListItem", "position": 3, "name": "Plan de table mariage", "item": "https://kaatch.fr/plan-de-table-mariage" },
      ],
    },
  ],
}

const OTHER_TOOLS = [
  { href: '/liste-invites-mariage', emoji: '📝', label: "Liste d'invités", desc: 'RSVP, régimes, coordonnées' },
  { href: '/checklist-mariage', emoji: '✅', label: 'Checklist mariage', desc: 'Toutes les étapes mois par mois' },
  { href: '/budget-mariage', emoji: '💰', label: 'Calculateur de budget', desc: 'Estimez le coût de votre mariage' },
  { href: '/programme-mariage', emoji: '🗓️', label: 'Programme du jour J', desc: 'Déroulé heure par heure' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[#2C3B2E] mb-4"
      style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.01em' }}
    >
      {children}
    </h2>
  )
}

export default function SeoContent() {
  return (
    <div className="px-5 md:px-10 pb-20" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Intro SEO */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
          <SectionTitle>Créez votre plan de table mariage en ligne — gratuit</SectionTitle>
          <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
            Fini les fichiers Excel à la main, les post-its sur la table du salon et les Google Sheets partagés en lecture seule. Cet outil gratuit vous permet d&apos;ajouter vos invités, de créer vos tables (rondes ou rectangulaires) et de placer chacun par glisser-déposer, directement dans votre navigateur.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
            Tout est sauvegardé automatiquement. Exportez le plan en PDF pour l&apos;imprimer ou le transmettre à votre traiteur. Sans inscription, sans carte bancaire.
          </p>
        </div>

        {/* Étapes — HowTo */}
        <div className="mb-8">
          <SectionTitle>Comment faire un plan de table de mariage en 5 étapes</SectionTitle>
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.name} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex gap-4">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm text-white"
                  style={{ background: SAGE, fontWeight: 500 }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-stone-800 text-sm mb-1" style={{ fontWeight: 500 }}>{s.name}</p>
                  <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Capacité des tables */}
        <div className="mb-8">
          <SectionTitle>Combien d&apos;invités par table ?</SectionTitle>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            {TABLE_CAPACITY.map(t => (
              <div key={t.label} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <p className="text-stone-400 text-xs uppercase tracking-wider mb-1" style={{ fontWeight: 400 }}>{t.label}</p>
                <p className="text-lg mb-2" style={{ color: SAGE, fontWeight: 500 }}>{t.value}</p>
                <p className="text-stone-500 text-xs leading-relaxed" style={{ fontWeight: 300 }}>{t.note}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-xs leading-relaxed" style={{ fontWeight: 300 }}>
            Ces repères sont indicatifs : la bonne capacité dépend de la taille de votre salle, de la place pour la piste de danse et de l&apos;ambiance recherchée.
          </p>
        </div>

        {/* Erreurs fréquentes */}
        <div className="mb-8">
          <SectionTitle>Les erreurs fréquentes à éviter</SectionTitle>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <ul className="space-y-3">
              {MISTAKES.map((m, i) => (
                <li key={i} className="flex gap-3 text-sm text-stone-500 leading-relaxed" style={{ fontWeight: 300 }}>
                  <span className="shrink-0" style={{ color: SAGE }}>·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Excel vs en ligne */}
        <div className="mb-8">
          <SectionTitle>Plan de table en ligne ou fichier Excel ?</SectionTitle>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <p className="text-stone-500 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
              Un tableur Excel dépanne pour une petite réception, mais il n&apos;a pas été pensé pour placer des invités : pas de vue visuelle de la salle, pas de glisser-déposer, et les couples finissent séparés dès qu&apos;on déplace une seule ligne. Comparer deux versions d&apos;une disposition devient vite laborieux.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
              Un outil de plan de table en ligne affiche vos tables, déplace les invités d&apos;un geste et sauvegarde chaque changement.{' '}
              <Link href="/kaatch-vs-excel" className="underline hover:text-[#4a5240] transition" style={{ color: SAGE }}>
                Voir la comparaison Kaatch vs Excel
              </Link>.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <SectionTitle>Questions fréquentes</SectionTitle>
          <div className="space-y-4">
            {FAQ_ITEMS.map(item => (
              <div key={item.q} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                <p className="text-stone-800 text-sm mb-2" style={{ fontWeight: 500 }}>{item.q}</p>
                <p className="text-stone-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Autres outils */}
        <div className="mb-8">
          <p className="text-xs text-stone-400 mb-4 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Autres outils gratuits
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OTHER_TOOLS.map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex items-start gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-stone-300 transition-all"
              >
                <span className="text-xl shrink-0">{t.emoji}</span>
                <div>
                  <p className="text-stone-800 text-sm group-hover:underline" style={{ fontWeight: 500 }}>{t.label}</p>
                  <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
          <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
            Gérez vos invités et votre plan en un seul endroit
          </p>
          <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            Kaatch synchronise votre liste d&apos;invités et votre plan de table — avec RSVP, régimes alimentaires et espace invité. Gratuit.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition"
            style={{ color: SAGE_DARK }}
          >
            Créer mon espace mariage →
          </Link>
        </div>

      </div>
    </div>
  )
}
