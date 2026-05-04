'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Props = {
  contactId: string
  slug: string
  weddingId: string
  currentPdfUrl?: string | null
  currentPdfName?: string | null
  onSave: (fd: FormData) => Promise<void>
}

export default function ContactPdfUpload({ contactId, slug, weddingId, currentPdfUrl, currentPdfName, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `contacts/${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('budget-files').upload(path, file, { contentType: file.type })
      if (upErr) throw upErr
      const { data: signedData } = await supabase.storage.from('budget-files').createSignedUrl(path, 60 * 60 * 24 * 365)
      const fileUrl = signedData?.signedUrl ?? path
      const fd = new FormData()
      fd.set('slug', slug)
      fd.set('contact_id', contactId)
      fd.set('file_name', file.name)
      fd.set('file_url', fileUrl)
      fd.set('file_type', file.type)
      await onSave(fd)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {currentPdfUrl && (
        <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer"
           className="text-xs flex items-center gap-1.5 text-stone-500 hover:text-[#4a5240] transition"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          📄 {currentPdfName ? currentPdfName.slice(0, 24) : 'Voir le devis PDF'}
        </a>
      )}
      <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        {uploading ? (
          <>
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
            </svg>
            Upload…
          </>
        ) : (
          <>📎 {currentPdfUrl ? 'Remplacer le PDF' : 'Joindre le devis PDF'}</>
        )}
      </button>
      {error && <span className="text-[10px] text-red-400" style={{ fontFamily: 'var(--font-lato)' }}>{error}</span>}
    </div>
  )
}
