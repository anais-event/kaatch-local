'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    icon: '✦',
    title: 'Bienvenue sur Kaatch',
    desc: 'Votre espace pour organiser votre mariage et connecter vos invités. Voici comment ça fonctionne.',
  },
  {
    icon: '📋',
    title: 'Organisez depuis le tableau de bord',
    desc: 'Ajoutez vos invités, gérez le programme, vos prestataires et vos hébergements depuis les cartes du tableau de bord.',
  },
  {
    icon: '💌',
    title: 'Partagez avec vos invités',
    desc: 'Dans "Vue invité ↗", récupérez le lien ou le QR code à partager. Vos invités accèdent sans créer de compte.',
  },
  {
    icon: '📸',
    title: 'Galerie & messagerie partagées',
    desc: 'Vos invités peuvent uploader des photos et créer des groupes de discussion. Tout s\'affiche en temps réel.',
  },
  {
    icon: '✍️',
    title: 'Le mot des mariés',
    desc: 'Écrivez un message personnel et vos infos pratiques — ils s\'affichent dès que vos invités arrivent sur l\'app.',
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
