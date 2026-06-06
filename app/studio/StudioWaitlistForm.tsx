'use client'

import { useState } from 'react'

const BODY = 'var(--font-lato)'

export default function StudioWaitlistForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    window.location.href = `mailto:bonjour@kaatch.fr?subject=Studio Kaatch - Me pr%C3%A9venir&body=Email%20%3A%20${encodeURIComponent(email)}`
    setSent(true)
  }

  if (sent) {
    return (
      <p className="text-sm text-[#4a5240]" style={{ fontFamily: BODY, fontWeight: 300 }}>
        Merci ! Votre client mail va s&apos;ouvrir.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.fr"
        required
        autoComplete="email"
        className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-600 placeholder:text-stone-300 outline-none focus:border-[#4a5240]"
        style={{ fontWeight: 300 }}
      />
      <button
        type="submit"
        className="text-sm bg-[#4a5240] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d3228] transition shrink-0"
        style={{ fontWeight: 500 }}
      >
        Me pr&eacute;venir
      </button>
    </form>
  )
}
