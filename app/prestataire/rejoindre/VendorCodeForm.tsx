'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorCodeForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length < 4) {
      setError("Code trop court")
      return
    }

    setError('')
    startTransition(async () => {
      const res = await fetch('/api/vendor-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Code invalide ou prestataire suspendu")
        return
      }

      const data = await res.json()
      router.push(data.redirect)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={code}
        onChange={e => {
          setCode(e.target.value.toUpperCase())
          setError('')
        }}
        placeholder="Ex : A3F8K2"
        maxLength={8}
        autoFocus
        className="w-full text-center text-2xl tracking-[0.3em] bg-[#f5f0e8] border border-stone-200 rounded-2xl px-4 py-4 outline-none focus:border-[#4a5240] focus:ring-1 focus:ring-[#4a5240]/20 transition placeholder:text-stone-300 placeholder:text-lg placeholder:tracking-[0.15em]"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 500 }}
      />

      {error && (
        <p style={{ fontWeight: 400, fontSize: '0.8rem' }} className="text-red-400 mt-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || code.trim().length < 4}
        className="w-full mt-4 bg-[#2C3B2E] text-white rounded-2xl py-3.5 hover:bg-[#1a2419] transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontWeight: 500, fontSize: '0.9rem' }}
      >
        {pending ? 'Recherche...' : 'Accéder au mariage'}
      </button>
    </form>
  )
}
