'use client'
import { toDateLocale } from '@/lib/locale-map'
import { useLocale } from 'next-intl'

import { useState, useRef } from 'react'

type Entry = {
  id: string
  author_name: string
  message: string
  photo_url: string | null
  created_at: string
}

type Props = {
  entries: Entry[]
  slug: string
}

export default function GuestbookViewer({ entries, slug }: Props) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [animating, setAnimating] = useState(false)
  const touchStart = useRef<number | null>(null)

  const total = entries.length
  const current = entries[page] ?? null

  function go(dir: 'prev' | 'next') {
    if (animating) return
    if (dir === 'prev' && page === 0) return
    if (dir === 'next' && page >= total - 1) return
    setDirection(dir === 'next' ? 'right' : 'left')
    setAnimating(true)
    setTimeout(() => {
      setPage(p => dir === 'next' ? p + 1 : p - 1)
      setAnimating(false)
    }, 300)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const delta = e.changedTouches[0].clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(delta) > 50) go(delta < 0 ? 'next' : 'prev')
  }

  const formattedDate = (iso: string) =>
    new Date(iso).toLocaleDateString(toDateLocale('fr'), { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap')`}</style>

      {/* Book container */}
      <div className="max-w-2xl mx-auto px-4">
        {total === 0 ? (
          <div className="text-center py-20">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '1rem' }} className="text-stone-400">
              Le livre d&apos;or est vide pour l&apos;instant... Les premiers mots arriveront bientôt 🌸
            </p>
          </div>
        ) : (
          <>
            {/* Page card */}
            <div
              className="relative mx-auto"
              style={{ perspective: '1200px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #fdfcf8 0%, #f5f0e8 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08), 2px 2px 0 #e8e0d0',
                  minHeight: '380px',
                  padding: '2.5rem 2rem',
                  position: 'relative',
                  transition: 'opacity 300ms ease, transform 300ms ease',
                  opacity: animating ? 0 : 1,
                  transform: animating
                    ? `translateX(${direction === 'right' ? '-40px' : '40px'})`
                    : 'translateX(0)',
                  border: '1px solid #e8e0d0',
                }}
              >
                {/* Page number top-right */}
                <span
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.72rem' }}
                  className="absolute top-4 right-5 text-stone-400"
                >
                  {page + 1} / {total}
                </span>

                {current && (
                  <div className="flex flex-col items-center text-center gap-4">
                    {/* Author */}
                    <p
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, fontSize: '1.05rem' }}
                      className="text-[#2d3228] mt-2"
                    >
                      {current.author_name}
                    </p>

                    {/* Date */}
                    <p
                      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
                      className="text-stone-400"
                    >
                      {formattedDate(current.created_at)}
                    </p>

                    {/* Message in Dancing Script */}
                    <p
                      style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600, fontSize: '1.2rem', lineHeight: 1.7 }}
                      className="text-stone-700 max-w-md whitespace-pre-wrap"
                    >
                      {current.message}
                    </p>

                    {/* Photo if present */}
                    {current.photo_url && (
                      <img
                        src={current.photo_url}
                        alt="Photo du message"
                        className="rounded-2xl object-cover max-h-48 max-w-full shadow-sm"
                      />
                    )}

                    {/* Decoration */}
                    <span style={{ fontSize: '1.4rem' }} className="mt-2">💌</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => go('prev')}
                disabled={page === 0}
                className="text-3xl text-[#4a5240] disabled:text-stone-300 transition cursor-pointer disabled:cursor-default select-none"
                aria-label="Page précédente"
              >
                ◀
              </button>
              <span
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem' }}
                className="text-stone-500"
              >
                Page {page + 1} / {total}
              </span>
              <button
                onClick={() => go('next')}
                disabled={page >= total - 1}
                className="text-3xl text-[#4a5240] disabled:text-stone-300 transition cursor-pointer disabled:cursor-default select-none"
                aria-label="Page suivante"
              >
                ▶
              </button>
            </div>
          </>
        )}
      </div>

    </>
  )
}
