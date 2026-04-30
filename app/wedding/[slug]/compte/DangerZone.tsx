'use client'

import { useState } from 'react'

export default function DangerZone({
  weddingName,
  isSuspended,
  suspendAction,
  deleteAction,
}: {
  weddingName: string
  isSuspended: boolean
  suspendAction: () => Promise<void>
  deleteAction: () => Promise<void>
}) {
  const [showDelete, setShowDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  return (
    <div className="space-y-4 mt-4">
      {/* Suspension */}
      <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-stone-200">
        <div>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '0.85rem' }}
             className="text-stone-700 mb-0.5">
            {isSuspended ? 'Réactiver l\'espace invités' : 'Suspendre l\'espace invités'}
          </p>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }}
             className="text-stone-400">
            {isSuspended
              ? 'Vos invités pourront à nouveau accéder à leur espace.'
              : 'Vos invités verront un message "bientôt disponible". Vous conservez l\'accès.'}
          </p>
        </div>
        <form action={suspendAction} className="shrink-0">
          <button type="submit"
            className={`px-4 py-1.5 rounded-full text-xs transition cursor-pointer ${
              isSuspended
                ? 'bg-[#4a5240] text-white hover:bg-[#2d3228]'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            {isSuspended ? 'Réactiver' : 'Suspendre'}
          </button>
        </form>
      </div>

      {/* Suppression */}
      <div className="p-4 rounded-xl border border-red-100">
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 400, fontSize: '0.85rem' }}
           className="text-red-500 mb-0.5">
          Supprimer le mariage
        </p>
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }}
           className="text-stone-400 mb-3">
          Supprime définitivement toutes les données — invités, photos, messages, programme. Cette action est irréversible.
        </p>

        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="text-xs text-red-400 hover:text-red-600 transition underline underline-offset-2 cursor-pointer"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Supprimer mon mariage
          </button>
        ) : (
          <div className="space-y-3">
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
               className="text-stone-500">
              Tapez <strong className="font-medium text-stone-700">{weddingName}</strong> pour confirmer
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={weddingName}
              className="w-full border border-red-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-400 transition text-stone-700 bg-white text-sm"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
            />
            <div className="flex gap-2">
              <form action={deleteAction}>
                <button type="submit"
                  disabled={confirmText !== weddingName}
                  className="bg-red-500 text-white px-5 py-2 rounded-full text-xs hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  Supprimer définitivement
                </button>
              </form>
              <button onClick={() => { setShowDelete(false); setConfirmText('') }}
                className="bg-stone-100 text-stone-500 px-5 py-2 rounded-full text-xs hover:bg-stone-200 transition cursor-pointer"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
