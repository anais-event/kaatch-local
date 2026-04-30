'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function PasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setStatus('error'); setMsg('Le mot de passe doit faire au moins 8 caractères.'); return
    }
    if (newPassword !== confirm) {
      setStatus('error'); setMsg('Les deux mots de passe ne correspondent pas.'); return
    }
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setStatus('error'); setMsg('Erreur : ' + error.message)
    } else {
      setStatus('success'); setMsg('Mot de passe mis à jour ✓')
      setNewPassword(''); setConfirm('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div>
        <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
               className="block text-stone-400 uppercase mb-1.5">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="8 caractères minimum"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white text-sm"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        />
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
               className="block text-stone-400 uppercase mb-1.5">
          Confirmer
        </label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Retapez le mot de passe"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white text-sm"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        />
      </div>
      {msg && (
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
           className={status === 'success' ? 'text-green-600' : 'text-red-500'}>
          {msg}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-[#4a5240] text-white px-5 py-2 rounded-full text-sm hover:bg-[#2d3228] transition disabled:opacity-50"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        {status === 'loading' ? 'Enregistrement…' : 'Mettre à jour'}
      </button>
    </form>
  )
}
