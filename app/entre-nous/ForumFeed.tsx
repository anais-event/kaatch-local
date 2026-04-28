'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { categoryLabel, type ForumCategory } from './types'
import PublicNav from '@/app/_components/PublicNav'

const DISPLAY = 'var(--font-geist-sans)'
const GREEN = '#2C3B2E'
const CREAM = '#f5f0e8'

const VENDOR_KEYWORDS = [
  'photographe', 'vidéaste', 'vidéo', 'traiteur', 'cuisine', 'buffet',
  'dj', 'animation', 'animateur', 'orchestre', 'groupe de musique',
  'fleuriste', 'décoration', 'décoratrice', 'wedding planner', 'coordinatrice',
  'domaine', 'château', 'salle de réception', 'location de salle',
  'voiture de luxe', 'limousine', 'pâtissier', 'wedding cake',
  'coiffeur', 'maquilleur', 'faire-part', 'papeterie', 'imprimerie',
  'nos services', 'notre offre', 'notre entreprise', 'notre site', 'notre société',
  'devis gratuit', 'contactez-nous', 'n\'hésitez pas à nous contacter',
  'professionnel', 'prestataire', 'prestation',
]

function detectVendor(text: string): boolean {
  const lower = text.toLowerCase()
  return VENDOR_KEYWORDS.some(kw => lower.includes(kw))
}

const categoryColors: Record<ForumCategory, { bg: string; text: string }> = {
  question: { bg: '#eceef8', text: '#4a5299' },
  astuce: { bg: '#eef1ec', text: '#4a5240' },
  'bon-plan': { bg: '#f3ede4', text: '#7c6d52' },
  'coup-de-coeur': { bg: '#fceef1', text: '#9c4a5a' },
}

type Post = {
  id: string
  user_id: string
  author_name: string
  category: ForumCategory
  title: string
  content: string
  likes_count: number
  replies_count: number
  created_at: string
}

