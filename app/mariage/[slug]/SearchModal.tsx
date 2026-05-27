'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { SearchResult } from '@/app/api/search/route'

export default function SearchModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setResults([]) }
  }, [open])

  const search = useCallback((q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?slug=${slug}&q=${encodeURIComponent(q)}`)
        if (!res.ok) {
          console.error('[search] API error', res.status, await res.text())
          setResults([])
        } else {
          const data = await res.json()
          console.log('[search] results', data.length, 'for', q)
          setResults(data)
          setActiveIdx(0)
        }
      } catch (err) {
        console.error('[search] fetch error', err)
      }
      setLoading(false)
    }, 300)
  }, [slug])

  useEffect(() => { search(query) }, [query, search])

  // Highlight query tokens in text
  function highlight(text: string): React.ReactNode {
    const tokens = query.trim().split(/\s+/).filter(t => t.length >= 2)
    if (!tokens.length) return text
    const regex = new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((p, i) =>
      regex.test(p) ? <mark key={i} className="bg-[#4a5240]/15 text-[#2d3228] rounded px-0.5 not-italic">{p}</mark> : p
    )
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  // Flat list for keyboard nav
  const flat = results

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && flat[activeIdx]) { window.location.href = flat[activeIdx].href; setOpen(false) }
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-[#4a5240] hover:bg-stone-100 transition cursor-pointer"
      title="Rechercher (⌘K)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <span className="hidden lg:inline text-xs" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>Rechercher</span>
      <kbd className="hidden lg:inline text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
    </button>
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
         onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
           style={{ fontFamily: 'var(--font-lato)' }}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-stone-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Rechercher invités, musiques, prestataires…"
            className="flex-1 outline-none text-stone-800 text-sm placeholder:text-stone-300"
            style={{ fontWeight: 300 }}
          />
          {loading && (
            <svg className="w-4 h-4 text-stone-300 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
            </svg>
          )}
          <button onClick={() => setOpen(false)}
            className="text-stone-300 hover:text-stone-500 transition cursor-pointer shrink-0">
            <kbd className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-12 text-center">
              <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">Aucun résultat pour « {query} »</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="py-8 text-center">
              <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">Tapez au moins 2 caractères…</p>
            </div>
          )}

          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <p style={{ fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.12em' }}
                 className="text-stone-400 uppercase px-4 pt-4 pb-1.5">{type}</p>
              {items.map(r => {
                const idx = flat.findIndex(x => x.id === r.id)
                return (
                  <a key={r.id} href={r.href} onClick={() => setOpen(false)}
                     className={`flex items-center gap-3 px-4 py-2.5 transition cursor-pointer ${
                       idx === activeIdx ? 'bg-[#4a5240]/8 text-[#2d3228]' : 'hover:bg-stone-50'
                     }`}
                     onMouseEnter={() => setActiveIdx(idx)}>
                    <span className="text-base shrink-0">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-stone-800 truncate">{highlight(r.label)}</p>
                      {r.sub && <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 truncate">{highlight(r.sub)}</p>}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                         className="w-3.5 h-3.5 text-stone-200 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>
                )
              })}
            </div>
          ))}

          {results.length > 0 && (
            <div className="px-4 py-2.5 border-t border-stone-50">
              <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300">
                {results.length} résultat{results.length > 1 ? 's' : ''} · ↑↓ naviguer · ↵ ouvrir
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
