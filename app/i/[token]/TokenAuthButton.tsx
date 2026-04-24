'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TokenAuthButton({ token, firstName }: { token: string; firstName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAccess() {
    setLoading(true)
    const res = await fetch('/api/guest-token-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (data.ok) {
      router.push(`/invite/${data.slug}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <p className="text-stone-400 mb-5" style={{ fontWeight: 300, fontSize: '0.78rem', letterSpacing: '0.12em' }}>
        VOTRE ESPACE PERSONNEL VOUS ATTEND
      </p>
      <button
        onClick={handleAccess}
        disabled={loading}
        className="w-full bg-[#4a5240] text-white py-3.5 rounded-xl hover:bg-[#2d3228] transition disabled:opacity-60 cursor-pointer"
        style={{ fontWeight: 300, fontSize: '0.9rem', letterSpacing: '0.08em' }}
      >
        {loading ? 'Chargement…' : `Accéder à mon espace →`}
      </button>
      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 mt-3">
        Ce lien vous est réservé, {firstName} 🔒
      </p>
    </div>
  )
}
