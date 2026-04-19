'use client'

import { useState } from 'react'

const RELATIONS = ['Ami(e)', 'Frère', 'Sœur', 'Père', 'Mère', 'Oncle', 'Tante', 'Cousin(e)', 'Collègue', 'Autre']

type Props = {
  weddingId: string
  slug: string
  addGuest: (formData: FormData) => Promise<void>
}

export default function AddGuestForm({ weddingId, slug, addGuest }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-stone-100 mb-4 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f0e8]/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#4a5240] text-lg leading-none">+</span>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1rem', fontStyle: 'italic' }}
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
          <select name="guest_type"
            className="border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-500 outline-none focus:border-[#4a5240] transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            <option value="adulte">Adulte</option>
            <option value="enfant">Enfant</option>
            <option value="animal">Animal</option>
          </select>
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
