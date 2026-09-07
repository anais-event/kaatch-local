'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RSVPForm({ guest }: { guest: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [status, setStatus] = useState(guest.rsvp_status || '')
  const [plusOne, setPlusOne] = useState(guest.plus_one_count || 0)
  const [dietary, setDietary] = useState(guest.dietary_restrictions || '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        plus_one_count: plusOne,
        dietary_restrictions: dietary,
        rsvp_at: new Date().toISOString(),
      })
      .eq('id', guest.id)

    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="text-center text-emerald-600 text-lg" style={{ fontWeight: 300 }}>
      ✅ Merci, votre réponse a bien été enregistrée !
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-stone-600 mb-1" style={{ fontWeight: 300 }}>
          Serez-vous présent(e) ?
        </label>
        <div className="flex gap-3">
          {['confirme', 'decline'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-xl border text-sm transition ${
                status === s
                  ? 'bg-[#4a5240] text-white border-[#4a5240]'
                  : 'border-stone-300 text-stone-600 hover:border-[#4a5240]'
              }`}
              style={{ fontWeight: 300 }}
            >
              {s === 'confirme' ? '✓ Oui' : 'Non'}
            </button>
          ))}
        </div>
      </div>

      {status === 'confirme' && guest.plus_one && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'accompagnants
          </label>
          <input
            type="number"
            min={0}
            max={5}
            value={plusOne}
            onChange={(e) => setPlusOne(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      {status === 'confirme' && (
        <div>
          <label className="block text-sm text-stone-600 mb-1" style={{ fontWeight: 300 }}>
            Restrictions alimentaires
          </label>
          <textarea
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            rows={3}
            placeholder="Végétarien, allergie aux noix..."
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition"
            style={{ fontWeight: 300 }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!status || loading}
        className="w-full bg-[#4a5240] text-white py-2.5 rounded-xl hover:bg-[#2d3228] disabled:opacity-40 transition"
        style={{ fontWeight: 300, letterSpacing: '0.04em' }}
      >
        {loading ? 'Envoi...' : 'Confirmer ma réponse'}
      </button>
    </form>
  )
}
