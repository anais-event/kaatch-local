'use client'

import { useState } from 'react'

type CustomItem = { id: string; label: string; done: boolean }
type SystemItem = { label: string; done: boolean; href?: string }

export default function Memo({
  slug,
  systemItems: _systemItems,
  customItems: initialCustomItems,
}: {
  slug: string
  systemItems: SystemItem[]
  customItems: CustomItem[]
}) {
  const [notes, setNotes] = useState(initialCustomItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  async function handleAdd() {
    if (!newLabel.trim()) return
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, label: newLabel.trim() }),
    })
    if (res.ok) {
      const item = await res.json()
      setNotes(prev => [...prev, item])
      setNewLabel('')
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  async function handleSaveEdit(id: string) {
    const trimmed = editLabel.trim()
    if (!trimmed) return
    setNotes(prev => prev.map(n => n.id === id ? { ...n, label: trimmed } : n))
    setEditingId(null)
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: trimmed }),
    })
  }

  return (
    <div style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.2em' }} className="text-stone-400 uppercase">
          Notes
        </p>
        <button
          onClick={() => { setAdding(true); setNewLabel('') }}
          className="flex items-center gap-1 text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
          style={{ fontWeight: 300, fontSize: '0.72rem' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        {/* Nouvelle note en cours */}
        {adding && (
          <div className="bg-[#fefce8] border border-yellow-200 rounded-2xl p-4 shadow-sm col-span-1">
            <textarea
              autoFocus
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
                if (e.key === 'Escape') { setAdding(false); setNewLabel('') }
              }}
              placeholder="Votre note…"
              className="w-full bg-transparent outline-none resize-none text-stone-600 placeholder:text-yellow-300"
              style={{ fontWeight: 300, fontSize: '0.85rem', minHeight: '72px', lineHeight: 1.6 }}
            />
            <div className="flex gap-3 mt-2 justify-end">
              <button
                onClick={() => { setAdding(false); setNewLabel('') }}
                className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 transition"
                style={{ fontWeight: 300 }}
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                className="text-xs text-[#4a5240] cursor-pointer hover:text-[#2d3228] transition"
                style={{ fontWeight: 400 }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Notes existantes */}
        {notes.map(note => (
          <div
            key={note.id}
            className="relative bg-[#fefce8] border border-yellow-200 rounded-2xl p-4 shadow-sm group cursor-pointer"
            onClick={() => {
              if (editingId !== note.id) {
                setEditingId(note.id)
                setEditLabel(note.label)
              }
            }}
          >
            {editingId === note.id ? (
              <>
                <textarea
                  autoFocus
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(note.id) }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                  className="w-full bg-transparent outline-none resize-none text-stone-700"
                  style={{ fontWeight: 300, fontSize: '0.85rem', minHeight: '72px', lineHeight: 1.6 }}
                />
                <div className="flex gap-3 mt-2 justify-end">
                  <button
                    onClick={e => { e.stopPropagation(); setEditingId(null) }}
                    className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 transition"
                    style={{ fontWeight: 300 }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleSaveEdit(note.id) }}
                    className="text-xs text-[#4a5240] cursor-pointer hover:text-[#2d3228] transition"
                    style={{ fontWeight: 400 }}
                  >
                    OK
                  </button>
                </div>
              </>
            ) : (
              <p
                style={{ fontWeight: 300, fontSize: '0.82rem', lineHeight: 1.65 }}
                className="text-stone-600 whitespace-pre-wrap break-words"
              >
                {note.label}
              </p>
            )}
            {editingId !== note.id && (
              <button
                onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-yellow-300 hover:text-red-400 transition cursor-pointer text-sm leading-none rounded-full hover:bg-red-50"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Bouton + quand vide et pas en train d'ajouter */}
        {notes.length === 0 && !adding && (
          <button
            onClick={() => { setAdding(true); setNewLabel('') }}
            className="bg-[#fefce8]/60 border border-yellow-100 border-dashed rounded-2xl p-4 text-yellow-300 hover:text-yellow-400 hover:border-yellow-200 transition cursor-pointer flex items-center justify-center min-h-[80px]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
