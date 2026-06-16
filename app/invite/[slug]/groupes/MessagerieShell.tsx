'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Group = {
  id: string
  name: string
  created_by: string
  lastMsg: { content: string; author_name: string; created_at: string } | null
}

export default function MessagerieShell({
  slug,
  groups,
  guestName,
  weddingId,
  children,
}: {
  slug: string
  groups: Group[]
  guestName: string
  weddingId: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isRoot = pathname === `/invite/${slug}/groupes`
  const [newGroup, setNewGroup] = useState('')
  const [creating, setCreating] = useState(false)

  const SUGGESTED = ['@EntreTemoinsMariee', '@EntreTemoinsMarie', '@Covoiturage', '@Cadeaux', '@Afterparty', '@Surprises']

  async function handleCreate(name: string) {
    if (!name.trim()) return
    setCreating(true)
    await fetch(`/api/groupes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, author: guestName, weddingId }),
    })
    setCreating(false)
    window.location.reload()
  }

  return (
    // Sur desktop: flex horizontal. Sur mobile: colonne, on cache sidebar si on est dans un groupe
    <div className="flex h-[calc(100vh-3rem)] bg-[#f5f0e8]">

      {/* Sidebar gauche — groupes */}
      <div className={`flex flex-col border-r border-stone-200 bg-white ${
        isRoot ? 'w-full sm:w-72 flex-shrink-0' : 'hidden sm:flex sm:w-72 flex-shrink-0'
      }`}>
        {/* Header sidebar */}
        <div className="px-4 py-4 border-b border-stone-100">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.3rem', fontStyle: 'italic' }}
              className="text-[#2d3228]">Messagerie</h2>
        </div>

        {/* Liste groupes */}
        <div className="flex-1 overflow-y-auto">
          {groups.map(group => {
            const isGeneral = group.name === '@ToutLeMonde'
            const isActive = pathname.includes(group.id)
            return (
              <a key={group.id} href={`/invite/${slug}/groupes/${group.id}`}
                 className={`flex items-center gap-3 px-4 py-3 border-b border-stone-50 transition-colors ${
                   isActive ? 'bg-[#4a5240]/8' : 'hover:bg-stone-50'
                 }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  isGeneral ? 'bg-[#4a5240] text-white' : 'bg-[#4a5240]/10 text-[#4a5240]'
                }`}
                  style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}>
                  {isGeneral ? '✦' : group.name.replace('@', '').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: isActive ? 500 : 400, fontSize: '0.85rem' }}
                     className={`truncate ${isGeneral ? 'text-[#4a5240]' : 'text-stone-700'}`}>
                    {group.name}
                  </p>
                  {group.lastMsg ? (
                    <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>
                      {group.lastMsg.author_name} · {group.lastMsg.content}
                    </p>
                  ) : (
                    <p className="text-xs text-stone-300 italic" style={{ fontWeight: 300 }}>
                      Aucun message
                    </p>
                  )}
                </div>
                {group.lastMsg && (
                  <span className="text-[10px] text-stone-300 shrink-0 hidden sm:inline">
                    {new Date(group.lastMsg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </a>
            )
          })}
        </div>

        {/* Créer groupe */}
        <div className="border-t border-stone-100 p-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => handleCreate(s)} disabled={creating}
                className="text-xs px-2.5 py-1.5 rounded-md border border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer"
                style={{ fontWeight: 300 }}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input type="text" value={newGroup} onChange={e => setNewGroup(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate(newGroup)}
              placeholder="@Groupe…"
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 outline-none focus:border-[#4a5240] transition bg-white"
              style={{ fontWeight: 300 }} />
            <button onClick={() => handleCreate(newGroup)} disabled={creating || !newGroup.trim()}
              className="bg-[#4a5240] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#2d3228] transition disabled:opacity-40 cursor-pointer"
              style={{ fontWeight: 300 }}>
              +
            </button>
          </div>
        </div>
      </div>

      {/* Zone centrale — chat ou accueil */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isRoot ? 'hidden sm:flex' : 'flex'}`}>
        {isRoot ? (
          // État vide sur desktop
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.2rem' }}
                 className="text-stone-400 mb-2">Choisissez un groupe</p>
              <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-300">
                ou créez-en un nouveau à gauche
              </p>
            </div>
          </div>
        ) : children}
      </div>
    </div>
  )
}
