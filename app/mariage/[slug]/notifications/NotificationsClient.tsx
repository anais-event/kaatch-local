'use client'

import { useState } from 'react'

type NotifKey = 'new_rsvp' | 'new_photo' | 'new_message' | 'new_guestbook' | 'order_shipped'

const NOTIFS: { key: NotifKey; icon: string; label: string; desc: string }[] = [
  { key: 'new_rsvp',      icon: '💌', label: 'Nouvelle réponse RSVP',      desc: 'Quand un invité confirme ou décline' },
  { key: 'new_photo',     icon: '📸', label: 'Nouvelle photo',              desc: 'Quand un invité partage une photo' },
  { key: 'new_message',   icon: '💬', label: 'Nouveau message',             desc: 'Quand un invité envoie un message' },
  { key: 'new_guestbook', icon: '📖', label: 'Message livre d\'or',         desc: 'Quand un invité écrit dans le livre d\'or' },
  { key: 'order_shipped', icon: '📦', label: 'Commande expédiée',           desc: 'Quand votre papeterie est en route' },
]

export default function NotificationsClient({
  slug, userEmail, notificationEmail, prefs, savePrefs,
}: {
  slug: string
  userEmail: string
  notificationEmail: string
  prefs: Record<string, boolean>
  savePrefs: (fd: FormData) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    await savePrefs(fd)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-xl mx-auto px-4 py-8 pb-24">

        <a href={`/mariage/${slug}`}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
          style={{ fontWeight: 300, fontSize: '0.75rem' }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tableau de bord
        </a>

        <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">
          Notifications email
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500 mb-6">
          Choisissez quand recevoir des emails de la part de Kaatch.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email de destination */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228] mb-3">
              Adresse de réception
            </p>
            <div>
              <label style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.06em' }}
                className="text-stone-500 uppercase block mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="notification_email"
                defaultValue={notificationEmail || userEmail}
                placeholder={userEmail}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-[#2d3228] placeholder-stone-300 focus:outline-none focus:border-[#4a5240] transition-colors"
                style={{ fontWeight: 300, fontSize: '0.82rem' }}
              />
              <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 mt-1.5">
                Par défaut : votre adresse de compte ({userEmail})
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-50">
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }} className="text-[#2d3228]">
                Événements
              </p>
            </div>
            {NOTIFS.map((n, i) => (
              <label key={n.key}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-stone-50/50 transition-colors ${i < NOTIFS.length - 1 ? 'border-b border-stone-50' : ''}`}>
                <span className="text-xl flex-shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 500, fontSize: '0.85rem' }} className="text-[#2d3228]">{n.label}</p>
                  <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-0.5">{n.desc}</p>
                </div>
                <div className="flex-shrink-0">
                  <input type="checkbox" name={n.key} defaultChecked={prefs[n.key] !== false}
                    className="sr-only peer" id={`pref-${n.key}`} />
                  <div
                    className="relative rounded-full transition-all duration-200 peer-checked:bg-[#4a5240] bg-stone-200 cursor-pointer"
                    style={{ width: 40, height: 22 }}
                    onClick={() => {
                      const cb = document.getElementById(`pref-${n.key}`) as HTMLInputElement
                      if (cb) cb.checked = !cb.checked
                    }}
                  >
                    <span className="absolute rounded-full bg-white shadow-sm transition-all duration-200 peer-checked:left-[20px]"
                      style={{ width: 16, height: 16, top: 3, left: 3 }} />
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl text-white transition-all"
            style={{ background: saved ? '#4a7a50' : '#4a5240', fontWeight: 400, fontSize: '0.88rem' }}>
            {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé ✓' : 'Enregistrer mes préférences'}
          </button>
        </form>
      </div>
    </div>
  )
}
