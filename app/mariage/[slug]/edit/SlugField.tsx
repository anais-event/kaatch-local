'use client'

import { useState } from 'react'

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export default function SlugField({ currentSlug }: { currentSlug: string }) {
  const [value, setValue] = useState(currentSlug)
  const preview = toSlug(value) || currentSlug

  return (
    <div>
      <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
             className="block text-stone-400 uppercase mb-2">
        URL du mariage
      </label>
      <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden focus-within:border-[#4a5240] transition">
        <span style={{ fontWeight: 300, fontSize: '0.8rem' }}
              className="pl-4 text-stone-300 whitespace-nowrap shrink-0">
          kaatch.fr/mariage/
        </span>
        <input
          type="text"
          name="new_slug"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={currentSlug}
          className="flex-1 px-2 py-3 outline-none text-stone-700 bg-transparent min-w-0"
          style={{ fontWeight: 300, fontSize: '0.88rem' }}
        />
      </div>
      {toSlug(value) !== value && value && (
        <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-1">
          → Sera enregistré comme : <strong>{preview}</strong>
        </p>
      )}
      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300 mt-1">
        Lettres minuscules, chiffres et tirets uniquement. Laissez vide pour garder l'URL actuelle.
      </p>
    </div>
  )
}