type Props = {
  posts: Post[]
  likedPostIds: Set<string>
  userId: string
  createPost: (formData: FormData) => Promise<void>
  deletePost: (formData: FormData) => Promise<void>
  editPost: (formData: FormData) => Promise<void>
  reportPost: (formData: FormData) => Promise<void>
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

export default function ForumFeed({ posts, likedPostIds, userId, createPost, deletePost, editPost, reportPost }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<ForumCategory | 'all'>('all')
  const [isPending, startTransition] = useTransition()
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(likedPostIds))
  const [formText, setFormText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const isVendor = detectVendor(formText)

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  function handleReport(postId: string) {
    setReportedIds(prev => new Set([...prev, postId]))
    const fd = new FormData()
    fd.set('postId', postId)
    startTransition(() => reportPost(fd))
  }

  function startEdit(post: Post) {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  return (
    <main style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228', background: CREAM, minHeight: '100vh' }}>

      <PublicNav active="entre-nous" />

      <div className="pt-24 pb-24 px-6 max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: GREEN }}
              className="mb-2">
            Entre nous 💬
          </h1>
          <p className="text-stone-500 text-sm" style={{ fontWeight: 300 }}>
            Questions, astuces, bons plans — entre futurs mariés. Réservé aux membres Kaatch.
          </p>
        </div>

        {/* Bouton nouveau post */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-left bg-white rounded-2xl px-5 py-4 border border-stone-200 hover:border-stone-300 transition mb-6 text-stone-400 text-sm"
            style={{ fontWeight: 300 }}>
            Partagez une question, une astuce, un bon plan…
          </button>
        )}

        {/* Formulaire nouveau post */}
        {showForm && (
          <form
            action={async (fd) => {
              startTransition(() => createPost(fd))
              setShowForm(false)
              setFormText('')
            }}
            className="bg-white rounded-2xl p-6 border border-stone-200 mb-6 space-y-4">
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block" style={{ fontWeight: 500 }}>Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryLabel) as ForumCategory[]).map(cat => (
                  <label key={cat} className="cursor-pointer">
                    <input type="radio" name="category" value={cat} className="sr-only" required />
                    <span className="text-xs px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-400 transition cursor-pointer"
                          style={{ fontWeight: 400, display: 'inline-block' }}>
                      {categoryLabel[cat]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block" style={{ fontWeight: 500 }}>Titre</label>
              <input
                name="title"
                required
                maxLength={200}
                placeholder="En une phrase…"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1.5 block" style={{ fontWeight: 500 }}>Votre message</label>
              <textarea
                name="content"
                required
                maxLength={2000}
                rows={4}
                placeholder="Détails, contexte, question précise…"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 transition resize-none"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
                onChange={e => setFormText(e.target.value)}
                value={formText}
              />
              <p className="text-xs text-stone-400 mt-1">Les liens externes sont retirés automatiquement.</p>
            </div>

            {isVendor && (
              <div className="rounded-2xl px-5 py-4 border" style={{ background: '#fdf8f0', borderColor: '#e8d9c0' }}>
                <p className="text-sm mb-1" style={{ fontWeight: 500, color: '#7c6d52', fontFamily: DISPLAY }}>
                  Vous êtes professionnel de l&apos;événementiel ? 🎉
                </p>
                <p className="text-sm text-stone-500 mb-3" style={{ fontWeight: 300 }}>
                  Cet espace est réservé aux futurs mariés pour s&apos;entraider. Mais on serait ravis de faire connaissance !
                </p>
                <Link href="/prestataires" className="text-sm hover:opacity-80 transition" style={{ color: '#7c6d52', fontWeight: 500 }}>
                  Découvrir l&apos;espace prestataires →
                </Link>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setFormText('') }}
                      className="text-sm text-stone-400 hover:text-stone-600 transition px-4 py-2">
                Annuler
              </button>
              <button type="submit" disabled={isPending || isVendor}
                      className="text-sm text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-40"
                      style={{ background: GREEN, fontWeight: 500 }}>
                Publier
              </button>
            </div>
          </form>
        )}

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(['all', ...Object.keys(categoryLabel)] as (ForumCategory | 'all')[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="text-xs px-3 py-1.5 rounded-full border transition"
              style={{
                borderColor: filter === cat ? GREEN : '#e2e0dc',
                background: filter === cat ? GREEN : 'white',
                color: filter === cat ? 'white' : '#78716c',
                fontWeight: 400,
              }}>
              {cat === 'all' ? 'Tous' : categoryLabel[cat as ForumCategory]}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm">
            Aucun post pour l&apos;instant. Soyez le premier !
          </div>
        )}

        <div className="space-y-4">
          {filtered.map(post => {
            const colors = categoryColors[post.category]
            const isLiked = likedIds.has(post.id)
            const isReported = reportedIds.has(post.id)
            const isOwner = post.user_id === userId
            const isEditing = editingId === post.id

            return (
              <div key={post.id} className="bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 transition"
                   style={{ boxShadow: '0 2px 12px rgba(44,59,46,0.04)' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: colors.bg, color: colors.text }}>
                      {categoryLabel[post.category]}
                    </span>
                    <span className="text-xs text-stone-400">{post.author_name}</span>
                    <span className="text-xs text-stone-300">·</span>
                    <span className="text-xs text-stone-400">{timeAgo(post.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isOwner && !isEditing && (
                      <>
                        <button onClick={() => startEdit(post)}
                                className="text-xs text-stone-400 hover:text-stone-600 transition">
                          Modifier
                        </button>
                        <form action={async (fd) => { startTransition(() => deletePost(fd)) }}>
                          <input type="hidden" name="postId" value={post.id} />
                          <button type="submit"
                                  onClick={e => { if (!confirm('Supprimer ce post ?')) e.preventDefault() }}
                                  className="text-xs text-stone-300 hover:text-red-400 transition">
                            Supprimer
                          </button>
                        </form>
                      </>
                    )}
                    {!isOwner && !isReported && (
                      <button onClick={() => handleReport(post.id)}
                              className="text-xs text-stone-300 hover:text-stone-400 transition"
                              title="Signaler ce post">
                        ⚑
                      </button>
                    )}
                    {!isOwner && isReported && <span className="text-xs text-stone-300">Signalé</span>}
                  </div>
                </div>

                {/* Mode édition */}
                {isEditing ? (
                  <form action={async (fd) => {
                    startTransition(() => editPost(fd))
                    setEditingId(null)
                  }} className="space-y-3">
                    <input type="hidden" name="postId" value={post.id} />
                    <input
                      name="title"
                      required
                      maxLength={200}
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 transition"
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, color: GREEN }}
                    />
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
                      <button type="button" onClick={() => setEditingId(null)}
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
                  <>
                    <Link href={`/entre-nous/${post.id}`}>
                      <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '0.95rem', color: GREEN, lineHeight: 1.35 }}
                          className="mb-2 hover:opacity-75 transition">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-3" style={{ fontWeight: 300 }}>
                      {stripLinks(post.content)}
                    </p>
                  </>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-5 mt-4">
                    <button
                      onClick={() => setLikedIds(prev => {
                        const next = new Set(prev)
                        isLiked ? next.delete(post.id) : next.add(post.id)
                        return next
                      })}
                      className="flex items-center gap-1.5 text-xs transition"
                      style={{ color: isLiked ? '#9c4a5a' : '#a8a29e', fontWeight: 400 }}>
                      <span>{isLiked ? '❤️' : '🤍'}</span>
                      <span>{post.likes_count + (isLiked && !likedPostIds.has(post.id) ? 1 : !isLiked && likedPostIds.has(post.id) ? -1 : 0)}</span>
                    </button>
                    <Link href={`/entre-nous/${post.id}`}
                          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition">
                      <span>💬</span>
                      <span>{post.replies_count} {post.replies_count === 1 ? 'réponse' : 'réponses'}</span>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}
