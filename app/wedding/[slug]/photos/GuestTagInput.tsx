'use client'

import { useState, useRef } from 'react'

type Guest = { id: string; first_name: string; last_name: string | null; guest_type?: string }

export default function GuestTagInput({ guests }: { guests: Guest[] }) {
  const [query, setQuery] = useState('')
  const [tagged, setTagged] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function guestName(g: Guest) {
    return [g.first_name, g.last_name].filter(Boolean).join(' ')
  }

  const suggestions = query.length > 0
    ? guests.filter(g => {
        const name = guestName(g)
        return name.toLowerCase().includes(query.toLowerCase()) && !tagged.includes(name)
      }).slice(0, 6)
    : []

  function tag(name: string) {
    setTagged(prev => [...prev, name])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function untag(name: string) {
    setTagged(prev => prev.filter(n => n !== name))
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.1em' }}
         className="text-stone-400 uppercase mb-2">Qui voit-on sur la photo ?</p>

      {tagged.map(name => (
        <input key={name} type="hidden" name="tagged_guests" value={name} />
      ))}

      <div className="flex flex-wrap gap-2 mb-2">
        {tagged.map(name => (
          <span key={name}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#4a5240] text-white text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            {name}
            <button type="button" onClick={() => untag(name)} className="hover:text-stone-300 ml-1">×</button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Taper un prénom…"
          className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-stone-200 shadow-md z-20 overflow-hidden">
            {suggestions.map(g => {
              const name = guestName(g)
              return (
                <button key={g.id} type="button" onMouseDown={() => tag(name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0e8] transition text-stone-700 text-sm"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  {name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
