'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoindreForm() {
  const [code, setCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    router.push(`/p/${code.trim().toUpperCase()}`)
  }

  async function startScanner() {
    setScanning(true)
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!)

      stream.getTracks().forEach(t => t.stop())
      setScanning(false)

      const text = result.getText()
      // Extraire le code de l'URL si c'est une URL complète
      const match = text.match(/\/p\/([A-Z0-9\-]+)/i)
      const extracted = match ? match[1] : text
      router.push(`/p/${extracted.toUpperCase()}`)
    } catch {
      setScanning(false)
      setError('Impossible de scanner. Entrez le code manuellement.')
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
    }
  }

  function stopScanner() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    }
    setScanning(false)
  }

  return (
    <div className="space-y-4">
      {/* Formulaire code */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: SOPHIE-JULIEN-2028"
          className="flex-1 border border-stone-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-center"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}
        />
        <button type="submit"
          className="bg-[#4a5240] text-white px-5 py-3 rounded-xl hover:bg-[#2d3228] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          →
        </button>
      </form>

      {/* Séparateur */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200" />
        <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
              className="text-stone-400">ou</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Bouton scanner */}
      {!scanning ? (
        <button onClick={startScanner}
          className="w-full border border-[#4a5240] text-[#4a5240] py-3 rounded-xl hover:bg-[#4a5240] hover:text-white transition flex items-center justify-center gap-2"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}>
          📷 Scanner le QR code
        </button>
      ) : (
        <div className="space-y-3">
          <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
          <button onClick={stopScanner}
            className="w-full border border-stone-300 text-stone-500 py-2 rounded-xl hover:bg-stone-100 transition text-sm"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Annuler
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          {error}
        </p>
      )}
    </div>
  )
}
