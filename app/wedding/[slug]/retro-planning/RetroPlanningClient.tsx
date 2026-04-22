'use client'

import { useState } from 'react'

type Task = {
  key: string
  label: string
  detail?: string
  done: boolean
}
type Period = {
  id: string
  label: string
  emoji: string
  color: string
  tasks: Task[]
}

export default function RetroPlanningClient({
  weddingId,
  initialPeriods,
}: {
  weddingId: string
  initialPeriods: Period[]
}) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [saving, setSaving] = useState<string | null>(null)

  const totalTasks = periods.flatMap(p => p.tasks).length
  const doneTasks = periods.flatMap(p => p.tasks).filter(t => t.done).length
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  async function toggleTask(periodId: string, taskKey: string, currentDone: boolean) {
    setSaving(taskKey)
    // Optimiste
    setPeriods(prev => prev.map(p =>
      p.id === periodId
        ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: !currentDone } : t) }
        : p
    ))
    try {
      await fetch('/api/retro-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, taskKey, done: !currentDone }),
      })
    } catch {
      // Rollback
      setPeriods(prev => prev.map(p =>
        p.id === periodId
          ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: currentDone } : t) }
          : p
      ))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-24">
      <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
          className="text-[#2d3228] mb-1">Rétro-planning</h1>
      <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400 mb-6">
        Toutes les étapes clés, dans l'ordre. Cochez au fur et à mesure.
      </p>

      {/* Barre de progression */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-500">
            {doneTasks} tâche{doneTasks > 1 ? 's' : ''} sur {totalTasks} complétée{doneTasks > 1 ? 's' : ''}
          </p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.3rem', fontStyle: 'italic' }}
             className="text-[#4a5240]">{pct}%</p>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4a5240] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-center mt-3 text-sm text-[#4a5240]"
             style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic' }}>
            🎉 Tout est prêt — profitez de chaque moment !
          </p>
        )}
      </div>

      {/* Périodes */}
      <div className="space-y-8">
        {periods.map(period => {
          const done = period.tasks.filter(t => t.done).length
          const total = period.tasks.length
          return (
            <div key={period.id}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{period.emoji}</span>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem', fontStyle: 'italic' }}
                      className="text-[#2d3228] leading-tight">{period.label}</h2>
                  <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                    {done}/{total} complété{done > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50">
                {period.tasks.map(task => (
                  <label key={task.key}
                    className="flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-stone-50/50 transition-colors group">
                    <div className="mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={task.done}
                        disabled={saving === task.key}
                        onChange={() => toggleTask(period.id, task.key, task.done)}
                        className="w-4 h-4 rounded border-stone-300 text-[#4a5240] cursor-pointer accent-[#4a5240]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.5 }}
                         className={`transition-colors ${task.done ? 'text-stone-300 line-through' : 'text-stone-700'}`}>
                        {task.label}
                      </p>
                      {task.detail && (
                        <p style={{ fontSize: '0.75rem', fontWeight: 300, lineHeight: 1.5 }}
                           className="text-stone-400 mt-0.5">{task.detail}</p>
                      )}
                    </div>
                    {task.done && (
                      <span className="text-[#4a5240] shrink-0 mt-0.5 text-sm">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
