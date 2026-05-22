import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes | Kaatch",
  description: "Toutes les réponses à vos questions sur Kaatch : prix, fonctionnalités, RSVP, album photo partagé, plan de table, playlist, livre d'or, coordination prestataires.",
  openGraph: {
    title: "FAQ — Questions fréquentes | Kaatch",
    description: "Toutes les réponses à vos questions sur Kaatch : prix, fonctionnalités, RSVP, album photo, plan de table, playlist, livre d'or, prestataires.",
    url: "https://kaatch.fr/faq",
    siteName: "Kaatch",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "https://kaatch.fr/og-image.png", width: 1200, height: 630, alt: "Kaatch — Organisation de mariage" }],
  },
}

const sections = [
  {
    title: "Découvrir Kaatch",
    questions: [
      {
        q: "C'est quoi Kaatch exactement ?",
        a: "Kaatch est une plateforme en ligne française qui centralise toute l'organisation d'un mariage au même endroit. Côté mariés, c'est un tableau de bord complet avec gestion des invités, budget, plan de table, programme, playlist, album photo partagé, livre d'or, messagerie et coordination des prestataires en temps réel. Côté invités, c'est un espace personnel accessible en un clic — sans créer de compte, sans télécharger d'application, et sans retenir de mot de passe. Côté prestataires, c'est un lien de partage dédié avec les informations toujours à jour.",
      },
      {
        q: "Pourquoi utiliser Kaatch plutôt qu'un tableur ou un site gratuit ?",
        a: "Un tableur ne gère pas les RSVP automatiques, ne permet pas aux invités de déposer des photos, et ne génère pas de faire-part animés. Les sites gratuits affichent de la publicité, nécessitent souvent une application à télécharger, et ne proposent pas de coordination avec les prestataires en temps réel. Kaatch réunit tout sans publicité et sans friction.",
      },
      {
        q: "Kaatch est-il adapté aux petits mariages ?",
        a: "Oui. Le plan Découverte permet de commencer sans frais avec 30 invités. Le plan Mariage à 45 euros (paiement unique) donne accès à toutes les fonctionnalités avec invités sans limite. Kaatch s'adapte aussi bien à un mariage intime qu'à une grande réception.",
      },
      {
        q: "Est-ce que Kaatch fonctionne sur mobile ?",
        a: "Oui. Kaatch est une application web responsive qui s'affiche parfaitement sur smartphone, tablette et ordinateur. Il n'y a rien à télécharger.",
      },
    ],
  },
  {
    title: "Invités et invitations",
    questions: [
      {
        q: "Comment les invités accèdent-ils à leur espace ?",
        a: "Trois options : un lien personnel unique (intégré au faire-part numérique ou imprimé sur un faire-part papier), un code de partage personnalisable (à communiquer de vive voix ou par message), ou un QR code (imprimable sur les tables, les menus ou les invitations). Dans tous les cas, l'invité arrive directement sur son espace sans aucune inscription.",
      },
      {
        q: "Les invités doivent-ils créer un compte ou télécharger une application ?",
        a: "Non et non. L'invité clique sur son lien ou scanne un QR code, et il est immédiatement dans son espace. Pas de formulaire, pas de mot de passe, pas d'App Store.",
      },
      {
        q: "Peut-on inviter des personnes seulement à certaines parties du mariage ?",
        a: "Oui. Kaatch gère les invitations par moment : un invité peut être convié uniquement au vin d'honneur, un autre à la cérémonie et au dîner, un troisième à l'ensemble du parcours incluant le brunch du lendemain.",
      },
      {
        q: "Comment fonctionne le RSVP ?",
        a: "L'invité accède à son espace via son lien personnel et confirme ou décline sa présence en quelques secondes. Les mariés voient les réponses en temps réel dans leur tableau de bord, avec un suivi par statut : en attente, confirmé, décliné.",
      },
      {
        q: "Peut-on importer sa liste d'invités depuis Excel ?",
        a: "Oui. Import direct depuis Excel ou Google Sheets avec tous les champs : prénom, nom, email, téléphone, lien de parenté, type, régime alimentaire, etc.",
      },
      {
        q: "Comment fonctionnent les faire-part animés ?",
        a: "Chaque invité reçoit un faire-part numérique personnalisé à son prénom, avec une animation d'ouverture. Le faire-part affiche la photo de couverture du mariage, les noms des mariés, la date, le lieu et le mot des mariés. Il contient un QR code personnel. Partageable par lien, e-mail, WhatsApp ou SMS. Version PDF téléchargeable.",
      },
    ],
  },
  {
    title: "Fonctionnalités mariés",
    questions: [
      {
        q: "Comment fonctionne le plan de table ?",
        a: "Interface glisser-déposer. Créez vos tables (nom + capacité), assignez les invités en les faisant glisser. Filtrage par invités non placés ou par statut RSVP. Modifiable jusqu'à la veille du mariage. Récapitulatif imprimable en PDF.",
      },
      {
        q: "Comment fonctionne la playlist participative ?",
        a: "Les mariés organisent la musique par moment : cérémonie, vin d'honneur, dîner, soirée. Les invités suggèrent des morceaux depuis leur espace. Liens Spotify/Deezer possibles. Liste exportable pour le DJ.",
      },
      {
        q: "Comment fonctionne l'album photo partagé ?",
        a: "Espace centralisé où mariés et invités déposent leurs photos. Taggage des personnes visibles. Filtrage par moment. Lightbox, sélection multiple, téléchargement ZIP. QR code imprimable pour les tables le jour J. Plus besoin de Google Drive, Facebook ou WhatsApp.",
      },
      {
        q: "Comment fonctionne le suivi de budget ?",
        a: "Suivi des dépenses par catégorie avec total en temps réel. Téléversement des devis en PDF. Suivi des acomptes versés et restes à charge.",
      },
      {
        q: "Comment fonctionne la messagerie interne ?",
        a: "Remplace les multiples groupes WhatsApp. Groupes de discussion ciblés avec tags personnalisés : @lestemoins, @babysittermariage, @famille, @prestataires.",
      },
      {
        q: "Comment coordonner ses prestataires avec Kaatch ?",
        a: "Les mariés invitent leurs prestataires via un lien de partage dédié. Ils choisissent exactement quelles informations partager. Si un changement est fait (nouvel horaire, modification du menu, nombre d'invités mis à jour), le prestataire voit instantanément la modification. Tout est centralisé au lieu d'être éparpillé entre mails, WhatsApp et SMS.",
      },
      {
        q: "Peut-on imprimer les documents de l'organisation ?",
        a: "Oui. La boîte à outils permet d'imprimer tous les documents en PDF : plan de table, programme, liste d'invités, récapitulatif budget.",
      },
    ],
  },
  {
    title: "Espace invités",
    questions: [
      {
        q: "Que voit un invité quand il accède à son espace ?",
        a: "Une page d'accueil avec un compte à rebours jusqu'au mariage, les informations essentielles et des raccourcis vers toutes les sections : RSVP, programme, photos, livre d'or, playlist, hébergements, messagerie, contacts utiles et animations.",
      },
      {
        q: "Comment fonctionne le livre d'or numérique ?",
        a: "Les invités écrivent des messages depuis leur espace personnel. Les mariés consultent tous les messages à tout moment. Un recueil de souvenirs accessible depuis n'importe quel appareil.",
      },
      {
        q: "Les invités peuvent-ils suggérer de la musique ?",
        a: "Oui. Depuis leur espace, les invités proposent des morceaux pour la playlist en précisant le moment souhaité.",
      },
    ],
  },
  {
    title: "Tarifs et pratique",
    questions: [
      {
        q: "Combien coûte Kaatch ?",
        a: "Plan Découverte inclus sans frais (30 invités, 20 photos). Plan Mariage à 45 euros en paiement unique, invités sans limite, 200 photos incluses. Pas d'abonnement, pas de frais cachés, pas de carte bleue requise pour le plan Découverte.",
      },
      {
        q: "Peut-on passer du plan gratuit au plan payant ?",
        a: "Oui, à tout moment. Les données déjà saisies sont conservées.",
      },
      {
        q: "Les données sont-elles sécurisées ?",
        a: "Oui. Hébergement par Vercel (infrastructure web) et Supabase (base de données), deux services reconnus pour leur fiabilité et leur sécurité.",
      },
      {
        q: "Que se passe-t-il après le mariage ?",
        a: "Les données (photos, messages, liste d'invités) restent accessibles aussi longtemps que l'espace est actif. Tout est téléchargeable à tout moment.",
      },
      {
        q: "Comment contacter l'équipe Kaatch ?",
        a: "Par email à bonjour@kaatch.fr. L'équipe répond dans la journée.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <main
      className="min-h-screen bg-[#f5f0e8] px-4 py-16"
      style={{ fontFamily: "var(--font-lato)", fontWeight: 300, color: "#2d3228" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 400,
              color: "#2d3228",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            Questions fréquentes
          </h1>
          <p className="text-stone-500 text-base" style={{ fontWeight: 300 }}>
            Tout ce que vous voulez savoir sur Kaatch avant de vous lancer.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontSize: "1.6rem",
                  fontWeight: 400,
                  color: "#4a5240",
                  marginBottom: "1rem",
                }}
              >
                {section.title}
              </h2>

              <div className="space-y-3">
                {section.questions.map((item) => (
                  <details
                    key={item.q}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group"
                  >
                    <summary
                      className="cursor-pointer px-6 py-4 font-medium text-stone-800 list-none flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <span>{item.q}</span>
                      <span className="text-[#4a5240] text-xl shrink-0 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div
                      className="px-6 pb-5 pt-1 text-stone-600 leading-relaxed"
                      style={{ fontWeight: 300 }}
                    >
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-stone-500 mb-6 text-sm" style={{ fontWeight: 300 }}>
            Une autre question ? On vous répond dans la journée.
          </p>
          <a
            href="mailto:bonjour@kaatch.fr"
            className="inline-block px-8 py-3 rounded-full text-white text-sm transition-colors bg-[#4a5240] hover:bg-[#2d3228]"
            style={{ fontWeight: 400 }}
          >
            Écrire à l&apos;équipe
          </a>
        </div>
      </div>
    </main>
  )
}
