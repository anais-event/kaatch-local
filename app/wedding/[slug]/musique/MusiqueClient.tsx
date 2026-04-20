'use client'

import { useState, useTransition } from 'react'

export type Song = {
  id: string
  moment: string | null
  title: string
  artist: string | null
  notes: string | null
  position: number
}

export type PlaylistLink = {
  id: string
  name: string
  url: string
  position: number
}

const MOMENTS = [
  { key: 'ceremonie', label: 'Cérémonie', icon: '💒' },
  { key: 'cocktail',  label: 'Cocktail',  icon: '🥂' },
  { key: 'diner',     label: 'Dîner',     icon: '🕯️' },
  { key: 'soiree',    label: 'Soirée',    icon: '🕺' },
]

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // Spotify
    if (u.hostname.includes('spotify.com')) {
      const path = u.pathname // e.g. /playlist/37i9dQZF1DXcBWIGoYBM5M
      return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`
    }
    // Deezer
    if (u.hostname.includes('deezer.com')) {
      const match = u.pathname.match(/\/(playlist|album|track)\/(\d+)/)
      if (match) return `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`
    }
    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      if (id) return `https://www.youtube.com/embed/${id}`
    }
  } catch {}
  return null
}

function getPlatformIcon(url: string) {
  if (url.includes('spotify')) return '🎧'
  if (url.includes('deezer'))  return '🎵'
  if (url.includes('youtube') || url.includes('youtu.be')) return '▶️'
  return '🔗'
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
}

