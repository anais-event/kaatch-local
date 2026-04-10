'use client'

import { useEffect, useRef, useState } from 'react'

export default function QRCodeDisplay({ url, weddingName, weddingDate }: {
  url: string
  weddingName: string
  weddingDate?: string | null
}) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const dateFormatted = weddingDate
    ? new Date(weddingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  useEffect(() => {
    async function generate() {
      const QRCode = (await import('qrcode')).default
      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, url, {
          width: 200,
          margin: 1,
          color: { dark: '#2d3228', light: '#ffffff' },
        })
      }
    }
    generate()
  }, [url])

  async function downloadCard() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
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

      {/* Carte à télécharger */}
      <div ref={cardRef}
           className="rounded-2xl overflow-hidden shadow-lg"
           style={{
             width: 340,
             background: 'linear-gradient(135deg, #f5f0e8 0%, #ede8df 100%)',
             border: '1px solid #e0d9ce',
           }}>

        {/* Bande décorative en haut */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, #4a5240, #2d3228)' }} />

        <div className="px-8 py-7 text-center">

          {/* Titre */}
          <p style={{
            fontFamily: 'var(--font-lato)', fontWeight: 300,
            fontSize: '0.6rem', letterSpacing: '0.28em',
            color: '#9a9187', textTransform: 'uppercase', marginBottom: 8
          }}>
            Partagez vos plus beaux moments
          </p>

          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontWeight: 600,
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

          {/* QR code */}
          <div style={{
            display: 'inline-flex', padding: 12,
            background: '#fff', borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20
          }}>
            <canvas ref={qrCanvasRef} style={{ borderRadius: 4 }} />
          </div>

          {/* Message */}
          <p style={{
            fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
            fontSize: '0.95rem', color: '#6b6459', lineHeight: 1.6,
            marginBottom: 12
          }}>
            Scannez pour rejoindre<br />notre album photo partagé
          </p>

          {/* URL en petit */}
          <p style={{
            fontFamily: 'var(--font-lato)', fontWeight: 300,
            fontSize: '0.6rem', color: '#b5ada3', letterSpacing: '0.06em',
            wordBreak: 'break-all'
          }}>
            {url}
          </p>
        </div>

        {/* Bande décorative en bas */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, #2d3228, #4a5240)' }} />
      </div>

      {/* Bouton télécharger */}
      <button onClick={downloadCard} disabled={downloading}
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
