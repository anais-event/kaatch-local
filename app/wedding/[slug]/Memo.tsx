'use client'

import { useState } from 'react'

type SystemItem = { label: string; done: boolean; href?: string }
type CustomItem = { id: string; label: string; done: boolean }

export default function Memo({
  slug,
  systemItems,
  customItems: initialCustomItems,
}: {
  slug: string
  systemItems: SystemItem[]
  customItems: CustomItem[]
}) {
  const [customItems, setCustomItems] = useState(initialCustomItems)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const doneCount = systemItems.filter(i => i.done).length + customItems.filter(i => i.done).length
  const total = systemItems.length + customItems.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  async function handleToggle(id: string, done: boolean) {
    setCustomItems(prev => prev.map(i => i.id === id ? { ...i, done: !done } : i))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done }),
    })
  }

  async function handleAdd() {
    if (!newLabel.trim()) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, label: newLabel.trim() }),
    })
    if (res.ok) {
      const item = await res.json()
      setCustomItems(prev => [...prev, item])
      setNewLabel('')
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setCustomItems(prev => prev.filter(i => i.id !== id))
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="rounded-xl border border-amber-100 bg-[#fdfdf8] overflow-hidden"
         style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f0ede4 27px, #f0ede4 28px)' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-[#fdfdf8]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
               className="text-stone-600">Mémo</p>
          </div>
          <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
            {pct}% fait
          </span>
        </div>
        {/* Barre fine */}
        <div className="h-0.5 bg-amber-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-300 rounded-full transition-all duration-500"
               style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="px-5 pb-5 space-y-0.5">
        {/* Items automatiques */}
        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.18em' }}
           className="text-stone-300 uppercase pt-3 pb-1.5">Checklist auto</p>
        {systemItems.map(item => (
          <a key={item.label} href={item.href ?? '#'}
             className="flex items-center gap-2.5 py-1.5 group">
            <span className={`text-sm shrink-0 ${item.done ? 'text-[#4a5240]' : 'text-stone-300'}`}>
              {item.done ? '✓' : '○'}
            </span>
            <span style={{ fontWeight: 300, fontSize: '0.82rem' }}
                  className={`transition group-hover:text-[#4a5240] ${item.done ? 'text-stone-400 line-through' : 'text-stone-600'}`}>
              {item.label}
            </span>
          </a>
        ))}

        {/* Items custom */}
        {customItems.length > 0 && (
          <>
            <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.18em' }}
               className="text-stone-300 uppercase pt-3 pb-1.5">Ma liste</p>
            {customItems.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 py-1.5 group">
                <button onClick={() => handleToggle(item.id, item.done)}
                  className={`text-sm shrink-0 cursor-pointer transition ${item.done ? 'text-[#4a5240]' : 'text-stone-300 hover:text-stone-500'}`}>
                  {item.done ? '✓' : '○'}
                </button>
                <button onClick={() => handleToggle(item.id, item.done)}
                  className={`flex-1 text-left transition cursor-pointer ${item.done ? 'text-stone-400 line-through' : 'text-stone-600'}`}
                  style={{ fontWeight: 300, fontSize: '0.82rem' }}>
                  {item.label}
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition text-base cursor-pointer shrink-0 leading-none">
                  ×
                </button>
              </div>
            ))}
          </>
        )}

        {/* Ajouter */}
        <div className="pt-3">
          {adding ? (
            <div className="flex gap-2">
              <input autoFocus type="text" value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewLabel('') } }}
                placeholder="Nouvelle tâche…"
                className="flex-1 bg-transparent border-b border-stone-300 outline-none text-stone-700 pb-0.5 text-sm"
                style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} />
              <button onClick={handleAdd}
                className="text-xs text-[#4a5240] hover:text-[#2d3228] transition cursor-pointer"
                style={{ fontWeight: 300 }}>OK</button>
              <button onClick={() => { setAdding(false); setNewLabel('') }}
                className="text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
                style={{ fontWeight: 300 }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer flex items-center gap-1.5"
              style={{ fontWeight: 300 }}>
              <span className="text-base leading-none">+</span> Ajouter une tâche
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
