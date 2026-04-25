'use client'

import { useState } from 'react'
import CopyLinkButton from './CopyLinkButton'

type Guest = {
  id: string
  first_name: string
  last_name: string
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

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
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

  // Background
  ctx.fillStyle = '#fdfcf8'
  ctx.fillRect(0, 0, 600, 900)

  // Top stripe gradient
  const topGrad = ctx.createLinearGradient(0, 0, 600, 0)
  topGrad.addColorStop(0, '#4a5240')
  topGrad.addColorStop(1, '#2d3228')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, 600, 8)

  // Ornament ✦
  ctx.fillStyle = '#c9a96e'
  ctx.font = '18px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('✦', 300, 55)

  // "Chère / Cher [Prénom],"
  const greeting = `Chère ${guest.first_name},`
  ctx.fillStyle = '#6b6459'
  ctx.font = 'italic 22px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(greeting, 300, 120)

  // Subtitle
  ctx.fillStyle = '#9a9187'
  ctx.font = '300 13px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '0.08em'
  ctx.fillText('Nous avons la joie de vous annoncer', 300, 160)

  // Wedding name
  ctx.fillStyle = '#2d3228'
  ctx.font = 'bold 48px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(wedding.name, 300, 220)

  // Invite text
  ctx.fillStyle = '#9a9187'
  ctx.font = '300 13px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('et vous invitent à célébrer leur mariage', 300, 260)

  // Divider 1
  ctx.strokeStyle = '#e0d9ce'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 295)
  ctx.lineTo(520, 295)
  ctx.stroke()

  // Date
  if (wedding.date) {
    const dateStr = capitalizeFirst(
      new Date(wedding.date).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    )
    ctx.fillStyle = '#4a5240'
    ctx.font = '18px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(dateStr, 300, 335)
  }

  // Location
  if (wedding.location) {
    ctx.fillStyle = '#9a9187'
    ctx.font = '300 14px Lato, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(wedding.location, 300, 365)
  }

  // Divider 2
  ctx.strokeStyle = '#e0d9ce'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 400)
  ctx.lineTo(520, 400)
  ctx.stroke()

  // QR code
  if (guest.invite_token) {
    const url = `${baseUrl}/i/${guest.invite_token}`
    const QR = await import('qrcode')
    const qrDataUrl = await QR.default.toDataURL(url, { width: 200, margin: 1 })
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.src = qrDataUrl
    })
    ctx.drawImage(qrImg, 200, 430, 200, 200)
  }

  // "Scannez pour confirmer..."
  ctx.fillStyle = '#b5ada3'
  ctx.font = '300 12px Lato, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Scannez pour confirmer votre présence', 300, 648)

  // Bottom stripe gradient
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

  const guestsWithToken = guests.filter(g => g.invite_token)
  const allWithTokenIds = guestsWithToken.map(g => g.id)
  const allSelected = allWithTokenIds.length > 0 && allWithTokenIds.every(id => selected.has(id))
  const someSelected = allWithTokenIds.some(id => selected.has(id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allWithTokenIds))
    }
  }

  function toggleGuest(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
      const lastName = (guest.last_name && guest.last_name !== 'null') ? `-${guest.last_name.toLowerCase()}` : ''
      a.download = `faire-part-${guest.first_name.toLowerCase()}${lastName}.png`
      a.click()
    }
    setDownloading(false)
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-2xl border border-stone-100">
        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem' }}
           className="text-stone-400 mb-2">Aucun invité</p>
        <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
          Ajoutez des invités d'abord depuis la page{' '}
          <a href={`/wedding/${slug}/guests`} className="text-[#4a5240] hover:underline">Invités</a>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-50 flex items-center gap-3">
          {guestsWithToken.length > 0 && (
            <input
              type="checkbox"
              checked={allSelected}
              ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-[#4a5240] cursor-pointer"
            />
          )}
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.15em' }}
             className="text-stone-400 uppercase flex-1">
            {guests.length} invité{guests.length > 1 ? 's' : ''}
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.12em' }}
             className="text-stone-400 uppercase hidden sm:block">
            Tout sélectionner
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-stone-50">
          {guests.map(guest => {
            const link = guest.invite_token ? `${baseUrl}/i/${guest.invite_token}` : null
            const isSelected = selected.has(guest.id)
            return (
              <div
                key={guest.id}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isSelected ? 'bg-[#f5f0e8]' : ''}`}
              >
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
                  <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700">
                    {guest.first_name} {guest.last_name && guest.last_name !== 'null' ? guest.last_name : ''}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${rsvpColor(guest.rsvp_status)}`}
                        style={{ fontWeight: 400 }}>
                    {rsvpLabel(guest.rsvp_status)}
                  </span>
                </div>

                {/* Link + actions */}
                {link ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <p style={{ fontWeight: 300, fontSize: '0.7rem' }}
                       className="text-stone-400 truncate hidden sm:block max-w-[220px]">
                      /i/{guest.invite_token}
                    </p>
                    <CopyLinkButton url={link} guestName={`${guest.first_name} ${guest.last_name ?? ''}`} slug={slug} />
                    <a href={link} target="_blank" rel="noopener noreferrer"
                       className="text-xs text-stone-300 hover:text-[#4a5240] transition"
                       title="Aperçu">
                      ↗
                    </a>
                  </div>
                ) : (
                  <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 italic">
                    Pas de lien
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-6 py-3 flex items-center justify-between z-50">
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-600">
            {selected.size} invité{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
          </p>
          <button
            onClick={downloadSelected}
            disabled={downloading}
            className="bg-[#4a5240] text-white px-5 py-2 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-60"
            style={{ fontWeight: 300 }}
          >
            {downloading ? 'Téléchargement…' : `Télécharger (${selected.size}) faire-part${selected.size > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </>
  )
}
