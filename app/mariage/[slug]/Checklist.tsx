'use client'

import { useState, useRef } from 'react'

type SystemItem = { label: string; done: boolean; href?: string }
type CustomItem = { id: string; label: string; done: boolean }

export default function Checklist({
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
  const inputRef = useRef<HTMLInputElement>(null)

  const doneCount =
    systemItems.filter(i => i.done).length +
    customItems.filter(i => i.done).length
  const total = systemItems.length + customItems.length

  async function handleToggleCustom(id: string, done: boolean) {
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
    <div className="bg-white rounded-xl border border-stone-100 px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
           className="text-stone-400 uppercase">Préparatifs</p>
        <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400">
          <span className="text-[#4a5240]" style={{ fontWeight: 500 }}>{doneCount}</span> / {total}
        </p>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-1 bg-stone-100 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-[#4a5240] rounded-full transition-all duration-700"
             style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%' }} />
      </div>

      {/* Items système — non modifiables, auto-calculés */}
      <div className="mb-3">
        <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }}
           className="text-stone-300 uppercase mb-2">Automatiques</p>
        <div className="flex flex-wrap gap-2">
          {systemItems.map(item => (
            <a key={item.label}
              href={item.href ?? '#'}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                item.done
                  ? 'bg-[#4a5240]/8 border-[#4a5240]/20 text-[#4a5240]'
                  : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
              style={{ fontWeight: 300 }}>
              <span className={item.done ? 'text-[#4a5240]' : 'text-stone-300'}>
                {item.done ? '✓' : '○'}
              </span>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Items custom — modifiables manuellement */}
      {(customItems.length > 0 || adding) && (
        <div className="border-t border-stone-100 pt-3 mb-3">
          <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.14em' }}
             className="text-stone-300 uppercase mb-2">Votre liste</p>
          <div className="space-y-1.5">
            {customItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => handleToggleCustom(item.id, item.done)}
                  className={`flex items-center gap-2 flex-1 text-left text-sm py-1 transition cursor-pointer ${
                    item.done ? 'text-stone-400 line-through' : 'text-stone-700'
                  }`}
                  style={{ fontWeight: 300 }}>
                  <span className={`text-base leading-none shrink-0 ${item.done ? 'text-[#4a5240]' : 'text-stone-300'}`}>
                    {item.done ? '✓' : '○'}
                  </span>
                  {item.label}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-stone-200 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-base cursor-pointer shrink-0">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ajouter */}
      {adding ? (
        <div className="flex gap-2 mt-3">
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewLabel('') } }}
            placeholder="Ex: Confirmer le traiteur, Envoyer les invitations…"
            className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
          <button onClick={handleAdd}
            className="bg-[#4a5240] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#2d3228] transition cursor-pointer"
            style={{ fontWeight: 300 }}>
            Ajouter
          </button>
          <button onClick={() => { setAdding(false); setNewLabel('') }}
            className="text-stone-400 hover:text-stone-600 transition text-xs cursor-pointer px-1"
            style={{ fontWeight: 300 }}>
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer flex items-center gap-1"
          style={{ fontWeight: 300 }}>
          <span className="text-base leading-none">+</span> Ajouter une tâche
        </button>
      )}
    </div>
  )
}
