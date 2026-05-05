'use client'
import { useEffect, useState } from 'react'

type Diff = { months: number; days: number; hours: number; minutes: number; past: boolean }

export default function Countdown({ weddingDate, compact = false, small = false }: { weddingDate: string; compact?: boolean; small?: boolean }) {
  const [diff, setDiff] = useState<Diff | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      // Parser la date locale (évite le décalage UTC)
      const [y, m, d] = weddingDate.split('-').map(Number)
      const target = new Date(y, m - 1, d, 0, 0, 0)
      const delta = target.getTime() - now.getTime()

      if (delta <= 0) {
        setDiff({ months: 0, days: 0, hours: 0, minutes: 0, past: true })
        return
      }
      const totalMinutes = Math.floor(delta / (1000 * 60))
      const minutes = totalMinutes % 60
      const totalHours = Math.floor(totalMinutes / 60)
      const hours = totalHours % 24
      const totalDays = Math.floor(totalHours / 24)
      const months = Math.floor(totalDays / 30)
      const days = totalDays % 30
      setDiff({ months, days, hours, minutes, past: false })
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [weddingDate])

  // Rien avant hydration (évite l'affichage de "00 Jours")
  if (!diff) return null

  if (diff.past) {
    if (compact) return (
      <div className="text-white/90 text-center">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>✨ C'est aujourd'hui !</span>
      </div>
    )
    return (
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#4a5240] text-white text-center justify-center">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>✨ C'est aujourd'hui !</span>
      </div>
    )
  }

  const units = [
    { value: diff.months, label: 'mois' },
    { value: diff.days, label: diff.days > 1 ? 'jours' : 'jour' },
    { value: diff.hours, label: 'h' },
    { value: diff.minutes, label: 'min' },
  ].filter(u => u.value > 0)

  const displayed = units.length > 0 ? units : [{ value: diff.days, label: 'jour' }]

  // Version mini pour dashboard mariés
  if (small) {
    return (
      <div className="flex items-center justify-center gap-5 py-3 px-4 bg-white/80 rounded-2xl">
        {displayed.map(({ value, label }) => (
          <div key={label} className="flex items-baseline gap-1">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', lineHeight: 1 }} className="text-[#4a5240]">{value}</span>
            <span style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.08em' }} className="text-stone-400 uppercase">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  // Version compacte (dans le hero de la cover)
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-white/90">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3 shrink-0 opacity-70">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span style={{ fontWeight: 300, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
          {displayed.map(({ value, label }) => `${value} ${label}`).join(' ')}
        </span>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-white/80">
      <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase mb-3 text-center">
        Compte à rebours
      </p>
      <div className="grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${displayed.length}, 1fr)` }}>
        {displayed.map(({ value, label }) => (
          <div key={label} className="bg-[#f5f0e8] rounded-xl py-3">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2rem', lineHeight: 1 }} className="text-[#4a5240]">
              {String(value).padStart(2, '0')}
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.1em' }} className="text-stone-400 uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
