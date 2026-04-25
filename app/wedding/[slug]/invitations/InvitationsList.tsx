'use client'

import { useState, useEffect, useRef } from 'react'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  telephone: string | null
  rsvp_status: string
  invite_token: string | null
}

type Props = {
  guests: Guest[]
  baseUrl: string
  slug: string
  wedding: { name: string; date: string | null; location: string | null }
}

function rsvpColor(s: string) {
  return s === 'confirme' ? 'bg-emerald-50 text-emerald-600' :
    s === 'decline' ? 'bg-red-50 text-red-400' :
    'bg-stone-100 text-stone-400'
}

function rsvpLabel(s: string) {
  return s === 'confirme' ? 'Confirmé' : s === 'decline' ? 'Décliné' : 'En attente'
}

function cleanName(first: string, last: string | null) {
  return [first, last].filter(v => v && v !== 'null').join(' ')
}

function QRCodeCell({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    import('qrcode').then(QR => {
      if (ref.current) {
        QR.default.toCanvas(ref.current, url, {
          width: 80, margin: 1,
          color: { dark: '#2d3228', light: '#ffffff' },
        })
      }
    })
  }, [url])
  return <canvas ref={ref} style={{ borderRadius: 6, display: 'block' }} />
}

async function drawFairePartCanvas(
  guest: Guest,
  baseUrl: string,
  wedding: { name: string; date: string | null; location: string | null }
): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 900
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#fdfcf8'
  ctx.fillRect(0, 0, 600, 900)

  const topGrad = ctx.createLinearGradient(0, 0, 600, 0)
  topGrad.addColorStop(0, '#4a5240')
  topGrad.addColorStop(1, '#2d3228')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, 600, 8)

  ctx.fillStyle = '#c9a96e'
  ctx.font = '18px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('✦', 300, 55)

  const firstName = guest.first_name
  ctx.fillStyle = '#6b6459'
  ctx.font = 'italic 22px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Chère/Cher ${firstName},`, 300, 120)

  ctx.fillStyle = '#9a9187'
  ctx.font = '300 13px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Nous avons la joie de vous annoncer', 300, 160)

  ctx.fillStyle = '#2d3228'
  ctx.font = 'bold 42px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(wedding.name, 300, 218)

  ctx.fillStyle = '#9a9187'
  ctx.font = '300 13px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('et vous invitent à célébrer leur mariage', 300, 258)

  ctx.strokeStyle = '#e0d9ce'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 290)
  ctx.lineTo(520, 290)
  ctx.stroke()

  if (wedding.date) {
    const dateStr = new Date(wedding.date).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    ctx.fillStyle = '#4a5240'
    ctx.font = '18px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 300, 330)
  }

  if (wedding.location) {
    ctx.fillStyle = '#9a9187'
    ctx.font = '300 14px Lato, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(wedding.location, 300, 360)
  }

  ctx.strokeStyle = '#e0d9ce'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 395)
  ctx.lineTo(520, 395)
  ctx.stroke()

  if (guest.invite_token) {
    const url = `${baseUrl}/i/${guest.invite_token}`
    const QR = await import('qrcode')
    const qrDataUrl = await QR.default.toDataURL(url, { width: 200, margin: 1 })
    const qrImg = new Image()
    await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); qrImg.src = qrDataUrl })
    ctx.drawImage(qrImg, 200, 425, 200, 200)
  }

  ctx.fillStyle = '#b5ada3'
  ctx.font = '300 12px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Scannez pour confirmer votre présence', 300, 642)
  ctx.fillText(`${baseUrl}/i/${guest.invite_token}`, 300, 660)

  const botGrad = ctx.createLinearGradient(0, 0, 600, 0)
  botGrad.addColorStop(0, '#2d3228')
  botGrad.addColorStop(1, '#4a5240')
  ctx.fillStyle = botGrad
  ctx.fillRect(0, 892, 600, 8)

  return canvas.toDataURL('image/png')
}

