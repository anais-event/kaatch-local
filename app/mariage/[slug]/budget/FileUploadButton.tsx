'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

type Props = {
  slug: string
  weddingId: string
  quoteId?: string
  itemId?: string
  onSave: (f: FormData) => Promise<void>
}

export default function FileUploadButton({ slug, weddingId, quoteId, itemId, onSave }: Props) {
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
      const path = `${weddingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('budget-files')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (upErr) throw upErr

      const { data: signedData } = await supabase.storage
        .from('budget-files')
        .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 an

      const fileUrl = signedData?.signedUrl ?? path

      const fd = new FormData()
      fd.set('slug', slug)
      fd.set('wedding_id', weddingId)
      fd.set('file_name', file.name)
      fd.set('file_url', fileUrl)
      fd.set('file_path', path)
      fd.set('file_type', file.type)
      if (quoteId) fd.set('quote_id', quoteId)
      if (itemId) fd.set('item_id', itemId)
      await onSave(fd)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Joindre un fichier (devis, facture…)"
        className="p-1.5 text-stone-300 hover:text-[#4a5240] transition cursor-pointer rounded-lg hover:bg-stone-100 disabled:opacity-50"
      >
        {uploading ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121M17.657 17.657l-2.121-2.121M8.757 8.757L6.636 6.636" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        )}
      </button>
      {error && <span className="text-[10px] text-red-400" style={{ fontWeight: 300 }}>{error}</span>}
    </>
  )
}
