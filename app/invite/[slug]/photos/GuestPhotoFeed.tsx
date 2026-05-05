'use client'

import { useState, useRef, useCallback, useEffect, useTransition, RefObject } from 'react'

type Comment = { id: string; author_name: string; content: string; created_at: string }
type Photo = {
  id: string; url: string; uploaded_by_name: string | null; moment_tag: string | null
  tagged_guests: string[]; created_at: string; likes: number; liked_by: string[]; comments: Comment[]
}

function cleanName(name: string | null | undefined): string {
  if (!name) return ''
  return name.split(' ').filter(p => p && p !== 'null').join(' ')
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function formatDateLong(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function downloadPhotoBlob(url: string, filename = 'photo.jpg') {
  try {
    const blob = await fetch(url).then(r => r.blob())
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = filename; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  } catch { window.open(url, '_blank') }
}

async function downloadZip(photos: Photo[]) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  await Promise.all(photos.map(async (p, i) => {
    try {
      const blob = await fetch(p.url).then(r => r.blob())
      zip.file(`photo-${i + 1}.jpg`, blob)
    } catch {}
  }))
  const a = document.createElement('a')
  a.href = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }))
  a.download = 'photos-mariage.zip'; a.click()
}

export default function GuestPhotoFeed({ photos, moments, guestName, guestNames, addLike, addComment, uploadPhoto, deletePhoto, claimPhoto, slug }: {
  photos: Photo[]; moments: string[]; guestNames: string[]; guestName: string; slug: string
  addLike: (fd: FormData) => Promise<void>
  addComment: (fd: FormData) => Promise<void>
  uploadPhoto: (fd: FormData) => Promise<void>
  deletePhoto: (fd: FormData) => Promise<void>
  claimPhoto: (fd: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [zipping, setZipping] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [lbComments, setLbComments] = useState<Comment[]>([])
  const [lbLikes, setLbLikes] = useState(0)
  const [lbLikedBy, setLbLikedBy] = useState<string[]>([])
  const [lbCommentText, setLbCommentText] = useState('')
  const [lbCommenting, setLbCommenting] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploaderName, setUploaderName] = useState(cleanName(guestName) || '')
  const [uploaderSuggestions, setUploaderSuggestions] = useState<string[]>([])
  const [tagged, setTagged] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [selectedMoment, setSelectedMoment] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [, startTransition] = useTransition()

  const fileRef = useRef<HTMLInputElement>(null)
  const tagRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const myName = uploaderName || cleanName(guestName) || 'Anonyme'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const filtered = photos.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return cleanName(p.uploaded_by_name).toLowerCase().includes(q) ||
      p.tagged_guests.some(g => cleanName(g).toLowerCase().includes(q)) ||
      (p.moment_tag?.toLowerCase().includes(q) ?? false)
  })

  const currentPhoto = lightbox ? photos.find(p => p.id === lightbox) ?? null : null
  const currentIdx = lightbox ? photos.findIndex(p => p.id === lightbox) : -1

  const openLightbox = useCallback((id: string) => {
    const p = photos.find(x => x.id === id)
    if (!p) return
    setLightbox(id); setLbLikes(p.likes); setLbLikedBy(p.liked_by); setLbComments(p.comments)
  }, [photos])

  const closeLightbox = () => { setLightbox(null); setLbComments([]); setEditingName(false) }
  const prevPhoto = () => openLightbox(photos[(currentIdx - 1 + photos.length) % photos.length].id)
  const nextPhoto = () => openLightbox(photos[(currentIdx + 1) % photos.length].id)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightbox, currentIdx])

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleDownload() {
    setZipping(true)
    const sel = selectedIds.size > 0 ? filtered.filter(p => selectedIds.has(p.id)) : filtered
    if (sel.length === 1) await downloadPhotoBlob(sel[0].url)
    else await downloadZip(sel)
    setZipping(false); setSelectedIds(new Set()); if (selectMode) setSelectMode(false)
  }

  const handleLike = () => {
    if (!lightbox) return
    if (lbLikedBy.includes(myName)) return
    setLbLikes(l => l + 1); setLbLikedBy(prev => [...prev, myName])
    const fd = new FormData()
    fd.append('photo_id', lightbox); fd.append('slug', slug); fd.append('liker_name', myName)
    startTransition(() => addLike(fd))
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lightbox || !lbCommentText.trim()) return
    setLbCommenting(true)
    const fd = new FormData()
    fd.append('photo_id', lightbox); fd.append('slug', slug)
    fd.append('author_name', myName); fd.append('content', lbCommentText)
    setLbComments(prev => [...prev, { id: Date.now().toString(), author_name: myName, content: lbCommentText, created_at: new Date().toISOString() }])
    setLbCommentText('')
    startTransition(() => addComment(fd))
    setLbCommenting(false)
  }

  const handleTagInput = (val: string) => {
    setTagInput(val)
    setTagSuggestions(val.trim() ? guestNames.filter(n => n.toLowerCase().includes(val.toLowerCase()) && !tagged.includes(n)).slice(0, 6) : [])
  }
  const addTag = (name: string) => {
    if (name.trim() && !tagged.includes(name)) setTagged(p => [...p, name.trim()])
    setTagInput(''); setTagSuggestions([]); tagRef.current?.focus()
  }

  const handleUploaderInput = (val: string) => {
    setUploaderName(val)
    setUploaderSuggestions(val.trim() ? guestNames.filter(n => n.toLowerCase().includes(val.toLowerCase())).slice(0, 5) : [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setUploading(true)
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('uploader_name', uploaderName || cleanName(guestName) || 'Anonyme')
    fd.set('moment_tag', selectedMoment)
    fd.set('tagged_guests_raw', tagged.join(', '))
    const files = pendingFiles.length > 0 ? pendingFiles : Array.from(fileRef.current?.files ?? [])
    files.forEach(f => fd.append('photo', f))
    await uploadPhoto(fd)
    setUploading(false); setShowUpload(false); setPendingFiles([])
    setTagged([]); setSelectedMoment('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Gallery */}
      <div className="p-3 max-w-2xl mx-auto">
        {filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300 }}
            className="text-center text-stone-300 py-20">
            {search ? 'Aucun résultat…' : "Aucune photo pour l'instant…"}
          </p>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {filtered.map(photo => {
              const isSelected = selectedIds.has(photo.id)
              return (
                <div key={photo.id}
                  onClick={() => selectMode ? toggleSelect(photo.id) : openLightbox(photo.id)}
                  className={`break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group shadow-sm transition ${isSelected ? 'ring-2 ring-[#4a5240]' : ''}`}>
                  <div className="relative">
                    <img src={photo.url} alt="" className="w-full object-cover transition duration-300 group-hover:brightness-90" />
                    {/* Checkbox — cliquer active le mode sélection */}
                    <div
                      onClick={e => { e.stopPropagation(); if (!selectMode) setSelectMode(true); toggleSelect(photo.id) }}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition shadow cursor-pointer z-10 ${isSelected ? 'bg-[#4a5240] border-[#4a5240]' : 'bg-white/80 border-stone-300 opacity-0 group-hover:opacity-100'}`}>
                      {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {/* Download on hover */}
                    {!selectMode && (
                      <button onClick={e => { e.stopPropagation(); downloadPhotoBlob(photo.url) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white shadow"
                        title="Télécharger">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-stone-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="bg-white px-3 py-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-stone-500 truncate flex-1" style={{ fontWeight: 300 }}>
                        {cleanName(photo.uploaded_by_name) || 'Anonyme'}
                        {photo.moment_tag && <span className="text-[#4a5240] ml-1">· {photo.moment_tag}</span>}
                      </p>
                      <span className="text-[10px] text-stone-300" style={{ fontWeight: 300 }}>{formatDateShort(photo.created_at)}</span>
                    </div>
                    {photo.tagged_guests.filter(g => cleanName(g)).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tagged_guests.filter(g => cleanName(g)).map(g => (
                          <span key={g} className="text-[10px] bg-[#f5f0e8] text-[#4a5240] px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>{cleanName(g)}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>❤️ {photo.likes}</span>
                      <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>💬 {photo.comments.length}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Barre de sélection flottante */}
      {selectMode && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white border border-stone-200 rounded-2xl shadow-xl px-4 py-2.5">
          <span className="text-stone-500 text-sm" style={{ fontWeight: 300 }}>
            {selectedIds.size > 0 ? `${selectedIds.size} sélectionnée${selectedIds.size > 1 ? 's' : ''}` : 'Toucher pour sélectionner'}
          </span>
          {selectedIds.size > 0 && (
            <button onClick={handleDownload} disabled={zipping}
              className="bg-[#4a5240] text-white px-3 py-1 rounded-xl text-xs hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer"
              style={{ fontWeight: 300 }}>
              {zipping ? '…' : '↓ Télécharger'}
            </button>
          )}
          <button onClick={() => { setSelectMode(false); setSelectedIds(new Set()) }}
            className="text-stone-400 hover:text-stone-700 text-sm cursor-pointer" style={{ fontWeight: 300 }}>
            Annuler
          </button>
        </div>
      )}

      {/* FABs */}
      <div className="fixed bottom-24 right-5 z-20 flex flex-col items-end gap-3" ref={dropdownRef}>
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="mb-1 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden w-64">
            {/* Recherche */}
            <div className="px-4 pt-3 pb-2">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Rechercher…"
                className="w-full bg-[#f5f0e8] border-0 rounded-xl px-3 py-2 text-stone-700 text-sm outline-none focus:ring-1 focus:ring-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
            </div>
            <div className="border-t border-stone-100">
              {/* Sélectionner */}
              <button onClick={() => { setSelectMode(s => !s); setSelectedIds(new Set()); setDropdownOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 transition cursor-pointer text-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm" style={{ fontWeight: 300 }}>{selectMode ? 'Quitter la sélection' : 'Sélectionner'}</span>
              </button>
              {/* Télécharger */}
              <button onClick={() => { handleDownload(); setDropdownOpen(false) }} disabled={zipping || filtered.length === 0}
                className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 transition cursor-pointer text-left disabled:opacity-40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm" style={{ fontWeight: 300 }}>{zipping ? 'En cours…' : `Tout télécharger (${filtered.length})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Bouton menu ☰ */}
        <button onClick={() => setDropdownOpen(o => !o)}
          className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-600 shadow-xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          title="Options">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Bouton + upload */}
        <button onClick={() => setShowUpload(true)}
          className="w-14 h-14 rounded-full bg-[#4a5240] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          title="Ajouter des photos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pt-16 pb-28 sm:p-4 overflow-hidden"
          onClick={e => { if (e.target === e.currentTarget) setShowUpload(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-3 max-h-[85dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.4rem' }} className="text-[#2d3228]">Ajouter des photos</h2>
              <button onClick={() => setShowUpload(false)} className="text-stone-400 hover:text-stone-700 transition cursor-pointer text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Drop zone */}
              <div onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setPendingFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))) }}
                className="border-2 border-dashed border-stone-200 hover:border-[#4a5240] rounded-2xl p-8 text-center cursor-pointer transition">
                {pendingFiles.length > 0 ? (
                  <div>
                    <p className="text-stone-700 mb-1" style={{ fontWeight: 300 }}>{pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} sélectionnée{pendingFiles.length > 1 ? 's' : ''}</p>
                    <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>Cliquer pour changer</p>
                  </div>
                ) : (
                  <div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-10 h-10 text-stone-300 mx-auto mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-stone-500 text-sm mb-1" style={{ fontWeight: 300 }}>Cliquer ou glisser des photos</p>
                    <p className="text-stone-300 text-xs" style={{ fontWeight: 300 }}>JPG, PNG, HEIC</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => setPendingFiles(Array.from(e.target.files ?? []))} />
              </div>

              {/* Qui publie */}
              <div className="relative">
                <input type="text" value={uploaderName} onChange={e => handleUploaderInput(e.target.value)}
                  placeholder="Qui publie ? (votre prénom)"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-700 outline-none focus:border-[#4a5240] transition text-sm"
                  style={{ fontWeight: 300 }} />
                {uploaderSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-stone-100 rounded-xl overflow-hidden z-10 w-full shadow-lg">
                    {uploaderSuggestions.map(s => (
                      <button key={s} type="button" onMouseDown={e => { e.preventDefault(); setUploaderName(s); setUploaderSuggestions([]) }}
                        className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 transition text-sm cursor-pointer" style={{ fontWeight: 300 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Moment */}
              {moments.length > 0 && (
                <select value={selectedMoment} onChange={e => setSelectedMoment(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-500 outline-none focus:border-[#4a5240] transition text-sm bg-white"
                  style={{ fontWeight: 300 }}>
                  <option value="">Quel moment ? (optionnel)</option>
                  {moments.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}

              {/* Tag guests */}
              <div className="border border-stone-200 rounded-xl px-4 py-2.5 space-y-2">
                <p className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>Qui voit-on sur la photo ?</p>
                {tagged.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagged.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f5f0e8] text-[#4a5240]" style={{ fontSize: '0.78rem', fontWeight: 300 }}>
                        {t}
                        <button type="button" onClick={() => setTagged(p => p.filter(x => x !== t))} className="text-stone-400 hover:text-stone-700 cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input ref={tagRef} type="text" value={tagInput} onChange={e => handleTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addTag(tagInput.trim()) } if (e.key === 'Escape') { setTagSuggestions([]); setTagInput('') } }}
                    placeholder="Taper un nom…"
                    className="w-full text-stone-700 outline-none text-sm" style={{ fontWeight: 300 }} />
                  {tagSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-stone-100 rounded-xl overflow-hidden z-10 w-full shadow-lg">
                      {tagSuggestions.map(s => (
                        <button key={s} type="button" onMouseDown={e => { e.preventDefault(); addTag(s) }}
                          className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 transition text-sm cursor-pointer" style={{ fontWeight: 300 }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={uploading || (pendingFiles.length === 0 && !fileRef.current?.files?.length)}
                className="w-full bg-[#4a5240] text-white py-3 rounded-xl text-sm hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer"
                style={{ fontWeight: 300 }}>
                {uploading ? 'Envoi en cours…' : `Partager ${pendingFiles.length > 0 ? `${pendingFiles.length} photo${pendingFiles.length > 1 ? 's' : ''}` : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black" onClick={closeLightbox}>

          {/* Photo — plein écran */}
          <div className="absolute inset-0 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={currentPhoto.url} alt="" className="object-contain select-none w-full h-full" style={{ maxHeight: '100dvh' }} />
          </div>

          {/* Flèches navigation */}
          {photos.length > 1 && (<>
            <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer z-10">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={nextPhoto} className="absolute right-3 md:right-72 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center cursor-pointer z-10">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </>)}

          {/* Compteur + fermer (mobile) */}
          <div className="md:hidden absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10" onClick={e => e.stopPropagation()}>
            <span className="text-white/50 text-xs" style={{ fontWeight: 300 }}>{currentIdx + 1} / {photos.length}</span>
            <button onClick={closeLightbox} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* ── MOBILE : panneau bas style Instagram ── */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-10" onClick={e => e.stopPropagation()}
               style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)' }}>
            <div className="px-4 pt-8 pb-6 space-y-3">

              {/* Auteur + moment */}
              <div className="flex items-center justify-between">
                <div>
                  {(!currentPhoto.uploaded_by_name || currentPhoto.uploaded_by_name === 'Anonyme' || currentPhoto.uploaded_by_name === myName) && editingName ? (
                    <form onSubmit={async e => {
                      e.preventDefault()
                      if (!editNameValue.trim()) return
                      setSavingName(true)
                      const fd = new FormData()
                      fd.append('photo_id', currentPhoto.id)
                      fd.append('slug', slug)
                      fd.append('new_name', editNameValue.trim())
                      await claimPhoto(fd)
                      setSavingName(false)
                      setEditingName(false)
                    }} className="flex gap-2 items-center">
                      <input type="text" value={editNameValue} onChange={e => setEditNameValue(e.target.value)} autoFocus
                        placeholder="Votre prénom"
                        className="border border-white/30 rounded-lg px-2.5 py-1 bg-white/10 text-white text-sm outline-none placeholder:text-white/40"
                        style={{ fontWeight: 300 }} />
                      <button type="submit" disabled={savingName || !editNameValue.trim()}
                        className="bg-[#4a5240] text-white px-2.5 py-1 rounded-lg text-xs cursor-pointer disabled:opacity-40"
                        style={{ fontWeight: 300 }}>{savingName ? '…' : '✓'}</button>
                      <button type="button" onClick={() => setEditingName(false)} className="text-white/60 cursor-pointer">×</button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm" style={{ fontWeight: 400 }}>
                        {cleanName(currentPhoto.uploaded_by_name) || 'Anonyme'}
                      </span>
                      {(!currentPhoto.uploaded_by_name || currentPhoto.uploaded_by_name === 'Anonyme' || currentPhoto.uploaded_by_name === myName) && (
                        <button onClick={() => { setEditingName(true); setEditNameValue(myName !== 'Anonyme' ? myName : '') }}
                          className="text-[10px] text-white/50 hover:text-white/80 transition cursor-pointer underline underline-offset-2"
                          style={{ fontWeight: 300 }}>
                          {!currentPhoto.uploaded_by_name || currentPhoto.uploaded_by_name === 'Anonyme' ? "C'est moi" : 'Modifier'}
                        </button>
                      )}
                    </div>
                  )}
                  {currentPhoto.moment_tag && (
                    <span className="text-white/50 text-xs block mt-0.5" style={{ fontWeight: 300 }}>{currentPhoto.moment_tag}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button onClick={handleLike}
                  className={`flex items-center gap-1.5 cursor-pointer ${lbLikedBy.includes(myName) ? 'text-red-400' : 'text-white/70'}`}>
                  <span className="text-xl">❤️</span>
                  <span className="text-sm text-white" style={{ fontWeight: 300 }}>{lbLikes}</span>
                </button>
                <button onClick={() => downloadPhotoBlob(currentPhoto.url)}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white transition cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </button>
                {myName && currentPhoto.uploaded_by_name === myName && (
                  <form onSubmit={e => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    closeLightbox()
                    startTransition(() => deletePhoto(fd))
                  }}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="photo_id" value={currentPhoto.id} />
                    <input type="hidden" name="uploader_name" value={myName} />
                    <button type="submit" className="text-red-400/80 hover:text-red-400 transition cursor-pointer">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </form>
                )}
              </div>

              {/* Commentaires */}
              {lbComments.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {lbComments.slice(-3).map(c => (
                    <p key={c.id} className="text-white/80 text-sm leading-snug" style={{ fontWeight: 300 }}>
                      <span className="text-white font-medium">{c.author_name}</span> {c.content}
                    </p>
                  ))}
                </div>
              )}
              <form onSubmit={handleComment} className="flex gap-2">
                <input type="text" value={lbCommentText} onChange={e => setLbCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire…"
                  className="flex-1 bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40 transition placeholder:text-white/40"
                  style={{ fontWeight: 300 }} />
                <button type="submit" disabled={lbCommenting || !lbCommentText.trim()}
                  className="bg-[#4a5240] text-white px-3 py-2 rounded-xl text-sm hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer">→</button>
              </form>
            </div>
          </div>

          {/* ── DESKTOP : panneau latéral ── */}
          <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-72 bg-white flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <span className="text-stone-400 text-xs" style={{ fontWeight: 300 }}>{formatDateLong(currentPhoto.created_at)}</span>
              <button onClick={closeLightbox} className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-stone-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-stone-400 text-xs mb-0.5" style={{ fontWeight: 300 }}>Publié par</p>
                {editingName ? (
                  <form onSubmit={async e => {
                    e.preventDefault()
                    if (!editNameValue.trim()) return
                    setSavingName(true)
                    const fd = new FormData()
                    fd.append('photo_id', currentPhoto.id)
                    fd.append('slug', slug)
                    fd.append('new_name', editNameValue.trim())
                    await claimPhoto(fd)
                    setSavingName(false)
                    setEditingName(false)
                  }} className="flex gap-2 items-center mt-1">
                    <input type="text" value={editNameValue} onChange={e => setEditNameValue(e.target.value)} autoFocus
                      placeholder="Votre prénom"
                      className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 text-sm outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }} />
                    <button type="submit" disabled={savingName || !editNameValue.trim()}
                      className="bg-[#4a5240] text-white px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer"
                      style={{ fontWeight: 300 }}>{savingName ? '…' : '✓'}</button>
                    <button type="button" onClick={() => setEditingName(false)} className="text-stone-400 hover:text-stone-700 text-sm cursor-pointer px-1">×</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-stone-700 text-sm" style={{ fontWeight: 400 }}>{cleanName(currentPhoto.uploaded_by_name) || 'Anonyme'}</p>
                    {(!currentPhoto.uploaded_by_name || currentPhoto.uploaded_by_name === 'Anonyme' || currentPhoto.uploaded_by_name === myName) && (
                      <button onClick={() => { setEditingName(true); setEditNameValue(myName !== 'Anonyme' ? myName : '') }}
                        className="text-[10px] text-stone-400 hover:text-[#4a5240] transition cursor-pointer underline underline-offset-2"
                        style={{ fontWeight: 300 }}>
                        {!currentPhoto.uploaded_by_name || currentPhoto.uploaded_by_name === 'Anonyme' ? "C'est moi" : 'Modifier'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {currentPhoto.moment_tag && (
                <div>
                  <p className="text-stone-400 text-xs mb-0.5" style={{ fontWeight: 300 }}>Moment</p>
                  <p className="text-[#4a5240] text-sm" style={{ fontWeight: 300 }}>{currentPhoto.moment_tag}</p>
                </div>
              )}
              {currentPhoto.tagged_guests.filter(g => cleanName(g)).length > 0 && (
                <div>
                  <p className="text-stone-400 text-xs mb-1.5" style={{ fontWeight: 300 }}>Sur la photo</p>
                  <div className="flex flex-wrap gap-1">
                    {currentPhoto.tagged_guests.filter(g => cleanName(g)).map(g => (
                      <span key={g} className="text-xs bg-[#f5f0e8] text-[#4a5240] px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>{cleanName(g)}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition cursor-pointer ${lbLikedBy.includes(myName) ? 'text-red-400' : 'text-stone-400'}`}>
                  <span>❤️</span><span className="text-sm" style={{ fontWeight: 300 }}>{lbLikes}</span>
                </button>
                <button onClick={() => downloadPhotoBlob(currentPhoto.url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition text-stone-500 cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  <span className="text-xs" style={{ fontWeight: 300 }}>Télécharger</span>
                </button>
                {myName && currentPhoto.uploaded_by_name === myName && (
                  <form onSubmit={e => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    closeLightbox()
                    startTransition(() => deletePhoto(fd))
                  }}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="photo_id" value={currentPhoto.id} />
                    <input type="hidden" name="uploader_name" value={myName} />
                    <button type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 transition text-red-400 cursor-pointer text-xs"
                      style={{ fontWeight: 300 }}>🗑 Supprimer</button>
                  </form>
                )}
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-2" style={{ fontWeight: 300 }}>Commentaires {lbComments.length > 0 && `(${lbComments.length})`}</p>
                <div className="space-y-2 mb-3">
                  {lbComments.map(c => (
                    <div key={c.id} className="bg-stone-50 rounded-xl px-3 py-2">
                      <p className="text-[#4a5240] text-xs font-medium">{c.author_name}</p>
                      <p className="text-stone-600 text-sm" style={{ fontWeight: 300 }}>{c.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleComment} className="flex gap-2">
                  <input type="text" value={lbCommentText} onChange={e => setLbCommentText(e.target.value)}
                    placeholder="Un commentaire…"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition" style={{ fontWeight: 300 }} />
                  <button type="submit" disabled={lbCommenting || !lbCommentText.trim()}
                    className="bg-[#4a5240] text-white px-3 py-1.5 rounded-xl text-sm hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer">→</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
