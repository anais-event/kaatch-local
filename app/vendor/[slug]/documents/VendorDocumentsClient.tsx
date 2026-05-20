'use client'

import { useRef, useState } from 'react'

type Doc = {
  id: string
  name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  uploaded_by: string
  created_at: string
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function fileIcon(type: string | null) {
  if (!type) return '📄'
  if (type.includes('pdf')) return '📕'
  if (type.includes('image')) return '🖼️'
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊'
  if (type.includes('word') || type.includes('document')) return '📝'
  return '📄'
}

export default function VendorDocumentsClient({
  slug,
  vendor,
  weddingId,
  documents,
  uploadAction,
  deleteAction,
}: {
  slug: string
  vendor: { id: string; name: string }
  weddingId: string
  documents: Doc[]
  uploadAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.set('file', file)
    fd.set('vendor_id', vendor.id)
    fd.set('wedding_id', weddingId)
    fd.set('uploaded_by', vendor.name)
    fd.set('slug', slug)
    await uploadAction(fd)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <a href={`/vendor/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-4 block"
           style={{ fontWeight: 300 }}>
          ← Retour au tableau de bord
        </a>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                className="text-[#2d3228] mb-1">Documents</h1>
            <p className="text-stone-400" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
              Devis, contrats, factures et autres fichiers partagés
            </p>
          </div>
          <div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition disabled:opacity-50 cursor-pointer"
              style={{ fontWeight: 400 }}
            >
              {uploading ? '⏳ Envoi...' : '📎 Ajouter un fichier'}
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300 }}
               className="text-stone-300 mb-2">Aucun document</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              Ajoutez vos devis, contrats ou factures ici
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/30 transition">
                <span className="text-xl shrink-0">{fileIcon(doc.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-[#2d3228] hover:text-[#4a5240] transition truncate block"
                     style={{ fontWeight: 400 }}>
                    {doc.name}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>
                      {doc.uploaded_by}
                    </span>
                    {doc.file_size && (
                      <>
                        <span className="text-stone-300">·</span>
                        <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>
                          {formatSize(doc.file_size)}
                        </span>
                      </>
                    )}
                    <span className="text-stone-300">·</span>
                    <span className="text-[11px] text-stone-400" style={{ fontWeight: 300 }}>
                      {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-[#4a5240] hover:underline shrink-0 hidden sm:block"
                   style={{ fontWeight: 300 }}>
                  Ouvrir ↗
                </a>
                <form action={deleteAction}>
                  <input type="hidden" name="doc_id" value={doc.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit"
                    className="text-stone-300 hover:text-red-400 transition cursor-pointer p-1"
                    title="Supprimer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
