'use client'

import { useState, useRef, useCallback } from 'react'

type Photo = { id: string; url: string; uploader_name: string | null; created_at: string; likes: number }

type Props = {
  slug: string
  weddingName: string
  photos: Photo[]
  uploadPhoto: (f: FormData) => Promise<void>
  deletePhoto: (f: FormData) => Promise<void>
}

export default function PhotoGallery({ slug, weddingName, photos, uploadPhoto, deletePhoto }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null) // index in photos
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploaderName, setUploaderName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Split photos into 3 columns for masonry
  const cols: Photo[][] = [[], [], []]
  photos.forEach((p, i) => cols[i % 3].push(p))

  const openLightbox = (idx: number) => setLightbox(idx)
  const closeLightbox = () => setLightbox(null)
  const prevPhoto = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const nextPhoto = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (lightbox === null) return
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'Escape') closeLightbox()
  }, [lightbox])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) { setPendingFiles(files); setShowUpload(true) }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('uploader_name', uploaderName || 'Les mariés')
    const files = pendingFiles.length > 0 ? pendingFiles : Array.from(fileRef.current?.files ?? [])
    files.forEach(f => fd.append('photo', f))
    await uploadPhoto(fd)
    setUploading(false)
    setShowUpload(false)
    setPendingFiles([])
    if (fileRef.current) fileRef.current.value = ''
  }

  const currentPhoto = lightbox !== null ? photos[lightbox] : null

  return (
    <div
      className="min-h-screen bg-[#1a1a18]"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#1a1a18]/90 backdrop-blur-sm border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <a href={`/wedding/${slug}`}
           className="text-white/40 hover:text-white/80 transition text-sm flex items-center gap-1.5"
           style={{ fontWeight: 300 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Retour</span>
        </a>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.1rem', fontStyle: 'italic' }}
            className="text-white/70">
          {weddingName} — Photos
        </h1>
        <span className="text-white/30 text-sm" style={{ fontWeight: 300 }}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Galerie masonry ── */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 300 }}
             className="text-white/30">Aucune photo pour l'instant</p>
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-white/20">
            Cliquez sur + pour ajouter les premières
          </p>
        </div>
      ) : (
        <div
          className="p-3 sm:p-4"
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {dragOver && (
            <div className="fixed inset-0 z-50 bg-[#4a5240]/80 backdrop-blur flex items-center justify-center pointer-events-none">
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300 }} className="text-white">
                Déposez vos photos ici
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {cols.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2 sm:gap-3">
                {col.map(photo => {
                  const globalIdx = photos.findIndex(p => p.id === photo.id)
                  return (
                    <div key={photo.id}
                      onClick={() => openLightbox(globalIdx)}
                      className="group relative cursor-pointer rounded-xl overflow-hidden bg-white/5"
                      style={{ aspectRatio: (ci % 2 === 0) ? '3/4' : '4/3' }}>
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-end p-3">
                        <div className="opacity-0 group-hover:opacity-100 transition duration-200">
                          {photo.uploader_name && (
                            <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-white/80">
                              {photo.uploader_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bouton + flottant ── */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-[#2d3228] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-20"
        title="Ajouter des photos"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* ── Modal upload ── */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
             onClick={e => { if (e.target === e.currentTarget) setShowUpload(false) }}>
          <div className="bg-[#1e1e1c] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.4rem', fontStyle: 'italic' }}
                  className="text-white">Ajouter des photos</h2>
              <button onClick={() => setShowUpload(false)} className="text-white/40 hover:text-white transition cursor-pointer text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Zone drop ou sélection */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); setPendingFiles(files) }}
                className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 text-center cursor-pointer transition"
              >
                {pendingFiles.length > 0 ? (
                  <div>
                    <p style={{ fontWeight: 300, fontSize: '0.95rem' }} className="text-white/80 mb-1">
                      {pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} sélectionnée{pendingFiles.length > 1 ? 's' : ''}
                    </p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-white/30">Cliquer pour changer</p>
                  </div>
                ) : (
                  <div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10 text-white/20 mx-auto mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-white/50 mb-1">Cliquer ou glisser des photos</p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-white/25">JPG, PNG, HEIC</p>
                  </div>
                )}
                <input ref={fileRef} type="file" name="photo" accept="image/*" multiple className="hidden"
                  onChange={e => setPendingFiles(Array.from(e.target.files ?? []))} />
              </div>

              {/* Nom */}
              <input
                type="text"
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                placeholder="Votre prénom (optionnel)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 outline-none focus:border-white/30 transition placeholder:text-white/25 text-sm"
                style={{ fontWeight: 300 }}
              />

              <button type="submit" disabled={uploading || (pendingFiles.length === 0 && !fileRef.current?.files?.length)}
                className="w-full bg-white text-[#2d3228] py-3 rounded-xl text-sm hover:bg-white/90 transition disabled:opacity-40 cursor-pointer font-medium">
                {uploading ? 'Envoi en cours…' : `Ajouter ${pendingFiles.length > 0 ? `${pendingFiles.length} photo${pendingFiles.length > 1 ? 's' : ''}` : 'les photos'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Image */}
          <img
            src={currentPhoto.url}
            alt=""
            className="max-h-screen max-w-screen object-contain select-none"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}
          />

          {/* Navigation */}
          {photos.length > 1 && (<>
            <button onClick={e => { e.stopPropagation(); prevPhoto() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={e => { e.stopPropagation(); nextPhoto() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>)}

          {/* Infos + fermer */}
          <div className="absolute top-4 right-4 flex items-center gap-3" onClick={e => e.stopPropagation()}>
            {/* Supprimer */}
            <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); await deletePhoto(fd); closeLightbox() }}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="photo_id" value={currentPhoto.id} />
              <button type="submit" onClick={e => { if (!confirm('Supprimer cette photo ?')) e.preventDefault() }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/40 transition flex items-center justify-center cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-white/60">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </form>
            {/* Fermer */}
            <button onClick={closeLightbox}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Compteur + auteur */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40">
              {lightbox + 1} / {photos.length}
            </span>
            {currentPhoto.uploader_name && (
              <>
                <span className="text-white/20">·</span>
                <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40">
                  {currentPhoto.uploader_name}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
