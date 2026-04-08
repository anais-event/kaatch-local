'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inscription</h1>
        <p className="text-gray-400 mb-8">Créez votre compte Kaatch 💍</p>

        <form onSubmit={handleSignup}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-6 text-sm outline-none"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <a href="/auth" className="text-black font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  )
}