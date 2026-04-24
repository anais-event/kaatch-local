'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p
        className="text-center text-[#2C3B2E]"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '1rem' }}
      >
        ✓ Message reçu — on vous répond vite !
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Votre prénom"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-700 placeholder-stone-400 outline-none focus:border-[#2C3B2E] transition"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />
      <textarea
        placeholder="Votre message…"
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        rows={4}
        className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-700 placeholder-stone-400 outline-none focus:border-[#2C3B2E] transition resize-none"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />
      {status === 'error' && (
        <p className="text-red-500 text-sm text-center" style={{ fontWeight: 300 }}>
          Une erreur est survenue, réessayez.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-[#2C3B2E] text-white rounded-2xl px-8 py-3 text-sm hover:bg-[#1a2419] transition disabled:opacity-60"
        style={{ fontWeight: 500 }}
      >
        {status === 'loading' ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}
