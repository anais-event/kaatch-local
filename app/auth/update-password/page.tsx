'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UpdatePassword() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      alert('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      alert('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '3.5rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">Kaatch</h1>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.1em' }}
             className="text-stone-400 uppercase mt-1">Nouveau mot de passe</p>
        </div>

        {done ? (
          <div className="text-center bg-white/80 rounded-2xl p-6">
            <p className="text-2xl mb-2">✅</p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontStyle: 'italic' }}
               className="text-stone-700">Mot de passe mis à jour !</p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
               className="text-stone-400 mt-2">Redirection en cours…</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe" required minLength={6}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 pr-12 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <input name="confirm" type={showPassword ? 'text' : 'password'}
              placeholder="Confirmer le mot de passe" required minLength={6}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
            <button type="submit" disabled={loading}
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
