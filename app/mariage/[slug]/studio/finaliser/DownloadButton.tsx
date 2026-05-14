'use client'

import { useState } from 'react'

interface Props {
  weddingId: string
  productKey: string
  label: string
}

export default function DownloadButton({ weddingId, productKey, label }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gelato/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, productKey }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Erreur génération PDF')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={download}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a5240]/10 text-[#4a5240] border border-[#4a5240]/20 transition-all hover:bg-[#4a5240]/15 disabled:opacity-50 flex-shrink-0"
        style={{ fontWeight: 400, fontSize: '0.72rem' }}
      >
        {loading ? (
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12" strokeDashoffset="6" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M6 1v6M4 5l2 2 2-2M1 9.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {loading ? 'Génération…' : 'Télécharger'}
      </button>
      {error && <p style={{ fontSize: '0.65rem', fontWeight: 300 }} className="text-red-500 mt-1">{error}</p>}
    </div>
  )
}
