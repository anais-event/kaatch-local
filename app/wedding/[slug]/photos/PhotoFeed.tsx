'use client'

import { useState, useTransition } from 'react'

type Comment = {
  id: string
  author_name: string
  content: string
  created_at: string
}

type Photo = {
  id: string
  url: string
  uploader_name: string | null
  moment_tag: string | null
  created_at: string
  likes: number
  comments: Comment[]
}

type Props = {
  photos: Photo[]
  moments: string[]
  addLike: (formData: FormData) => Promise<void>
  addComment: (formData: FormData) => Promise<void>
}

export default function PhotoFeed({ photos, moments, addLike, addComment }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = filter === 'all' ? photos : photos.filter(p => p.moment_tag === filter)

  return (
    <div>
      {/* Filtre par moment */}
      {moments.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${filter === 'all' ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Tout
          </button>
          {moments.map(m => (
            <button key={m} onClick={() => setFilter(m)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${filter === m ? 'bg-[#4a5240] text-white' : 'bg-white/60 text-stone-500 hover:bg-white'}`}
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              {m}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stone-400 italic"
           style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem' }}>
          Aucune photo pour le moment…
        </p>
      )}

      {/* Grille photos */}
      <div className="columns-2 gap-3 space-y-3">
        {filtered.map(photo => (
          <div key={photo.id} className="break-inside-avoid bg-white/80 rounded-2xl overflow-hidden shadow-sm">
            <img src={photo.url} alt="" className="w-full object-cover" />
            <div className="p-3">
              {photo.uploader_name && (
                <p className="text-xs text-stone-400 mb-2"
                   style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  📸 {photo.uploader_name}
                  {photo.moment_tag && <span className="ml-2 text-[#4a5240]">· {photo.moment_tag}</span>}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <form action={async (fd) => { startTransition(() => addLike(fd)) }}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button type="submit" className="flex items-center gap-1 text-sm text-stone-400 hover:text-red-400 transition">
                    ❤️ <span>{photo.likes}</span>
                  </button>
                </form>
                <button onClick={() => setOpenComments(openComments === photo.id ? null : photo.id)}
                  className="flex items-center gap-1 text-sm text-stone-400 hover:text-[#4a5240] transition">
                  💬 <span>{photo.comments.length}</span>
                </button>
              </div>

              {/* Commentaires */}
              {openComments === photo.id && (
                <div className="mt-3 space-y-2">
                  {photo.comments.map(c => (
                    <div key={c.id} className="bg-stone-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-[#4a5240]"
                         style={{ fontFamily: 'var(--font-lato)' }}>{c.author_name}</p>
                      <p className="text-sm text-stone-600"
                         style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>{c.content}</p>
                    </div>
                  ))}
                  <form action={async (fd) => {
                    startTransition(() => addComment(fd))
                    setOpenComments(null)
                  }} className="flex gap-2 mt-2">
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <input type="text" name="author_name" placeholder="Votre prénom" required
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
                    <input type="text" name="content" placeholder="Commentaire" required
                      className="flex-2 border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
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
