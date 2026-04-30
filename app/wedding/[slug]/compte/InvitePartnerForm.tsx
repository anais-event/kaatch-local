'use client'

import { useState } from 'react'

export default function InvitePartnerForm({
  currentCoOwnerEmail,
  inviteAction,
  removeAction,
}: {
  currentCoOwnerEmail: string | null
  inviteAction: (formData: FormData) => Promise<void>
  removeAction: () => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (currentCoOwnerEmail) {
    return (
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between bg-[#f5f0e8] rounded-xl px-4 py-3">
          <div>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.1em' }}
               className="text-stone-400 uppercase mb-0.5">Partenaire invité(e)</p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '0.9rem' }}
               className="text-[#4a5240]">{currentCoOwnerEmail}</p>
          </div>
          <span className="text-lg">✓</span>
        </div>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }}
           className="text-stone-400">
          Votre partenaire peut accéder à cet espace en se connectant avec cette adresse email.
        </p>
        <form action={removeAction}>
          <button type="submit"
            className="text-xs text-stone-400 hover:text-red-400 transition underline underline-offset-2 cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Retirer l&apos;accès
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
         className="text-stone-500">
        Invitez votre partenaire à gérer le mariage avec vous. Il ou elle devra créer un compte avec cette adresse email sur kaatch.fr.
      </p>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#4a5240] text-white px-5 py-2 rounded-full text-sm hover:bg-[#2d3228] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Inviter mon partenaire
        </button>
      ) : (
        <form action={inviteAction} className="space-y-3">
          <div>
            <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em' }}
                   className="block text-stone-400 uppercase mb-1.5">
              Adresse email du partenaire
            </label>
            <input
              type="email"
              name="co_owner_email"
              required
              placeholder="prenom@exemple.fr"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2 rounded-full text-sm hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Envoyer l&apos;invitation
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-stone-100 text-stone-500 px-5 py-2 rounded-full text-sm hover:bg-stone-200 transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
