'use client'

import { useState, useRef, useCallback } from 'react'

export default function CoverPositionPicker({
  imageUrl,
  defaultPosition,
}: {
  imageUrl: string
  defaultPosition: number
}) {
  const [position, setPosition] = useState(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const compute = useCallback((clientY: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const pct = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)))
    setPosition(pct)
  }, [])

  return (
    <div>
      <input type="hidden" name="cover_position_y" value={position} />

      <div
        ref={ref}
        className="relative w-full h-52 overflow-hidden rounded-xl select-none"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={e => { setDragging(true); compute(e.clientY) }}
        onMouseMove={e => { if (dragging) compute(e.clientY) }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={e => { setDragging(true); compute(e.touches[0].clientY) }}
        onTouchMove={e => { e.preventDefault(); if (dragging) compute(e.touches[0].clientY) }}
        onTouchEnd={() => setDragging(false)}
      >
        <img
          src={imageUrl}
          alt="Aperçu"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none transition-none"
          style={{ objectPosition: `center ${position}%` }}
        />

        {/* Guide line */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
        >
          <div className="h-px bg-white/60 w-full" />
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-stone-500 text-[11px] px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap"
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ↕ glisser pour recadrer
          </div>
        </div>

        {/* Overlay lors du drag */}
        {dragging && <div className="absolute inset-0 bg-black/5 pointer-events-none" />}
      </div>

      <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem' }}
         className="text-stone-300 mt-1.5">
        Position : {position}% — sauvegardez pour appliquer
      </p>
    </div>
  )
}
