import type { Metadata } from 'next'
import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import PublicNav from '@/app/_components/PublicNav'
import messages from '@/messages/fr.json'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notre méthodologie : calcul budget mariage Kaatch',
  description:
    'Découvrez comment nous calculons les estimations de budget mariage. Sources fiables, données terrain 2026, mise à jour trimestrielle.',
  keywords: 'méthodologie budget mariage, tarifs mariage 2026, calcul budget, sources fiables',
}

export default function MethodologiePage() {
  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
    <main className="min-h-screen bg-[#f5f0e8]">
      <PublicNav active="budget-mariage" />

      {/* Header */}
      <div className="pt-24 pb-10 md:pt-28 md:pb-14 px-5 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Link href="/budget-mariage" className="text-sm text-stone-600 hover:text-stone-800 mb-6 inline-block">
            ← Retour au calculateur
          </Link>
          <h1 className="text-[#2C3B2E] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            D&apos;où viennent nos chiffres ?
          </h1>
          <p className="text-stone-500 max-w-xl" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '1rem' }}>
            Transparence totale sur la méthodologie — parce que vous méritez mieux que des estimations sorties de nulle part
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <article className="space-y-12">
          {/* Intro */}
          <section className="space-y-4 bg-white border border-stone-100 rounded-2xl p-6">
            <p className="text-stone-700 text-lg leading-relaxed">
              Vous vous demandez d&apos;où viennent nos chiffres ? Excellente question — c'est même la question qu'on se pose tout le temps en voyant certaines estimations de mariage qui font tellement peur qu'on a envie de repenser tout en petit comité 😅
            </p>
            <p className="text-stone-700 leading-relaxed">
              Ici, on prône la transparence totale. Voilà comment on a construit ce calculateur, en s'appuyant sur <strong>des sources réelles</strong> et <strong>des tarifs terrain 2026</strong>.
            </p>
          </section>

          {/* 3 sources */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">📊 Trois sources qui se parlent</h3>
            <p className="text-stone-700">
              On ne s'invente pas des chiffres. Nos estimations reposent sur trois piliers :
            </p>

            <div className="space-y-6">
              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">1. Les grandes études sectorielles</h4>
                <p className="text-stone-700 text-sm mb-3">Des enquêtes annuelles, fiables :</p>
                <ul className="space-y-2 text-stone-700 text-sm">
                  <li>
                    <strong>Mariages.net</strong> — Le baromètre annuel français (2 000+ couples interrogés chaque année)
                  </li>
                  <li>
                    <strong>Zankyou Wedding Report 2025</strong> — Enquête internationale avec données France détaillées
                  </li>
                  <li>
                    <strong>INSEE</strong> — Dépenses réelles des ménages français par catégorie (données gouvernementales)
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">2. Le terrain, quatre fois par an</h4>
                <p className="text-stone-700 text-sm mb-4">
                  Chaque trimestre (janvier, avril, juillet, octobre), on appelle les prestataires directement pour récupérer les vrais tarifs :
                </p>
                <ul className="space-y-1 text-stone-700 text-sm list-disc list-inside">
                  <li>30+ salles de réception en France (petites, moyennes, grandes villes)</li>
                  <li>25+ traiteurs de différentes régions</li>
                  <li>20+ photographes / vidéographes indépendants</li>
                  <li>15+ fleuristes / décorateurs</li>
                  <li>DJ, animateurs, pâtissiers, prestataires divers</li>
                </ul>
                <p className="text-stone-700 text-sm mt-4 italic">
                  On récupère les tarifs de base 2026, on calcule les moyennes par région, on applique des coefficients pour tenir compte du coût de la vie local (Paris ≠ Corrèze). C'est du vrai boulot.
                </p>
              </div>

              <div className="bg-white border border-stone-100 rounded-xl p-6">
                <h4 className="font-medium text-stone-800 mb-3 text-lg">3. Vous — les vrais chiffres de vrais mariages</h4>
                <p className="text-stone-700 text-sm">
                  Si vous utilisez Kaatch pour budgéter votre mariage et qu'on vous demande (complètement anonyme) vos dépenses réelles, elles alimentent nos données futures. C'est un cercle vertueux : <strong>plus les gens utilisent le calculateur, plus les estimations deviennent précises.</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">🎯 Comment on construit le calcul</h3>
            <p className="text-stone-700">
              Pour chaque ligne (photographe, DJ, fleurs, etc.), on propose <strong>trois paliers de budget</strong> :
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">Palier</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">Signification</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-800 border-b border-stone-200">Exemple : Salle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">€ Économique</td>
                    <td className="py-3 px-4 text-stone-700">Budget serré, choix épurés</td>
                    <td className="py-3 px-4 text-stone-700">800 € (salle municipale, lieu familial)</td>
                  </tr>
                  <tr className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">€€ Classique</td>
                    <td className="py-3 px-4 text-stone-700">La médiane — la plupart des couples</td>
                    <td className="py-3 px-4 text-stone-700">4 000 € (domaine, grange rénovée)</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-3 px-4 text-stone-700 font-medium">€€€ Premium</td>
                    <td className="py-3 px-4 text-stone-700">Haut de gamme, prestation complète</td>
                    <td className="py-3 px-4 text-stone-700">10 000 € (château, vignoble, luxe)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-stone-700">
              Vous sélectionnez votre palier pour chaque poste, et le calculateur compile automatiquement le total. Rien de magique, juste de l&apos;addition intelligente.
            </p>

            <div className="bg-white border border-stone-100 rounded-xl p-6 space-y-4 mt-6">
              <h4 className="font-medium text-stone-800 text-lg">Fonctionnalités du calculateur</h4>
              <ul className="space-y-2 text-stone-700 text-sm list-disc list-inside">
                <li><strong>19 postes détaillés</strong> — chacun avec description, conseil pratique 💡, et 3 niveaux chiffrés</li>
                <li><strong>3 types de calcul</strong> — forfait fixe, coût par invité (×nombre de convives), ou pourcentage du sous-total</li>
                <li><strong>{"\"J'ai déjà un devis\""}</strong> — saisissez votre propre montant pour remplacer l&apos;estimation</li>
                <li><strong>Voyage de noces hors total</strong> — séparé du budget mariage principal pour plus de clarté</li>
                <li><strong>Divers & imprévus</strong> — calculé en % du sous-total (5 %, 8 % ou 12 % selon le niveau)</li>
                <li><strong>Réorganisation libre</strong> — glissez-déposez les postes dans l&apos;ordre qui vous convient</li>
                <li><strong>Export PDF</strong> — téléchargez votre estimation complète en un clic</li>
              </ul>
            </div>
          </section>

          {/* Régions */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">📍 Les tarifs varient énormément selon où vous êtes</h3>
            <p className="text-stone-700">
              Organiser un mariage à Paris, en Île-de-France, en Provence, et en Auvergne... ce ne sont clairement pas les mêmes prix. Notre calculateur applique un <strong>coefficient régional</strong> automatique :
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">Île-de-France</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">+30%</p>
                <p className="text-stone-600 text-sm mt-2">vs moyenne France</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">Côte d'Azur / Provence</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">+18%</p>
                <p className="text-stone-600 text-sm mt-2">vs moyenne France</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">Grandes métropoles</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">+12%</p>
                <p className="text-stone-600 text-sm mt-2">Lyon, Toulouse, Bordeaux</p>
              </div>
              <div className="bg-white border border-stone-100 rounded-lg p-4">
                <p className="text-stone-700 font-medium">Régions rurales</p>
                <p className="text-2xl font-light text-[#4a5240] mt-1">-10% à -20%</p>
                <p className="text-stone-600 text-sm mt-2">vs moyenne France</p>
              </div>
            </div>

            <p className="text-stone-700 mt-4">
              Quand vous entrez votre ville ou région, le calculateur ajuste les montants automatiquement. C'est plus juste qu'une moyenne unique.
            </p>
          </section>

          {/* Updates */}
          <section className="space-y-6 bg-white border border-stone-100 rounded-xl p-6">
            <h3 className="text-2xl font-light text-stone-800">🔄 Mise à jour : comment on reste à jour</h3>
            <p className="text-stone-700 font-medium">Tous les trimestres (janvier, avril, juillet, octobre).</p>
            <p className="text-stone-700">
              On redémarche nos contacts prestataires, on récupère les nouveaux tarifs (inflation, saisonnalité, tendances du moment), et on met à jour le calculateur. Pas de données fossilisées, on suit le marché réel.
            </p>
            <p className="text-stone-700 text-sm text-stone-500 mt-4">
              <em>Dernière mise à jour : mai 2026</em>
            </p>
          </section>

          {/* Limites — honest */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">⚠️ Soyons honnêtes : les limites</h3>
            <p className="text-stone-700">
              <strong>C'est une estimation indicative, pas un devis.</strong> On voudrait que les chiffres soient magiquement précis, mais la réalité, c'est plus nuancé.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 space-y-4">
              <p className="font-medium text-stone-800">Votre budget réel peut varier parce que :</p>
              <ul className="space-y-2 text-stone-700 list-disc list-inside">
                <li><strong>Vous avez des goûts spécifiques</strong> — Vous voulez un photographe étranger ? Un traiteur ultra spécialisé ? Un DJ en vinyl uniquement ? Ça coûtera plus cher.</li>
                <li><strong>La saisonnalité joue énormément</strong> — Mai à septembre = +20-30% minimum. Décembre et janvier, ça baisse.</li>
                <li><strong>Les imprévus arrivent toujours</strong> — Prévoir une marge de 10-15% est sage.</li>
                <li><strong>Les prestataires négocient</strong> — Surtout en basse saison ou si vous prenez plusieurs services d'une même personne.</li>
                <li><strong>Votre micro-région n'est peut-être pas représentée</strong> — Si vous vivez dans un coin très reculé ou très touristique, l'estimation moyenne peut dévier.</li>
              </ul>
            </div>

            <p className="text-stone-700 font-medium">
              → À utiliser comme <strong>point de départ réaliste</strong>, pas comme vérité absolue.
            </p>
          </section>

          {/* Pourquoi gratuit */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">💡 Pourquoi on fait ça gratuitement ?</h3>
            <p className="text-stone-700">
              Logique simple : si vous avez une estimation <strong>fiable et apaisante</strong> du coût réel de votre mariage, vous allez naturellement vouloir l'organiser quelque part. Et on pense vraiment que{' '}
              <Link href="/" className="text-[#4a5240] hover:underline font-medium">
                Kaatch est l'endroit idéal pour budgéter, tracker vos dépenses, et tout centraliser.
              </Link>
            </p>
            <p className="text-stone-700">
              Aucune pression, aucune obligation. C'est juste du bon sens.
            </p>
          </section>

          {/* Feedback */}
          <section className="space-y-6 bg-white border border-stone-100 rounded-xl p-6">
            <h3 className="text-2xl font-light text-stone-800">📧 Vous pensez qu'on s'est trompés ?</h3>
            <p className="text-stone-700">
              Si vos prestataires vous donnent des tarifs qui divergent vraiment de nos estimations, <strong>dites-nous</strong> — on adore les retours et on améliore les données continuellement.
            </p>
            <p className="text-stone-700">
              Envoyez un mail à <strong>hello@kaatch.fr</strong> avec : région + type de prestataire + tarif réel obtenu.
            </p>
            <p className="text-stone-700 text-sm mt-3">
              Chaque retour améliore la base pour les couples suivants. Win-win.
            </p>
          </section>

          {/* Footer */}
          <div className="pt-12 border-t border-stone-200">
            <p className="text-stone-600 text-sm">
              <em>Dernière mise à jour : mai 2026</em>
            </p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/budget-mariage"
                className="px-6 py-3 bg-[#4a5240] text-white rounded-lg font-medium hover:bg-[#2d3228] transition-colors"
              >
                ← Retour au calculateur
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors"
              >
                Aller à mon espace Kaatch →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
    </NextIntlClientProvider>
  )
}
