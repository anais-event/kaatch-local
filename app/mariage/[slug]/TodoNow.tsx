'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, CheckCircle2, X } from 'lucide-react'

type Task = {
  label: string
  sub: string
  done: boolean
  href: string
}

export default function TodoNow({ tasks, slug }: { tasks: Task[]; slug: string }) {
  const LS_KEY = `todo_dismissed_${slug}`
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setDismissed(new Set(JSON.parse(raw)))
    } catch {}
  }, [LS_KEY])

  function dismiss(label: string) {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(label)
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  // Server render: show all. Client: filter dismissed
  const visible = mounted
    ? tasks.filter(t => !dismissed.has(t.label))
    : tasks

  if (visible.length === 0) return null

  return (
    <div className="bg-white rounded-3xl border border-stone-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">
          À faire maintenant
        </h2>
        <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
      </div>
      <div className="space-y-3">
        {visible.map((task) => (
          <div key={task.label} className="flex items-start gap-3 group/row">
            <Link href={task.href} className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300 group-hover/row:border-[#4a5240]'}`}>
                {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div className="min-w-0">
                <p style={{ fontWeight: 400, fontSize: '0.92rem' }}
                   className={task.done ? 'text-stone-400 line-through' : 'text-stone-700 group-hover/row:text-[#4a5240]'}>
                  {task.label}
                </p>
                {!task.done && task.sub && (
                  <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 mt-0.5">
                    {task.sub}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={() => dismiss(task.label)}
              className="shrink-0 mt-1 p-1 rounded-full text-stone-200 hover:text-stone-400 hover:bg-stone-100 transition opacity-0 group-hover/row:opacity-100"
              title="Masquer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
