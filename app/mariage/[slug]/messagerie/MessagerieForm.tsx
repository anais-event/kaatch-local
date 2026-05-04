'use client'

import { useEffect, useRef, useState } from 'react'

type Guest = { id: string; first_name: string; last_name: string | null }

export default function MessagerieForm({
  groupId,
  slug,
  guests,
  sendMessage,
}: {
  groupId: string
  slug: string
  guests: Guest[]
  sendMessage: (fd: FormData) => Promise<void>
}) {
  const [author, setAuthor] = useState('')
  const [authorOpen, setAuthorOpen] = useState(false)
  const [content, setContent] = useState('')
  const authorRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('kaatch_uploader_name')
    if (saved) setAuthor(saved)
  }, [])

  function guestName(g: Guest) {
    return [g.first_name, g.last_name].filter(Boolean).join(' ')
  }

  const allNames = guests.map(guestName)
  const authorValid = allNames.includes(author) || author === ''
  const authorSuggestions = author.length > 0
    ? guests.filter(g => guestName(g).toLowerCase().includes(author.toLowerCase())).slice(0, 5)
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!author.trim() || !content.trim() || !authorValid) return
    const fd = new FormData()
    fd.set('group_id', groupId)
    fd.set('slug', slug)
    fd.set('author_name', author)
    fd.set('content', content)
    await sendMessage(fd)
    setContent('')
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2 items-start">
      {/* Prénom avec autocomplete */}
      <div className="relative w-32 shrink-0">
        <input
          ref={authorRef}
          type="text"
          value={author}
          onChange={e => { setAuthor(e.target.value); setAuthorOpen(true) }}
          onFocus={() => setAuthorOpen(true)}
          onBlur={() => setTimeout(() => setAuthorOpen(false), 150)}
          placeholder="Prénom *"
          required
          autoComplete="off"
          className={`w-full border rounded-xl px-3 py-2 bg-white outline-none transition text-stone-700 text-sm ${author && !authorValid ? 'border-red-300' : 'border-stone-200 focus:border-[#4a5240]'}`}
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
        />
        {authorOpen && authorSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-xl border border-stone-200 shadow-md z-20 overflow-hidden">
            {authorSuggestions.map(g => {
              const name = guestName(g)
              return (
                <button key={g.id} type="button" onMouseDown={() => { setAuthor(name); localStorage.setItem('kaatch_uploader_name', name); setAuthorOpen(false) }}
                  className="w-full text-left px-3 py-2 hover:bg-[#f5f0e8] text-stone-700 text-sm"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  {name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Votre message…"
        required
        className="flex-1 border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
      />
      <button type="submit"
        className="bg-[#4a5240] text-white px-5 py-2 rounded-xl hover:bg-[#2d3228] transition text-sm shrink-0"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        →
      </button>
    </form>
  )
}
