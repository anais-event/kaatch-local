'use client'

import { useState, useTransition } from 'react'

type Comment = { id: string; author_name: string; content: string; created_at: string }

type Photo = {
  id: string
  url: string
  uploader_name: string | null
  moment_tag: string | null
  tagged_guests: string[]
  created_at: string
  likes: number
  comments: Comment[]
}

type Props = {
  photos: Photo[]
  moments: string[]
  guestNames: string[]
  addLike: (formData: FormData) => Promise<void>
  addComment: (formData: FormData) => Promise<void>
}

export default function PhotoFeed({ photos, moments, guestNames, addLike, addComment }: Props) {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [momentFilter, setMomentFilter] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [downloading, setDownloading] = useState(false)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Mode de recherche : moment ou personne visible sur la photo
  const isMomentSearch = moments.some(m => m.toLowerCase() === search.toLowerCase().trim())

  // Suggestions autocomplete — moments d'abord, puis noms d'invités
  const searchSuggestions = search.length > 0 ? [
    ...moments.filter(m => m.toLowerCase().includes(search.toLowerCase())),
    ...guestNames.filter(n => n.toLowerCase().includes(search.toLowerCase()) && !moments.some(m => m.toLowerCase() === n.toLowerCase()))
  ].slice(0, 6) : []

  // Filtrage — la recherche par nom ne cherche QUE dans tagged_guests (pas uploader_name)
  const filtered = photos.filter(p => {
    const q = search.toLowerCase().trim()
    const matchSearch = q === '' ||
      p.moment_tag?.toLowerCase().includes(q) ||
      p.tagged_guests.some(g => g.toLowerCase().includes(q))
    const matchMoment = momentFilter === 'all' || p.moment_tag === momentFilter
    return matchSearch && matchMoment
  })

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function downloadOne(url: string, id: string) {
    const res = await fetch(url)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `photo_${id}.jpg`
    a.click()
    URL.revokeObjectURL(objectUrl)
  }

  async function downloadZip() {
    const toDownload = selected.length > 0 ? photos.filter(p => selected.includes(p.id)) : filtered
    setDownloading(true)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    await Promise.all(toDownload.map(async (p, i) => {
      const res = await fetch(p.url)
      const blob = await res.blob()
      zip.file(`photo_${i + 1}.jpg`, blob)
    }))
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'photos.zip'
    a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
    setSelected([])
  }

  return (
    <div>
      {/* Barre de recherche avec autocomplete */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder="Rechercher par prénom, moment, personne…"
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 pr-10"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }}
          autoComplete="off"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 text-xl">×</button>
        )}
        {searchOpen && searchSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-stone-200 shadow-md z-20 overflow-hidden">
            {searchSuggestions.map(s => (
              <button key={s} type="button" onMouseDown={() => { setSearch(s); setSearchOpen(false) }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0e8] transition text-stone-700 text-sm"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtres moment */}
      {moments.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setMomentFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${momentFilter === 'all' ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Tout
          </button>
          {moments.map(m => (
            <button key={m} onClick={() => setMomentFilter(m)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${momentFilter === m ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Barre sélection + téléchargement */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-stone-400" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            {selected.length > 0 ? `${selected.length} sélectionnée(s)` : `${filtered.length} photo(s)`}
          </p>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <button onClick={() => setSelected([])}
                className="text-xs text-stone-400 hover:text-stone-600 transition px-3 py-1.5"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                Désélectionner
              </button>
            )}
            <button onClick={downloadZip} disabled={downloading}
              className="px-4 py-1.5 rounded-full text-xs bg-[#4a5240] text-white hover:bg-[#2d3228] transition disabled:opacity-50"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {downloading ? 'Préparation…' : selected.length > 0 ? `↓ ZIP (${selected.length})` : '↓ Tout télécharger'}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stone-400 italic"
           style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
          {search ? 'Aucune photo trouvée…' : 'Aucune photo pour le moment…'}
        </p>
      )}

      {/* Grille photos */}
      <div className="columns-2 gap-3 space-y-3">
        {filtered.map(photo => (
          <div key={photo.id}
            className={`break-inside-avoid bg-white/80 rounded-2xl overflow-hidden shadow-sm ring-2 transition ${selected.includes(photo.id) ? 'ring-[#4a5240]' : 'ring-transparent'}`}>
            <div className="relative">
              <img src={photo.url} alt="" className="w-full object-cover" />
              {/* Bouton sélection */}
              <button type="button" onClick={() => toggleSelect(photo.id)}
                className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow transition ${selected.includes(photo.id) ? 'bg-[#4a5240] border-[#4a5240] text-white' : 'bg-white/80 border-white text-white hover:border-[#4a5240]'}`}>
                ✓
              </button>
            </div>
            <div className="p-3">
              <p className="text-[10px] text-stone-300 mb-1" style={{ fontWeight: 300 }}>
                {new Date(photo.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {photo.uploader_name && (
                <p className="text-xs text-stone-400 mb-1 truncate"
                   style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  {photo.uploader_name}
                  {photo.moment_tag && <span className="ml-2 text-[#4a5240]">· {photo.moment_tag}</span>}
                </p>
              )}
              {photo.tagged_guests.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {photo.tagged_guests.map(g => (
                    <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-[#f5f0e8] text-[#4a5240]"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <form action={async (fd) => { startTransition(() => addLike(fd)) }}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button type="submit" className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-stone-400 hover:text-red-400 hover:bg-red-50 transition">
                    ❤️ {photo.likes}
                  </button>
                </form>
                <button onClick={() => setOpenComments(openComments === photo.id ? null : photo.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-stone-400 hover:text-[#4a5240] hover:bg-stone-50 transition">
                  💬 {photo.comments.length}
                </button>
                <button type="button" onClick={() => downloadOne(photo.url, photo.id)}
                  className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#f5f0e8] text-[#4a5240] hover:bg-[#4a5240] hover:text-white transition font-medium">
                  ↓ Télécharger
                </button>
              </div>

              {openComments === photo.id && (
                <div className="mt-3 space-y-2">
                  {photo.comments.map(c => (
                    <div key={c.id} className="bg-stone-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-[#4a5240]">{c.author_name}</p>
                      <p className="text-sm text-stone-600" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>{c.content}</p>
                    </div>
                  ))}
                  <form action={async (fd) => { startTransition(() => addComment(fd)); setOpenComments(null) }}
                    className="flex gap-2 mt-2">
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <input type="text" name="author_name" placeholder="Prénom" required
                      className="w-24 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                    <input type="text" name="content" placeholder="Commentaire" required
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                    <button type="submit"
                      className="bg-[#4a5240] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#2d3228] transition">→</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
