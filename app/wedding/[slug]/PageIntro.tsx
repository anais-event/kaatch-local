'use client'

import { useState } from 'react'

type PageIntroProps = {
  what: string        // À quoi ça sert
  how: string         // Comment remplir
  guests?: string     // Ce que voient les invités (optionnel)
}

export default function PageIntro({ what, how, guests }: PageIntroProps) {
  const [open, setOpen] = useState(true)

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="mb-5 flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
      style={{ fontWeight: 300 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      Comment ça marche ?
    </button>
  )

  return (
    <div className="mb-6 bg-white rounded-xl border border-stone-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4a5240]/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.15em' }}
                className="text-stone-400 uppercase">Comment ça marche</span>
        </div>
        <button onClick={() => setOpen(false)}
          className="text-stone-300 hover:text-stone-500 transition text-base leading-none cursor-pointer"
          style={{ fontWeight: 300 }}>×</button>
      </div>
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.12em' }}
             className="text-[#4a5240] uppercase mb-1">À quoi ça sert</p>
          <p style={{ fontWeight: 300, fontSize: '0.8rem', lineHeight: 1.55 }} className="text-stone-500">{what}</p>
        </div>
        <div>
          <p style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.12em' }}
             className="text-[#4a5240] uppercase mb-1">Comment remplir</p>
          <p style={{ fontWeight: 300, fontSize: '0.8rem', lineHeight: 1.55 }} className="text-stone-500">{how}</p>
        </div>
        {guests && (
          <div>
            <p style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.12em' }}
               className="text-[#4a5240] uppercase mb-1">👁 Ce que voient les invités</p>
            <p style={{ fontWeight: 300, fontSize: '0.8rem', lineHeight: 1.55 }} className="text-stone-500">{guests}</p>
          </div>
        )}
      </div>
    </div>
  )
}
