'use client'

import { useState, useTransition } from 'react'
import JSZip from 'jszip'

type Comment = { id: string; author_name: string; content: string; created_at: string }
type Photo = {
  id: string; url: string; uploader_name: string | null; moment_tag: string | null
  tagged_guests: string[]; created_at: string; likes: number; liked_by: string[]; comments: Comment[]
}

export default function GuestPhotoFeed({ photos, moments, guestName, guestNames, addLike, addComment, slug }: {
  photos: Photo[]
  moments: string[]
  guestNames: string[]
  guestName: string
  slug: string
  addLike: (fd: FormData) => Promise<void>
  addComment: (fd: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [momentFilter, setMomentFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [, startTransition] = useTransition()

  const suggestions = search.length >= 1
    ? [...moments, ...guestNames].filter(s => s.toLowerCase().includes(search.toLowerCase()) && s !== search)
    : []

  const filtered = photos.filter(p => {
    if (momentFilter && p.moment_tag !== momentFilter) return false
    if (search) {
      const s = search.toLowerCase()
      const matchMoment = p.moment_tag?.toLowerCase().includes(s)
      const matchGuest = p.tagged_guests.some(g => g.toLowerCase().includes(s))
      if (!matchMoment && !matchGuest) return false
    }
    return true
  })

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const downloadZip = async () => {
    setDownloading(true)
    const zip = new JSZip()
    const toDownload = filtered.filter(p => selected.size === 0 || selected.has(p.id))
    await Promise.all(toDownload.map(async (p, i) => {
      try {
        const res = await fetch(p.url)
        const blob = await res.blob()
        const ext = p.url.split('.').pop()?.split('?')[0] ?? 'jpg'
        zip.file(`photo-${i + 1}.${ext}`, blob)
      } catch {}
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url; a.download = 'photos-mariage.zip'; a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
    setSelected(new Set())
  }

  const downloadSingle = async (photo: Photo) => {
    const res = await fetch(photo.url)
    const blob = await res.blob()
    const ext = photo.url.split('.').pop()?.split('?')[0] ?? 'jpg'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `photo.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Barre de recherche */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par moment, nom…"
          className="w-full border border-stone-200 rounded-full px-5 py-2.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 text-sm"
          style={{ fontWeight: 300 }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-stone-100 rounded-2xl shadow-lg z-20 overflow-hidden">
            {suggestions.slice(0, 6).map(s => (
              <li key={s}>
                <button onClick={() => { setSearch(s); setMomentFilter(moments.includes(s) ? s : '') }}
                  className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-sm text-stone-700 transition"
                  style={{ fontWeight: 300 }}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filtres moments */}
      {moments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setMomentFilter('')}
            className={`px-3 py-1 rounded-full text-xs transition ${!momentFilter ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
            style={{ fontWeight: 300 }}>
            Tous
          </button>
          {moments.map(m => (
            <button key={m} onClick={() => setMomentFilter(momentFilter === m ? '' : m)}
              className={`px-3 py-1 rounded-full text-xs transition ${momentFilter === m ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
              style={{ fontWeight: 300 }}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Barre sélection */}
      {(selected.size > 0 || filtered.length > 0) && (
        <div className="flex items-center justify-between mb-4 bg-white/80 rounded-2xl px-4 py-2.5">
          <span className="text-xs text-stone-500" style={{ fontWeight: 300 }}>
            {selected.size > 0 ? `${selected.size} sélectionnée${selected.size > 1 ? 's' : ''}` : `${filtered.length} photo${filtered.length > 1 ? 's' : ''}`}
          </span>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())}
                className="text-xs text-stone-400 hover:text-stone-600 transition" style={{ fontWeight: 300 }}>
                Tout désélectionner
              </button>
            )}
            <button onClick={downloadZip} disabled={downloading}
              className="flex items-center gap-1.5 bg-[#4a5240] text-white px-3 py-1.5 rounded-full text-xs hover:bg-[#2d3228] transition disabled:opacity-50"
              style={{ fontWeight: 300 }}>
              {downloading ? '⏳' : '↓'} {selected.size > 0 ? `Télécharger (${selected.size})` : 'Tout télécharger'}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stone-400 italic" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem' }}>
          Aucune photo pour le moment…
        </p>
      )}

      <div className="columns-2 gap-3 space-y-3">
        {filtered.map(photo => {
          const isSelected = selected.has(photo.id)
          return (
            <div key={photo.id} className={`break-inside-avoid rounded-2xl overflow-hidden shadow-sm transition ${isSelected ? 'ring-2 ring-[#4a5240]' : 'bg-white/80'}`}>
              <div className="relative group">
                <img src={photo.url} alt="" className="w-full object-cover" />
                {/* Overlay sélection */}
                <button onClick={() => toggleSelect(photo.id)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition shadow ${
                    isSelected ? 'bg-[#4a5240] text-white' : 'bg-white/80 text-stone-400 hover:bg-white'
                  }`}>
                  {isSelected ? '✓' : '○'}
                </button>
              </div>
              <div className="p-3 bg-white/80">
                <p className="text-[10px] text-stone-300 mb-1" style={{ fontWeight: 300 }}>
                  {new Date(photo.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {photo.uploader_name && (
                  <p className="text-xs text-stone-400 mb-1" style={{ fontWeight: 300 }}>
                    {photo.uploader_name}
                    {photo.moment_tag && <span className="ml-1 text-[#4a5240]">· {photo.moment_tag}</span>}
                  </p>
                )}
                {photo.tagged_guests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photo.tagged_guests.map(g => (
                      <span key={g} className="text-[10px] bg-[#f5f0e8] text-[#4a5240] px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <form action={async (fd) => {
                    fd.append('slug', slug)
                    fd.append('liker_name', guestName)
                    startTransition(() => addLike(fd))
                  }}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button type="submit"
                      className={`flex items-center gap-1 text-xs transition ${photo.liked_by.includes(guestName) ? 'text-red-400' : 'text-stone-400 hover:text-red-400'}`}>
                      ❤️ {photo.likes}
                    </button>
                  </form>
                  <button onClick={() => setOpenComments(openComments === photo.id ? null : photo.id)}
                    className="flex items-center gap-1 text-xs text-stone-400 hover:text-[#4a5240] transition">
                    💬 {photo.comments.length}
                  </button>
                  <button onClick={() => downloadSingle(photo)}
                    className="ml-auto text-xs text-stone-400 hover:text-[#4a5240] transition">
                    ↓
                  </button>
                </div>
                {openComments === photo.id && (
                  <div className="mt-3 space-y-2">
                    {photo.comments.map(c => (
                      <div key={c.id} className="bg-stone-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-[#4a5240]">{c.author_name}</p>
                        <p className="text-sm text-stone-600" style={{ fontWeight: 300 }}>{c.content}</p>
                      </div>
                    ))}
                    <form action={async (fd) => {
                      fd.append('slug', slug)
                      startTransition(() => addComment(fd))
                      setOpenComments(null)
                    }} className="flex gap-2 mt-2">
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <input type="hidden" name="author_name" value={guestName} />
                      <input type="text" name="content" placeholder="Votre commentaire…" required
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                        style={{ fontWeight: 300 }} />
                      <button type="submit"
                        className="bg-[#4a5240] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#2d3228] transition">→</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
