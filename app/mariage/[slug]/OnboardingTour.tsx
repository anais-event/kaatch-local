'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronDown } from 'lucide-react'

interface OnboardingStep {
  id: string
  label: string
  description: string
  href: string
  done?: boolean
}

export default function OnboardingTour({ slug, guestCount, vendorCount }: { slug: string; guestCount: number; vendorCount: number }) {
  const [open, setOpen] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const steps: OnboardingStep[] = [
    {
      id: 'imagine',
      label: 'Imaginez',
      description: 'Renseigner date, lieu et message couple',
      href: `/mariage/${slug}/edit`,
    },
    {
      id: 'prepare',
      label: 'Préparez',
      description: 'Ajouter vos prestataires clés',
      href: `/mariage/${slug}/prestataires`,
    },
    {
      id: 'invite',
      label: 'Invitez',
      description: `Importer et lister vos invités`,
      href: `/mariage/${slug}/guests`,
    },
    {
      id: 'coordinate',
      label: 'Coordonnez',
      description: 'Valider les confirmations',
      href: `/mariage/${slug}/guests`,
    },
  ]

  // Init from localStorage
  useEffect(() => {
    const storageKey = `onboarding_${slug}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setCompletedSteps(new Set(JSON.parse(stored)))
    } else {
      // First visit
      setOpen(true)
    }
  }, [slug])

  // Auto-mark steps based on data
  useEffect(() => {
    const newCompleted = new Set(completedSteps)

    // Mark "Prepare" done if vendors exist
    if (vendorCount > 0) newCompleted.add('prepare')
    // Mark "Invite" done if guests exist
    if (guestCount > 0) newCompleted.add('invite')

    if (newCompleted.size > completedSteps.size) {
      setCompletedSteps(newCompleted)
      localStorage.setItem(`onboarding_${slug}`, JSON.stringify(Array.from(newCompleted)))
    }
  }, [guestCount, vendorCount, slug, completedSteps])

  const progress = Math.round((completedSteps.size / steps.length) * 100)
  const allDone = completedSteps.size === steps.length

  if (!open) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚀</span>
            <h2 style={{ fontWeight: 600, fontSize: '1rem' }} className="text-green-900">
              Premiers pas — Gagnez des crédits !
            </h2>
          </div>
          <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-green-700 mb-4">
            Complétez ces étapes pour démarrer votre mariage
          </p>

          {/* Progress bar */}
          <div className="w-full bg-green-200 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-green-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-green-700 mb-4">
            {completedSteps.size}/{steps.length} étapes • {progress}% complété
          </p>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="p-2 hover:bg-green-100 rounded-lg transition shrink-0"
        >
          <X className="w-5 h-5 text-green-700" />
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => {
          const isDone = completedSteps.has(step.id)
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`block p-4 rounded-xl border transition ${
                isDone
                  ? 'bg-white border-green-200 opacity-60'
                  : 'bg-white border-green-100 hover:border-green-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-green-600 border-green-600'
                      : 'border-2 border-green-300'
                  }`}
                >
                  {isDone && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p
                    style={{ fontWeight: 600, fontSize: '0.9rem' }}
                    className={isDone ? 'text-green-600 line-through' : 'text-green-900'}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{ fontWeight: 400, fontSize: '0.8rem' }}
                    className="text-green-700 opacity-75"
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {allDone && (
        <div className="mt-4 p-3 bg-green-100 rounded-xl">
          <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-green-900">
            ✨ Bien joué ! Vous pouvez explorer tous les autres outils maintenant.
          </p>
        </div>
      )}
    </div>
  )
}
