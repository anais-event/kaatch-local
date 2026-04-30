'use client'

import { useState, useTransition } from 'react'

type Props = {
  redeemCode: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  weddingId: string
  slug: string
}

export default function PromoCodeForm({ redeemCode, weddingId, slug }: Props) {
  const [open, setOpen] = useState(false)
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-stone-400 hover:text-[#4a5240] transition underline underline-offset-2 cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        J'ai un code avantage
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
         className="text-[#2d3228] mb-3">Code avantage</p>

      {result?.success ? (
        <div className="flex items-center gap-2 text-emerald-600">
          <span>✓</span>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }}>Code activé — plan Mariage débloqué !</p>
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
            onClick={() => { setOpen(false); setResult(null) }}
            className="text-stone-300 hover:text-stone-500 transition text-sm cursor-pointer px-1">
            ✕
          </button>
        </form>
      )}

      {result?.error && (
        <p className="text-red-400 text-xs mt-2" style={{ fontWeight: 300 }}>{result.error}</p>
      )}
    </div>
  )
}
