'use client'

import { useState } from 'react'
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
  const atLimit = !paid && guestCount >= FREE_GUEST_LIMIT

  if (atLimit) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-4 flex items-start gap-3">
        <span className="text-amber-500 text-lg leading-none mt-0.5">🔒</span>
        <div className="flex-1">
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.88rem' }} className="text-amber-800 mb-1">
            Limite de {FREE_GUEST_LIMIT} invités atteinte
          </p>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }} className="text-amber-700 mb-3">
            Passez au plan Mariage pour ajouter des invités en illimité.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? '/pricing'}?checkout[custom][wedding_id]=${weddingId}`}
            className="inline-block bg-[#4a5240] text-white text-xs px-4 py-2 rounded-xl hover:bg-[#2d3228] transition"
            style={{ fontWeight: 400 }}
          >
            Passer au plan Mariage — 45€ →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-100 mb-4 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f0e8]/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#4a5240] text-lg leading-none">+</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem' }}
                className="text-[#4a5240]">Ajouter un invité</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Form (collapsible) */}
      {open && (
        <form action={addGuest} className="grid grid-cols-2 gap-2 px-4 pb-4 pt-1 border-t border-stone-50">
          <input type="hidden" name="wedding_id" value={weddingId} />
          <input type="hidden" name="slug" value={slug} />
          {[
            { name: 'first_name', placeholder: 'Prénom *', required: true, type: 'text' },
            { name: 'last_name', placeholder: 'Nom', required: false, type: 'text' },
            { name: 'nickname', placeholder: 'Surnom (optionnel)', required: false, type: 'text' },
            { name: 'email', placeholder: 'Email', required: false, type: 'email' },
            { name: 'telephone', placeholder: 'Téléphone', required: false, type: 'tel' },
          ].map(f => (
            <input key={f.name} type={f.type} name={f.name} placeholder={f.placeholder} required={f.required}
              className="border border-stone-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
          ))}
          <select name="relation"
            className="border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            <option value="">Lien de parenté</option>
            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select name="gender"
            className="border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            <option value="">Genre…</option>
            <option value="F">👩 Féminin (Chère…)</option>
            <option value="M">👨 Masculin (Cher…)</option>
          </select>
          <select name="guest_type"
            className="border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            <option value="adulte">Adulte</option>
            <option value="enfant">Enfant</option>
            <option value="animal">Animal</option>
          </select>
          {/* Moments d'invitation */}
          <div className="col-span-2 border border-stone-200 rounded-xl px-3 py-2.5 bg-white">
            <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Invité à…</p>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'ceremonie', label: '💒 Cérémonie' },
                { value: 'vin_honneur', label: '🥂 Vin d\'honneur' },
                { value: 'reception', label: '🎉 Réception' },
              ].map(p => (
                <label key={p.value} className="flex items-center gap-1.5 text-sm text-stone-600 cursor-pointer" style={{ fontWeight: 300 }}>
                  <input type="checkbox" name="invited_parts" value={p.value} defaultChecked
                    className="rounded" />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <button type="submit"
            className="col-span-2 bg-[#4a5240] text-white px-6 py-2 rounded-xl hover:bg-[#2d3228] transition cursor-pointer text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            + Ajouter
          </button>
        </form>
      )}
    </div>
  )
}
