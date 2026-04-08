'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Auth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      alert('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '3.5rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">
            Kaatch
          </h1>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.1em' }}
             className="text-stone-400 uppercase mt-1">
            Connexion
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          />
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            required
            className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50 mt-2"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}>
          <span className="text-stone-400">Pas encore de compte ? </span>
          <a href="/register" className="text-[#4a5240] hover:underline">S'inscrire</a>
        </p>
      </div>
    </main>
  )
}
