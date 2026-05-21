import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import PublicNav from '@/app/_components/PublicNav'

const DISPLAY = 'var(--font-display)'
const BODY = 'var(--font-body)'
const GREEN = '#2C3B2E'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

type FeatureData = {
  icon: string
  title: string
  tagline: string
  intro: string
  benefits: { icon: string; title: string; desc: string }[]
  howItWorks: { step: string; label: string; desc: string }[]
  ctaLine: string
  seoTitle: string
  seoDesc: string
  relatedFeatures: string[]
}

const data: Record<string, FeatureData> = {
  'faire-part-rsvp': {
    icon: '💌',
    title: 'Faire-parts & RSVP',
    tagline: 'Des invitations qui donnent envie d\'y être.',
    intro: 'Fini le faire-part PDF générique que tout le monde oublie. Kaatch génère un faire-part animé, personnalisé au prénom de chaque invité — avec un lien unique et un QR code à glisser dans votre faire-part papier.',
    benefits: [
      { icon: '🎭', title: 'Animé & personnalisé', desc: 'Chaque invité reçoit un faire-part à son prénom, avec une animation rideau et des pétales. Un vrai moment.' },
      { icon: '⚡', title: 'RSVP en 2 clics', desc: 'Vos invités répondent sans créer de compte, depuis leur téléphone. Les réponses tombent en direct dans votre tableau.' },
      { icon: '📊', title: 'Tableau de bord en direct', desc: 'Qui a répondu ? Qui a ouvert son lien ? Qui n\'a pas encore répondu ? Tout en un coup d\'oeil.' },
      { icon: '🔗', title: 'Lien + QR code', desc: 'Le lien personnel peut figurer dans un faire-part numérique ou papier. Le QR code aussi.' },
      { icon: '📋', title: 'Régimes & notes', desc: 'Végétarien, allergie, enfant — les invités renseignent leurs contraintes directement avec leur RSVP.' },
      { icon: '🔔', title: 'Relance automatique', desc: 'Les invités sans réponse peuvent recevoir une relance douce. Vous n\'avez plus à vous en charger.' },
    ],
    howItWorks: [
      { step: '1', label: 'Ajoutez vos invités', desc: 'Import CSV ou saisie manuelle. Chaque invité reçoit un lien unique automatiquement.' },
      { step: '2', label: 'Envoyez le faire-part', desc: 'Copiez le lien, scannez le QR code dans le faire-part papier, ou partagez via WhatsApp.' },
      { step: '3', label: 'Suivez les réponses', desc: 'Les RSVP arrivent en temps réel. Vous gérez depuis votre tableau de bord.' },
    ],
    ctaLine: 'Créez vos invitations gratuitement',
    seoTitle: 'Faire-parts & RSVP en ligne | Kaatch',
    seoDesc: 'Créez des faire-parts animés personnalisés et gérez les RSVP de votre mariage en temps réel. Sans compte pour vos invités.',
    relatedFeatures: ['plan-de-table', 'espace-invites', 'programme-jour-j'],
  },

  'plan-de-table': {
    icon: '🪑',
    title: 'Plan de table',
    tagline: 'Le casse-tête du plan de table, résolu.',
    intro: 'Déplacer une personne sur un tableur Excel et tout recalculer à la main — c\'est fini. Kaatch vous donne une interface glisser-déposer pour placer vos invités, ajuster jusqu\'à la veille, et partager le résultat avec vos prestataires.',
    benefits: [
      { icon: '🖱️', title: 'Glisser-déposer', desc: 'Déplacez un invité d\'une table à une autre en une seconde. Pas de copier-coller.' },
      { icon: '🔄', title: 'Mis à jour en continu', desc: 'Un invité annule ? Vous ajoutez quelqu\'un ? Le plan s\'adapte sans tout recommencer.' },
      { icon: '📤', title: 'Export & partage', desc: 'Partagez le plan de table avec votre salle, votre traiteur, ou imprimez-le.' },
      { icon: '🔗', title: 'Lié aux RSVP', desc: 'Les invités confirmés apparaissent directement dans l\'interface. Pas de doublon à gérer.' },
      { icon: '📊', title: 'Vue d\'ensemble', desc: 'Capacités des tables, taux de remplissage, invités non placés — tout est visible.' },
      { icon: '👁️', title: 'Visible pour les invités', desc: 'Optionnellement, vos invités peuvent voir leur table depuis leur espace invité.' },
    ],
    howItWorks: [
      { step: '1', label: 'Créez vos tables', desc: 'Nommez-les, définissez leur capacité. Ronde, rectangulaire — vous choisissez.' },
      { step: '2', label: 'Placez vos invités', desc: 'Glissez chaque invité confirmé sur la table de votre choix.' },
      { step: '3', label: 'Ajustez jusqu\'au bout', desc: 'Modifiez à volonté jusqu\'à la veille du mariage, sans tout refaire.' },
    ],
    ctaLine: 'Créer mon plan de table',
    seoTitle: 'Plan de table mariage en ligne | Kaatch',
    seoDesc: 'Créez et gérez votre plan de table mariage par glisser-déposer. Lié à vos RSVP, ajustable jusqu\'à la veille.',
    relatedFeatures: ['faire-part-rsvp', 'programme-jour-j', 'espace-invites'],
  },

  'album-photo': {
    icon: '📸',
    title: 'Album photo partagé',
    tagline: 'Toutes les photos du mariage, au même endroit.',
    intro: 'Fini les groupes WhatsApp qui explosent, les Google Drive introuvables et le fameux "tu m\'enverras les photos hein ?". Un QR code sur les tables, les invités déposent leurs photos en 2 clics. Tout arrive au même endroit.',
    benefits: [
      { icon: '📱', title: 'Upload mobile instantané', desc: 'Les invités prennent une photo et la partagent depuis leur téléphone, sans télécharger d\'app.' },
      { icon: '🗂️', title: 'Organisé par moment', desc: 'Cérémonie, cocktail, dîner, soirée — les photos sont triées par moment du mariage.' },
      { icon: '❤️', title: 'Likes & commentaires', desc: 'Vos invités peuvent réagir aux photos des autres. L\'album devient vivant.' },
      { icon: '⬇️', title: 'Téléchargement ZIP', desc: 'Téléchargez toutes les photos en un clic. Zippées, prêtes à archiver.' },
      { icon: '🔒', title: 'Vous décidez', desc: 'Vous gardez le contrôle. Supprimez ce qui ne vous convient pas.' },
      { icon: '♾️', title: 'Pour toujours', desc: 'L\'album reste accessible longtemps après le mariage. Les souvenirs ne disparaissent pas.' },
    ],
    howItWorks: [
      { step: '1', label: 'Activez l\'album', desc: 'L\'album est créé automatiquement avec votre espace mariage.' },
      { step: '2', label: 'Un QR code sur les tables', desc: 'Les invités scannent et accèdent directement à l\'upload. Sans compte.' },
      { step: '3', label: 'Profitez & téléchargez', desc: 'Regardez les photos arriver en direct. Téléchargez tout en un clic après.' },
    ],
    ctaLine: 'Créer mon album photo',
    seoTitle: 'Album photo partagé mariage | Kaatch',
    seoDesc: 'Partagez et collectez toutes les photos de votre mariage en un seul endroit. QR code sur les tables, upload mobile, téléchargement ZIP.',
    relatedFeatures: ['espace-invites', 'faire-part-rsvp', 'livre-dor'],
  },

  'programme-jour-j': {
    icon: '📅',
    title: 'Programme jour J',
    tagline: 'Tout le monde sait où être, et quand.',
    intro: 'Vos témoins n\'ont plus à vous appeler pour savoir à quelle heure arrive la pièce montée. Le programme du mariage est accessible à tous vos invités depuis leur téléphone, mis à jour en temps réel si quelque chose change.',
    benefits: [
      { icon: '📋', title: 'Programme complet', desc: 'Cérémonie, vin d\'honneur, dîner, soirée — chaque étape avec heure et lieu.' },
      { icon: '📍', title: 'Avec les lieux', desc: 'Chaque étape peut inclure l\'adresse ou un lien Maps. Personne ne se perd.' },
      { icon: '🔔', title: 'Visible pour tous les invités', desc: 'Accessible depuis l\'espace invité, sans créer de compte.' },
      { icon: '✏️', title: 'Modifiable à tout moment', desc: 'Un changement de dernière minute ? Mettez à jour le programme, vos invités voient la version à jour.' },
      { icon: '🖨️', title: 'Imprimable', desc: 'Exportez le programme en PDF pour l\'imprimer ou l\'intégrer dans votre décoration.' },
      { icon: '🌐', title: 'En français', desc: 'Le programme est présenté dans un format propre et lisible, optimisé mobile.' },
    ],
    howItWorks: [
      { step: '1', label: 'Créez vos étapes', desc: 'Ajoutez chaque moment du mariage : heure, titre, lieu, description.' },
      { step: '2', label: 'Publiez', desc: 'Le programme apparaît automatiquement dans l\'espace de chaque invité.' },
      { step: '3', label: 'Modifiez si besoin', desc: 'Un retard, un changement — mettez à jour et vos invités voient la version actuelle.' },
    ],
    ctaLine: 'Créer mon programme',
    seoTitle: 'Programme mariage en ligne pour les invités | Kaatch',
    seoDesc: 'Partagez le programme de votre mariage avec tous vos invités en temps réel. Accessible depuis leur téléphone, sans application.',
    relatedFeatures: ['espace-invites', 'faire-part-rsvp', 'plan-de-table'],
  },

  'espace-invites': {
    icon: '🔗',
    title: 'Espace invités',
    tagline: 'Vos invités ont leur propre espace. Sans compte.',
    intro: 'Chaque invité reçoit un lien personnel. Il clique, et il est chez vous — RSVP, programme, album photo, livre d\'or, hébergements. Aucune inscription, aucun mot de passe, aucune friction.',
    benefits: [
      { icon: '🚫', title: 'Zéro compte à créer', desc: 'Vos invités cliquent sur leur lien et accèdent directement. Pas d\'inscription, pas de mot de passe.' },
      { icon: '📱', title: ' 100% mobile', desc: 'L\'espace invité est conçu pour le téléphone. Tout fonctionne depuis le navigateur.' },
      { icon: '🎯', title: 'Personnalisé par invité', desc: 'Chaque lien est unique. L\'espace affiche le prénom de l\'invité, son RSVP, sa table (si partagée).' },
      { icon: '📂', title: 'Tout en un endroit', desc: 'Faire-part, programme, album, livre d\'or, hébergements, contacts — dans un seul espace.' },
      { icon: '🔒', title: 'Accès sécurisé', desc: 'Chaque lien est unique et non devinable. Seul l\'invité qui reçoit le lien y accède.' },
      { icon: '📄', title: 'Compatible papier', desc: 'Le QR code peut figurer sur le faire-part papier. Vos invités flashent et accèdent depuis leur téléphone.' },
    ],
    howItWorks: [
      { step: '1', label: 'Ajoutez vos invités', desc: 'Chaque invité reçoit automatiquement un lien personnel unique.' },
      { step: '2', label: 'Envoyez le lien', desc: 'Via WhatsApp, email, SMS — ou en QR code sur le faire-part papier.' },
      { step: '3', label: 'Ils ont accès à tout', desc: 'RSVP, programme, album, livre d\'or — depuis leur téléphone, sans rien installer.' },
    ],
    ctaLine: 'Créer mon espace mariage',
    seoTitle: 'Espace invités mariage sans inscription | Kaatch',
    seoDesc: 'Offrez à chaque invité un espace personnalisé accessible sans compte. Programme, album photo, livre d\'or — depuis leur téléphone.',
    relatedFeatures: ['faire-part-rsvp', 'album-photo', 'livre-dor'],
  },

  'livre-dor': {
    icon: '📝',
    title: "Livre d'or",
    tagline: 'Les mots de vos invités, pour toujours.',
    intro: "Un cahier qu'on oublie de signer. Une page Facebook que personne ne retrouve. Le livre d'or Kaatch est accessible à tous vos invités depuis leur téléphone — avant, pendant et après le mariage.",
    benefits: [
      { icon: '📱', title: 'Depuis le téléphone', desc: 'Vos invités laissent un message directement depuis leur espace, sans rien installer.' },
      { icon: '🎥', title: 'Texte & vidéo', desc: 'Mots écrits, photos de souvenir, vidéos courtes — vos invités choisissent.' },
      { icon: '⏰', title: 'Avant, pendant, après', desc: "Le livre d'or est ouvert dès le faire-part. Les messages arrivent tout au long du chemin." },
      { icon: '🔒', title: 'Que pour vous', desc: 'Seuls vous (les mariés) et vos invités connectés voient les messages. Pas public.' },
      { icon: '⬇️', title: 'Téléchargeable', desc: "Exportez tous les messages pour les garder indépendamment de l'app." },
      { icon: '💚', title: 'Sans modération lourde', desc: "Vous voyez tous les messages. Vous pouvez en masquer si besoin." },
    ],
    howItWorks: [
      { step: '1', label: "Le livre s'ouvre", desc: "Dès que votre espace est créé, le livre d'or est actif pour vos invités." },
      { step: '2', label: 'Les invités écrivent', desc: 'Depuis leur espace personnalisé, ils laissent un message quand ils le souhaitent.' },
      { step: '3', label: 'Vous les recevez', desc: 'Tous les messages apparaissent dans votre tableau de bord, en temps réel.' },
    ],
    ctaLine: "Créer mon livre d'or",
    seoTitle: "Livre d'or mariage en ligne | Kaatch",
    seoDesc: "Collectez les messages de vos invités avant, pendant et après le mariage. Texte, photos, vidéos — accessible depuis leur téléphone.",
    relatedFeatures: ['album-photo', 'espace-invites', 'faire-part-rsvp'],
  },

  'playlist-collaborative': {
    icon: '🎵',
    title: 'Playlist collaborative',
    tagline: 'La bande-son de votre mariage, composée par vos invités.',
    intro: "Fini le DJ qui passe des morceaux que personne ne connaît. Avec Kaatch, vos invités suggèrent leurs morceaux préférés pour chaque moment — cérémonie, vin d'honneur, dîner, soirée. Vous gardez le contrôle.",
    benefits: [
      { icon: '🎶', title: 'Par moment', desc: "Les invités suggèrent des morceaux pour la cérémonie, le vin d'honneur, le dîner ou la soirée." },
      { icon: '📱', title: 'Depuis leur espace', desc: "Pas d'app à installer. Les invités ajoutent leurs suggestions depuis leur espace invité." },
      { icon: '✅', title: 'Vous validez', desc: 'Chaque suggestion passe par vous. Vous approuvez, refusez ou réorganisez.' },
      { icon: '🎧', title: 'Partagez au DJ', desc: 'Exportez la playlist validée et envoyez-la à votre DJ ou musicien.' },
      { icon: '💚', title: 'Implique vos invités', desc: "Vos invités adorent participer. C'est un moyen simple de les impliquer avant le jour J." },
      { icon: '🔒', title: 'Privée', desc: 'Seuls vos invités connectés peuvent voir et contribuer à la playlist.' },
    ],
    howItWorks: [
      { step: '1', label: 'Activez la playlist', desc: 'Depuis votre tableau de bord, la playlist est accessible à vos invités.' },
      { step: '2', label: 'Les invités suggèrent', desc: 'Ils choisissent un moment et proposent un titre + artiste.' },
      { step: '3', label: 'Vous composez', desc: 'Validez les suggestions, organisez par moment, et partagez au DJ.' },
    ],
    ctaLine: 'Créer ma playlist collaborative',
    seoTitle: 'Playlist collaborative mariage | Kaatch',
    seoDesc: "Laissez vos invités suggérer les morceaux de votre mariage. Organisez par moment, validez, et partagez au DJ.",
    relatedFeatures: ['programme-jour-j', 'espace-invites', 'faire-part-rsvp'],
  },
}

