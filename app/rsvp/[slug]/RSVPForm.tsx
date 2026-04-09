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
    <div className="text-center text-green-600 font-medium text-lg">
      ✅ Merci, votre réponse a bien été enregistrée !
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Serez-vous présent(e) ?
        </label>
        <div className="flex gap-3">
          {['confirmed', 'declined'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                status === s
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-gray-300 text-gray-600 hover:border-rose-300'
              }`}
            >
              {s === 'confirmed' ? '✅ Oui' : '❌ Non'}
            </button>
          ))}
        </div>
      </div>

      {status === 'confirmed' && guest.plus_one && (
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

      {status === 'confirmed' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restrictions alimentaires
          </label>
          <textarea
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            rows={3}
            placeholder="Végétarien, allergie aux noix..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!status || loading}
        className="w-full bg-rose-500 text-white py-2 rounded-lg font-medium hover:bg-rose-600 disabled:opacity-40 transition"
      >
        {loading ? 'Envoi...' : 'Confirmer ma réponse'}
      </button>
    </form>
  )
}
