'use client'

import { useState, useRef, useEffect, useTransition } from 'react'

type Msg = { id: string; content: string; author_name: string; created_at: string }

function formatDateSeparator(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByDate(messages: Msg[]) {
  const grouped: { date: string; msgs: Msg[] }[] = []
  for (const msg of messages) {
    const d = formatDateSeparator(new Date(msg.created_at))
    const last = grouped[grouped.length - 1]
    if (!last || last.date !== d) grouped.push({ date: d, msgs: [msg] })
    else last.msgs.push(msg)
  }
  return grouped
}

export default function GroupChat({
  slug,
  groupId,
  groupName,
  weddingId,
  guestName,
  initialMessages,
}: {
  slug: string
  groupId: string
  groupName: string
  weddingId: string
  guestName: string
  initialMessages: Msg[]
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll bas à l'init et à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll toutes les 5 secondes pour les nouveaux messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?groupId=${groupId}`)
        if (res.ok) {
          const data: Msg[] = await res.json()
          setMessages(data)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [groupId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')

    // Ajout optimiste immédiat
    const tempMsg: Msg = {
      id: `temp-${Date.now()}`,
      content,
      author_name: guestName || 'Invité',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMsg])
    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, weddingId, content, authorName: guestName || 'Invité' }),
      })
      if (res.ok) {
        const saved: Msg = await res.json()
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? saved : m))
      }
    } catch {
      // Retirer le message temp si erreur
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      setInput(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const grouped = groupByDate(messages)

  return (
    <div className="flex flex-col h-full bg-[#f5f0e8]">

      {/* Header groupe */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-stone-200 bg-white shrink-0">
        <a href={`/invite/${slug}/groupes`}
           className="sm:hidden text-[#4a5240] text-xl leading-none">←</a>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          groupName === '@ToutLeMonde' ? 'bg-[#4a5240] text-white' : 'bg-[#4a5240]/10 text-[#4a5240]'
        }`}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {groupName === '@ToutLeMonde' ? '✦' : groupName.replace('@', '').charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}
            className="text-[#2d3228]">
          {groupName}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {grouped.length === 0 && (
          <p className="text-center text-stone-400 pt-12"
             style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            Soyez le premier à écrire…
          </p>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-[10px] text-stone-400 whitespace-nowrap" style={{ fontWeight: 300 }}>
                {date}
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="space-y-2">
              {msgs.map((msg, i) => {
                const isMe = msg.author_name === guestName
                const isKaatch = msg.author_name === 'Kaatch'
                const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const showName = !isMe && !isKaatch && (i === 0 || msgs[i - 1].author_name !== msg.author_name)
                const isTemp = msg.id.startsWith('temp-')

                if (isKaatch) return (
                  <div key={msg.id} className="flex justify-center my-1">
                    <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full" style={{ fontWeight: 300 }}>
                      {msg.content}
                    </span>
                  </div>
                )

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-[10px] text-stone-400 mb-0.5 mx-1" style={{ fontWeight: 300 }}>
                        {msg.author_name}
                      </span>
                    )}
                    <div className={`max-w-[72%] px-4 py-2.5 text-sm leading-snug transition-opacity ${
                      isTemp ? 'opacity-60' : 'opacity-100'
                    } ${
                      isMe
                        ? 'bg-[#4a5240] text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-stone-700 rounded-2xl rounded-bl-sm shadow-sm border border-stone-100'
                    }`} style={{ fontWeight: 300 }}>
                      {msg.content}
                    </div>
                    {!isTemp && (
                      <span className="text-[9px] text-stone-300 mt-0.5 mx-1">{time}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
            className="shrink-0 border-t border-stone-200 bg-white/95 backdrop-blur px-4 py-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Écrire un message…"
          autoComplete="off"
          className="flex-1 border border-stone-200 rounded-full px-5 py-2.5 bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
          style={{ fontWeight: 300 }}
        />
        <button type="submit" disabled={sending || !input.trim()}
          className="bg-[#4a5240] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#2d3228] transition shrink-0 cursor-pointer disabled:opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
