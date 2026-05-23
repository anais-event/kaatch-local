'use client'

import { useState, useTransition } from 'react'
import { ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_ICONS, DEFAULT_TYPE_PERMISSIONS } from '@/lib/vendor-permissions'
import type { VendorPermissions, VendorPermissionKey } from '@/lib/vendor-permissions'

type Vendor = {
  id: string
  name: string
  category: string
  email: string | null
  phone: string | null
  permissions: VendorPermissions
  inviteToken: string
  vendorCode: string
  isSuspended: boolean
}

const CATEGORIES = Object.keys(DEFAULT_TYPE_PERMISSIONS).concat(['Autre'])

type BudgetSuggestion = { name: string; category: string }

type Props = {
  slug: string
  weddingId: string
  vendors: Vendor[]
  budgetSuggestions: BudgetSuggestion[]
  addAction: (fd: FormData) => Promise<void>
  updateAction: (fd: FormData) => Promise<void>
  deleteAction: (fd: FormData) => Promise<void>
}

export default function PrestatairesClient({ slug, weddingId, vendors, budgetSuggestions, addAction, updateAction, deleteAction }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [savedVendor, setSavedVendor] = useState<string | null>(null)

  function copyLink(token: string, vendorId: string) {
    const url = `${window.location.origin}/v/${token}`
    navigator.clipboard.writeText(url)
    setCopied(vendorId)
    setTimeout(() => setCopied(null), 2000)
  }

  function togglePermission(vendor: Vendor, key: VendorPermissionKey) {
    const newPerms = { ...vendor.permissions, [key]: !vendor.permissions[key] }
    const fd = new FormData()
    fd.set('id', vendor.id)
    fd.set('slug', slug)
    fd.set('field', 'permissions')
    fd.set('value', JSON.stringify(newPerms))
    startTransition(async () => {
      await updateAction(fd)
      setSavedVendor(vendor.id)
      setTimeout(() => setSavedVendor(null), 2000)
    })
  }

  function toggleSuspend(vendor: Vendor) {
    const fd = new FormData()
    fd.set('id', vendor.id)
    fd.set('slug', slug)
    fd.set('field', 'is_suspended')
    fd.set('value', String(!vendor.isSuspended))
    startTransition(() => updateAction(fd))
  }

  function handleDelete(vendorId: string) {
    const fd = new FormData()
    fd.set('id', vendorId)
    fd.set('slug', slug)
    startTransition(() => deleteAction(fd))
    setConfirmDelete(null)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.8rem' }}
                className="text-[#2d3228] mb-1">Prestataires</h1>
            <p className="text-stone-400" style={{ fontWeight: 300, fontSize: '0.85rem' }}>
              {"Gérez vos prestataires et leurs accès aux infos du mariage"}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
            style={{ fontWeight: 400 }}
          >
            + Ajouter
          </button>
        </div>

        {/* Add vendor form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
            <form action={async (fd) => {
              fd.set('slug', slug)
              fd.set('wedding_id', weddingId)
              await addAction(fd)
              setShowAdd(false)
            }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Nom *</label>
                  <input name="name" required placeholder="Ex: Studio Photo Martin"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>{"Catégorie *"}</label>
                  <select name="category" required
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>Email</label>
                  <input name="email" type="email" placeholder="contact@presta.fr"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1 block" style={{ fontWeight: 300 }}>{"Téléphone"}</label>
                  <input name="phone" type="tel" placeholder="06 12 34 56 78"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition"
                    style={{ fontWeight: 300 }} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition cursor-pointer"
                  style={{ fontWeight: 300 }}>Annuler</button>
                <button type="submit"
                  className="px-4 py-2 bg-[#4a5240] text-white rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                  style={{ fontWeight: 400 }}>Ajouter</button>
              </div>
            </form>
          </div>
        )}

        {/* Budget suggestions */}
        {budgetSuggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4">
            <p className="text-xs text-amber-700 mb-3 flex items-center gap-1.5" style={{ fontWeight: 400 }}>
              💡 Prestataires retenus dans le budget — pas encore ajoutés ici
            </p>
            <div className="flex flex-wrap gap-2">
              {budgetSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const fd = new FormData()
                    fd.set('slug', slug)
                    fd.set('wedding_id', weddingId)
                    fd.set('name', s.name)
                    fd.set('category', s.category)
                    startTransition(() => addAction(fd))
                  }}
                  className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs hover:border-amber-400 hover:bg-amber-50 transition cursor-pointer"
                  style={{ fontWeight: 300 }}
                >
                  <span className="text-[#2d3228]" style={{ fontWeight: 400 }}>{s.name}</span>
                  <span className="text-stone-400">{s.category}</span>
                  <span className="text-amber-500 ml-1">+ Importer</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vendor list */}
        {vendors.length === 0 && !showAdd && budgetSuggestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-16 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 300 }}
               className="text-stone-300 mb-2">Aucun prestataire</p>
            <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
              {"Ajoutez vos prestataires pour leur donner accès aux infos du mariage"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(v => {
              const isExpanded = expanded === v.id
              return (
                <div key={v.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
                  v.isSuspended ? 'border-red-200 opacity-60' : 'border-stone-100'
                }`}>
                  {/* Header row */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-stone-50/50 transition"
                    onClick={() => setExpanded(isExpanded ? null : v.id)}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#4a5240]/10 text-[#4a5240] flex items-center justify-center shrink-0 text-sm"
                         style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#2d3228] truncate" style={{ fontWeight: 400 }}>{v.name}</p>
                      <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>{v.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.isSuspended && (
                        <span className="text-[10px] bg-red-50 text-red-400 px-2 py-0.5 rounded-full" style={{ fontWeight: 300 }}>
                          {"Suspendu"}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-300" style={{ fontWeight: 300 }}>
                        {Object.values(v.permissions).filter(Boolean).length} {"accès"}
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                           className={`w-4 h-4 text-stone-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 px-5 py-4 bg-stone-50/30 space-y-4">

                      {/* Contact info */}
                      {(v.email || v.phone) && (
                        <div className="flex gap-4 flex-wrap text-xs text-stone-500" style={{ fontWeight: 300 }}>
                          {v.email && <span>{"📧"} {v.email}</span>}
                          {v.phone && <span>{"📞"} {v.phone}</span>}
                        </div>
                      )}

                      {/* Vendor code */}
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2" style={{ fontWeight: 400 }}>
                          Code prestataire
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#f5f0e8] border border-stone-200 rounded-lg px-4 py-2.5 text-lg tracking-[0.3em] text-[#2C3B2E] text-center select-all"
                               style={{ fontWeight: 600, fontFamily: ‘monospace’ }}>
                            {v.vendorCode}
                          </div>
                          <p className="text-[10px] text-stone-400" style={{ fontWeight: 300, lineHeight: 1.4 }}>
                            Communiquez ce code au prestataire.<br />
                            Il le saisit sur <strong>kaatch.fr/prestataire/rejoindre</strong>
                          </p>
                        </div>
                      </div>

                      {/* Invite link */}
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2" style={{ fontWeight: 400 }}>
                          {"Ou lien d’accès direct"}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-500 truncate"
                               style={{ fontWeight: 300 }}>
                            {`${typeof window !== 'undefined' ? window.location.origin : ''}/v/${v.inviteToken}`}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyLink(v.inviteToken, v.id) }}
                            className="px-3 py-2 bg-[#4a5240] text-white rounded-lg text-xs hover:bg-[#2d3228] transition cursor-pointer shrink-0"
                            style={{ fontWeight: 400 }}
                          >
                            {copied === v.id ? "Copié !" : "Copier"}
                          </button>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] text-stone-400 uppercase tracking-wider" style={{ fontWeight: 400 }}>
                            {"Accès aux informations"}
                          </p>
                          {savedVendor === v.id && (
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1" style={{ fontWeight: 400 }}>
                              ✓ Enregistré
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ALL_PERMISSIONS.map(key => {
                            const on = v.permissions[key] === true
                            return (
                              <button
                                key={key}
                                onClick={(e) => { e.stopPropagation(); togglePermission(v, key) }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition cursor-pointer ${
                                  on
                                    ? 'bg-[#4a5240]/10 border-[#4a5240]/30 text-[#4a5240]'
                                    : 'bg-white border-stone-200 text-stone-400'
                                }`}
                                style={{ fontWeight: on ? 400 : 300 }}
                              >
                                <span>{PERMISSION_ICONS[key]}</span>
                                <span className="flex-1 text-left truncate">{PERMISSION_LABELS[key]}</span>
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  on ? 'border-[#4a5240] bg-[#4a5240]' : 'border-stone-300'
                                }`}>
                                  {on && (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSuspend(v) }}
                          className={`text-xs px-3 py-1.5 rounded-lg transition cursor-pointer ${
                            v.isSuspended
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                          style={{ fontWeight: 300 }}
                        >
                          {v.isSuspended ? "Réactiver" : "Suspendre"}
                        </button>

                        {confirmDelete === v.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400" style={{ fontWeight: 300 }}>Confirmer ?</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }}
                              className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition cursor-pointer"
                              style={{ fontWeight: 400 }}
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(null) }}
                              className="text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
                              style={{ fontWeight: 300 }}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(v.id) }}
                            className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer"
                            style={{ fontWeight: 300 }}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
