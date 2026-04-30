import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function UpgradePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, plan')
    .eq('slug', slug)
    .single()

  if (!wedding) redirect(`/wedding/${slug}`)
  if (wedding.plan === 'mariage' || wedding.plan === 'pro') redirect(`/wedding/${slug}`)

  // URL Lemon Squeezy avec les données du mariage pré-remplies
  const baseUrl = process.env.LEMONSQUEEZY_CHECKOUT_URL ?? 'https://kaatch-mariage.lemonsqueezy.com/checkout/buy/a9a7912e-a499-41a4-83ee-a885e4d3855c'
  const checkoutUrl = `${baseUrl}?checkout[custom][wedding_id]=${wedding.id}&checkout[custom][plan]=mariage`

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-6"
         style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-lg w-full">

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>
            Passer à l'offre supérieure
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2.4rem', lineHeight: 1.2 }}
              className="text-[#2d3228] mb-3">
            Offre 💍 Mariage
          </h1>
          <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
            Un paiement unique. Accès à vie pour votre mariage.
          </p>
        </div>

        {/* Carte tarif */}
        <div className="bg-[#4a5240] rounded-2xl p-8 text-white mb-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-amber-400 text-amber-900 text-xs px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ fontWeight: 400 }}>
              ✦ Prix de lancement
            </span>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '3.5rem', lineHeight: 1 }}>
              45
            </span>
            <div className="pb-2">
              <p style={{ fontWeight: 300, fontSize: '0.85rem', textDecoration: 'line-through' }}
                 className="text-white/40">65</p>
              <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-white/60">euros · paiement unique</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {[
              'Invités & photos illimités',
              'RSVP complet',
              'Invitation à plusieurs moments de la fête',
              'Plan de table',
              'Gestion budget',
              'Site personnalisé',
              'Sans branding Kaatch',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90" style={{ fontWeight: 300 }}>
                <span className="text-amber-300 shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton paiement */}
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
           className="block w-full text-center bg-[#4a5240] text-white px-8 py-4 rounded-xl hover:bg-[#2d3228] transition text-sm font-normal"
           style={{ fontWeight: 300, letterSpacing: '0.05em' }}>
          Passer à l'offre Mariage →
        </a>

        <p className="text-center mt-4 text-xs text-stone-400" style={{ fontWeight: 300 }}>
          Paiement sécurisé · Accès immédiat après paiement · Prix en euros
        </p>

        <div className="text-center mt-8">
          <a href={`/wedding/${slug}`}
             className="text-sm text-stone-400 hover:text-[#4a5240] transition"
             style={{ fontWeight: 300 }}>
            ← Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  )
}