const allFeatures = [
  { slug: 'faire-part-rsvp',   icon: '💌', label: 'Faire-parts & RSVP' },
  { slug: 'plan-de-table',     icon: '🪑', label: 'Plan de table' },
  { slug: 'album-photo',       icon: '📸', label: 'Album photo partagé' },
  { slug: 'programme-jour-j',  icon: '📅', label: 'Programme jour J' },
  { slug: 'espace-invites',    icon: '🔗', label: 'Espace invités' },
  { slug: 'livre-dor',         icon: '📝', label: "Livre d'or" },
  { slug: 'playlist-collaborative', icon: '🎵', label: 'Playlist collaborative' },
]

export async function generateStaticParams() {
  return Object.keys(data).map(feature => ({ feature }))
}

const ogData: Record<string, { title: string; description: string; url: string }> = {
  "faire-part-rsvp": {
    title: "Faire-parts animés & RSVP en ligne | Kaatch",
    description: "Faire-part animé personnalisé par invité. RSVP sans compte, suivi en temps réel, QR code intégré.",
    url: "https://kaatch.fr/fonctionnalites/faire-part-rsvp",
  },
  "plan-de-table": {
    title: "Plan de table mariage en glisser-déposer | Kaatch",
    description: "Plan de table drag & drop, filtrage RSVP, modifiable à la veille, export PDF.",
    url: "https://kaatch.fr/fonctionnalites/plan-de-table",
  },
  "album-photo": {
    title: "Album photo de mariage partagé | Kaatch",
    description: "Album photo centralisé. QR code, upload mobile, taggage, téléchargement ZIP.",
    url: "https://kaatch.fr/fonctionnalites/album-photo",
  },
  "programme-jour-j": {
    title: "Programme du jour J — déroulé mariage | Kaatch",
    description: "Programme heure par heure, sections par rôle, export PDF.",
    url: "https://kaatch.fr/fonctionnalites/programme-jour-j",
  },
  "espace-invites": {
    title: "Espace invités sans compte ni application | Kaatch",
    description: "Espace invité accessible en un clic. RSVP, programme, photos, livre d'or, playlist. Sans compte.",
    url: "https://kaatch.fr/fonctionnalites/espace-invites",
  },
  "livre-dor": {
    title: "Livre d'or numérique mariage | Kaatch",
    description: "Livre d'or en ligne. Messages des invités sans compte, accessible pour toujours.",
    url: "https://kaatch.fr/fonctionnalites/livre-dor",
  },
}

