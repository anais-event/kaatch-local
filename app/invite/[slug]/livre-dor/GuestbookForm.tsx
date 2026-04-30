'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface GuestbookFormProps {
  submitEntry: (formData: FormData) => Promise<void>
  defaultName: string
}

export default function GuestbookForm({ submitEntry, defaultName }: GuestbookFormProps) {
  const [message, setMessage] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_CHARS = 500

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setPreviewUrl(null); return }
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 5 Mo.')
      e.target.value = ''
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await submitEntry(formData)
      setSuccess(true)
      setMessage('')
      setPreviewUrl(null)
      formRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
        <p className="text-3xl mb-3">💌</p>
        <p className="text-[#4a5240] text-lg" style={{ fontFamily: 'var(--font-display)' }}>
          Merci, votre mot a été déposé
        </p>
        <p className="text-stone-400 text-sm mt-2" style={{ fontWeight: 300 }}>Votre message sera lu par les mariés 🌸</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm text-[#4a5240] underline underline-offset-2"
          style={{ fontWeight: 300 }}
        >
          Écrire un autre message
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col gap-5">

      {/* Author name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
          Votre prénom
        </label>
        <input
          name="author_name"
          type="text"
          defaultValue={defaultName}
          required
          className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
          style={{ fontWeight: 300 }}
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
          Votre message
        </label>
        <textarea
          name="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={MAX_CHARS}
          rows={5}
          required
          placeholder="Écrivez vos voeux, un souvenir, une pensée…"
          className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
          style={{ fontWeight: 300 }}
        />
        <p className={`text-right text-xs ${message.length >= MAX_CHARS ? 'text-red-400' : 'text-stone-300'}`} style={{ fontWeight: 300 }}>
          {message.length} / {MAX_CHARS}
        </p>
      </div>

      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
          Photo (optionnel)
        </label>
        <label className="cursor-pointer flex items-center gap-3 text-sm text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-3 hover:border-[#4a5240]/40 transition-colors bg-[#f5f0e8]/40">
          <span className="text-lg">📷</span>
          <span style={{ fontWeight: 300 }}>Ajouter une photo</span>
          <input
            ref={fileInputRef}
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {previewUrl && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
            <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-1 right-1 bg-white/80 rounded-full w-5 h-5 text-xs flex items-center justify-center text-stone-500 hover:bg-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="w-full py-3 rounded-xl bg-[#4a5240] text-white text-sm transition-all hover:bg-[#2d3228] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontWeight: 300, letterSpacing: '0.03em' }}
      >
        {loading ? 'Envoi en cours…' : 'Déposer dans le livre d\'or 💌'}
      </button>

      <p className="text-center text-xs text-stone-300" style={{ fontWeight: 300 }}>
        Votre message sera lu par les mariés 🌸
      </p>
    </form>
  )
}
