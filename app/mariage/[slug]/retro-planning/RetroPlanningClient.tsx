'use client'

import { useState, useRef } from 'react'

type Task = {
  key: string
  label: string
  detail?: string
  done: boolean
  assigned_to?: string | null
  custom?: boolean
  id?: string
}
type Period = {
  id: string
  label: string
  emoji: string
  tasks: Task[]
}
type CustomTask = {
  id: string
  period_id: string
  title: string
  assigned_to: string | null
  done: boolean
}

export default function RetroPlanningClient({
  weddingId,
  initialPeriods,
  initialCustomTasks,
}: {
  weddingId: string
  initialPeriods: Period[]
  initialCustomTasks: CustomTask[]
}) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [customTasks, setCustomTasks] = useState(initialCustomTasks)
  const [saving, setSaving] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  const allPredefined = periods.flatMap(p => p.tasks)
  const donePredefined = allPredefined.filter(t => t.done).length
  const doneCustom = customTasks.filter(t => t.done).length
  const totalTasks = allPredefined.length + customTasks.length
  const doneTasks = donePredefined + doneCustom
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  async function togglePredefined(periodId: string, taskKey: string, currentDone: boolean) {
    setSaving(taskKey)
    setPeriods(prev => prev.map(p =>
      p.id === periodId
        ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: !currentDone } : t) }
        : p
    ))
    await fetch('/api/retro-planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, taskKey, done: !currentDone }),
    }).catch(() => {
      setPeriods(prev => prev.map(p =>
        p.id === periodId
          ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: currentDone } : t) }
          : p
      ))
    })
    setSaving(null)
  }

  async function addCustomTask(periodId: string) {
    if (!newTitle.trim()) return
    const res = await fetch('/api/retro-custom-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, periodId, title: newTitle.trim(), assigned_to: newAssignee.trim() || null }),
    })
    if (res.ok) {
      const created: CustomTask = await res.json()
      setCustomTasks(prev => [...prev, created])
    }
    setNewTitle('')
    setNewAssignee('')
    setAddingTo(null)
  }

  async function toggleCustom(id: string, currentDone: boolean) {
    setSaving(id)
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t))
    await fetch(`/api/retro-custom-tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !currentDone }),
    }).catch(() => {
      setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, done: currentDone } : t))
    })
    setSaving(null)
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, title: editTitle, assigned_to: editAssignee || null } : t))
    await fetch(`/api/retro-custom-tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), assigned_to: editAssignee.trim() || null }),
    })
    setEditingId(null)
  }

  async function deleteCustom(id: string) {
    setCustomTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/retro-custom-tasks/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-24">

      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem' }}
            className="text-[#2d3228] mb-1">Rétro-planning</h1>
        <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">
          Toutes les étapes clés, dans l&apos;ordre. Ajoutez vos propres tâches et assignez-les.
        </p>
      </div>

      {/* Barre de progression globale */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-500">
            {doneTasks} / {totalTasks} tâches complétées
          </p>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem' }}
                className="text-[#4a5240]">{pct}%</span>
        </div>
        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4a5240, #6b7a5e)' }} />
        </div>
        {pct === 100 && (
          <p className="text-center mt-3 text-sm text-[#4a5240]" style={{ fontFamily: 'var(--font-display)' }}>
            🎉 Tout est prêt — profitez de chaque moment !
          </p>
        )}
      </div>

      {/* Périodes */}
      <div className="space-y-6">
        {periods.map(period => {
          const periodCustom = customTasks.filter(t => t.period_id === period.id)
          const totalP = period.tasks.length + periodCustom.length
          const doneP = period.tasks.filter(t => t.done).length + periodCustom.filter(t => t.done).length
          const pctP = totalP ? Math.round((doneP / totalP) * 100) : 0
          const allDone = totalP > 0 && doneP === totalP

          return (
            <div key={period.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

              {/* Header période */}
              <div className={`px-5 py-4 flex items-center justify-between border-b ${allDone ? 'bg-emerald-50 border-emerald-100' : 'border-stone-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{period.emoji}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}
                       className={allDone ? 'text-emerald-700' : 'text-[#2d3228]'}>
                      {period.label}
                    </p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                      {doneP}/{totalP} · {pctP}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mini progress ring */}
                  <svg viewBox="0 0 28 28" className="w-7 h-7 -rotate-90">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#f5f0e8" strokeWidth="3" />
                    <circle cx="14" cy="14" r="11" fill="none"
                      stroke={allDone ? '#10b981' : '#4a5240'} strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 11}`}
                      strokeDashoffset={`${2 * Math.PI * 11 * (1 - pctP / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                  </svg>
                </div>
              </div>

              {/* Tâches prédéfinies */}
              <div className="divide-y divide-stone-50">
                {period.tasks.map(task => (
                  <label key={task.key}
                         className="flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-stone-50/60 transition-colors group">
                    <input
                      type="checkbox"
                      checked={task.done}
                      disabled={saving === task.key}
                      onChange={() => togglePredefined(period.id, task.key, task.done)}
                      className="mt-0.5 w-4 h-4 shrink-0 rounded border-stone-300 accent-[#4a5240] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.5 }}
                         className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}>
                        {task.label}
                      </p>
                      {task.detail && !task.done && (
                        <p style={{ fontSize: '0.72rem', fontWeight: 300 }} className="text-stone-400 mt-0.5">
                          {task.detail}
                        </p>
                      )}
                    </div>
                    {task.done && <span className="text-emerald-500 shrink-0 mt-0.5 text-sm">✓</span>}
                  </label>
                ))}

                {/* Tâches custom */}
                {periodCustom.map(task => (
                  <div key={task.id} className="flex items-start gap-4 px-5 py-3 hover:bg-stone-50/60 transition-colors group">
                    {editingId === task.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                          className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4a5240]"
                          style={{ fontWeight: 300 }}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            value={editAssignee}
                            onChange={e => setEditAssignee(e.target.value)}
                            placeholder="Assigné à... (optionnel)"
                            className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4a5240]"
                            style={{ fontWeight: 300 }}
                          />
                          <button onClick={() => saveEdit(task.id)}
                                  className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg cursor-pointer"
                                  style={{ fontWeight: 300 }}>
                            OK
                          </button>
                          <button onClick={() => setEditingId(null)}
                                  className="text-xs text-stone-400 px-2 py-1.5 cursor-pointer">
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={task.done}
                          disabled={saving === task.id}
                          onChange={() => toggleCustom(task.id, task.done)}
                          className="mt-0.5 w-4 h-4 shrink-0 rounded border-stone-300 accent-[#4a5240] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.5 }}
                             className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}>
                            {task.title}
                          </p>
                          {task.assigned_to && (
                            <span className="inline-block mt-0.5 bg-[#4a5240]/10 text-[#4a5240] text-[11px] px-2 py-0.5 rounded-full"
                                  style={{ fontWeight: 400 }}>
                              👤 {task.assigned_to}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => { setEditingId(task.id); setEditTitle(task.title); setEditAssignee(task.assigned_to ?? '') }}
                                  className="p-1 text-stone-300 hover:text-stone-500 cursor-pointer" title="Modifier">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteCustom(task.id)}
                                  className="p-1 text-stone-300 hover:text-red-400 cursor-pointer" title="Supprimer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                        {task.done && <span className="text-emerald-500 shrink-0 mt-0.5 text-sm">✓</span>}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulaire ajout tâche */}
              {addingTo === period.id ? (
                <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/50 space-y-2">
                  <input
                    ref={addInputRef}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCustomTask(period.id); if (e.key === 'Escape') setAddingTo(null) }}
                    placeholder="Titre de la tâche..."
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white"
                    style={{ fontWeight: 300 }}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      value={newAssignee}
                      onChange={e => setNewAssignee(e.target.value)}
                      placeholder="Assigné à... (optionnel)"
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
                      style={{ fontWeight: 300 }}
                    />
                    <button onClick={() => addCustomTask(period.id)}
                            disabled={!newTitle.trim()}
                            className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-40"
                            style={{ fontWeight: 300 }}>
                      Ajouter
                    </button>
                    <button onClick={() => { setAddingTo(null); setNewTitle(''); setNewAssignee('') }}
                            className="text-xs text-stone-400 px-2 py-1.5 cursor-pointer">
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-2.5 border-t border-stone-50">
                  <button
                    onClick={() => { setAddingTo(period.id); setNewTitle(''); setNewAssignee('') }}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
                    style={{ fontWeight: 300 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Ajouter une tâche
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
