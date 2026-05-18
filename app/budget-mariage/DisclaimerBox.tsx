'use client'

import Link from 'next/link'

export default function DisclaimerBox() {
  return (
    <div className="mt-8 bg-stone-50 border border-stone-200 rounded-lg p-6">
      <div className="flex gap-4">
        <div className="text-xl flex-shrink-0">ℹ️</div>
        <div className="flex-1 text-sm text-stone-700 space-y-3">
          <p>
            <strong>À propos de cette estimation</strong>
          </p>
          <p>
            Les montants affichés sont des <strong>estimations indicatives</strong> basées sur les tarifs
            moyens du marché français en 2026. Ils ne constituent en aucun cas un devis ni un engagement
            contractuel.
          </p>
          <p>Votre budget réel peut varier selon :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>La saison (haute saison +20-30%)</li>
            <li>La localisation précise (Paris/PACA vs régions rurales)</li>
            <li>Vos choix personnels (prestataires, niveau de gamme, options)</li>
            <li>Les imprévus (prévoir une marge de 10-15%)</li>
          </ul>
          <p className="pt-2">
            <Link href="/budget-mariage/methodologie" className="text-[#4a5240] hover:underline font-medium">
              → En savoir plus sur notre méthodologie
            </Link>
          </p>
          <p className="text-xs text-stone-500 pt-2 border-t border-stone-200">
            Sources : Mariages.net, Zankyou Wedding Report, INSEE. Dernière mise à jour : janvier 2026.
          </p>
        </div>
      </div>
    </div>
  )
}