const metaTitles: Record<string, string> = {
  "faire-part-rsvp": "Faire-parts animés & RSVP en ligne | Kaatch",
  "plan-de-table": "Plan de table mariage en glisser-déposer | Kaatch",
  "album-photo": "Album photo de mariage partagé | Kaatch",
  "programme-jour-j": "Programme du jour J — déroulé mariage | Kaatch",
  "espace-invites": "Espace invités sans compte ni application | Kaatch",
  "livre-dor": "Livre d'or numérique mariage | Kaatch",
}

const metaDescs: Record<string, string> = {
  "faire-part-rsvp": "Créez des faire-part animés personnalisés au prénom de chaque invité. RSVP en 2 clics, sans compte. Suivi en temps réel. Partage par lien, WhatsApp ou QR code.",
  "plan-de-table": "Organisez votre plan de table en drag & drop. Filtrage par RSVP, modifiable jusqu'à la veille, récapitulatif imprimable en PDF. Simple et visuel.",
  "album-photo": "Toutes les photos de votre mariage au même endroit. QR code sur les tables, upload mobile sans app, taggage des visages, téléchargement ZIP.",
  "programme-jour-j": "Créez le programme détaillé de votre journée de mariage. Sections visibles selon le rôle (invités, témoins, prestataires). Imprimable en PDF.",
  "espace-invites": "Vos invités accèdent à leur espace mariage en un clic. RSVP, programme, photos, livre d'or, playlist — sans inscription, sans mot de passe, sans application.",
  "livre-dor": "Un livre d'or en ligne où vos invités laissent leurs mots doux. Accessible sans compte, consultable pour toujours. Des souvenirs qui ne se perdent pas.",
}

