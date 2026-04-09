'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GuestAuthForm({
  weddingId,
  weddingSlug,
  code,
}: {
  weddingId: string
  weddingSlug: string
  code: string
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/guest-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId,
        weddingSlug,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim() || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.ok) {
      router.push(`/invité/${weddingSlug}`)
    } else {
      setError(data.message || 'Vous n\'êtes pas sur la liste des invités.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Prénom *"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        required
        className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />
      <input
        type="text"
        placeholder="Nom *"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        required
        className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />
      <input
        type="text"
        placeholder="Surnom (optionnel)"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl mb-1">🚫</p>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
             className="text-red-500">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem', letterSpacing: '0.08em' }}
      >
        {loading ? 'Vérification…' : 'Accéder au mariage'}
      </button>
    </form>
  )
}
