'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useState, useRef, useEffect, useMemo } from 'react'
import { FairePartCard } from '../../../invite/[slug]/faire-part/FairePartCard'

async function markSent(guestId: string) {
  try {
    await fetch('/api/invite-sent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestId }) })
  } catch {}
}

export default function CopyLinkButton({
  url,
  guestName,
  gender,
  slug,
  wedding,
  guestId,
  paid = true,
  weddingId,
  theme,
}: {
  url: string
  guestName: string
  gender?: 'M' | 'F' | null
  slug?: string
  wedding?: { name: string; date: string | null; location: string | null; coverImageUrl: string | null; coupleMessage: string | null }
  guestId?: string
  paid?: boolean
  weddingId?: string
  theme?: string | null
}) {
  const locale = useLocale()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const checkoutBase = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? '/pricing'
  const upgradeUrl = weddingId ? `${checkoutBase}?checkout[custom][wedding_id]=${weddingId}` : '/pricing'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Format date the same way FairePartEnvelope does
  const dateStr = useMemo(() => {
    if (!wedding?.date) return null
    const d = new Date(wedding.date + 'T00:00:00').toLocaleDateString(toDateLocale(locale), {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    return d.charAt(0).toUpperCase() + d.slice(1)
  }, [wedding?.date])

  const firstName = guestName?.split(' ')[0] ?? guestName
  const salutation = gender === 'F' ? `Chère ${firstName},` : gender === 'M' ? `Cher ${firstName},` : `Cher(e) ${firstName},`

  const whatsappMsg = encodeURIComponent(`${salutation}\n\nVoici ton invitation personnalisée pour notre mariage${wedding?.name ? ` — ${wedding.name}` : ''} :\n${url}\n\nÀ très vite ! 🥂`)
  const smsMsg = encodeURIComponent(`${salutation} Voici ton invitation pour notre mariage${wedding?.name ? ` — ${wedding.name}` : ''} : ${url}`)
  const emailSubject = encodeURIComponent(`Ton invitation — ${wedding?.name ?? 'Notre mariage'}`)
  const emailBody = encodeURIComponent(`${salutation}\n\nNous sommes ravis de t'inviter à célébrer notre mariage !\n\nAccède à ton espace personnel ici :\n${url}\n\nÀ très vite,\n${wedding?.name ?? 'Les mariés'}`)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setDropdownOpen(false)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    setDropdownOpen(false)
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
      ])
      // Give QR a moment to be drawn (useEffect in FairePartCard)
      await new Promise(r => setTimeout(r, 400))
      const themeKey = theme === 'champetre' ? 'champetre' : theme === 'romantique' ? 'romantique' : 'classique'
      const bgColor = themeKey === 'champetre' ? '#ebeee4' : themeKey === 'romantique' ? '#1a0a14' : '#0b1209'
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: bgColor, logging: false,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.93)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.height / canvas.width
      const imgH = pdfW * ratio
      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, (pdfH - imgH) / 2, pdfW, imgH)
      } else {
        const scale = pdfH / imgH
        const scaledW = pdfW * scale
        pdf.addImage(imgData, 'JPEG', (pdfW - scaledW) / 2, 0, scaledW, pdfH)
      }
      pdf.save(`faire-part-${(firstName ?? 'invite').toLowerCase()}.pdf`)
      if (guestId) markSent(guestId)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      {/* Off-screen card — always rendered so QR is ready */}
      <div aria-hidden style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, width: 440, pointerEvents: 'none' }}>
        <FairePartCard
          ref={cardRef}
          weddingName={wedding?.name ?? guestName}
          dateStr={dateStr}
          location={wedding?.location ?? null}
          coupleMessage={wedding?.coupleMessage ?? null}
          personalUrl={url}
          themeKey={theme ?? 'classique'}
        />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer whitespace-nowrap ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-stone-200 text-stone-600 hover:border-[#4a5240] hover:text-[#4a5240]'
          }`}
          style={{ fontWeight: 300 }}>
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="hidden sm:inline">Copié !</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              <span className="hidden sm:inline">Faire-part</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3 h-3 transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 w-[220px] max-w-[calc(100vw-2rem)]">

            {/* Aperçu faire-part */}
            <a href={url} target="_blank" rel="noopener noreferrer"
               onClick={() => setDropdownOpen(false)}
               className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">Aperçu</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Voir le faire-part de {firstName}</p>
              </div>
            </a>

            {/* Copier le lien */}
            <button onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition text-left cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              <div>
                <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">Copier le lien</p>
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Lien personnel de {firstName}</p>
              </div>
            </button>

            <div className="border-t border-stone-50 my-1" />

            {/* WhatsApp */}
            {paid ? (
              <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                 onClick={() => { setDropdownOpen(false); if (guestId) markSent(guestId) }}
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">WhatsApp</p>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Message personnalisé prêt</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-default select-none">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">WhatsApp 🔒</p></div>
              </div>
            )}

            {/* SMS */}
            {paid ? (
              <a href={`sms:?body=${smsMsg}`} onClick={() => { setDropdownOpen(false); if (guestId) markSent(guestId) }}
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">SMS</p><p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Ouvre l&apos;application SMS</p></div>
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-default select-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">SMS 🔒</p></div>
              </div>
            )}

            {/* Email */}
            {paid ? (
              <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} onClick={() => { setDropdownOpen(false); if (guestId) markSent(guestId) }}
                 className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">Email</p><p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Ouvre votre messagerie</p></div>
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-default select-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">Email 🔒</p></div>
              </div>
            )}

            <div className="border-t border-stone-50 my-1" />

            {/* Télécharger faire-part */}
            {paid ? (
              <button onClick={handleDownload} disabled={downloading}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f0e8] transition text-left cursor-pointer disabled:opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                <div>
                  <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">{downloading ? 'Génération…' : 'Télécharger le faire-part'}</p>
                  <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">PDF identique au faire-part</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-default select-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-stone-400 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">Télécharger le faire-part 🔒</p></div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  )
}
