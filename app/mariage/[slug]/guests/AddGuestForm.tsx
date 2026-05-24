'use client'

import { useState, useRef } from 'react'
import { FREE_GUEST_LIMIT } from '@/lib/plan'

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

type Props = {
  weddingId: string
  slug: string
  addGuest: (formData: FormData) => Promise<void>
  guestCount: number
  paid: boolean
}

export default function AddGuestForm({ weddingId, slug, addGuest, guestCount, paid }: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const atLimit = !paid && guestCount >= FREE_GUEST_LIMIT

  async function handleSubmit(fd: FormData) {
    setSubmitting(true)
    await addGuest(fd)
    setSubmitting(false)
    setOpen(false)
    formRef.current?.reset()
  }

  return (
    <>
      {/* Bouton + */}
      {atLimit ? (
        <a
          href={`/api/stripe/checkout?wedding_id=${weddingId}&slug=${slug}`}
          className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        >
          <span className="text-base leading-none">+</span>
          Passer au plan Mariage — 45€
        </a>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter un invité
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          <div
            className="relative bg-[#f5f0e8] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl"
            style={{ fontFamily: 'var(--font-lato)' }}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <p style={{ fontWeight: 500, fontSize: '0.95rem' }} className="text-[#2d3228]">
                Nouvel invité
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-200/60 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form ref={formRef} action={handleSubmit} className="px-5 pb-5 space-y-2">
              <input type="hidden" name="wedding_id" value={weddingId} />
              <input type="hidden" name="slug" value={slug} />

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'first_name', placeholder: 'Prénom *', required: true, type: 'text' },
                  { name: 'last_name',  placeholder: 'Nom',      required: false, type: 'text' },
                  { name: 'email',      placeholder: 'Email',    required: false, type: 'email' },
                  { name: 'telephone',  placeholder: 'Téléphone',required: false, type: 'tel' },
                ].map(f => (
                  <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
                    className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[#4a5240]/50 transition text-stone-700 text-sm"
                    style={{ fontWeight: 300 }} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select name="relation"
                  className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-500 outline-none focus:border-[#4a5240]/50 transition text-sm"
                  style={{ fontWeight: 300 }}>
                  <option value="">Lien de parenté</option>
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select name="gender"
                  className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-500 outline-none focus:border-[#4a5240]/50 transition text-sm"
                  style={{ fontWeight: 300 }}>
                  <option value="">Genre…</option>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                </select>
                <select name="guest_type"
                  className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-500 outline-none focus:border-[#4a5240]/50 transition text-sm"
                  style={{ fontWeight: 300 }}>
                  <option value="adulte">Adulte (18+)</option>
                  <option value="ado">Ado (12-18, sans alcool)</option>
                  <option value="enfant">Enfant (≤12 ans)</option>
                  <option value="animal">Animal</option>
                </select>
                <input name="nickname" type="text" placeholder="Surnom (optionnel)"
                  className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[#4a5240]/50 transition text-stone-700 text-sm"
                  style={{ fontWeight: 300 }} />
              </div>

              <input name="dietary_notes" type="text"
                placeholder="Allergie, régime, attention particulière… (optionnel)"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[#4a5240]/50 transition text-stone-700 text-sm"
                style={{ fontWeight: 300 }} />

              {/* Moments */}
              <div className="border border-stone-200 rounded-xl px-3 py-2.5 bg-white">
                <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Invité à…</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'ceremonie',   label: 'Cérémonie' },
                    { value: 'vin_honneur', label: "Vin d'honneur" },
                    { value: 'reception',   label: 'Réception' },
                  ].map(p => (
                    <label key={p.value} className="flex items-center gap-1.5 text-sm text-stone-600 cursor-pointer" style={{ fontWeight: 300 }}>
                      <input type="checkbox" name="invited_parts" value={p.value} defaultChecked className="rounded accent-[#4a5240]" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-[#4a5240] text-white rounded-xl py-2.5 text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer mt-1"
                style={{ fontWeight: 300 }}>
                {submitting ? 'Ajout en cours…' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
