'use client'

import { useState, useTransition } from 'react'

export default function MessageModal({ slug, guestId, existingMessage, weddingName, saveMessage }: {
  slug: string
  guestId: string
  existingMessage: string | null
  weddingName: string
  saveMessage: (fd: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(existingMessage ?? '')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function openModal() {
    setMessage(existingMessage ?? '')
    setDone(false)
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', guestId)
    fd.set('message', message.trim())
    startTransition(async () => {
      await saveMessage(fd)
      setDone(true)
      setTimeout(() => setOpen(false), 900)
    })
  }

  function handleDelete() {
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('guest_id', guestId)
    fd.set('message', '')
    startTransition(async () => {
      await saveMessage(fd)
      setMessage('')
      setOpen(false)
    })
  }

  return (
    <>
      {/* Trigger */}
      <button onClick={openModal}
        className="w-full flex items-center gap-3 bg-white border border-stone-100 rounded-xl p-4 text-left hover:border-[#4a5240]/30 hover:shadow-sm transition cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)' }}>
        <span className="text-xl">💌</span>
        <div className="flex-1 min-w-0">
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">
            {existingMessage ? 'Mon message aux mariés' : 'Laisser un message aux mariés'}
          </p>
          {existingMessage && (
            <p className="text-stone-400 text-xs truncate mt-0.5" style={{ fontWeight: 300 }}>
              {existingMessage}
            </p>
          )}
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-300 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            style={{ fontFamily: 'var(--font-lato)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.3rem', fontStyle: 'italic' }}
                className="text-[#2d3228]">
                Message aux mariés
              </h2>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center cursor-pointer text-stone-500">
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {done ? (
                <p className="text-center text-[#4a5240] py-4" style={{ fontWeight: 300 }}>
                  ✓ Message enregistré
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>
                    {existingMessage
                      ? 'Modifiez votre message ci-dessous.'
                      : `Un mot pour ${weddingName} ? Une question, un souhait…`}
                  </p>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Votre message…"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 resize-none bg-[#f5f0e8]"
                    style={{ fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.6 }}
                    autoFocus
                  />
                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={isPending || !message.trim()}
                      className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d3228] transition text-sm disabled:opacity-40 cursor-pointer"
                      style={{ fontWeight: 300, letterSpacing: '0.04em' }}>
                      {isPending ? '…' : existingMessage ? 'Mettre à jour' : 'Envoyer'}
                    </button>
                    {existingMessage && (
                      <button type="button" onClick={handleDelete} disabled={isPending}
                        className="text-xs text-stone-400 hover:text-red-400 transition cursor-pointer disabled:opacity-40"
                        style={{ fontWeight: 300 }}>
                        Supprimer le message
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
