'use client'

import { useState, useTransition } from 'react'

export type Song = {
  id: string
  moment: string | null
  title: string
  artist: string | null
  notes: string | null
  song_url: string | null
  position: number
  suggested_by: string | null
}

export type PlaylistLink = {
  id: string
  name: string
  url: string
  position: number
}

const MOMENTS = [
  { key: 'ceremonie',   label: 'Cérémonie',   icon: '💒', color: '#e8f0e8' },
  { key: 'cocktail',    label: 'Cocktail',    icon: '🥂', color: '#fef9ec' },
  { key: 'diner',       label: 'Dîner',       icon: '🕯️', color: '#f0ede8' },
  { key: 'soiree',      label: 'Soirée',      icon: '🕺', color: '#ede8f5' },
]

const REPERE_SENTINEL = '__KTC_REPERE__'

function getMoment(key: string | null) {
  return MOMENTS.find(m => m.key === key) ?? null
}

function getPlatformIcon(url: string) {
  if (url.includes('spotify')) return { icon: '🎧', label: 'Spotify', color: '#1DB954' }
  if (url.includes('deezer'))  return { icon: '🎵', label: 'Deezer',  color: '#A238FF' }
  if (url.includes('youtube') || url.includes('youtu.be')) return { icon: '▶️', label: 'YouTube', color: '#FF0000' }
  return { icon: '🔗', label: 'Lien', color: '#888' }
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('spotify.com')) return `https://open.spotify.com/embed${u.pathname}?utm_source=generator&theme=0`
    if (u.hostname.includes('deezer.com')) {
      const match = u.pathname.match(/\/(playlist|album|track)\/(\d+)/)
      if (match) return `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {}
  return null
}

type Props = {
  slug: string
  songs: Song[]
  playlistLinks: PlaylistLink[]
  addSong: (f: FormData) => Promise<void>
  deleteSong: (f: FormData) => Promise<void>
  updateSong: (f: FormData) => Promise<void>
  addPlaylistLink: (f: FormData) => Promise<void>
  deletePlaylistLink: (f: FormData) => Promise<void>
  acceptSuggestion: (f: FormData) => Promise<void>
}

type Tab = 'songs' | 'suggestions' | 'playlists'

export default function MusiqueClient({ slug, songs, playlistLinks, addSong, deleteSong, updateSong, addPlaylistLink, deletePlaylistLink, acceptSuggestion }: Props) {
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<Tab>('songs')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newMoment, setNewMoment] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [editForm, setEditForm] = useState({ title: '', artist: '', notes: '', moment: '', song_url: '' })
  const [newPlUrl, setNewPlUrl] = useState('')
  const [newPlName, setNewPlName] = useState('')
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)

  const suggestions = songs.filter(s => s.suggested_by)
  const ownSongs = songs.filter(s => !s.suggested_by)
  const realSongs = ownSongs.filter(s => s.notes !== REPERE_SENTINEL)

  // Sort: by moment order, repères inline
  const sortedSongs = [...ownSongs].sort((a, b) => {
    const mi = (k: string | null) => k ? MOMENTS.findIndex(m => m.key === k) : 99
    return mi(a.moment) - mi(b.moment) || a.position - b.position
  })

  function handleAdd() {
    if (!newTitle.trim()) return
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('moment', newMoment)
    fd.set('title', newTitle.trim())
    fd.set('artist', newArtist.trim())
    fd.set('notes', newNotes.trim())
    fd.set('song_url', newUrl.trim())
    fd.set('position', String(ownSongs.filter(s => s.moment === (newMoment || null)).length))
    startTransition(() => addSong(fd))
    setNewTitle(''); setNewArtist(''); setNewNotes(''); setNewMoment(''); setNewUrl(''); setShowAddForm(false)
  }

  function handleDelete(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    startTransition(() => deleteSong(fd))
    if (expandedId === id) setExpandedId(null)
    if (editingId === id) setEditingId(null)
  }

  function startEdit(song: Song) {
    setEditingId(song.id)
    setExpandedId(song.id)
    setEditForm({
      title: song.title,
      artist: song.artist ?? '',
      notes: song.notes === REPERE_SENTINEL ? '' : (song.notes ?? ''),
      moment: song.moment ?? '',
      song_url: song.song_url ?? '',
    })
  }

  function handleUpdate(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    fd.set('title', editForm.title); fd.set('artist', editForm.artist)
    fd.set('notes', editForm.notes); fd.set('moment', editForm.moment)
    fd.set('song_url', editForm.song_url)
    startTransition(() => updateSong(fd))
    setEditingId(null)
  }

  function handleAccept(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    startTransition(() => acceptSuggestion(fd))
  }

  function handleAddPlaylist() {
    if (!newPlUrl.trim()) return
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('url', newPlUrl.trim())
    fd.set('name', newPlName.trim() || 'Ma playlist')
    fd.set('position', String(playlistLinks.length))
    startTransition(() => addPlaylistLink(fd))
    setNewPlUrl(''); setNewPlName('')
  }

  function handleDeletePlaylist(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    startTransition(() => deletePlaylistLink(fd))
  }

  const playlistHeader = playlistLinks.length > 0
    ? `PLAYLISTS DES MARIÉS\n${playlistLinks.map(pl => `${pl.name}: ${pl.url}`).join('\n')}\n\n`
    : ''

  const exportText = playlistHeader + MOMENTS.map(m => {
    const ms = sortedSongs.filter(s => s.moment === m.key)
    if (!ms.length) return null
    let songIdx = 0
    const lines = ms.map(s => {
      if (s.notes === REPERE_SENTINEL) return `\n--- ${s.title} ---`
      songIdx++
      return `${songIdx}. ${s.title}${s.artist ? ` — ${s.artist}` : ''}${s.song_url ? ` [${s.song_url}]` : ''}${s.notes ? `\n   → ${s.notes}` : ''}`
    })
    return `${m.label.toUpperCase()}\n${lines.join('\n')}`
  }).filter(Boolean).join('\n\n')

  let songRowIdx = 0

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-6 block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.02em', lineHeight: 1 }}
                className="text-[#2d3228]">Musique</h1>
            <p className="text-stone-400 mt-0.5" style={{ fontWeight: 300, fontSize: '0.75rem' }}>
              {realSongs.length} morceau{realSongs.length !== 1 ? 'x' : ''}
              {suggestions.length > 0 && ` · ${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} en attente`}
            </p>
          </div>
          <div className="flex gap-2">
            {realSongs.length > 0 && (
              <button
                onClick={() => {
                  const blob = new Blob([exportText], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url; a.download = 'playlist-mariage.txt'; a.click()
                }}
                className="text-xs border border-[#4a5240] text-[#4a5240] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                ↓ Export DJ
              </button>
            )}
            {activeTab === 'songs' && (
              <button onClick={() => setShowAddForm(v => !v)}
                className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                + Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 mb-6">
          {[
            { key: 'songs' as Tab, label: 'Morceaux' },
            { key: 'suggestions' as Tab, label: `Suggestions${suggestions.length > 0 ? ` (${suggestions.length})` : ''}` },
            { key: 'playlists' as Tab, label: 'Playlists' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === t.key
                  ? 'border-[#4a5240] text-[#2d3228]'
                  : 'border-transparent text-stone-400 hover:text-stone-500'
              }`}
              style={{ fontWeight: activeTab === t.key ? 500 : 300, fontSize: '0.82rem' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── MORCEAUX TAB ── */}
        {activeTab === 'songs' && (
          <div className="space-y-4">

            {/* Add form */}
            {showAddForm && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5">
                <p style={{ fontWeight: 500, fontSize: '0.82rem' }} className="text-[#4a5240] mb-4">Nouveau morceau</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="Titre *" autoFocus
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                  <input value={newArtist} onChange={e => setNewArtist(e.target.value)}
                    placeholder="Artiste"
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select value={newMoment} onChange={e => setNewMoment(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 outline-none focus:border-[#4a5240] transition bg-white"
                    style={{ fontWeight: 300 }}>
                    <option value="">— Moment —</option>
                    {MOMENTS.map(m => <option key={m.key} value={m.key}>{m.icon} {m.label}</option>)}
                  </select>
                  <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                    placeholder="Lien Spotify / Deezer / YouTube"
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                </div>
                <input value={newNotes} onChange={e => setNewNotes(e.target.value)}
                  placeholder="Note pour le DJ"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition mb-3"
                  style={{ fontWeight: 300 }} />
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={!newTitle.trim()}
                    className="bg-[#4a5240] text-white px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-40 hover:bg-[#2d3228] transition"
                    style={{ fontWeight: 300 }}>
                    Ajouter
                  </button>
                  <button onClick={() => { setShowAddForm(false); setNewTitle(''); setNewArtist(''); setNewNotes(''); setNewMoment(''); setNewUrl('') }}
                    className="border border-stone-200 text-stone-400 px-4 py-2 rounded-lg text-sm cursor-pointer hover:border-stone-300 transition"
                    style={{ fontWeight: 300 }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            {ownSongs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
                <p className="text-3xl mb-3">🎵</p>
                <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">
                  Aucun morceau — commencez à construire votre playlist
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f5f0e8' }}>
                        {['#', 'Titre', 'Artiste', 'Moment', 'Lien', ''].map((h, i) => (
                          <th key={i} style={{
                            fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.1em',
                            textTransform: 'uppercase', padding: '10px 12px',
                            textAlign: i === 0 ? 'center' : 'left',
                            color: '#a8a29e', whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => { songRowIdx = 0; return null })()}
                      {sortedSongs.map(song => {
                        const isRepere = song.notes === REPERE_SENTINEL
                        const isExpanded = expandedId === song.id
                        const isEditing = editingId === song.id
                        const mom = getMoment(song.moment)
                        if (!isRepere) songRowIdx++
                        const rowNum = isRepere ? null : songRowIdx

                        return (
                          <>
                            <tr key={song.id}
                              style={{
                                borderBottom: '1px solid #faf9f8',
                                background: isRepere ? '#fffbeb' : isExpanded ? '#fafaf9' : 'white',
                                cursor: isRepere ? 'default' : 'pointer',
                                transition: 'background 0.15s',
                              }}
                              onClick={() => !isRepere && setExpandedId(isExpanded ? null : song.id)}
                              onMouseEnter={e => { if (!isRepere && !isExpanded) (e.currentTarget as HTMLElement).style.background = '#fafaf9' }}
                              onMouseLeave={e => { if (!isRepere && !isExpanded) (e.currentTarget as HTMLElement).style.background = 'white' }}>

                              <td style={{ padding: '11px 12px', textAlign: 'center', width: 36, verticalAlign: 'middle' }}>
                                {isRepere
                                  ? <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>📍</span>
                                  : <span style={{ fontWeight: 300, fontSize: '0.75rem', color: '#d6d3d1' }}>{rowNum}</span>
                                }
                              </td>

                              <td style={{ padding: '11px 12px', verticalAlign: 'middle', maxWidth: 200 }}>
                                {isRepere
                                  ? <span style={{ fontWeight: 400, fontSize: '0.82rem', color: '#92400e' }}>{song.title}</span>
                                  : <span style={{ fontWeight: 400, fontSize: '0.85rem', color: '#2d3228' }}>{song.title}</span>
                                }
                                {!isRepere && song.notes && (
                                  <p style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', marginTop: 2, lineHeight: 1.3 }}>
                                    {song.notes}
                                  </p>
                                )}
                              </td>

                              <td style={{ padding: '11px 12px', verticalAlign: 'middle' }}>
                                <span style={{ fontWeight: 300, fontSize: '0.82rem', color: '#78716c' }}>
                                  {song.artist ?? '—'}
                                </span>
                              </td>

                              <td style={{ padding: '11px 12px', verticalAlign: 'middle' }}>
                                {mom
                                  ? <span style={{
                                      background: mom.color, color: '#4a5240',
                                      fontSize: '0.68rem', fontWeight: 300,
                                      padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap',
                                    }}>
                                      {mom.icon} {mom.label}
                                    </span>
                                  : <span style={{ color: '#d6d3d1', fontSize: '0.75rem' }}>—</span>
                                }
                              </td>

                              <td style={{ padding: '11px 12px', verticalAlign: 'middle' }}>
                                {song.song_url ? (
                                  <a href={song.song_url} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{ fontSize: '1rem', lineHeight: 1, opacity: 0.85 }}
                                    title={getPlatformIcon(song.song_url).label}>
                                    {getPlatformIcon(song.song_url).icon}
                                  </a>
                                ) : (
                                  <span style={{ color: '#e7e5e4', fontSize: '0.75rem' }}>—</span>
                                )}
                              </td>

                              <td style={{ padding: '11px 12px', verticalAlign: 'middle' }}>
                                <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                                  {!isRepere && (
                                    <button onClick={() => startEdit(song)}
                                      className="text-xs text-stone-400 hover:text-[#4a5240] px-2 py-1 rounded cursor-pointer transition">
                                      ✏
                                    </button>
                                  )}
                                  <button onClick={() => handleDelete(song.id)}
                                    className="text-xs text-stone-300 hover:text-red-400 px-2 py-1 rounded cursor-pointer transition">
                                    ×
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded edit row */}
                            {isExpanded && !isRepere && (
                              <tr key={`${song.id}-edit`} style={{ borderBottom: '1px solid #f5f0e8', background: '#fafaf9' }}>
                                <td colSpan={6} style={{ padding: '12px 16px' }}>
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                          placeholder="Titre *" autoFocus
                                          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                                          style={{ fontWeight: 300 }} />
                                        <input value={editForm.artist} onChange={e => setEditForm(f => ({ ...f, artist: e.target.value }))}
                                          placeholder="Artiste"
                                          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                                          style={{ fontWeight: 300 }} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <select value={editForm.moment} onChange={e => setEditForm(f => ({ ...f, moment: e.target.value }))}
                                          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-600 outline-none focus:border-[#4a5240] transition bg-white"
                                          style={{ fontWeight: 300 }}>
                                          <option value="">— Sans moment —</option>
                                          {MOMENTS.map(m => <option key={m.key} value={m.key}>{m.icon} {m.label}</option>)}
                                        </select>
                                        <input value={editForm.song_url} onChange={e => setEditForm(f => ({ ...f, song_url: e.target.value }))}
                                          placeholder="Lien Spotify / Deezer / YouTube"
                                          className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                                          style={{ fontWeight: 300 }} />
                                      </div>
                                      <input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Note pour le DJ"
                                        className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                                        style={{ fontWeight: 300 }} />
                                      <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(song.id)}
                                          className="bg-[#4a5240] text-white px-4 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-[#2d3228] transition"
                                          style={{ fontWeight: 300 }}>
                                          Enregistrer
                                        </button>
                                        <button onClick={() => setEditingId(null)}
                                          className="border border-stone-200 text-stone-400 px-4 py-1.5 rounded-lg text-sm cursor-pointer transition"
                                          style={{ fontWeight: 300 }}>
                                          Annuler
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-4">
                                      {song.notes && (
                                        <p style={{ fontWeight: 300, fontSize: '0.78rem', color: '#78716c', fontStyle: 'italic' }}>
                                          → {song.notes}
                                        </p>
                                      )}
                                      {song.song_url && (
                                        <a href={song.song_url} target="_blank" rel="noopener noreferrer"
                                          className="text-xs text-[#4a5240] hover:underline"
                                          style={{ fontWeight: 300 }}>
                                          {getPlatformIcon(song.song_url).icon} Écouter sur {getPlatformIcon(song.song_url).label}
                                        </a>
                                      )}
                                      <button onClick={() => startEdit(song)}
                                        className="text-xs text-[#4a5240] hover:underline cursor-pointer ml-auto"
                                        style={{ fontWeight: 300 }}>
                                        Modifier
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add repère footer */}
                <div className="border-t border-stone-50 px-4 py-3">
                  <button onClick={() => {
                    const label = prompt('Libellé du repère (ex: Entrée des mariés, Après le gâteau…)')
                    if (!label?.trim()) return
                    const fd = new FormData()
                    fd.set('slug', slug); fd.set('moment', ''); fd.set('title', label.trim())
                    fd.set('artist', ''); fd.set('notes', REPERE_SENTINEL); fd.set('song_url', '')
                    fd.set('position', String(ownSongs.length))
                    startTransition(() => addSong(fd))
                  }} className="text-xs text-amber-500 hover:underline cursor-pointer" style={{ fontWeight: 300 }}>
                    📍 Ajouter un repère DJ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUGGESTIONS TAB ── */}
        {activeTab === 'suggestions' && (
          <div>
            {suggestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
                <p className="text-3xl mb-3">💌</p>
                <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">
                  Aucune suggestion pour l&apos;instant.
                </p>
                <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 mt-1">
                  Les invités peuvent suggérer des morceaux depuis leur espace.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f5f0e8' }}>
                        {['Titre', 'Artiste', 'Moment', 'Lien', 'Suggéré par', ''].map((h, i) => (
                          <th key={i} style={{
                            fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.1em',
                            textTransform: 'uppercase', padding: '10px 12px',
                            textAlign: 'left', color: '#a8a29e',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.map(song => {
                        const mom = getMoment(song.moment)
                        return (
                          <tr key={song.id} style={{ borderBottom: '1px solid #faf9f8' }}>
                            <td style={{ padding: '11px 12px' }}>
                              <p style={{ fontWeight: 400, fontSize: '0.85rem', color: '#2d3228' }}>{song.title}</p>
                              {song.notes && (
                                <p style={{ fontWeight: 300, fontSize: '0.7rem', color: '#a8a29e', marginTop: 1, fontStyle: 'italic' }}>
                                  "{song.notes}"
                                </p>
                              )}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{ fontWeight: 300, fontSize: '0.82rem', color: '#78716c' }}>
                                {song.artist ?? '—'}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              {mom
                                ? <span style={{ background: mom.color, color: '#4a5240', fontSize: '0.68rem', fontWeight: 300, padding: '2px 8px', borderRadius: 99 }}>
                                    {mom.icon} {mom.label}
                                  </span>
                                : <span style={{ color: '#d6d3d1', fontSize: '0.75rem' }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              {song.song_url ? (
                                <a href={song.song_url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: '1rem', opacity: 0.85 }}
                                  title={getPlatformIcon(song.song_url).label}>
                                  {getPlatformIcon(song.song_url).icon}
                                </a>
                              ) : <span style={{ color: '#e7e5e4' }}>—</span>}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{ fontWeight: 300, fontSize: '0.75rem', color: '#a8a29e' }}>
                                {song.suggested_by}
                              </span>
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => handleAccept(song.id)}
                                  className="text-xs bg-[#4a5240] text-white px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#2d3228] transition"
                                  style={{ fontWeight: 300 }}>
                                  Accepter
                                </button>
                                <button onClick={() => handleDelete(song.id)}
                                  className="text-xs border border-stone-200 text-stone-400 px-2.5 py-1 rounded-lg cursor-pointer hover:text-red-400 hover:border-red-200 transition"
                                  style={{ fontWeight: 300 }}>
                                  Refuser
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PLAYLISTS TAB ── */}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {playlistLinks.map(pl => {
              const embedUrl = getEmbedUrl(pl.url)
              const isExpanded = expandedPlaylist === pl.id
              return (
                <div key={pl.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="text-xl">{getPlatformIcon(pl.url).icon}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-[#2d3228]">{pl.name}</p>
                      <a href={pl.url} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-stone-400 hover:text-[#4a5240] transition truncate block" style={{ fontWeight: 300 }}>
                        {pl.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {embedUrl && (
                        <button onClick={() => setExpandedPlaylist(isExpanded ? null : pl.id)}
                          className="text-xs text-[#4a5240] border border-[#4a5240]/30 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#4a5240]/5 transition"
                          style={{ fontWeight: 300 }}>
                          {isExpanded ? 'Fermer' : 'Aperçu'}
                        </button>
                      )}
                      <button onClick={() => handleDeletePlaylist(pl.id)}
                        className="text-stone-300 hover:text-red-400 transition text-lg cursor-pointer">×</button>
                    </div>
                  </div>
                  {isExpanded && embedUrl && (
                    <div className="px-5 pb-5">
                      <iframe src={embedUrl} width="100%" height="152" frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy" className="rounded-xl" />
                    </div>
                  )}
                </div>
              )
            })}

            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
              <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#4a5240]">+ Ajouter une playlist</p>
              <input value={newPlName} onChange={e => setNewPlName(e.target.value)}
                placeholder="Nom (ex: Playlist cocktail Spotify)"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
              <input value={newPlUrl} onChange={e => setNewPlUrl(e.target.value)}
                placeholder="Lien Spotify, Deezer, YouTube…"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
              {newPlUrl && getEmbedUrl(newPlUrl) && (
                <iframe src={getEmbedUrl(newPlUrl)!} width="100%" height="152" frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy" className="rounded-xl" />
              )}
              <button onClick={handleAddPlaylist} disabled={!newPlUrl.trim()}
                className="w-full bg-[#4a5240] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-40"
                style={{ fontWeight: 300 }}>
                Enregistrer la playlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