export default function InvitationsList({ guests, baseUrl, slug, wedding }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)

  const guestsWithToken = guests.filter(g => g.invite_token)
  const allIds = guestsWithToken.map(g => g.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
  const someSelected = allIds.some(id => selected.has(id))

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  function toggleGuest(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function copyLink(url: string, id: string) {
    await navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function downloadSelected() {
    setDownloading(true)
    const selectedGuests = guests.filter(g => selected.has(g.id) && g.invite_token)
    for (let i = 0; i < selectedGuests.length; i++) {
      const guest = selectedGuests[i]
      if (i > 0) await new Promise(r => setTimeout(r, 200))
      const dataUrl = await drawFairePartCanvas(guest, baseUrl, wedding)
      const a = document.createElement('a')
      a.href = dataUrl
      const name = cleanName(guest.first_name, guest.last_name).toLowerCase().replace(/\s+/g, '-')
      a.download = `faire-part-${name}.png`
      a.click()
    }
    setDownloading(false)
  }

  const dateFormatted = wedding.date
    ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  function whatsappMsg(guest: Guest, url: string) {
    return encodeURIComponent(
      `Cher(e) ${guest.first_name},\n\nVoici ton invitation personnalisée pour notre mariage :\n${url}\n\nÀ très vite ! 🥂`
    )
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem' }}
           className="text-stone-400 mb-2">Aucun invité</p>
        <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
          Ajoutez des invités depuis la page{' '}
          <a href={`/wedding/${slug}/guests`} className="text-[#4a5240] hover:underline">Invités</a>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-3">
          {guestsWithToken.length > 0 && (
            <input
              type="checkbox"
              checked={allSelected}
              ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-[#4a5240] cursor-pointer"
            />
          )}
          <p style={{ fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em' }}
             className="text-stone-500 uppercase flex-1">
            {guests.length} INVITÉ{guests.length > 1 ? 'S' : ''}
          </p>
          <p style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase hidden sm:block">
            QR CODE · LIEN · PARTAGER
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-50">
          {guests.map(guest => {
            const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
            const isSelected = selected.has(guest.id)
            const name = cleanName(guest.first_name, guest.last_name)

            return (
              <div key={guest.id}>
                <div className={`flex items-center gap-3 px-5 py-3 transition-colors ${isSelected ? 'bg-[#f5f0e8]' : ''}`}>
                  {/* Checkbox */}
                  <div className="w-5 flex-shrink-0">
                    {guest.invite_token && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGuest(guest.id)}
                        className="w-4 h-4 rounded accent-[#4a5240] cursor-pointer"
                      />
                    )}
                  </div>

                  {/* Name + RSVP */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 600, fontSize: '0.88rem' }} className="text-[#2d3228]">{name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${rsvpColor(guest.rsvp_status)}`}
                          style={{ fontWeight: 400 }}>
                      {rsvpLabel(guest.rsvp_status)}
                    </span>
                  </div>

                  {/* Actions */}
                  {link ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* QR toggle */}
                      <button
                        onClick={() => setShowQR(showQR === guest.id ? null : guest.id)}
                        title="QR Code"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer text-sm ${
                          showQR === guest.id
                            ? 'bg-[#4a5240] text-white border-[#4a5240]'
                            : 'border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240]'
                        }`}>
                        ▦
                      </button>

                      {/* Copier */}
                      <button
                        onClick={() => copyLink(link, guest.id)}
                        title="Copier le lien"
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer text-xs ${
                          copied === guest.id
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240]'
                        }`}>
                        {copied === guest.id ? '✓' : '⎘'}
                      </button>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${whatsappMsg(guest, link)}`}
                        target="_blank" rel="noopener noreferrer"
                        title="WhatsApp"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:border-[#25D366] hover:text-[#25D366] transition text-sm">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>

                      {/* Aperçu */}
                      <a
                        href={link}
                        target="_blank" rel="noopener noreferrer"
                        title="Aperçu faire-part"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition text-xs">
                        ↗
                      </a>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 italic">Pas de lien</span>
                  )}
                </div>

                {/* QR Code panel */}
                {showQR === guest.id && link && (
                  <div className="px-5 py-4 bg-stone-50 border-t border-stone-100 flex items-start gap-6">
                    <QRCodeCell url={link} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em' }}
                         className="text-stone-500 uppercase mb-1">QR Code personnel</p>
                      <p style={{ fontWeight: 300, fontSize: '0.75rem', lineHeight: 1.6 }} className="text-stone-400 mb-3">
                        {guest.first_name} peut scanner ce code pour accéder directement à son faire-part.
                      </p>
                      <p style={{ fontWeight: 300, fontSize: '0.65rem' }}
                         className="text-stone-300 font-mono break-all">{link}</p>
                      {guest.email && (
                        <a
                          href={`mailto:${guest.email}?subject=Ton invitation — ${wedding.name}&body=${encodeURIComponent(`Chère/Cher ${guest.first_name},\n\nVoici ton invitation personnalisée :\n${link}\n\nÀ très vite !\n${wedding.name}`)}`}
                          className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#4a5240] border border-[#4a5240]/30 px-3 py-1.5 rounded-lg hover:bg-[#4a5240] hover:text-white transition"
                          style={{ fontWeight: 400 }}>
                          ✉ Envoyer par email à {guest.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky bottom bar - bulk actions */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-6 py-3 flex items-center justify-between z-50 gap-3 flex-wrap">
          <p style={{ fontWeight: 400, fontSize: '0.82rem' }} className="text-[#2d3228]">
            <strong>{selected.size}</strong> invité{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
          </p>
          <button
            onClick={downloadSelected}
            disabled={downloading}
            className="bg-[#4a5240] text-white px-5 py-2 rounded-xl text-xs hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-60"
            style={{ fontWeight: 400, letterSpacing: '0.06em' }}>
            {downloading ? 'Génération…' : `TÉLÉCHARGER (${selected.size}) FAIRE-PART${selected.size > 1 ? 'S' : ''}`}
          </button>
        </div>
      )}
    </>
  )
}
