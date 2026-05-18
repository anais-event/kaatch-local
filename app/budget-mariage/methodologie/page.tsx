import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Notre méthodologie : calcul budget mariage Kaatch',
  description:
    'Découvrez comment nous calculons les estimations de budget mariage. Sources fiables, données terrain 2026, mise à jour trimestrielle.',
  keywords: 'méthodologie budget mariage, tarifs mariage 2026, calcul budget, sources fiables',
}

export default function MethodologiePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-[#faf8f3] border-b border-stone-200 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/budget-mariage" className="text-sm text-stone-600 hover:text-stone-800 mb-6 inline-block">
            ← Retour au calculateur
          </Link>
          <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-4" style={{ fontFamily: 'var(--font-lato)' }}>
            Notre méthodologie
          </h1>
          <h2 className="text-lg text-stone-600 font-light">
            Comment fonctionne le calcul de budget mariage
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <article className="space-y-10">
          {/* Intro */}
          <section className="space-y-4">
            <p className="text-stone-700 text-lg leading-relaxed">
              Vous vous demandez d'où viennent nos chiffres ? Excellente question. Ici, on prône la transparence
              totale. Voilà comment on a construit ce calculateur.
            </p>
          </section>

          {/* Où viennent les tarifs */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">📊 Où viennent les tarifs ?</h3>
            <p className="text-stone-700">
              Nos montants moyens sont basés sur <strong>3 sources fiables</strong> :
            </p>

            <div className="space-y-6 pl-6 border-l-2 border-stone-300">
              <div>
                <h4 className="font-medium text-stone-800 mb-3">1. Études sectorielles de référence</h4>
                <ul className="space-y-2 text-stone-700 text-sm">
                  <li>
                    <strong>Mariages.net</strong> — Baromètre annuel du budget mariage en France (2 000+ couples
                    interrogés)
                  </li>
                  <li>
                    <strong>Zankyou Wedding Report 2025</strong> — Enquête internationale avec focus France
                  </li>
                  <li>
                    <strong>INSEE</strong> — Données sur les dépenses des ménages français par catégorie
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-stone-800 mb-3">2. Données terrain collectées directement</h4>
                <p className="text-stone-700 text-sm mb-3">Chaque trimestre, on contacte des prestataires réels :</p>
                <ul className="space-y-1 text-stone-700 text-sm list-disc list-inside">
                  <li>30+ salles de réception en France (petites, moyennes, grandes villes)</li>
                  <li>25+ traiteurs de différentes régions</li>
                  <li>20+ photographes/vidéographes</li>
                  <li>15+ fleuristes/décorateurs</li>
                  <li>DJ, animateurs, pâtissiers, etc.</li>
                </ul>
                <p className="text-stone-700 text-sm mt-3">
                  <em>
                    On récupère les tarifs de base 2026, on fait des moyennes par région, et on applique des
                    coefficients pour tenir compte du coût de la vie local.
                  </em>
                </p>
              </div>

              <div>
                <h4 className="font-medium text-stone-800 mb-3">3. Retours anonymes de couples Kaatch</h4>
                <p className="text-stone-700 text-sm">
                  Si vous utilisez Kaatch pour budgéter votre mariage, vos dépenses réelles (totalement anonymisées)
                  alimentent nos données futures. C'est un cercle vertueux : plus les gens utilisent le calculateur,
                  plus nos estimations deviennent précises.
                </p>
              </div>
            </div>
          </section>

          {/* Comment on calcule */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">🎯 Comment on calcule les montants ?</h3>
            <p className="text-stone-700">
              Pour chaque catégorie, on utilise <strong>3 paliers</strong> :
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-300">
                    <th className="text-left py-3 px-3 font-medium text-stone-800">Palier</th>
                    <th className="text-left py-3 px-3 font-medium text-stone-800">Définition</th>
                    <th className="text-left py-3 px-3 font-medium text-stone-800">Exemple : Salle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 px-3 text-stone-700 font-medium">Basique</td>
                    <td className="py-3 px-3 text-stone-700">Budget serré, choix simplifiés</td>
                    <td className="py-3 px-3 text-stone-700">3 000-4 500€ (lieu classique, peu de prestations)</td>
                  </tr>
                  <tr className="border-b border-stone-200">
                    <td className="py-3 px-3 text-stone-700 font-medium">Standard</td>
                    <td className="py-3 px-3 text-stone-700">La médiane, budget « normal »</td>
                    <td className="py-3 px-3 text-stone-700">5 500-7 000€ (lieu sympa, quelques plus)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 text-stone-700 font-medium">Premium</td>
                    <td className="py-3 px-3 text-stone-700">Haut de gamme, service exclusive</td>
                    <td className="py-3 px-3 text-stone-700">8 500-12 000€+ (château, vignoble, luxe)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-stone-700">
              Vous choisissez votre niveau de budget pour chaque poste, et on compile automatiquement le total.{' '}
              <strong>C'est simple comme ça.</strong>
            </p>
          </section>

          {/* Variations régionales */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">📍 Les variations régionales</h3>
            <p className="text-stone-700">Un mariage à Paris n'a pas le même prix qu'en Auvergne, c'est logique.</p>
            <p className="text-stone-700">Notre calculateur tient compte du coefficient régional :</p>

            <div className="space-y-2 pl-6 border-l-2 border-stone-300">
              <div className="text-stone-700">
                <strong>Île-de-France</strong> : +25 à +35% vs moyenne France
              </div>
              <div className="text-stone-700">
                <strong>Côte d'Azur / Provence</strong> : +15 à +20%
              </div>
              <div className="text-stone-700">
                <strong>Grandes métropoles</strong> (Lyon, Toulouse, Bordeaux) : +10 à +15%
              </div>
              <div className="text-stone-700">
                <strong>Régions rurales</strong> : -10 à -20%
              </div>
            </div>

            <p className="text-stone-700">
              C'est pour ça que si vous habitez en Île-de-France, les montants proposés seront automatiquement ajustés
              à la hausse. C'est plus juste.
            </p>
          </section>

          {/* Mise à jour */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">🔄 Mise à jour : quand on recalcule ?</h3>
            <p className="text-stone-700 font-medium">Tous les trimestres.</p>
            <p className="text-stone-700">
              En janvier, avril, juillet, octobre, on redémarche nos prestataires, on récupère les nouveaux tarifs
              (inflation, saisonnalité, tendances), et on update le calculateur.
            </p>
            <p className="text-stone-700 text-sm text-stone-500">
              <em>Dernière mise à jour : janvier 2026</em>
            </p>
          </section>

          {/* Les limites */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">⚠️ Les limites (qu'on assume)</h3>
            <p className="text-stone-700">
              Soyons honnêtes : c'est une <strong>estimation indicative, pas un devis.</strong>
            </p>

            <div className="bg-stone-50 p-6 rounded-lg space-y-4">
              <p className="font-medium text-stone-800">Votre budget réel peut varier parce que :</p>
              <ul className="space-y-2 text-stone-700 list-disc list-inside">
                <li>Vous avez des goûts / demandes spécifiques</li>
                <li>La saison impacte (mai-septembre = +20-30%)</li>
                <li>Les imprévus arrivent toujours (budget +15% de marge)</li>
                <li>Les prestataires font des prix custom (négociation possible)</li>
                <li>Vous vivez dans une micro-région pas représentée dans nos données</li>
              </ul>
            </div>

            <p className="text-stone-700 font-medium">→ À utiliser comme point de départ, pas comme vérité absolue.</p>
          </section>

          {/* Pourquoi on fait ça gratuitement */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">💡 Pourquoi on fait ça gratuitement ?</h3>
            <p className="text-stone-700">Simple : c'est une valeur ajoutée pour vous.</p>
            <p className="text-stone-700">
              Si vous avez une estimation fiable du coût de votre mariage, vous allez naturellement vouloir
              l'organiser quelque part. Et nous, on pense que{' '}
              <Link href="/" className="text-[#4a5240] hover:underline font-medium">
                Kaatch est l'endroit idéal pour budgéter et tracker vos dépenses
              </Link>
              .
            </p>
            <p className="text-stone-700">Sans pression, sans obligation. C'est juste du bon sens. 😊</p>
          </section>

          {/* Feedback */}
          <section className="space-y-6">
            <h3 className="text-2xl font-light text-stone-800">📧 Vous pensez qu'on s'est trompés ?</h3>
            <p className="text-stone-700">
              Si les chiffres que vous avez eus de vos prestataires divergent beaucoup de nos estimations,{' '}
              <strong>dites-nous</strong> ! On aime les retours.
            </p>
            <p className="text-stone-700">
              Envoyez un mail à <strong>hello@kaatch.fr</strong> avec la région + le poste + votre prix réel.
            </p>
            <p className="text-stone-700">Plus on reçoit de feedback, plus nos données s'améliorent. Et c'est du win-win.</p>
          </section>

          {/* Footer */}
          <div className="pt-12 border-t border-stone-200">
            <p className="text-stone-600 text-sm">
              <em>Dernière mise à jour : janvier 2026</em>
            </p>
            <div className="mt-8 flex gap-4">
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
  )
}
