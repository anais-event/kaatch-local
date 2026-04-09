'use client'

import { useEffect, useState, useRef } from 'react'

type Guest = { id: string; first_name: string; last_name: string | null }

export default function UploaderNameInput({ guests }: { guests: Guest[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('kaatch_uploader_name')
    if (saved) setQuery(saved)
  }, [])

  function guestName(g: Guest) {
    return [g.first_name, g.last_name].filter(Boolean).join(' ')
  }

  const allNames = guests.map(guestName)
  const isValid = allNames.includes(query)

  const suggestions = query.length > 0
    ? guests.filter(g => guestName(g).toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  function select(name: string) {
    setQuery(name)
    localStorage.setItem('kaatch_uploader_name', name)
    setOpen(false)
    if (inputRef.current) inputRef.current.setCustomValidity('')
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="uploader_name"
        placeholder="Votre prénom *"
        required
        value={query}
        onChange={e => {
          const val = e.target.value
          setQuery(val)
          setOpen(true)
          const valid = allNames.includes(val) || val === ''
          e.target.setCustomValidity(valid ? '' : 'Choisissez un prénom dans la liste des invités')
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        className={`w-full border rounded-xl px-4 py-2 bg-white outline-none transition text-stone-700 ${query && !isValid ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-[#4a5240]'}`}
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
      />
      {query && !isValid && (
        <p className="text-xs text-red-400 mt-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Choisissez un prénom dans la liste
        </p>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-stone-200 shadow-md z-20 overflow-hidden">
          {suggestions.map(g => {
            const name = guestName(g)
            return (
              <button key={g.id} type="button" onMouseDown={() => select(name)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0e8] transition text-stone-700 text-sm"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                {name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