export async function generateMetadata(
  { params }: { params: Promise<{ feature: string }> }
): Promise<Metadata> {
  const { feature } = await params
  const d = data[feature]
  if (!d) return { title: "Fonctionnalité | Kaatch" }
  const og = ogData[feature]
  return {
    title: metaTitles[feature] ?? d.seoTitle,
    description: metaDescs[feature] ?? d.seoDesc,
    ...(og && {
      openGraph: {
        title: og.title,
        description: og.description,
        url: og.url,
        siteName: "Kaatch",
        locale: "fr_FR",
        type: "website",
        images: [{ url: "https://kaatch.fr/og-image.png", width: 1200, height: 630, alt: "Kaatch — Organisation de mariage" }],
      },
    }),
  }
}

export default async function FeaturePage(
  { params }: { params: Promise<{ feature: string }> }
) {
  const { feature } = await params
  const d = data[feature]
  if (!d) notFound()

  const related = allFeatures.filter(f => d.relatedFeatures.includes(f.slug))

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": d.title,
    "description": d.intro,
    "step": d.howItWorks.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.label,
      "text": s.desc,
    })),
  }

  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: BODY, fontWeight: 300, color: '#2d3228' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">{d.icon}</div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4" style={{ fontWeight: 500 }}>
            Fonctionnalité
          </p>
          <h1
            style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-5"
          >
            {d.title}
          </h1>
          <p
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontStyle: 'italic', color: '#4a5240' }}
            className="mb-8"
          >
            {d.tagline}
          </p>
          <p className="text-stone-600 max-w-2xl mx-auto" style={{ fontSize: '1.05rem', lineHeight: 1.85 }}>
            {d.intro}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/auth"
              className="inline-block bg-[#2C3B2E] text-white px-8 py-4 rounded-2xl hover:bg-[#1a2419] transition text-sm text-center"
              style={{ fontWeight: 500 }}
            >
              {d.ctaLine} →
            </a>
            <a
              href="/#offres"
              className="inline-block border border-stone-300 text-stone-500 px-8 py-4 rounded-2xl hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition text-sm text-center"
              style={{ fontWeight: 400 }}
            >
              Voir les offres
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4 text-center" style={{ fontWeight: 500 }}>
            Ce que vous gagnez
          </p>
          <h2
            style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-12 text-center"
          >
            Tout ce qu&apos;il faut, rien de plus.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {d.benefits.map((b, i) => (
              <div key={i} className="bg-[#f5f0e8] rounded-2xl p-6" style={{ boxShadow: SHADOW }}>
                <div className="text-2xl mb-3">{b.icon}</div>
                <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: GREEN }} className="mb-2">
                  {b.title}
                </p>
                <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 md:px-10 bg-[#f5f0e8] border-t border-stone-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-4 text-center" style={{ fontWeight: 500 }}>
            Comment ça marche
          </p>
          <h2
            style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-[#2C3B2E] mb-12 text-center"
          >
            Trois étapes, c&apos;est tout.
          </h2>
          <div className="space-y-5">
            {d.howItWorks.map((step, i) => (
              <div
                key={i}
                className="flex gap-5 bg-white rounded-2xl p-6"
                style={{ boxShadow: SHADOW }}
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm"
                  style={{ background: GREEN, fontFamily: DISPLAY, fontWeight: 800 }}
                >
                  {step.step}
                </div>
                <div>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: GREEN }} className="mb-1">
                    {step.label}
                  </p>
                  <p className="text-stone-500 text-sm" style={{ lineHeight: 1.7, fontWeight: 300 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-20 px-6 md:px-10 bg-[#2C3B2E]">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
            className="text-white mb-4"
          >
            Prêt à simplifier votre mariage ?
          </h2>
          <p className="text-white/65 mb-8" style={{ fontSize: '0.95rem', lineHeight: 1.8, fontWeight: 300 }}>
            Commencez gratuitement. Aucune carte bleue requise.
          </p>
          <a
            href="/auth"
            className="inline-block bg-[#f5f0e8] text-[#2C3B2E] px-8 py-4 rounded-2xl hover:bg-white transition text-sm"
            style={{ fontWeight: 600 }}
          >
            {d.ctaLine} →
          </a>
        </div>
      </section>

      {/* Related features */}
      <section className="py-16 px-6 md:px-10 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#2C3B2E] mb-8 text-center" style={{ fontWeight: 500 }}>
            Les autres fonctionnalités
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map(f => (
              <Link
                key={f.slug}
                href={`/fonctionnalites/${f.slug}`}
                className="flex items-center gap-3 bg-[#f5f0e8] rounded-2xl p-5 hover:bg-stone-100 transition"
                style={{ boxShadow: SHADOW }}
              >
                <span className="text-2xl shrink-0">{f.icon}</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.88rem', color: GREEN }}>
                  {f.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-stone-400 hover:text-[#2C3B2E] transition"
              style={{ fontWeight: 300 }}
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-stone-200 py-8 px-6 md:px-10 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1rem', color: GREEN }}>Kaatch</span>
          <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
            © 2026 Kaatch —{' '}
            <a href="mailto:bonjour@kaatch.fr" className="hover:text-[#2C3B2E] transition">bonjour@kaatch.fr</a>
          </p>
          <div className="flex gap-4">
            {[
              { label: 'Mentions légales', href: '/mentions-legales' },
              { label: 'CGV', href: '/cgv' },
            ].map(l => (
              <a key={l.href} href={l.href} className="text-xs text-stone-400 hover:text-[#2C3B2E] transition" style={{ fontWeight: 300 }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
