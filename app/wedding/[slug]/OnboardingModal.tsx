'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    icon: '✦',
    title: 'Félicitations !',
    desc: 'Bienvenue sur l\'app qui vous simplifie vraiment l\'organisation du plus beau jour de votre vie. En quelques minutes, tout est au même endroit.',
  },
  {
    icon: '👥',
    title: 'Commencez par vos invités',
    desc: 'Importez votre liste depuis Excel ou Google Sheets en un clic. Gérez les RSVP, les régimes alimentaires, les tables — tout depuis un seul tableau de bord.',
  },
  {
    icon: '📅',
    title: 'Construisez votre journée',
    desc: 'Ajoutez chaque moment du programme avec l\'heure, le lieu et une description. Vos invités voient le déroulé en temps réel, avec la carte et l\'itinéraire.',
  },
  {
    icon: '📸',
    title: 'Le jour J, vivez-le pleinement',
    desc: 'Vos invités uploadent leurs photos directement dans l\'app, créent des groupes de discussion et retrouvent toutes les infos sans vous déranger.',
  },
  {
    icon: '💌',
    title: 'Un lien, c\'est tout',
    desc: 'Partagez un simple lien ou un QR code — vos invités accèdent à tout sans créer de compte. Imprimez-le sur les tables le jour J.',
  },
]

export default function OnboardingModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const storageKey = `kaatch_onboarded_${slug}`

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      setTimeout(() => setOpen(true), 600)
    }
  }, [])

  function close() {
    localStorage.setItem(storageKey, 'true')
    setOpen(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else close()
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">

        {/* Barre de progression */}
        <div className="flex gap-1 p-4">
          {STEPS.map((_, i) => (
            <div key={i}
              className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#4a5240]' : 'bg-stone-100'}`} />
          ))}
        </div>

        {/* Contenu */}
        <div className="px-8 pb-8 text-center">
          <div className="text-4xl mb-5">{current.icon}</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.5rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-3">{current.title}</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.7 }}
             className="text-stone-500 mb-8">{current.desc}</p>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 border border-stone-200 text-stone-400 py-2.5 rounded-xl text-sm hover:border-stone-300 transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                Précédent
              </button>
            )}
            <button onClick={next}
              className="flex-1 bg-[#4a5240] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              {step < STEPS.length - 1 ? 'Suivant' : 'C\'est parti !'}
            </button>
          </div>

          {step < STEPS.length - 1 && (
            <button onClick={close}
              className="mt-4 text-xs text-stone-300 hover:text-stone-400 transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              Passer l'introduction
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
