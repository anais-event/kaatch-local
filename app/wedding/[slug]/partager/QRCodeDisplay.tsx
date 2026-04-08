'use client'

import { useEffect, useRef } from 'react'

export default function QRCodeDisplay({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function generate() {
      const QRCode = (await import('qrcode')).default
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 240,
          margin: 2,
          color: { dark: '#2d3228', light: '#f5f0e8' },
        })
      }
    }
    generate()
  }, [url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'qrcode-mariage.png'
    a.href = canvas.toDataURL()
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-2xl" />
      <button onClick={download}
        className="border border-[#4a5240] text-[#4a5240] px-6 py-2 rounded-full hover:bg-[#4a5240] hover:text-white transition text-sm"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em' }}>
        ⬇️ Télécharger le QR code
      </button>
    </div>
  )
}
