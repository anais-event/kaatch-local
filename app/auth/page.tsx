'use client'

import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function AuthInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [audience, setAudience] = useState<'choice' | 'married'>('choice')
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'confirm'>('login')
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
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    // Si la session est déjà active (email confirm désactivé côté Supabase), on redirige
    if (data.session) {
      router.push(next)
      router.refresh()
      return
    }
    // Sinon : email de confirmation envoyé
    setMode('confirm' as typeof mode)
    setLoading(false)
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

  const subtitle = mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : mode === 'confirm' ? 'Vérifiez votre email' : 'Mot de passe oublié'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      {/* Bouton retour — mobile uniquement */}
      <a href="/"
        className="fixed top-4 left-4 sm:hidden flex items-center gap-1.5 text-stone-400 hover:text-[#2C3B2E] transition text-sm px-3 py-2 rounded-xl hover:bg-white/60"
        style={fontLato}>
        ← Retour
      </a>
      <div className={`w-full px-6 ${audience === 'choice' ? 'max-w-2xl' : 'max-w-sm'}`}>

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" style={{ ...fontCormorant, fontWeight: 700, fontSize: '2.4rem', letterSpacing: '-0.03em' }}
            className="text-[#2C3B2E]">Kaatch</a>
          <p style={{ ...fontLato, fontSize: '0.8rem', letterSpacing: '0.1em' }}
            className="text-stone-400 uppercase mt-1">
            {audience === 'choice' ? 'Vous êtes…' : 'Votre espace mariage'}
          </p>
        </div>

        {/* CARREFOUR — choix audience */}
        {audience === 'choice' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => { setAudience('married'); setMode('login'); setError('') }}
                className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2C3B2E] transition text-left cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-[#2C3B2E]/8 flex items-center justify-center mb-4 group-hover:bg-[#2C3B2E]/15 transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4a5240" strokeWidth={1.5} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <p style={{ ...fontCormorant, fontWeight: 700, fontSize: '1.2rem' }} className="text-[#2C3B2E] mb-1">
                  Marié·e
                </p>
                <p style={{ ...fontLato, fontSize: '0.82rem', lineHeight: 1.5 }} className="text-stone-500">
                  Gérer mon mariage
                </p>
              </button>

              <a href="/rejoindre"
                className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2C3B2E] transition text-left cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-[#2C3B2E]/8 flex items-center justify-center mb-4 group-hover:bg-[#2C3B2E]/15 transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4a5240" strokeWidth={1.5} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <p style={{ ...fontCormorant, fontWeight: 700, fontSize: '1.2rem' }} className="text-[#2C3B2E] mb-1">
                  Invité·e
                </p>
                <p style={{ ...fontLato, fontSize: '0.82rem', lineHeight: 1.5 }} className="text-stone-500">
                  Rejoindre un mariage
                </p>
              </a>

              <a href="/prestataire/rejoindre"
                className="group bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2C3B2E] transition text-left cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-[#2C3B2E]/8 flex items-center justify-center mb-4 group-hover:bg-[#2C3B2E]/15 transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4a5240" strokeWidth={1.5} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.241.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p style={{ ...fontCormorant, fontWeight: 700, fontSize: '1.2rem' }} className="text-[#2C3B2E] mb-1">
                  Prestataire
                </p>
                <p style={{ ...fontLato, fontSize: '0.82rem', lineHeight: 1.5 }} className="text-stone-500">
                  Accéder à mon espace
                </p>
              </a>
            </div>

            <p className="text-center mt-8">
              <a href="/" className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>← Retour à l'accueil</a>
            </p>
          </>
        )}

        {/* Bouton retour vers carrefour */}
        {audience === 'married' && mode !== 'confirm' && !resetSent && (
          <button
            type="button"
            onClick={() => { setAudience('choice'); setError('') }}
            className="text-stone-400 hover:text-[#2C3B2E] text-xs mb-4 cursor-pointer transition"
            style={fontLato}>
            ← Changer de profil
          </button>
        )}

        {/* Toggle login / signup */}
        {audience === 'married' && mode !== 'reset' && mode !== 'confirm' && !resetSent && (
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
        {audience === 'married' && mode === 'login' && (
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
          </form>
        )}

        {/* INSCRIPTION */}
        {audience === 'married' && mode === 'signup' && (
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

        {/* EMAIL DE CONFIRMATION ENVOYÉ */}
        {audience === 'married' && mode === 'confirm' && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#2C3B2E]/8 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4a5240" strokeWidth={1.5} className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#2C3B2E' }}>
                Un email vous attend !
              </p>
              <p style={{ ...fontLato, fontSize: '0.85rem', lineHeight: 1.7 }} className="text-stone-500 mt-2">
                Cliquez sur le lien dans votre boîte mail pour activer votre compte.
                Pensez à vérifier vos spams si vous ne le voyez pas.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p style={{ ...fontLato, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-amber-700">
                Toujours rien après 5 min ? Vérifiez vos spams ou contactez-nous à{' '}
                <a href="mailto:bonjour@kaatch.fr" className="underline">bonjour@kaatch.fr</a>
              </p>
            </div>
            <button onClick={() => { setMode('login'); setError('') }}
              className="text-stone-400 hover:text-stone-600 text-sm cursor-pointer" style={fontLato}>
              ← Retour à la connexion
            </button>
          </div>
        )}

        {/* MOT DE PASSE OUBLIÉ */}
        {audience === 'married' && mode === 'reset' && !resetSent && (
          <form onSubmit={handleReset} className="space-y-4">
            <p style={{ ...fontCormorant, fontSize: '0.95rem' }} className="text-stone-500 text-center mb-2">
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
        {audience === 'married' && resetSent && (
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
