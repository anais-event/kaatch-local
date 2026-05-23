'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronUp, ChevronDown } from 'lucide-react'

interface Step {
  id: string
  label: string
  description: string
  href: string
}

export default function OnboardingTour({ slug, guestCount, vendorCount }: {
  slug: string
  guestCount: number
  vendorCount: number
}) {
  const [visible, setVisible] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const steps: Step[] = [
    { id: 'imagine',     label: 'Imaginer',    description: 'Renseigner date, lieu et message couple',  href: `/mariage/${slug}/edit` },
    { id: 'prepare',     label: 'Préparer',    description: 'Ajouter vos prestataires clés',             href: `/mariage/${slug}/prestataires` },
    { id: 'invite',      label: 'Inviter',     description: 'Importer et lister vos invités',             href: `/mariage/${slug}/guests` },
    { id: 'coordinate',  label: 'Coordonner',  description: 'Valider les premières confirmations',        href: `/mariage/${slug}/guests` },
  ]

  useEffect(() => {
    const key = `onboarding_done_${slug}`
    if (localStorage.getItem(key) === 'true') return
    const storedCompleted = localStorage.getItem(`onboarding_completed_${slug}`)
    const init = storedCompleted ? new Set<string>(JSON.parse(storedCompleted)) : new Set<string>()
    if (vendorCount > 0) init.add('prepare')
    if (guestCount > 0) init.add('invite')
    setCompleted(init)
    setVisible(true)
  }, [slug, guestCount, vendorCount])

  function markDone(id: string) {
    const next = new Set(completed)
    next.add(id)
    setCompleted(next)
    localStorage.setItem(`onboarding_completed_${slug}`, JSON.stringify(Array.from(next)))
  }

  function close() {
    localStorage.setItem(`onboarding_done_${slug}`, 'true')
    setVisible(false)
  }

  if (!visible) return null

  const progress = Math.round((completed.size / steps.length) * 100)

  return (
    <div className="fixed bottom-6 right-6 z-[90] w-72 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-[#4a5240] cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-base">🚀</span>
          <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.85rem' }} className="text-white truncate">
            Premiers pas
          </span>
          <span style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-white/70 shrink-0">
            {progress}%
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {collapsed
            ? <ChevronUp className="w-4 h-4 text-white/70" />
            : <ChevronDown className="w-4 h-4 text-white/70" />
          }
          <button
            onClick={e => { e.stopPropagation(); close() }}
            className="ml-1 p-0.5 hover:bg-white/20 rounded transition"
          >
            <X className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!collapsed && (
        <div className="h-1 bg-stone-100">
          <div
            className="h-full bg-[#4a5240] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Steps */}
      {!collapsed && (
        <div className="p-3 space-y-1.5">
          {steps.map(step => {
            const done = completed.has(step.id)
            return (
              <Link
                key={step.id}
                href={step.href}
                onClick={() => markDone(step.id)}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                  done
                    ? 'opacity-50'
                    : 'hover:bg-stone-50'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300'
                }`}>
                  {done && (
                    <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 500, fontSize: '0.82rem' }}
                    className={done ? 'text-stone-400 line-through' : 'text-stone-800'}>
                    {step.label}
                  </p>
                  <p style={{ fontWeight: 300, fontSize: '0.73rem' }} className="text-stone-400">
                    {step.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