export default function MusiqueClient({ slug, songs, playlistLinks, addSong, deleteSong, updateSong, addPlaylistLink, deletePlaylistLink }: Props) {
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs')
  const [activeMoment, setActiveMoment] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newMoment, setNewMoment] = useState('')
  const [editForm, setEditForm] = useState({ title: '', artist: '', notes: '', moment: '' })
  const [newPlUrl, setNewPlUrl] = useState('')
  const [newPlName, setNewPlName] = useState('')
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)

  function getSongs(moment: string | null) {
    if (moment === null) return songs.filter(s => !s.moment)
    return songs.filter(s => s.moment === moment).sort((a, b) => a.position - b.position)
  }

  function handleAdd(defaultMoment?: string) {
    if (!newTitle.trim()) return
    const moment = newMoment || defaultMoment || ''
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('moment', moment)
    fd.set('title', newTitle.trim())
    fd.set('artist', newArtist.trim())
    fd.set('notes', newNotes.trim())
    fd.set('position', String(songs.filter(s => s.moment === moment).length))
    startTransition(() => addSong(fd))
    setNewTitle(''); setNewArtist(''); setNewNotes(''); setNewMoment(''); setAddingTo(null)
  }

  function handleDelete(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    startTransition(() => deleteSong(fd))
  }

  function startEdit(song: Song) {
    setEditingId(song.id)
    setEditForm({ title: song.title, artist: song.artist ?? '', notes: song.notes ?? '', moment: song.moment ?? '' })
  }

  function handleUpdate(id: string) {
    const fd = new FormData()
    fd.set('id', id); fd.set('slug', slug)
    fd.set('title', editForm.title); fd.set('artist', editForm.artist)
    fd.set('notes', editForm.notes); fd.set('moment', editForm.moment)
    startTransition(() => updateSong(fd))
    setEditingId(null)
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

  const exportText = MOMENTS.map(m => {
    const ms = getSongs(m.key)
    if (!ms.length) return null
    return `${m.label.toUpperCase()}\n${ms.map((s, i) => `${i + 1}. ${s.title}${s.artist ? ` — ${s.artist}` : ''}${s.notes ? `\n   → ${s.notes}` : ''}`).join('\n')}`
  }).filter(Boolean).join('\n\n')

  // Affichage d'une section de morceaux (réutilisable pour chaque moment + "sans moment")
  function SongSection({ momentKey, label, icon }: { momentKey: string | null, label: string, icon: string }) {
    const momentSongs = getSongs(momentKey)
    const sectionKey = momentKey ?? '__none__'
    return (
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-3">
        <div className="px-5 py-3.5 border-b border-stone-50 flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem', fontStyle: 'italic' }}
              className="text-[#4a5240] flex-1">{label}</h2>
          <span className="text-xs text-stone-300" style={{ fontWeight: 300 }}>{momentSongs.length} morceau{momentSongs.length !== 1 ? 'x' : ''}</span>
        </div>

        <div className="divide-y divide-stone-50">
          {momentSongs.length === 0 && (
            <div className="px-5 py-5 text-center">
              <p className="text-xs text-stone-300 italic" style={{ fontWeight: 300 }}>Aucun morceau — ajoutes-en un ci-dessous</p>
            </div>
          )}
          {momentSongs.map((song, idx) => (
            <div key={song.id} className="px-5 py-3">
              {editingId === song.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Titre *"
                      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }} />
                    <input value={editForm.artist} onChange={e => setEditForm(f => ({ ...f, artist: e.target.value }))}
                      placeholder="Artiste"
                      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Note pour le DJ"
                      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                      style={{ fontWeight: 300 }} />
                    <select value={editForm.moment} onChange={e => setEditForm(f => ({ ...f, moment: e.target.value }))}
                      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-600 outline-none focus:border-[#4a5240] transition bg-white"
                      style={{ fontWeight: 300 }}>
                      <option value="">— Sans moment —</option>
                      {MOMENTS.map(m => <option key={m.key} value={m.key}>{m.icon} {m.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(song.id)}
                      className="flex-1 bg-[#4a5240] text-white py-1.5 rounded-lg text-sm cursor-pointer" style={{ fontWeight: 300 }}>
                      Enregistrer
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 border border-stone-200 text-stone-400 py-1.5 rounded-lg text-sm cursor-pointer" style={{ fontWeight: 300 }}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 group">
                  <span className="text-xs text-stone-300 pt-1 w-4 shrink-0 text-right" style={{ fontWeight: 300 }}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-[#2d3228]">{song.title}</p>
                    {song.artist && <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{song.artist}</p>}
                    {song.notes && <p className="text-xs text-stone-400 italic mt-0.5" style={{ fontWeight: 300 }}>→ {song.notes}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => startEdit(song)} className="text-xs text-stone-400 hover:text-[#4a5240] px-2 py-1 rounded cursor-pointer transition">✏</button>
                    <button onClick={() => handleDelete(song.id)} className="text-xs text-stone-300 hover:text-red-400 px-2 py-1 rounded cursor-pointer transition">×</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add song */}
        {addingTo === sectionKey ? (
          <div className="px-5 py-4 border-t border-stone-100 space-y-2 bg-[#f5f0e8]/40">
            <div className="grid grid-cols-2 gap-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(momentKey ?? '') }}
                placeholder="Titre *" autoFocus
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition bg-white"
                style={{ fontWeight: 300 }} />
              <input value={newArtist} onChange={e => setNewArtist(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(momentKey ?? '') }}
                placeholder="Artiste (optionnel)"
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition bg-white"
                style={{ fontWeight: 300 }} />
            </div>
            <input value={newNotes} onChange={e => setNewNotes(e.target.value)}
              placeholder="Note pour le DJ (optionnel)"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition bg-white"
              style={{ fontWeight: 300 }} />
            <div className="flex gap-2">
              <button onClick={() => handleAdd(momentKey ?? '')} disabled={!newTitle.trim()}
                className="flex-1 bg-[#4a5240] text-white py-2 rounded-lg text-sm cursor-pointer disabled:opacity-40" style={{ fontWeight: 300 }}>
                + Ajouter
              </button>
              <button onClick={() => { setAddingTo(null); setNewTitle(''); setNewArtist(''); setNewNotes('') }}
                className="px-4 border border-stone-200 text-stone-400 py-2 rounded-lg text-sm cursor-pointer" style={{ fontWeight: 300 }}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-3 border-t border-stone-50">
            <button onClick={() => { setAddingTo(sectionKey); setActiveMoment(momentKey) }}
              className="text-sm text-[#4a5240] hover:underline cursor-pointer" style={{ fontWeight: 300 }}>
              + Ajouter un morceau
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-6 block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
                className="text-[#2d3228]">Musique</h1>
            <p className="text-stone-400 mt-0.5" style={{ fontWeight: 300, fontSize: '0.82rem' }}>
              {songs.length} morceau{songs.length !== 1 ? 'x' : ''} · {playlistLinks.length} playlist{playlistLinks.length !== 1 ? 's' : ''}
            </p>
          </div>
          {songs.length > 0 && (
            <button
              onClick={() => {
                const blob = new Blob([exportText], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'playlist-mariage.txt'; a.click()
              }}
              className="text-xs border border-[#4a5240] text-[#4a5240] px-3 py-1.5 rounded-lg hover:bg-[#4a5240] hover:text-white transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              ↓ Exporter DJ
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl border border-stone-100 p-1 mb-6 gap-1">
          {[
            { key: 'songs', label: '🎶 Morceaux' },
            { key: 'playlists', label: '🔗 Playlists externes' },
          ].map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key as 'songs' | 'playlists')}
              className={`flex-1 py-2 rounded-lg text-sm transition cursor-pointer ${activeTab === t.key ? 'bg-[#4a5240] text-white' : 'text-stone-400 hover:text-stone-600'}`}
              style={{ fontWeight: 300 }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'songs' && (
          <>
            {MOMENTS.map(m => (
              <SongSection key={m.key} momentKey={m.key} label={m.label} icon={m.icon} />
            ))}
            <SongSection momentKey={null} label="Sans moment spécifique" icon="🎼" />
          </>
        )}

        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {/* Playlists existantes */}
            {playlistLinks.map(pl => {
              const embedUrl = getEmbedUrl(pl.url)
              const isExpanded = expandedPlaylist === pl.id
              return (
                <div key={pl.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="text-xl">{getPlatformIcon(pl.url)}</span>
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
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Ajouter une playlist */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem', fontStyle: 'italic' }}
                  className="text-[#4a5240]">+ Ajouter une playlist</h2>
              <input value={newPlName} onChange={e => setNewPlName(e.target.value)}
                placeholder="Nom (ex: Playlist cocktail Spotify)"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
              <input value={newPlUrl} onChange={e => setNewPlUrl(e.target.value)}
                placeholder="Lien Spotify, Deezer, YouTube…"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
              {newPlUrl && getEmbedUrl(newPlUrl) && (
                <iframe
                  src={getEmbedUrl(newPlUrl)!}
                  width="100%" height="152" frameBorder="0"
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
