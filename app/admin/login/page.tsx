'use client'

import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

const SAGE_DARK = '#2d3228'

function AdminLoginInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const denied = sp.get('denied') === '1'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fontCormorant = { fontFamily: 'var(--font-display)' }
  const fontLato = { fontFamily: 'var(--font-body)', fontWeight: 300 as const }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })
    if (err) {
      setError('Identifiants incorrects.')
      setLoading(false)
      return
    }
    // L'autorisation admin est vérifiée côté serveur par /admin : s'il n'est pas admin,
    // /admin le renverra ici avec ?denied=1 (aucune autorisation fondée sur le client).
    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]" style={fontLato}>
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <a href="/" style={{ ...fontCormorant, fontWeight: 700, fontSize: '2.2rem', letterSpacing: '-0.03em' }} className="text-[#2C3B2E]">Kaatch</a>
          <p style={{ ...fontLato, fontSize: '0.75rem', letterSpacing: '0.18em' }} className="text-stone-400 uppercase mt-1">Administration</p>
        </div>

        {denied && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800" style={fontLato}>
            Ce compte n'a pas accès à l'administration Kaatch.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input name="email" type="email" placeholder="Email administrateur" required autoComplete="email"
            className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700" style={fontLato} />
          <div className="relative">
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required autoComplete="current-password"
              className="w-full border border-stone-300 rounded-xl px-4 py-3 bg-white/80 outline-none focus:border-[#2C3B2E] transition text-stone-700" style={fontLato} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer" style={fontLato}>
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {error && <p className="text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-2" style={{ ...fontLato, fontSize: '0.82rem' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full text-white py-3 rounded-full transition disabled:opacity-50 cursor-pointer"
            style={{ ...fontLato, background: SAGE_DARK, letterSpacing: '0.08em', fontSize: '0.85rem' }}>
            {loading ? 'Connexion…' : 'Accéder à l’administration'}
          </button>
        </form>

        <p className="text-center mt-8">
          <a href="/" className="text-stone-400 hover:text-stone-600 text-sm" style={fontLato}>← Retour au site</a>
        </p>
      </div>
    </main>
  )
}

export default function AdminLogin() {
  return (
    <Suspense>
      <AdminLoginInner />
    </Suspense>
  )
}
