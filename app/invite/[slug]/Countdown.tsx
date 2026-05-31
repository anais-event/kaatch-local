'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function Countdown({ weddingDate, dark = false }: { weddingDate: string; dark?: boolean }) {
  const t = useTranslations('invite.countdown')
  const [diff, setDiff] = useState({ months: 0, days: 0, hours: 0, minutes: 0, past: false })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const target = new Date(weddingDate)
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
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [weddingDate])

  if (diff.past) return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#4a5240] text-white text-center justify-center">
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>✨ {t('today')}</span>
    </div>
  )

  const daysLabel = t('days')
  const units = [
    { value: diff.months, label: t('months'), key: 'months' },
    { value: diff.days, label: daysLabel, key: 'days' },
    { value: diff.hours, label: t('hours'), key: 'hours' },
    { value: diff.minutes, label: t('min'), key: 'min' },
  ].filter(u => u.value > 0 || u.key === 'days')

  if (dark) return (
    <div className="text-center">
      <p style={{ fontWeight: 300, fontSize: '0.62rem', letterSpacing: '0.25em', fontFamily: 'var(--font-lato)' }}
        className="text-white/40 uppercase mb-4">
        {t('onlyLeft')}
      </p>
      <div className="flex items-end justify-center gap-3">
        {units.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2.8rem, 9vw, 4rem)', lineHeight: 1, color: '#fff' }}>
              {String(value).padStart(2, '0')}
            </p>
            <p style={{ fontWeight: 300, fontSize: '0.58rem', letterSpacing: '0.18em', fontFamily: 'var(--font-lato)' }}
              className="text-white/40 uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-5 rounded-2xl bg-white/80">
      <p style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }} className="text-stone-400 uppercase mb-3 text-center">{t('countdown')}</p>
      <div className="grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${units.length}, 1fr)` }}>
        {units.map(({ value, label }) => (
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
