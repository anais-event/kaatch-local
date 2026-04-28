'use client'

import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function AuthInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (err) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password,
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    // Auto sign in après signup
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password,
    })
    if (!loginErr) {
      router.push(next)
      router.refresh()
    } else {
      setError('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      formData.get('email') as string,
      { redirectTo: `${window.location.origin}/auth/update-password` }
    )
    if (err) {
      setError('Une erreur est survenue. Vérifiez votre email.')
      setLoading(false)
      return
    }
    setResetSent(true)
    setLoading(false)
  }

  const fontCormorant = { fontFamily: 'var(--font-display)' }
  const fontLato = { fontFamily: 'var(--font-body)', fontWeight: 300 as const }

  const subtitle = mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="w-full max-w-sm px-6">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" style={{ ...fontCormorant, fontWeight: 700, fontSize: '2.4rem', letterSpacing: '-0.03em' }}
            className="text-[#2C3B2E]">Kaatch</a>
          <p style={{ ...fontLato, fontSize: '0.8rem', letterSpacing: '0.1em' }}
            className="text-stone-400 uppercase mt-1">
            Espace organisateurs
          </p>
        </div>

        {/* Toggle login / signup */}
        {mode !== 'reset' && !resetSent && (
          <div className="flex rounded-xl border border-stone-200 bg-white/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-xs transition cursor-pointer ${mode === 'login' ? 'bg-[#2C3B2E] text-white' : 'text-stone-400 hover:text-stone-600'}`}
              style={fontLato}>
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-xs transition cursor-pointer ${mode === 'signup' ? 'bg-[#2C3B2E] text-white' : 'text-stone-400 hover:text-stone-600'}`}
              style={fontLato}>
              Créer un compte
            </button>
          </div>
        )}

        {/* CONNEXION */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="email" type="email" placeholder="Email" required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
              style={fontLato} />
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
                style={fontLato} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                style={fontLato}>
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {error && <p style={{ ...fontLato, fontSize: '0.82rem' }} className="text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#2C3B2E] text-white py-3 rounded-full hover:bg-[#1a2419] transition disabled:opacity-50 cursor-pointer"
              style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setMode('reset'); setError('') }}
                className="text-stone-400 hover:text-[#2C3B2E] text-sm transition cursor-pointer"
                style={fontLato}>
                Mot de passe oublié ?
              </button>
            </p>
            <p className="text-center text-sm" style={fontLato}>
              <span className="text-stone-400">Vous êtes invité(e) ? </span>
              <a href="/rejoindre" className="text-[#2C3B2E] hover:underline">Rejoindre un mariage</a>
            </p>
            <p className="text-center">
              <a href="/" className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>← Retour</a>
            </p>
          </form>
        )}

        {/* INSCRIPTION */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <input name="email" type="email" placeholder="Votre email" required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
              style={fontLato} />
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Choisir un mot de passe" required minLength={6}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
                style={fontLato} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                style={fontLato}>
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <input name="confirm" type={showPassword ? 'text' : 'password'} placeholder="Confirmer le mot de passe" required minLength={6}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
              style={fontLato} />
            {error && <p style={{ ...fontLato, fontSize: '0.82rem' }} className="text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#2C3B2E] text-white py-3 rounded-full hover:bg-[#1a2419] transition disabled:opacity-50 cursor-pointer"
              style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
            <p className="text-center text-xs text-stone-400" style={fontLato}>
              En créant un compte, vous acceptez nos conditions d'utilisation.
            </p>
            <p className="text-center">
              <a href="/" className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>← Retour</a>
            </p>
          </form>
        )}

        {/* MOT DE PASSE OUBLIÉ */}
        {mode === 'reset' && !resetSent && (
          <form onSubmit={handleReset} className="space-y-4">
            <p style={{ ...fontCormorant, fontSize: '0.95rem', fontStyle: 'italic' }} className="text-stone-500 text-center mb-2">
              Entrez votre email, on vous envoie un lien.
            </p>
            <input name="email" type="email" placeholder="Votre email" required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700"
              style={fontLato} />
            {error && <p style={{ ...fontLato, fontSize: '0.82rem' }} className="text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#2C3B2E] text-white py-3 rounded-full hover:bg-[#1a2419] transition disabled:opacity-50 cursor-pointer"
              style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setMode('login'); setError('') }}
                className="text-stone-400 hover:text-stone-600 text-sm cursor-pointer" style={fontLato}>
                ← Retour
              </button>
            </p>
          </form>
        )}

        {/* CONFIRMATION RESET */}
        {resetSent && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#2C3B2E]/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4a5240" strokeWidth={1.5} className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p style={fontCormorant} className="text-stone-600 text-lg italic">Un lien vous a été envoyé.</p>
            <p style={{ ...fontLato, fontSize: '0.82rem' }} className="text-stone-400">
              Vérifiez votre boîte de réception (et vos spams, on ne sait jamais 😉).
            </p>
            <button onClick={() => { setResetSent(false); setMode('login') }}
              className="text-stone-400 hover:text-stone-600 text-sm cursor-pointer" style={fontLato}>
              ← Retour à la connexion
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

export default function Auth() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  )
}
