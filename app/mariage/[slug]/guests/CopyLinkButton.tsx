'use client'

import { useState, useRef, useEffect } from 'react'

async function markSent(guestId: string) {
  try {
    await fetch('/api/invite-sent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestId }) })
  } catch {}
}

function parseCoupleNames(name: string): [string, string | null] {
  const m = name.match(/^(.+?)\s+[&]\s+(.+)$/i)
  if (m) return [m[1].trim(), m[2].trim()]
  const m2 = name.match(/^(.+?)\s+et\s+(.+)$/i)
  if (m2) return [m2[1].trim(), m2[2].trim()]
  return [name, null]
}

async function downloadFairePartPng(
  url: string,
  guestName: string,
  wedding: { name: string; date: string | null; location: string | null } | undefined
) {
  const W = 600, H = 900
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'

  // Green background
  ctx.fillStyle = '#4a5639'
  ctx.fillRect(0, 0, W, H)

  function goldGrad(x0: number, y0: number, x1: number, y1: number) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, '#e2c97e'); g.addColorStop(0.4, '#c9a96e')
    g.addColorStop(0.75, '#a07840'); g.addColorStop(1, '#d4b96e')
    return g
  }

  function drawLeaf(lx: number, ly: number, size: number, angle: number, color: string, alpha = 0.75) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(angle); ctx.globalAlpha = alpha
    ctx.beginPath(); ctx.moveTo(0, 0)
    ctx.bezierCurveTo(-size * 0.32, -size * 0.45, -size * 0.22, -size * 1.05, 0, -size * 1.15)
    ctx.bezierCurveTo(size * 0.22, -size * 1.05, size * 0.32, -size * 0.45, 0, 0)
    ctx.fillStyle = color; ctx.fill(); ctx.restore(); ctx.globalAlpha = 1
  }

  // Top text
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'italic 21px Georgia, serif'
  ctx.fillText('Vous êtes invités au mariage de', W / 2, 52)

  // Ring
  const rx = W / 2, ry = 310, rr = 168, rr2 = 154
  const leafColors = ['#9bb982', '#8aad72', '#a3c48a', '#7aa068', '#b0cc96']

  ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2)
  ctx.strokeStyle = goldGrad(rx - rr, ry, rx + rr, ry); ctx.lineWidth = 2.2; ctx.stroke()
  ctx.beginPath(); ctx.arc(rx, ry, rr2, 0, Math.PI * 2)
  ctx.strokeStyle = goldGrad(rx + rr2, ry, rx - rr2, ry); ctx.globalAlpha = 0.65; ctx.lineWidth = 1.4; ctx.stroke()
  ctx.globalAlpha = 1

  ;[0, 90, 180, 270].forEach(deg => {
    const rad = (deg * Math.PI) / 180
    ctx.beginPath(); ctx.arc(rx + rr * Math.cos(rad), ry + rr * Math.sin(rad), 3, 0, Math.PI * 2)
    ctx.strokeStyle = goldGrad(rx - 4, ry, rx + 4, ry); ctx.lineWidth = 1.5; ctx.stroke()
  })

  // Top leaves
  ;[
    [rx, ry - rr - 2, 20, -Math.PI / 2, 0], [rx - 28, ry - rr + 8, 16, -Math.PI * 0.6, 1],
    [rx + 28, ry - rr + 8, 16, -Math.PI * 0.4, 2], [rx - 52, ry - rr + 20, 14, -Math.PI * 0.7, 3],
    [rx + 52, ry - rr + 20, 14, -Math.PI * 0.3, 4], [rx - 70, ry - rr + 34, 12, -Math.PI * 0.75, 2],
    [rx + 70, ry - rr + 34, 12, -Math.PI * 0.25, 3],
  ].forEach(([lx, ly, s, a, ci]) => drawLeaf(lx as number, ly as number, s as number, a as number, leafColors[ci as number]))

  // Bottom leaves
  ;[
    [rx, ry + rr + 2, 20, Math.PI / 2, 0], [rx - 30, ry + rr - 8, 16, Math.PI * 0.62, 1],
    [rx + 30, ry + rr - 8, 16, Math.PI * 0.38, 2], [rx - 56, ry + rr - 18, 14, Math.PI * 0.7, 3],
    [rx + 56, ry + rr - 18, 14, Math.PI * 0.3, 4], [rx - 78, ry + rr - 30, 12, Math.PI * 0.78, 2],
    [rx + 78, ry + rr - 30, 12, Math.PI * 0.22, 3], [rx - 94, ry + rr - 42, 11, Math.PI * 0.82, 0],
    [rx + 94, ry + rr - 42, 11, Math.PI * 0.18, 1],
  ].forEach(([lx, ly, s, a, ci]) => drawLeaf(lx as number, ly as number, s as number, a as number, leafColors[ci as number]))

  // Gold leaf left
  ctx.save(); ctx.translate(rx - rr - 25, ry - 28)
  const gl = goldGrad(0, 0, 35, 60)
  ctx.beginPath(); ctx.moveTo(35, 0)
  ctx.bezierCurveTo(8, 10, 4, 38, 8, 50); ctx.bezierCurveTo(14, 62, 32, 56, 35, 0)
  ctx.fillStyle = gl; ctx.fill(); ctx.restore()

  // Names
  const [n1, n2] = parseCoupleNames(wedding?.name ?? guestName)
  ctx.fillStyle = '#ffffff'; ctx.font = '600 32px Georgia, serif'
  if (n2) {
    ctx.fillText(n1.toUpperCase(), rx, ry - 28)
    ctx.fillStyle = '#c9a96e'; ctx.font = 'normal 18px Georgia, serif'
    ctx.fillText('&', rx, ry - 4)
    ctx.fillStyle = '#ffffff'; ctx.font = '600 32px Georgia, serif'
    ctx.fillText(n2.toUpperCase(), rx, ry + 26)
  } else {
    ctx.fillText(n1.toUpperCase(), rx, ry + 8)
  }

  if (wedding?.date) {
    const d = new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = 'italic 15px Georgia, serif'
    ctx.fillText(d.charAt(0).toUpperCase() + d.slice(1), rx, n2 ? ry + 56 : ry + 40)
  }

  // Location
  if (wedding?.location) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = 'italic 14px Georgia, serif'
    ctx.fillText(wedding.location, rx, 758)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.font = 'italic 12px Georgia, serif'
  ctx.fillText("pour célébrer ce moment d'amour", rx, 782)

  // QR
  const QR = await import('qrcode')
  const qrDataUrl = await QR.default.toDataURL(url, {
    width: 110, margin: 1, color: { dark: '#2d3a22', light: '#f0ede4' }
  })
  const qrImg = new Image()
  await new Promise<void>(r => { qrImg.onload = () => r(); qrImg.src = qrDataUrl })

  // Label above QR
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '300 11px Arial, sans-serif'
  ctx.letterSpacing = '0.1em'
  ctx.fillText('VOTRE ESPACE PERSONNEL', rx, 790)
  ctx.letterSpacing = '0'

  // QR code — centré, fits within canvas (H=900)
  ctx.drawImage(qrImg, rx - 50, 800, 100, 100)

  // Hearts
  ctx.fillStyle = 'rgba(201,169,110,0.5)'; ctx.font = '13px sans-serif'
  ;[-65, 65].forEach(dx => ctx.fillText('♡', rx + dx, 888))

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `faire-part-${(guestName.split(' ')[0] ?? 'invite').toLowerCase()}.png`
  a.click()
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
}: {
  url: string
  guestName: string
  gender?: 'M' | 'F' | null
  slug?: string
  wedding?: { name: string; date: string | null; location: string | null; coverImageUrl: string | null; coupleMessage: string | null }
  guestId?: string
  paid?: boolean
  weddingId?: string
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const checkoutBase = process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? '/pricing'
  const upgradeUrl = weddingId ? `${checkoutBase}?checkout[custom][wedding_id]=${weddingId}` : '/pricing'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    setDownloading(true)
    setDropdownOpen(false)
    try {
      await downloadFairePartPng(url, guestName, wedding ? { name: wedding.name, date: wedding.date, location: wedding.location } : undefined)
    } finally {
      setDownloading(false)
    }
  }

  return (
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
            <span className="hidden sm:inline">Partager</span>
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
              <div><p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-stone-700">SMS</p><p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Ouvre l'application SMS</p></div>
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
                <p style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400">Image PNG à envoyer</p>
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
  )
}
