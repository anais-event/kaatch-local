'use client'

import { useState, useTransition } from 'react'

type Comment = { id: string; author_name: string; content: string; created_at: string }
type Photo = {
  id: string; url: string; uploader_name: string | null; moment_tag: string | null
  tagged_guests: string[]; created_at: string; likes: number; liked_by: string[]; comments: Comment[]
}

export default function GuestPhotoFeed({ photos, moments, guestName, addLike, addComment, slug }: {
  photos: Photo[]
  moments: string[]
  guestName: string
  slug: string
  addLike: (fd: FormData) => Promise<void>
  addComment: (fd: FormData) => Promise<void>
}) {
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [momentFilter, setMomentFilter] = useState('')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = photos.filter(p => {
    if (filter === 'mine' && !p.tagged_guests.includes(guestName)) return false
    if (momentFilter && p.moment_tag !== momentFilter) return false
    return true
  })

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm transition ${filter === 'all' ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Toutes
        </button>
        <button onClick={() => setFilter('mine')}
          className={`px-4 py-1.5 rounded-full text-sm transition ${filter === 'mine' ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          📸 Mes photos
        </button>
        {moments.map(m => (
          <button key={m} onClick={() => setMomentFilter(momentFilter === m ? '' : m)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${momentFilter === m ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            {m}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stone-400 italic"
           style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
          {filter === 'mine' ? 'Aucune photo avec votre tag pour l\'instant…' : 'Aucune photo pour le moment…'}
        </p>
      )}

      <div className="columns-2 gap-3 space-y-3">
        {filtered.map(photo => (
          <div key={photo.id} className="break-inside-avoid bg-white/80 rounded-2xl overflow-hidden shadow-sm">
            <img src={photo.url} alt="" className="w-full object-cover" />
            <div className="p-3">
              {photo.uploader_name && (
                <p className="text-xs text-stone-400 mb-1" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  📸 {photo.uploader_name}
                  {photo.moment_tag && <span className="ml-1 text-[#4a5240]">· {photo.moment_tag}</span>}
                </p>
              )}
              {photo.tagged_guests.length > 0 && (
                <p className="text-xs text-stone-400 mb-2" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  🏷️ {photo.tagged_guests.join(', ')}
                </p>
              )}
              <div className="flex items-center gap-4">
                <form action={async (fd) => {
                  fd.append('slug', slug)
                  fd.append('liker_name', guestName)
                  startTransition(() => addLike(fd))
                }}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button type="submit"
                    className={`flex items-center gap-1 text-sm transition ${photo.liked_by.includes(guestName) ? 'text-red-400' : 'text-stone-400 hover:text-red-400'}`}>
                    ❤️ <span>{photo.likes}</span>
                  </button>
                </form>
                <button onClick={() => setOpenComments(openComments === photo.id ? null : photo.id)}
                  className="flex items-center gap-1 text-sm text-stone-400 hover:text-[#4a5240] transition">
                  💬 <span>{photo.comments.length}</span>
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
                      className="bg-[#4a5240] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#2d3228] transition">
                      →
                    </button>
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
