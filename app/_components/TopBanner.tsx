'use client'

import { useEffect, useState } from 'react'

const LAUNCH_DATE = new Date('2025-06-01')
const START_SPOTS = 100
const FLOOR = 23

function getSpots(): number {
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24))
  const hour = now.getHours()
  let base = START_SPOTS - Math.floor(daysSince * 1.15)
  const seed = daysSince * 24 + hour
  const jitter = ((seed * 7 + 13) % 5) - 2 // -2 à +2
  base += jitter
  return Math.max(FLOOR, Math.min(START_SPOTS, base))
}

export default function TopBanner() {
  const [display, setDisplay] = useState<number | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('has-banner')
    return () => document.documentElement.classList.remove('has-banner')
  }, [])

  useEffect(() => {
    const spots = getSpots()
    // Animation d'entrée : descend de spots+3 vers spots
    let current = spots + 3
    setDisplay(current)
    const intro = setInterval(() => {
      current--
      setDisplay(current)
      if (current <= spots) clearInterval(intro)
    }, 120)

    // Après l'intro, décrémente aléatoirement toutes les 3–8 min
    let liveValue = spots
    const scheduleNext = () => {
      const delay = (180 + Math.random() * 300) * 1000 // 3–8 min
      return setTimeout(() => {
        liveValue = Math.max(FLOOR, liveValue - 1)
        setDisplay(liveValue)
        timer = scheduleNext()
      }, delay)
    }
    let timer = scheduleNext()

    return () => {
      clearInterval(intro)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 110,
        background: 'linear-gradient(135deg, #2d3228 0%, #3a4233 50%, #4d3c2e 100%)',
        padding: '0.55rem 2.5rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        fontWeight: 400,
        color: 'rgba(245,240,232,0.85)',
        letterSpacing: '0.01em',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ marginRight: '0.4rem' }}>🇫🇷</span>
      La plateforme mariage en France —{' '}
      <a
        href="/auth"
        style={{
          color: '#f5f0e8',
          fontWeight: 600,
          borderBottom: '1px solid rgba(245,240,232,0.3)',
          paddingBottom: 1,
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.7)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.3)' }}
      >
        {display !== null ? `${display} places gratuites restantes` : '…'}
      </a>
    </div>
  )
}
