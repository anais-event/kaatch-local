'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Toast {
  id: number
  message: string
  icon: string
}

interface Props {
  slug: string
  weddingId: string
}

export default function RealtimeNotifications({ slug, weddingId }: Props) {
  const [unread, setUnread] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<{ message: string; icon: string; time: string }[]>([])
  const toastId = useRef(0)
  const mounted = useRef(false)

  function addToast(icon: string, message: string) {
    if (!mounted.current) return
    const id = ++toastId.current
    setToasts(t => [...t, { id, message, icon }])
    setLog(l => [{ message, icon, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }, ...l.slice(0, 19)])
    setUnread(n => n + 1)
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  useEffect(() => {
    mounted.current = true

    const channel = supabase
      .channel(`wedding-${weddingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: `wedding_id=eq.${weddingId}`,
      }, (payload) => {
        const name = (payload.new as any).uploaded_by_name || 'Quelqu\'un'
        addToast('📸', `${name} a ajouté une photo`)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `wedding_id=eq.${weddingId}`,
      }, (payload) => {
        const name = (payload.new as any).author_name || 'Quelqu\'un'
        addToast('💬', `${name} a envoyé un message`)
      })
      .subscribe()

    return () => {
      mounted.current = false
      supabase.removeChannel(channel)
    }
  }, [weddingId])

  return (
    <>
      {/* Cloche */}
      <div className="relative">
        <button
          onClick={() => { setOpen(o => !o); setUnread(0) }}
          className="relative p-1.5 rounded-full hover:bg-stone-100 transition text-stone-500 hover:text-[#4a5240]"
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Dropdown log */}
        {open && (
          <div className="absolute right-0 top-8 w-72 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Activité récente</span>
              <button onClick={() => setOpen(false)} className="text-stone-300 hover:text-stone-500 text-lg leading-none">×</button>
            </div>
            {log.length === 0 ? (
              <div className="px-4 py-6 text-center text-stone-400 text-sm">Aucune activité pour l'instant</div>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-stone-50">
                {log.map((entry, i) => (
                  <li key={i} className="px-4 py-2.5 flex items-start gap-2.5 hover:bg-stone-50 transition">
                    <span className="text-base shrink-0">{entry.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 leading-snug">{entry.message}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{entry.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[100] pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className="flex items-center gap-2 bg-[#2d3228] text-white text-sm px-4 py-2.5 rounded-full shadow-lg animate-fade-in-up pointer-events-auto"
          >
            <span>{toast.icon}</span>
            <span style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  )
}
