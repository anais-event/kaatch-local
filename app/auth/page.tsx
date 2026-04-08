'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Auth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

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

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResetLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.get('email') as string,
      { redirectTo: `${window.location.origin}/auth/update-password` }
    )

    if (error) {
      alert('Erreur : ' + error.message)
      setResetLoading(false)
      return
    }

    setResetSent(true)
    setResetLoading(false)
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
            {resetMode ? 'Mot de passe oublié' : 'Connexion'}
          </p>
        </div>

        {resetMode ? (
          resetSent ? (
            <div className="text-center bg-white/80 rounded-2xl p-6">
              <p className="text-2xl mb-3">📬</p>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontStyle: 'italic' }}
                 className="text-stone-700 mb-2">Email envoyé !</p>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                 className="text-stone-400 mb-4">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
              </p>
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                 className="text-stone-400 mb-6">
                Vous n'avez pas reçu d'email ?{' '}
                <a href="/register" className="text-[#4a5240] hover:underline">Créer un compte</a>
              </p>
              <button onClick={() => { setResetMode(false); setResetSent(false) }}
                className="text-stone-400 hover:text-stone-600 text-sm"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input name="email" type="email" placeholder="Votre email" required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
              <button type="submit" disabled={resetLoading}
                className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <p className="text-center">
                <button type="button" onClick={() => setResetMode(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  ← Retour
                </button>
              </p>
            </form>
          )
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="email" type="email" placeholder="Email" required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 pr-12 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition text-sm">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setResetMode(true)}
                  className="text-xs text-stone-400 hover:text-[#4a5240] transition"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  Mot de passe oublié ?
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center mt-6" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}>
              <span className="text-stone-400">Pas encore de compte ? </span>
              <a href="/register" className="text-[#4a5240] hover:underline">S'inscrire</a>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
