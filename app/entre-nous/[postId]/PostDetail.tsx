'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { categoryLabel, type ForumCategory } from '../types'

const DISPLAY = 'var(--font-geist-sans)'
const GREEN = '#2C3B2E'
const CREAM = '#f5f0e8'

const categoryColors: Record<ForumCategory, { bg: string; text: string }> = {
  question: { bg: '#eceef8', text: '#4a5299' },
  astuce: { bg: '#eef1ec', text: '#4a5240' },
  'bon-plan': { bg: '#f3ede4', text: '#7c6d52' },
  'coup-de-coeur': { bg: '#fceef1', text: '#9c4a5a' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'à l\'instant'
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function stripLinks(text: string) {
  return text.replace(/https?:\/\/\S+/g, '[lien retiré]')
}

type Post = {
  id: string
  author_name: string
  category: ForumCategory
  title: string
  content: string
  likes_count: number
  replies_count: number
  created_at: string
}

type Reply = {
  id: string
  user_id: string
  author_name: string
  content: string
  created_at: string
}

type Props = {
  post: Post
  replies: Reply[]
  isLiked: boolean
  userId: string
  addReply: (formData: FormData) => Promise<void>
  editReply: (formData: FormData) => Promise<void>
  deleteReply: (formData: FormData) => Promise<void>
  toggleLike: (formData: FormData) => Promise<void>
}

export default function PostDetail({ post, replies, isLiked, userId, addReply, editReply, deleteReply, toggleLike }: Props) {
  const [liked, setLiked] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isPending, startTransition] = useTransition()
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const colors = categoryColors[post.category]

  function handleLike() {
    setLiked(prev => !prev)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    const fd = new FormData()
    fd.set('postId', post.id)
    startTransition(() => toggleLike(fd))
  }

  return (
    <main style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <nav style={{ background: `${CREAM}f2`, backdropFilter: 'blur(12px)' }}
           className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: GREEN }}>
              Kaatch
            </Link>
            <Link href="/entre-nous" className="text-sm text-stone-400 hover:text-stone-600 transition flex items-center gap-1" style={{ fontWeight: 400 }}>
              ← Entre nous
            </Link>
          </div>
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-800 transition" style={{ fontWeight: 400 }}>
            Mon espace →
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-6 max-w-3xl mx-auto">

        {/* Post */}
        <div className="bg-white rounded-2xl p-7 border border-stone-100 mb-6"
             style={{ boxShadow: '0 2px 16px rgba(44,59,46,0.06)' }}>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: colors.bg, color: colors.text }}>
              {categoryLabel[post.category]}
            </span>
            <span className="text-xs text-stone-400">{post.author_name}</span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-400">{timeAgo(post.created_at)}</span>
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', lineHeight: 1.2, color: GREEN, letterSpacing: '-0.01em' }}
              className="mb-4">
            {post.title}
          </h1>

          <p className="text-stone-600 leading-relaxed" style={{ fontSize: '0.95rem', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
            {stripLinks(post.content)}
          </p>

          <div className="flex items-center gap-5 mt-6 pt-5 border-t border-stone-100">
            <button onClick={handleLike} disabled={isPending}
                    className="flex items-center gap-1.5 text-sm transition"
                    style={{ color: liked ? '#9c4a5a' : '#a8a29e', fontWeight: 400 }}>
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{likesCount}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-stone-400">
              <span>💬</span>
              <span>{replies.length} {replies.length === 1 ? 'réponse' : 'réponses'}</span>
            </span>
          </div>
        </div>

        {/* Réponses */}
        {replies.length > 0 && (
          <div className="space-y-3 mb-6">
            {replies.map(reply => {
              const isOwner = reply.user_id === userId
              const isEditing = editingReplyId === reply.id
              return (
                <div key={reply.id} className="bg-white rounded-2xl px-6 py-5 border border-stone-100">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: GREEN }}>{reply.author_name}</span>
                      <span className="text-xs text-stone-300">·</span>
                      <span className="text-xs text-stone-400">{timeAgo(reply.created_at)}</span>
                    </div>
                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditingReplyId(reply.id); setEditContent(reply.content) }}
                                className="text-xs text-stone-400 hover:text-stone-600 transition">
                          Modifier
                        </button>
                        <form action={async (fd) => { startTransition(() => deleteReply(fd)) }}>
                          <input type="hidden" name="replyId" value={reply.id} />
                          <input type="hidden" name="postId" value={post.id} />
                          <button type="submit"
                                  onClick={e => { if (!confirm('Supprimer cette réponse ?')) e.preventDefault() }}
                                  className="text-xs text-stone-300 hover:text-red-400 transition">
                            Supprimer
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <form action={async (fd) => {
                      startTransition(() => editReply(fd))
                      setEditingReplyId(null)
                    }} className="space-y-2">
                      <input type="hidden" name="replyId" value={reply.id} />
                      <input type="hidden" name="postId" value={post.id} />
                      <textarea
                        name="content"
                        required
                        maxLength={2000}
                        rows={3}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition resize-none"
                        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                      />
                      <div className="flex gap-3 justify-end">
                        <button type="button" onClick={() => setEditingReplyId(null)}
                                className="text-xs text-stone-400 hover:text-stone-600 transition px-3 py-1.5">
                          Annuler
                        </button>
                        <button type="submit" disabled={isPending}
                                className="text-xs text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition"
                                style={{ background: GREEN, fontWeight: 500 }}>
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-stone-600 text-sm leading-relaxed" style={{ fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                      {stripLinks(reply.content)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Formulaire réponse */}
        <form action={async (fd) => {
          fd.set('postId', post.id)
          startTransition(() => addReply(fd))
        }}
              className="bg-white rounded-2xl p-6 border border-stone-100">
          <p className="text-sm font-medium mb-3" style={{ color: GREEN, fontFamily: DISPLAY, fontWeight: 600 }}>
            Votre réponse
          </p>
          <textarea
            name="content"
            required
            maxLength={2000}
            rows={3}
            placeholder="Partagez votre expérience, votre conseil…"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition resize-none mb-3"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">Les liens externes sont retirés automatiquement.</p>
            <button type="submit" disabled={isPending}
                    className="text-sm text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    style={{ background: GREEN, fontWeight: 500 }}>
              Répondre
            </button>
          </div>
        </form>

      </div>
    </main>
  )
}
