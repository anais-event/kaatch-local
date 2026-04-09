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
  const [mode, setMode] = useState<'choice' | 'married' | 'guest'>('married')
  const [guestCode, setGuestCode] = useState('')
  const [guestFirst, setGuestFirst] = useState('')
  const [guestLast, setGuestLast] = useState('')
  const [guestNickname, setGuestNickname] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error) { alert('Erreur : ' + error.message); setLoading(false); return }
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
    if (error) { alert('Erreur : ' + error.message); setResetLoading(false); return }
    setResetSent(true)
    setResetLoading(false)
  }

  async function handleGuestAccess(e: React.FormEvent) {
    e.preventDefault()
    setGuestLoading(true)
    setGuestError('')

    const supabase = createClient()

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id, slug, partner1_name, partner2_name')
      .eq('guest_code', guestCode.toUpperCase().trim())
      .single()

    if (!wedding) {
      setGuestError('Code introuvable. Vérifiez le code sur votre invitation.')
      setGuestLoading(false)
      return
    }

    let query = supabase
      .from('guests')
      .select('id, first_name, last_name, nickname')
      .eq('wedding_id', wedding.id)
      .ilike('first_name', guestFirst.trim())
      .ilike('last_name', guestLast.trim())

    if (guestNickname.trim()) {
      query = query.ilike('nickname', guestNickname.trim())
    }

    const { data: guest } = await query.single()

    if (!guest) {
      setGuestError("Nous ne vous trouvons pas sur la liste. Vérifiez l'orthographe ou contactez les mariés.")
      setGuestLoading(false)
      return
    }

    router.push(`/rsvp/${wedding.slug}?guest=${guest.id}`)
  }

  const fontCormorant = { fontFamily: 'var(--font-cormorant)' }
  const fontLato = { fontFamily: 'var(--font-lato)', fontWeight: 300 }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="w-full max-w-sm px-6">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 style={{ ...fontCormorant, fontWeight: 300, fontSize: '3.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228]">Kaatch</h1>
          <p style={{ ...fontLato, fontSize: '0.8rem', letterSpacing: '0.1em' }}
            className="text-stone-400 uppercase mt-1">
            {mode === 'choice' ? 'Bienvenue' : mode === 'married' ? 'Espace mariés' : 'Accès invité'}
          </p>
        </div>

        {/* CHOIX INITIAL */}
        {mode === 'choice' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('guest')}
              className="w-full bg-[#4a5240] text-white py-4 rounded-2xl hover:bg-[#2d3228] transition"
              style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.9rem' }}>
              Je suis invité(e) 💌
            </button>
            <button
              onClick={() => setMode('married')}
              className="w-full border border-[#4a5240] text-[#4a5240] py-4 rounded-2xl hover:bg-[#4a5240] hover:text-white transition"
              style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.9rem' }}>
              Je suis marié(e) 💍
            </button>
          </div>
        )}

        {/* ESPACE MARIÉS */}
        {mode === 'married' && (
          <>
            {resetSent ? (
              <div className="text-center space-y-4">
                <p style={fontCormorant} className="text-stone-600 text-lg italic">
                  Un lien de réinitialisation a été envoyé à votre adresse email.
                </p>
                <button onClick={() => { setResetSent(false); setResetMode(false) }}
                  className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>
                  ← Retour à la connexion
                </button>
              </div>
            ) : !resetMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input name="email" type="email" placeholder="Email" required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={fontLato} />
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                    style={fontLato} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    style={fontLato}>
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                  style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <p className="text-center">
                  <button type="button" onClick={() => setResetMode(true)}
                    className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>
                    Mot de passe oublié ?
                  </button>
                </p>
                <p className="text-center text-sm" style={fontLato}>
                  <span className="text-stone-400">Vous êtes invité(e) ? </span>
                  <a href="/rejoindre" className="text-[#4a5240] hover:underline">Rejoindre un mariage</a>
                </p>
                <p className="text-center">
                  <a href="/" className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>
                    ← Retour
                  </a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <input name="email" type="email" placeholder="Votre email" required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={fontLato} />
                <button type="submit" disabled={resetLoading}
                  className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                  style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
                  {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
                <p className="text-center">
                  <button type="button" onClick={() => setResetMode(false)}
                    className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>
                    ← Retour
                  </button>
                </p>
              </form>
            )}
          </>
        )}

        {/* ESPACE INVITÉ */}
        {mode === 'guest' && (
          <>
            <form onSubmit={handleGuestAccess} className="space-y-4">
              <div className="bg-white/80 rounded-2xl p-5 border border-stone-200 space-y-3">
                <p style={{ ...fontCormorant, fontSize: '1rem', fontStyle: 'italic' }} className="text-stone-500 mb-1">
                  Le code figure sur votre invitation
                </p>
                <input
                  value={guestCode}
                  onChange={e => setGuestCode(e.target.value)}
                  placeholder="Code mariage (ex: EMMA-THOMAS-2025)"
                  required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 uppercase tracking-widest text-sm"
                  style={fontLato}
                />
              </div>

              <div className="space-y-3">
                <input
                  value={guestFirst}
                  onChange={e => setGuestFirst(e.target.value)}
                  placeholder="Votre prénom"
                  required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={fontLato}
                />
                <input
                  value={guestLast}
                  onChange={e => setGuestLast(e.target.value)}
                  placeholder="Votre nom de famille"
                  required
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={fontLato}
                />
                <input
                  value={guestNickname}
                  onChange={e => setGuestNickname(e.target.value)}
                  placeholder="Surnom (optionnel, si deux personnes portent le même nom)"
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#4a5240] transition text-stone-700"
                  style={fontLato}
                />
              </div>

              {guestError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p style={{ ...fontLato, fontSize: '0.82rem' }} className="text-red-500">{guestError}</p>
                </div>
              )}

              <button type="submit" disabled={guestLoading}
                className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition disabled:opacity-50"
                style={{ ...fontLato, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
                {guestLoading ? 'Recherche...' : 'Accéder à mon invitation →'}
              </button>
            </form>

            <p className="text-center mt-6">
              <button onClick={() => { setMode('choice'); setGuestError('') }}
                className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>
                ← Retour
              </button>
            </p>
          </>
        )}

      </div>
    </main>
  )
}
