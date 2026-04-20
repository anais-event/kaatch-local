'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function KaatchChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Réessaie !' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bulle flottante */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
        style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #4a5240, #2d3228)' }}
        title="Aide Kaatch">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        )}
      </button>

      {/* Fenêtre chat */}
      {open && (
        <div
          className="fixed bottom-[88px] sm:bottom-24 right-4 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: 'min(360px, calc(100vw - 32px))', height: 500, border: '1px solid #e7e5e4' }}>

          {/* Header */}
          <div className="px-4 py-3 shrink-0 flex items-center gap-3"
               style={{ background: 'linear-gradient(135deg, #4a5240, #2d3228)' }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic', color: 'white' }}>
                Assistant Kaatch
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                Je réponds à toutes vos questions
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#fdfdf8' }}>
            {messages.length === 0 && (
              <div className="text-center pt-4">
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1rem', color: '#a8a29e' }}>
                  Bonjour ! 👋
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.78rem', color: '#a8a29e', lineHeight: 1.6, marginTop: 6 }}>
                  Comment puis-je vous aider avec Kaatch ?
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'Comment envoyer les invitations ?',
                    'Comment fonctionne le plan de table ?',
                    'C\'est quoi le QR code ?',
                  ].map(q => (
                    <button key={q} onClick={() => { setInput(q); }}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition bg-white cursor-pointer"
                      style={{ fontWeight: 300 }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-sm"
                  style={{
                    fontWeight: 300,
                    lineHeight: 1.6,
                    fontSize: '0.82rem',
                    ...(m.role === 'user'
                      ? { background: '#4a5240', color: 'white', borderRadius: '16px 16px 4px 16px' }
                      : { background: 'white', color: '#44403c', border: '1px solid #f5f5f4', borderRadius: '16px 16px 16px 4px' }
                    )
                  }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-xl bg-white border border-stone-100" style={{ borderRadius: '16px 16px 16px 4px' }}>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-stone-100 bg-white shrink-0 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Posez votre question…"
              className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer disabled:opacity-40"
              style={{ background: '#4a5240' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
