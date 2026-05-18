'use client'

import { useEffect, useState } from 'react'

interface ResultDisplayProps {
  total: number
  perGuest: number
  message: string
  color: { bg: string; text: string }
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let animationFrameId: number
    let currentValue = displayValue
    const targetValue = value
    const duration = 400
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      currentValue = Math.floor(displayValue + (targetValue - displayValue) * progress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    if (value !== displayValue) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [value, displayValue])

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(displayValue)
}

export default function ResultDisplay({
  total,
  perGuest,
  message,
  color,
}: ResultDisplayProps) {
  return (
    <div className={`bg-gradient-to-br ${color.bg} rounded-2xl border border-stone-200 p-8 shadow-md`}>
      {/* Main total */}
      <div className="text-center mb-8">
        <p className="text-sm text-stone-600 mb-2 uppercase tracking-wide font-medium">Budget total estimé</p>
        <div className={`text-5xl md:text-6xl font-light ${color.text} mb-2`}>
          <AnimatedNumber value={total} />
        </div>
      </div>

      {/* Per guest */}
      <div className="bg-white/60 rounded-lg p-4 mb-6 text-center">
        <p className="text-xs text-stone-600 uppercase tracking-wide">Par invité</p>
        <p className="text-2xl font-light text-stone-800">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
          }).format(perGuest)}
        </p>
      </div>

      {/* Message */}
      <div className="bg-white/50 rounded-lg p-4 text-center">
        <p className={`text-base font-medium ${color.text}`}>{message}</p>
      </div>
    </div>
  )
}
