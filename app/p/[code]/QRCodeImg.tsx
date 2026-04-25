'use client'

import { useEffect, useRef } from 'react'

export default function QRCodeImg({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (ref.current) {
        QRCode.toCanvas(ref.current, url, {
          width: 140,
          margin: 1,
          color: { dark: '#2d3228', light: '#f5f0e8' },
        })
      }
    })
  }, [url])

  return <canvas ref={ref} style={{ borderRadius: 8 }} />
}
