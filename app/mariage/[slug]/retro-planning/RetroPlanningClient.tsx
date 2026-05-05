'use client'

import { useState, useRef, useEffect } from 'react'

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
  tasks: Task[]
}
type CustomTask = {
  id: string
  period_id: string
  title: string
  assigned_to: string | null
  done: boolean
}

const PERIOD_COLORS: Record<string, string> = {
  p18:     '#8b5cf6',
  p12:     '#3b82f6',
  p9:      '#06b6d4',
  p6:      '#10b981',
  p1:      '#f59e0b',
  semaine: '#f97316',
}

const LS_KEY = 'retro_hidden_periods'

function getHidden(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveHidden(s: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]))
}

function CheckCircle({ checked, onChange, saving, color }: {
  checked: boolean
  onChange: () => void
  saving?: boolean
  color: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={saving}
      className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5 cursor-pointer disabled:cursor-wait"
      style={{
        backgroundColor: checked ? color : 'white',
        borderColor: checked ? color : '#d6d3d1',
      }}
    >
      {saving ? (
        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse" />
      ) : checked ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </button>
  )
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
  const [periodsState, setPeriodsState] = useState(initialPeriods)
  const [customTasks, setCustomTasks] = useState(initialCustomTasks)
  const [saving, setSaving] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const s = new Set<string>()
    initialPeriods.forEach(p => {
      const custom = initialCustomTasks.filter(t => t.period_id === p.id)
      const total = p.tasks.length + custom.length
      const done = p.tasks.filter(t => t.done).length + custom.filter(t => t.done).length
      if (total > 0 && done === total) s.add(p.id)
    })
    return s
  })
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHidden(getHidden())
  }, [])

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function hidePeriod(id: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.add(id)
      saveHidden(next)
      return next
    })
  }

  function restoreAll() {
    const empty = new Set<string>()
    saveHidden(empty)
    setHidden(empty)
  }

  const visiblePeriods = periodsState.filter(p => !hidden.has(p.id))

  const allPredefined = periodsState.flatMap(p => p.tasks)
  const doneTasks = allPredefined.filter(t => t.done).length + customTasks.filter(t => t.done).length
  const totalTasks = allPredefined.length + customTasks.length
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  async function togglePredefined(periodId: string, taskKey: string, currentDone: boolean) {
    setSaving(taskKey)
    setPeriodsState(prev => prev.map(p =>
      p.id === periodId
        ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: !currentDone } : t) }
        : p
    ))
    await fetch('/api/retro-planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, taskKey, done: !currentDone }),
    }).catch(() => {
      setPeriodsState(prev => prev.map(p =>
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
    setNewTitle(''); setNewAssignee(''); setAddingTo(null)
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
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-24" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Header */}
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.2rem, 6vw, 3rem)', lineHeight: 1.05 }}
          className="text-[#2d3228] mb-2"
        >
          Rétro‑planning
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem', letterSpacing: '0.03em' }} className="text-stone-400">
          Toutes les étapes, dans l&apos;ordre — cochez au fur et à mesure.
        </p>
      </div>

      {/* Progression globale */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
        <div className="flex items-baseline gap-3 mb-3">
          <span
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.6rem', lineHeight: 1 }}
            className="text-[#4a5240]"
          >{pct}%</span>
          <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400">
            {doneTasks} / {totalTasks} tâches complétées
          </span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4a5240, #7a9068)' }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-3 text-sm text-[#4a5240] text-center" style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 400 }}>
            Tout est prêt — profitez de chaque moment.
          </p>
        )}
      </div>

      {/* Périodes masquées — bouton restaurer */}
      {hidden.size > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
            {hidden.size} période{hidden.size > 1 ? 's' : ''} masquée{hidden.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={restoreAll}
            className="text-xs text-[#4a5240] hover:text-[#2d3228] underline cursor-pointer transition"
            style={{ fontWeight: 300 }}
          >
            Restaurer
          </button>
        </div>
      )}

      {/* Périodes */}
      <div className="space-y-3">
        {visiblePeriods.map(period => {
          const color = PERIOD_COLORS[period.id] ?? '#4a5240'
          const periodCustom = customTasks.filter(t => t.period_id === period.id)
          const totalP = period.tasks.length + periodCustom.length
          const doneP = period.tasks.filter(t => t.done).length + periodCustom.filter(t => t.done).length
          const pctP = totalP ? Math.round((doneP / totalP) * 100) : 0
          const allDone = totalP > 0 && doneP === totalP
          const isCollapsed = collapsed.has(period.id)

          return (
            <div
              key={period.id}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm"
              style={{ borderLeftWidth: 3, borderLeftColor: color }}
            >
              {/* En-tête période */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleCollapse(period.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{period.emoji}</span>
                      <p
                        style={{ fontWeight: 400, fontSize: '0.9rem' }}
                        className={allDone ? 'text-stone-400' : 'text-[#2d3228]'}
                      >
                        {period.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 bg-stone-100 rounded-full overflow-hidden w-24">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pctP}%`, backgroundColor: allDone ? '#34d399' : color }}
                        />
                      </div>
                      <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400">
                        {doneP}/{totalP}
                      </span>
                      {allDone && (
                        <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-emerald-500">✓ Terminé</span>
                      )}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                    className={`w-4 h-4 text-stone-300 transition-transform duration-200 flex-shrink-0 ${isCollapsed ? '' : 'rotate-180'}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Bouton masquer la période */}
                <button
                  type="button"
                  onClick={() => hidePeriod(period.id)}
                  className="p-1.5 text-stone-200 hover:text-stone-400 cursor-pointer rounded-lg hover:bg-stone-50 transition flex-shrink-0"
                  title="Masquer cette période"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>

              {/* Contenu */}
              {!isCollapsed && (
                <>
                  <div className="divide-y divide-stone-50/80 border-t border-stone-50">

                    {period.tasks.map(task => (
                      <div
                        key={task.key}
                        className="flex items-start gap-3.5 px-5 py-3 hover:bg-stone-50/40 transition-colors"
                      >
                        <CheckCircle
                          checked={task.done}
                          saving={saving === task.key}
                          color={color}
                          onChange={() => togglePredefined(period.id, task.key, task.done)}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.55 }}
                            className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}
                          >
                            {task.label}
                          </p>
                          {task.detail && !task.done && (
                            <p style={{ fontSize: '0.7rem', fontWeight: 300 }} className="text-stone-400 mt-0.5">
                              {task.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {periodCustom.map(task => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3.5 px-5 py-3 hover:bg-stone-50/40 transition-colors group"
                      >
                        {editingId === task.id ? (
                          <div className="flex-1 space-y-2">
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit(task.id)
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm outline-none"
                              style={{ fontWeight: 300 }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <input
                                value={editAssignee}
                                onChange={e => setEditAssignee(e.target.value)}
                                placeholder="Assigné à… (optionnel)"
                                className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                style={{ fontWeight: 300 }}
                              />
                              <button
                                onClick={() => saveEdit(task.id)}
                                className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg cursor-pointer"
                                style={{ fontWeight: 300 }}
                              >OK</button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs text-stone-400 cursor-pointer px-1"
                              >✕</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <CheckCircle
                              checked={task.done}
                              saving={saving === task.id}
                              color={color}
                              onChange={() => toggleCustom(task.id, task.done)}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.55 }}
                                className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}
                              >
                                {task.title}
                              </p>
                              {task.assigned_to && !task.done && (
                                <span
                                  className="inline-block mt-0.5 rounded-full px-2 py-0.5"
                                  style={{ fontSize: '0.65rem', fontWeight: 400, backgroundColor: `${color}18`, color }}
                                >
                                  {task.assigned_to}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => { setEditingId(task.id); setEditTitle(task.title); setEditAssignee(task.assigned_to ?? '') }}
                                className="p-1.5 text-stone-300 hover:text-stone-600 cursor-pointer rounded-lg hover:bg-stone-100 transition"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteCustom(task.id)}
                                className="p-1.5 text-stone-300 hover:text-red-400 cursor-pointer rounded-lg hover:bg-red-50 transition"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Formulaire ajout tâche */}
                  {addingTo === period.id ? (
                    <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/40 space-y-2">
                      <input
                        ref={addInputRef}
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addCustomTask(period.id)
                          if (e.key === 'Escape') setAddingTo(null)
                        }}
                        placeholder="Titre de la tâche…"
                        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white"
                        style={{ fontWeight: 300 }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <input
                          value={newAssignee}
                          onChange={e => setNewAssignee(e.target.value)}
                          placeholder="Assigné à… (optionnel)"
                          className="flex-1 border border-stone-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
                          style={{ fontWeight: 300 }}
                        />
                        <button
                          onClick={() => addCustomTask(period.id)}
                          disabled={!newTitle.trim()}
                          className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-xl cursor-pointer disabled:opacity-40 hover:bg-[#2d3228] transition"
                          style={{ fontWeight: 300 }}
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => { setAddingTo(null); setNewTitle(''); setNewAssignee('') }}
                          className="text-xs text-stone-400 cursor-pointer px-1 hover:text-stone-600"
                        >✕</button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-2.5 border-t border-stone-50">
                      <button
                        onClick={() => { setAddingTo(period.id); setNewTitle(''); setNewAssignee('') }}
                        className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#4a5240] transition cursor-pointer"
                        style={{ fontWeight: 300 }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Ajouter une tâche
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
