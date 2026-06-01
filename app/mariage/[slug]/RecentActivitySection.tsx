'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'

interface ActivityItem {
  text: string
  time: string
  id: string
}

export default function RecentActivitySection({ activity }: { activity: ActivityItem[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = activity.filter(item => !dismissed.has(item.id))

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(id)
    setDismissed(newDismissed)
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
        <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
      </div>
      {visible.length === 0 ? (
        <p style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-stone-400 italic">
          Aucune activité récente
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 group">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4a5240]/30 shrink-0" />
              <p style={{ fontWeight: 400, fontSize: '0.88rem' }} className="text-stone-700 flex-1">
                {item.text}
              </p>
              <button
                onClick={() => handleDismiss(item.id)}
                className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-stone-100 transition"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5 text-stone-400 hover:text-stone-600" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
