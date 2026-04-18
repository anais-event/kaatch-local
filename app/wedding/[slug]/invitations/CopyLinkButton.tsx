'use client'

import { useState } from 'react'

export default function CopyLinkButton({ url, guestName }: { url: string; guestName: string }) {
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappText = encodeURIComponent(`Votre invitation : ${url}`)

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {/* Copier */}
        <button onClick={copy}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition cursor-pointer text-sm whitespace-nowrap ${
            copied
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'border-stone-200 text-stone-600 hover:border-[#4a5240] hover:text-[#4a5240]'
          }`}
          style={{ fontWeight: 300 }}>
          {copied ? '✓ Copié !' : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copier
            </>
          )}
        </button>

        {/* WhatsApp */}
        <a href={`https://wa.me/?text=${whatsappText}`}
           target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:border-green-400 hover:text-green-600 transition text-sm whitespace-nowrap"
           style={{ fontWeight: 300 }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>

        {/* Aperçu */}
        <button onClick={() => setPreview(true)}
           className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm whitespace-nowrap cursor-pointer"
           style={{ fontWeight: 300 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Aperçu
        </button>
      </div>

      {/* Modale d'aperçu */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setPreview(false) }}>
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
               style={{ width: '420px', height: '88vh', maxHeight: '800px' }}>

            {/* Header modale */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-[#f5f0e8] shrink-0">
              <div>
                <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228]">
                  Aperçu — {guestName}
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">
                  C'est exactement ce que verra {guestName.split(' ')[0]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-[#4a5240] border border-[#4a5240]/30 px-2.5 py-1 rounded-lg hover:bg-[#4a5240] hover:text-white transition"
                   style={{ fontWeight: 300 }}>
                  Ouvrir ↗
                </a>
                <button onClick={() => setPreview(false)}
                  className="text-stone-400 hover:text-stone-700 transition text-xl leading-none cursor-pointer w-7 h-7 flex items-center justify-center">
                  ×
                </button>
              </div>
            </div>

            {/* iframe faire-part */}
            <iframe
              src={url}
              className="flex-1 w-full border-0"
              title={`Invitation de ${guestName}`}
            />
          </div>
        </div>
      )}
    </>
  )
}
