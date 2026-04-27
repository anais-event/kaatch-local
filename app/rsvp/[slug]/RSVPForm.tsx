'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function RSVPForm({ guest }: { guest: any }) {
  const supabase = createClient()
  const [status, setStatus] = useState<'confirme' | 'decline' | ''>(guest.rsvp_status || '')
  const [dietary, setDietary] = useState(guest.dietary_restrictions || '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!status) return
    setLoading(true)
    await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        dietary_restrictions: dietary || null,
        rsvp_at: new Date().toISOString(),
      })
      .eq('id', guest.id)
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="text-center py-8">
      <p className="text-5xl mb-4">{status === 'confirme' ? '🥂' : '💌'}</p>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.8rem', fontStyle: 'italic' }}
          className="text-[#2d3228] mb-2">
        {status === 'confirme' ? 'À très bientôt !' : 'Réponse enregistrée'}
      </h2>
      <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
        {status === 'confirme'
          ? 'Votre présence a bien été confirmée. Les mariés sont ravis !'
          : 'Votre réponse a bien été transmise aux mariés.'}
      </p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Présence */}
      <div>
        <p className="text-sm text-stone-500 mb-3" style={{ fontWeight: 300 }}>
          Serez-vous présent(e) ?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus('confirme')}
            className={`py-3 rounded-2xl border text-sm transition ${
              status === 'confirme'
                ? 'bg-[#4a5240] text-white border-[#4a5240]'
                : 'border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240]'
            }`}
            style={{ fontWeight: 400 }}
          >
            🥂 Avec plaisir !
          </button>
          <button
            type="button"
            onClick={() => setStatus('decline')}
            className={`py-3 rounded-2xl border text-sm transition ${
              status === 'decline'
                ? 'bg-stone-700 text-white border-stone-700'
                : 'border-stone-200 text-stone-400 hover:border-stone-400'
            }`}
            style={{ fontWeight: 400 }}
          >
            😔 Je ne pourrai pas
          </button>
        </div>
      </div>

      {/* Restrictions alimentaires */}
      {status === 'confirme' && (
        <div>
          <label className="block text-sm text-stone-500 mb-2" style={{ fontWeight: 300 }}>
            Restrictions alimentaires <span className="text-stone-300">(optionnel)</span>
          </label>
          <textarea
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            rows={2}
            placeholder="Végétarien, allergie aux fruits de mer…"
            className="w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4a5240] resize-none"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!status || loading}
        className="w-full bg-[#4a5240] text-white py-3.5 rounded-2xl text-sm hover:bg-[#2d3228] disabled:opacity-40 transition"
        style={{ fontWeight: 400, letterSpacing: '0.02em' }}
      >
        {loading ? 'Envoi…' : 'Confirmer ma réponse'}
      </button>
    </form>
  )
}
