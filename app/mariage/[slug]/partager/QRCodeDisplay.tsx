'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useEffect, useRef, useState } from 'react'

export default function QRCodeDisplay({ url, weddingName, weddingDate }: {
  url: string
  weddingName: string
  weddingDate?: string | null
}) {
  const locale = useLocale()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const dateFormatted = weddingDate
    ? new Date(weddingDate).toLocaleDateString(toDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  useEffect(() => {
    async function generate() {
      const QRCode = (await import('qrcode')).default
      // Render to canvas for display
      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, url, {
          width: 200,
          margin: 2,
          color: { dark: '#2d3228', light: '#ffffff' },
        })
      }
      // Also get data URL for download
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#2d3228', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
    }
    generate()
  }, [url])

  async function downloadCard() {
    if (!qrDataUrl) return
    setDownloading(true)
    try {
      // Card dimensions (scale 3x for print quality)
      const scale = 3
      const W = 340 * scale
      const H = 520 * scale

      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 340, 520)
      grad.addColorStop(0, '#f5f0e8')
      grad.addColorStop(1, '#ede8df')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(0, 0, 340, 520, 16)
      ctx.fill()

      // Border
      ctx.strokeStyle = '#e0d9ce'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(0, 0, 340, 520, 16)
      ctx.stroke()

      // Top stripe
      const topGrad = ctx.createLinearGradient(0, 0, 340, 0)
      topGrad.addColorStop(0, '#4a5240')
      topGrad.addColorStop(1, '#2d3228')
      ctx.fillStyle = topGrad
      ctx.beginPath()
      ctx.roundRect(0, 0, 340, 6, [16, 16, 0, 0])
      ctx.fill()

      // "Partagez vos plus beaux moments"
      ctx.fillStyle = '#9a9187'
      ctx.font = '300 8px Lato, sans-serif'
      ctx.textAlign = 'center'
      ctx.letterSpacing = '2px'
      ctx.fillText('PARTAGEZ VOS PLUS BEAUX MOMENTS', 170, 36)

      // Wedding name
      ctx.fillStyle = '#2d3228'
      ctx.font = '600 28px Georgia, serif'
      ctx.letterSpacing = '0px'
      ctx.fillText(weddingName, 170, 74)

      // Date
      if (dateFormatted) {
        ctx.fillStyle = '#9a9187'
        ctx.font = '300 11px Lato, sans-serif'
        ctx.fillText(dateFormatted, 170, 94)
      }

      // QR code white card background
      const qrSize = 200
      const qrX = (340 - qrSize - 24) / 2
      const qrY = 112
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.06)'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.roundRect(qrX, qrY, qrSize + 24, qrSize + 24, 12)
      ctx.fill()
      ctx.shadowBlur = 0

      // QR code image
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, qrX + 12, qrY + 12, qrSize, qrSize)
          resolve()
        }
        img.src = qrDataUrl
      })

      // "Scannez pour rejoindre..."
      ctx.fillStyle = '#6b6459'
      ctx.font = 'italic 15px Georgia, serif'
      ctx.fillText('Scannez pour rejoindre', 170, 370)
      ctx.fillText('notre album photo partagé', 170, 390)

      // URL
      ctx.fillStyle = '#b5ada3'
      ctx.font = '300 8px Lato, sans-serif'
      ctx.fillText(url, 170, 420)

      // Bottom stripe
      const botGrad = ctx.createLinearGradient(0, 0, 340, 0)
      botGrad.addColorStop(0, '#2d3228')
      botGrad.addColorStop(1, '#4a5240')
      ctx.fillStyle = botGrad
      ctx.beginPath()
      ctx.roundRect(0, 514, 340, 6, [0, 0, 16, 16])
      ctx.fill()

      const a = document.createElement('a')
      a.download = `carte-qr-${weddingName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Carte preview */}
      <div className="rounded-2xl overflow-hidden shadow-lg"
           style={{
             width: 340,
             background: 'linear-gradient(135deg, #f5f0e8 0%, #ede8df 100%)',
             border: '1px solid #e0d9ce',
           }}>

        <div style={{ height: 6, background: 'linear-gradient(90deg, #4a5240, #2d3228)' }} />

        <div className="px-8 py-7 text-center">
          <p style={{
            fontFamily: 'var(--font-lato)', fontWeight: 300,
            fontSize: '0.6rem', letterSpacing: '0.28em',
            color: '#9a9187', textTransform: 'uppercase', marginBottom: 8
          }}>
            Partagez vos plus beaux moments
          </p>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '1.6rem', lineHeight: 1.15, color: '#2d3228',
            marginBottom: 4
          }}>
            {weddingName}
          </h2>

          {dateFormatted && (
            <p style={{
              fontFamily: 'var(--font-lato)', fontWeight: 300,
              fontSize: '0.72rem', color: '#9a9187', letterSpacing: '0.06em',
              marginBottom: 20
            }}>
              {dateFormatted}
            </p>
          )}

          <div style={{
            display: 'inline-flex', padding: 12,
            background: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20
          }}>
            <canvas ref={qrCanvasRef} style={{ borderRadius: 4 }} />
          </div>

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem', color: '#6b6459', lineHeight: 1.6,
            marginBottom: 12
          }}>
            Scannez pour rejoindre<br />notre album photo partagé
          </p>

          <p style={{
            fontFamily: 'var(--font-lato)', fontWeight: 300,
            fontSize: '0.6rem', color: '#b5ada3', letterSpacing: '0.06em',
            wordBreak: 'break-all'
          }}>
            {url}
          </p>
        </div>

        <div style={{ height: 6, background: 'linear-gradient(90deg, #2d3228, #4a5240)' }} />
      </div>

      <button onClick={downloadCard} disabled={downloading || !qrDataUrl}
        className="bg-[#4a5240] text-white px-8 py-2.5 rounded-lg hover:bg-[#2d3228] transition text-sm disabled:opacity-50 cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em' }}>
        {downloading ? 'Génération…' : 'Télécharger la carte'}
      </button>
      <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
         className="text-stone-400 text-center">
        Image PNG haute résolution — à imprimer sur les tables le jour J
      </p>
    </div>
  )
}
