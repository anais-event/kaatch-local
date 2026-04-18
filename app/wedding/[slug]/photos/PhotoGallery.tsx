'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type Photo = {
  id: string
  url: string
  uploaded_by_name: string | null
  tagged_guests: string[]
  created_at: string
  likes: number
  comments: number
}

type Comment = {
  id: string
  author_name: string
  content: string
  created_at: string
}

type Props = {
  slug: string
  weddingName: string
  photos: Photo[]
  guestNames: string[]
  uploadPhoto: (f: FormData) => Promise<void>
  deletePhoto: (f: FormData) => Promise<void>
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadZip(photos: Photo[]) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  await Promise.all(photos.map(async (p, i) => {
    const res = await fetch(p.url)
    const blob = await res.blob()
    zip.file(`photo-${i + 1}.jpg`, blob)
  }))
  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'photos-mariage.zip'
  a.click()
}

export default function PhotoGallery({ slug, weddingName, photos, guestNames, uploadPhoto, deletePhoto }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploaderName, setUploaderName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [tagged, setTagged] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [zipping, setZipping] = useState(false)
  // Lightbox state
  const [lbLikes, setLbLikes] = useState(0)
  const [lbComments, setLbComments] = useState<Comment[]>([])
  const [lbCommenting, setLbCommenting] = useState(false)
  const [lbCommentAuthor, setLbCommentAuthor] = useState('')
  const [lbCommentText, setLbCommentText] = useState('')
  const [likingId, setLikingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const tagRef = useRef<HTMLInputElement>(null)

  const filteredPhotos = photos.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.uploaded_by_name?.toLowerCase().includes(q) ||
      p.tagged_guests.some(g => g.toLowerCase().includes(q))
    )
  })

  const cols: Photo[][] = [[], [], []]
  filteredPhotos.forEach((p, i) => cols[i % 3].push(p))

  const currentPhoto = lightbox ? photos.find(p => p.id === lightbox) ?? null : null
  const currentIdx = lightbox ? photos.findIndex(p => p.id === lightbox) : -1

  const openLightbox = useCallback(async (id: string) => {
    const photo = photos.find(p => p.id === id)
    if (!photo) return
    setLightbox(id)
    setLbLikes(photo.likes)
    setLbComments([])
    const res = await fetch(`/api/photos/${id}/comments`)
    if (res.ok) setLbComments(await res.json())
  }, [photos])

  const closeLightbox = () => {
    setLightbox(null)
    setLbComments([])
    setLbCommenting(false)
  }

  const prevPhoto = () => {
    if (currentIdx > 0) openLightbox(photos[currentIdx - 1].id)
    else openLightbox(photos[photos.length - 1].id)
  }
  const nextPhoto = () => {
    if (currentIdx < photos.length - 1) openLightbox(photos[currentIdx + 1].id)
    else openLightbox(photos[0].id)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightbox) return
    if (e.key === 'ArrowLeft') prevPhoto()
    if (e.key === 'ArrowRight') nextPhoto()
    if (e.key === 'Escape') closeLightbox()
  }, [lightbox, currentIdx])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleLike = async (photoId: string) => {
    setLikingId(photoId)
    const res = await fetch(`/api/photos/${photoId}/like`, { method: 'POST' })
    if (res.ok) {
      const { likes } = await res.json()
      setLbLikes(likes)
    }
    setLikingId(null)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lightbox || !lbCommentText.trim()) return
    setLbCommenting(true)
    const res = await fetch(`/api/photos/${lightbox}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_name: lbCommentAuthor || 'Anonyme', content: lbCommentText }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setLbComments(prev => [...prev, newComment])
      setLbCommentText('')
    }
    setLbCommenting(false)
  }

  const handleTagInput = (val: string) => {
    setTagInput(val)
    if (val.trim().length > 0) {
      setTagSuggestions(
        guestNames.filter(n => n.toLowerCase().includes(val.toLowerCase()) && !tagged.includes(n)).slice(0, 6)
      )
    } else {
      setTagSuggestions([])
    }
  }

  const addTag = (name: string) => {
    if (!tagged.includes(name) && name.trim()) {
      setTagged(prev => [...prev, name.trim()])
    }
    setTagInput('')
    setTagSuggestions([])
    tagRef.current?.focus()
  }

  const removeTag = (name: string) => setTagged(prev => prev.filter(t => t !== name))

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
    fd.set('uploader_name', uploaderName || 'Anonyme')
    const files = pendingFiles.length > 0 ? pendingFiles : Array.from(fileRef.current?.files ?? [])
    files.forEach(f => fd.append('photo', f))
    tagged.forEach(t => fd.append('tagged', t))
    await uploadPhoto(fd)
    setUploading(false)
    setShowUpload(false)
    setPendingFiles([])
    setTagged([])
    setUploaderName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#1a1a18]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#1a1a18]/90 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
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
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 text-sm outline-none focus:border-white/30 placeholder:text-white/25 transition"
            style={{ fontWeight: 300 }}
          />
          <button
            onClick={async () => { setZipping(true); await downloadZip(filteredPhotos); setZipping(false) }}
            disabled={zipping || filteredPhotos.length === 0}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition disabled:opacity-40 cursor-pointer whitespace-nowrap"
            style={{ fontWeight: 300 }}
          >
            {zipping ? '…' : '↓ ZIP'}
          </button>
        </div>
      </div>

      {/* Gallery */}
      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.8rem', fontWeight: 300 }}
            className="text-white/30">
            {search ? 'Aucun résultat' : 'Aucune photo pour l\'instant'}
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
                {col.map(photo => (
                  <div key={photo.id}
                    onClick={() => openLightbox(photo.id)}
                    className="group relative cursor-pointer rounded-xl overflow-hidden bg-white/5"
                    style={{ aspectRatio: (ci % 2 === 0) ? '3/4' : '4/3' }}>
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300 flex flex-col justify-end p-2.5">
                      <div className="opacity-0 group-hover:opacity-100 transition duration-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-white/80">
                            {photo.uploaded_by_name ?? 'Anonyme'} · {formatDateShort(photo.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {photo.likes > 0 && (
                              <span style={{ fontSize: '0.65rem' }} className="text-white/70 flex items-center gap-0.5">
                                ❤️ {photo.likes}
                              </span>
                            )}
                            <a
                              href={photo.url}
                              download
                              onClick={e => e.stopPropagation()}
                              className="text-white/50 hover:text-white transition"
                              title="Télécharger"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        {photo.tagged_guests.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {photo.tagged_guests.map(g => (
                              <span key={g} className="px-1.5 py-0.5 rounded-full bg-white/15 text-white/70"
                                style={{ fontSize: '0.6rem', fontWeight: 300 }}>
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-[#2d3228] shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer z-20"
        title="Ajouter des photos"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowUpload(false) }}>
          <div className="bg-[#1e1e1c] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: '1.4rem', fontStyle: 'italic' }}
                className="text-white">Ajouter des photos</h2>
              <button onClick={() => setShowUpload(false)} className="text-white/40 hover:text-white transition cursor-pointer text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Drop zone */}
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

              {/* Uploader name */}
              <input
                type="text"
                value={uploaderName}
                onChange={e => setUploaderName(e.target.value)}
                placeholder="Qui publie ? (votre prénom)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 outline-none focus:border-white/30 transition placeholder:text-white/25 text-sm"
                style={{ fontWeight: 300 }}
              />

              {/* Tag guests */}
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 space-y-2">
                <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40">Qui voit-on sur la photo ?</p>
                {tagged.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagged.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white/80"
                        style={{ fontSize: '0.75rem', fontWeight: 300 }}>
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="text-white/40 hover:text-white transition leading-none cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    ref={tagRef}
                    type="text"
                    value={tagInput}
                    onChange={e => handleTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addTag(tagInput.trim()) }
                      if (e.key === 'Escape') { setTagSuggestions([]); setTagInput('') }
                    }}
                    placeholder="Taper un nom…"
                    className="w-full bg-transparent text-white/70 outline-none placeholder:text-white/25 text-sm"
                    style={{ fontWeight: 300 }}
                  />
                  {tagSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 bg-[#2a2a28] border border-white/10 rounded-xl overflow-hidden z-10 w-full shadow-xl">
                      {tagSuggestions.map(s => (
                        <button key={s} type="button"
                          onMouseDown={e => { e.preventDefault(); addTag(s) }}
                          className="w-full text-left px-3 py-2 text-white/70 hover:bg-white/10 transition text-sm cursor-pointer"
                          style={{ fontWeight: 300 }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={uploading || (pendingFiles.length === 0 && !fileRef.current?.files?.length)}
                className="w-full bg-white text-[#2d3228] py-3 rounded-xl text-sm hover:bg-white/90 transition disabled:opacity-40 cursor-pointer font-medium">
                {uploading ? 'Envoi en cours…' : `Ajouter ${pendingFiles.length > 0 ? `${pendingFiles.length} photo${pendingFiles.length > 1 ? 's' : ''}` : 'les photos'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex" onClick={closeLightbox}>
          {/* Left: image */}
          <div className="flex-1 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
            <img
              src={currentPhoto.url}
              alt=""
              className="max-h-screen object-contain select-none"
              style={{ maxHeight: '90vh', maxWidth: '100%' }}
            />
            {/* Nav arrows */}
            {photos.length > 1 && (<>
              <button onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>)}
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/30">
                {currentIdx + 1} / {photos.length}
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div
            className="w-72 bg-[#111110] flex flex-col overflow-hidden border-l border-white/5"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40">
                {formatDateLong(currentPhoto.created_at)}
              </span>
              <button onClick={closeLightbox}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Uploader */}
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40 mb-0.5">Publié par</p>
                <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-white/80">
                  {currentPhoto.uploaded_by_name ?? 'Anonyme'}
                </p>
              </div>

              {/* Tagged */}
              {currentPhoto.tagged_guests.length > 0 && (
                <div>
                  <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40 mb-1.5">Qui voit-on ?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPhoto.tagged_guests.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-white/70"
                        style={{ fontSize: '0.75rem', fontWeight: 300 }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Likes + download */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(currentPhoto.id)}
                  disabled={likingId === currentPhoto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
                >
                  <span className="text-sm">❤️</span>
                  <span style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-white/70">{lbLikes}</span>
                </button>
                <a
                  href={currentPhoto.url}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-white/60 hover:text-white/80"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span style={{ fontWeight: 300, fontSize: '0.8rem' }}>Télécharger</span>
                </a>
              </div>

              {/* Comments */}
              <div>
                <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-white/40 mb-2">
                  Commentaires {lbComments.length > 0 && `(${lbComments.length})`}
                </p>
                <div className="space-y-2 mb-3">
                  {lbComments.map(c => (
                    <div key={c.id} className="bg-white/5 rounded-xl px-3 py-2">
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-white/60 mb-0.5">{c.author_name}</p>
                      <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-white/80">{c.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleComment} className="space-y-2">
                  <input
                    type="text"
                    value={lbCommentAuthor}
                    onChange={e => setLbCommentAuthor(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-xs outline-none focus:border-white/30 placeholder:text-white/25 transition"
                    style={{ fontWeight: 300 }}
                  />
                  <textarea
                    value={lbCommentText}
                    onChange={e => setLbCommentText(e.target.value)}
                    placeholder="Écrire un commentaire…"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-xs outline-none focus:border-white/30 placeholder:text-white/25 transition resize-none"
                    style={{ fontWeight: 300 }}
                  />
                  <button type="submit" disabled={lbCommenting || !lbCommentText.trim()}
                    className="w-full bg-white/10 hover:bg-white/15 text-white/70 py-2 rounded-xl text-xs transition disabled:opacity-40 cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    {lbCommenting ? 'Envoi…' : 'Commenter'}
                  </button>
                </form>
              </div>

              {/* Delete */}
              <div className="pt-2 border-t border-white/5">
                <form onSubmit={async e => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  await deletePhoto(fd)
                  closeLightbox()
                }}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="photo_id" value={currentPhoto.id} />
                  <button type="submit"
                    onClick={e => { if (!confirm('Supprimer cette photo ?')) e.preventDefault() }}
                    className="w-full py-2 rounded-xl border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition text-xs cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    Supprimer la photo
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
