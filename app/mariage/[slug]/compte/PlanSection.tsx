'use client'

import { useState, useTransition } from 'react'

type Props = {
  plan: string | null
  weddingId: string
  slug: string
  redeemCode: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  checkoutUrl: string
}

export default function PlanSection({ plan, weddingId, slug, redeemCode, checkoutUrl }: Props) {
  const isPaid = plan === 'mariage' || plan === 'pro' || plan === 'essential' || plan === 'premium'
  const [showPromo, setShowPromo] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await redeemCode(fd)
      setResult(res)
      if (res.success) setTimeout(() => window.location.reload(), 1200)
    })
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.95rem' }}
              className="text-[#2d3228] mb-1">
            Formule
          </h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem' }}
             className="text-stone-400">
            Votre abonnement Kaatch actuel
          </p>
        </div>
        <span
          className={`shrink-0 text-xs px-3 py-1 rounded-full font-medium ${isPaid ? 'bg-[#4a5240] text-white' : 'bg-stone-100 text-stone-500'}`}
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
          {isPaid ? '✓ Mariage' : 'Gratuit'}
        </span>
      </div>

      {isPaid ? (
        <div className="bg-[#f5f0e8] rounded-xl px-4 py-3">
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-stone-600">
            Vous bénéficiez de toutes les fonctionnalités Kaatch — invités illimités, galerie complète, rétro-planning avancé et bien plus.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <a
            href={checkoutUrl}
            className="flex items-center justify-center gap-2 w-full bg-[#4a5240] hover:bg-[#2d3228] text-white rounded-xl px-4 py-3 transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
            <span>✨</span>
            Je souhaite débloquer la formule Mariage
          </a>

          {!showPromo ? (
            <button
              onClick={() => setShowPromo(true)}
              className="w-full text-xs text-stone-400 hover:text-[#4a5240] transition underline underline-offset-2 cursor-pointer text-center"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              J'ai un code promotionnel
            </button>
          ) : (
            <div className="border border-stone-100 rounded-xl p-4">
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '0.8rem' }}
                 className="text-stone-500 mb-2">
                Code promotionnel
              </p>

              {result?.success ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <span>✓</span>
                  <p style={{ fontWeight: 300, fontSize: '0.85rem' }}>Code activé — formule Mariage débloquée !</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input type="hidden" name="wedding_id" value={weddingId} />
                  <input type="hidden" name="slug" value={slug} />
                  <input
                    type="text"
                    name="code"
                    placeholder="KAATCH-XXXX"
                    required
                    autoFocus
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition uppercase"
                    style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#4a5240] text-white px-4 py-2 rounded-xl text-xs hover:bg-[#2d3228] transition disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    style={{ fontWeight: 400 }}>
                    {isPending ? '…' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPromo(false); setResult(null) }}
                    className="text-stone-300 hover:text-stone-500 transition text-sm cursor-pointer px-1">
                    ✕
                  </button>
                </form>
              )}

              {result?.error && (
                <p className="text-red-400 text-xs mt-2" style={{ fontWeight: 300 }}>{result.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
