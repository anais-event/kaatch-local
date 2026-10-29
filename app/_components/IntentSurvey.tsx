'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isPublicPath, SURVEY } from '@/lib/analytics-cockpit'
import { trackSurveyShown, trackSurveyAnswer } from '@/lib/analytics'

// Micro-sondage d'intention — question unique, réponse en 1 clic, 100% facultatif.
// Règles produit :
//  - N'apparaît que sur les pages PUBLIQUES (jamais dans un espace marié/invité/admin).
//  - S'affiche après 5 s, une seule fois par visiteur (localStorage), jamais relancé après réponse ou fermeture.
//  - Ne bloque jamais l'accès à l'outil : carte ancrée en bas, fermable, aucun overlay opaque.
//  - Aucune PII : on émet seulement des ids d'option (enum fermé) via trackSurveyAnswer.

const SEEN_KEY = `kaatch_survey_${SURVEY.id}` // présence = déjà vu/répondu/fermé → ne plus montrer
const DELAY_MS = 5000

function alreadySeen(): boolean {
  try { return localStorage.getItem(SEEN_KEY) != null } catch { return true }
}
function markSeen(value: string) {
  try { localStorage.setItem(SEEN_KEY, value) } catch {}
}

export default function IntentSurvey() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [answered, setAnswered] = useState(false)
  const shownTracked = useRef(false)

  useEffect(() => {
    // Gate : pages publiques uniquement + pas déjà vu.
    if (!isPublicPath(pathname) || alreadySeen()) return
    const t = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [pathname])

  // Émet survey_shown une seule fois, à la 1re ouverture.
  useEffect(() => {
    if (open && !shownTracked.current) {
      shownTracked.current = true
      trackSurveyShown(SURVEY.id)
    }
  }, [open])

  if (!open) return null

  const close = () => { markSeen('dismissed'); setOpen(false) }
  const answer = (id: string) => {
    markSeen('answered')
    trackSurveyAnswer(SURVEY.id, id)
    setAnswered(true)
    setTimeout(() => setOpen(false), 1600)
  }

  return (
    <>
      <style>{`
        @keyframes kaatchSurveyIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        role="dialog"
        aria-label="Micro-sondage Kaatch"
        className="fixed z-[60] inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[360px]"
        style={{ animation: 'kaatchSurveyIn 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          {/* liseré sauge */}
          <div className="h-1 bg-[#4a5240]" />
          <div className="p-5">
            {answered ? (
              <div className="py-3 text-center">
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.35rem', color: '#2d3228', lineHeight: 1.1 }}>
                  Merci&nbsp;!
                </p>
                <p className="text-stone-500 text-sm mt-1" style={{ fontWeight: 300 }}>
                  Votre réponse nous aide à améliorer Kaatch.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-[#4a5240] text-[0.68rem] uppercase tracking-widest" style={{ fontWeight: 600 }}>
                    Micro-sondage
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Fermer le sondage"
                    className="-mt-1 -mr-1 w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.3rem', color: '#2d3228', lineHeight: 1.15 }}>
                  {SURVEY.question}
                </h2>
                <p className="text-stone-500 text-xs mt-1.5 mb-3.5" style={{ fontWeight: 300 }}>
                  {SURVEY.intro}
                </p>
                <div className="flex flex-col gap-1.5">
                  {SURVEY.options.map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => answer(o.id)}
                      className="group flex items-center gap-2.5 text-left rounded-xl border border-stone-200 px-3 py-2.5 hover:border-[#4a5240] hover:bg-[#4a5240]/5 transition"
                    >
                      <span className="text-base leading-none shrink-0">{o.emoji}</span>
                      <span className="text-stone-700 text-sm group-hover:text-[#2d3228]" style={{ fontWeight: 400 }}>
                        {o.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
