'use client'

import { useState, useEffect, useRef } from 'react'

interface Suggestion {
  display_name: string
  lat: string
  lon: string
}

export default function AddressInput() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selected, setSelected] = useState<Suggestion | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (query.length < 3 || selected) {
      setSuggestions([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        const data = await res.json()
        setSuggestions(data)
      } catch (e) {
        console.error(e)
      }
    }, 400)
  }, [query, selected])

  function handleSelect(s: Suggestion) {
    setQuery(s.display_name)
    setSelected(s)
    setSuggestions([])
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null) // reset si on retape
  }

  return (
    <div className="relative w-full">
      {/* Champ visible */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Adresse (ex: Château de Versailles...)"
        className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
        autoComplete="off"
      />

      {/* Champ caché envoyé au formulaire — adresse complète */}
      <input
        type="hidden"
        name="address"
        value={selected ? selected.display_name : query}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg mt-1 overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSelect(s)}
              className="px-4 py-2 hover:bg-[#f5f0e8] cursor-pointer text-stone-700 text-sm border-b border-stone-100 last:border-0"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
