'use client'

import { useState, useRef, useEffect } from 'react'
import { PERIOD_COLORS } from './tasks'

type Task = {
  key: string
  label: string
  detail?: string
  done: boolean
  deadline: string | null
  assigned_to: string | null
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
  deadline: string | null
}

const LS_KEY = 'retro_hidden_periods'

function getHidden(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}
function saveHidden(s: Set<string>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...s]))
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function monthLabel(d: string) {
  const [y, m] = d.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .replace(/^./, c => c.toUpperCase())
}
function isOverdue(d: string) {
  return d < new Date().toISOString().slice(0, 10)
}

function CheckCircle({ checked, onChange, saving, color }: {
  checked: boolean; onChange: () => void; saving?: boolean; color: string
}) {
  return (
    <button type="button" onClick={onChange} disabled={saving}
      className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-150 cursor-pointer disabled:cursor-wait"
      style={{
        backgroundColor: 'white',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: checked ? color : '#d6d3d1',
      }}>
      {saving
        ? <div className="w-1 h-1 rounded-full bg-stone-300 animate-pulse" />
        : checked
          ? <svg viewBox="0 0 24 24" fill="none" strokeWidth={3} className="w-2.5 h-2.5" style={{ stroke: color }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          : null}
    </button>
  )
}

function DeadlineChip({ value, onChange, color, overdueable = true }: {
  value: string | null
  onChange: (v: string) => void
  color: string
  overdueable?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const overdue = overdueable && value && isOverdue(value)
  return (
    <div className="relative flex-shrink-0">
      <input
        ref={inputRef}
        type="date"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="absolute opacity-0 pointer-events-none w-px h-px"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker()}
        className="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer select-none whitespace-nowrap transition-colors"
        style={{
          fontFamily: 'var(--font-lato)',
          fontWeight: 300,
          fontSize: '0.68rem',
          background: value ? (overdue ? '#fef2f2' : `${color}10`) : 'transparent',
          color: value ? (overdue ? '#dc2626' : color) : '#c7c3c0',
          border: `1px solid ${value ? (overdue ? '#fecaca' : `${color}25`) : '#e7e5e4'}`,
        }}
      >
        {value
          ? <>{overdue ? <span style={{ fontSize: '0.55rem', marginRight: 1 }}>▲</span> : null}{formatDate(value)}</>
          : '+ date'
        }
      </button>
    </div>
  )
}

export default function RetroPlanningClient({
  weddingId, initialPeriods, initialCustomTasks,
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
  const [newDeadline, setNewDeadline] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'periods' | 'timeline'>('periods')
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

  useEffect(() => { setHidden(getHidden()) }, [])

  function toggleCollapse(id: string) {
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function hidePeriod(id: string) {
    setHidden(prev => { const n = new Set(prev); n.add(id); saveHidden(n); return n })
  }
  function restoreAll() { const e = new Set<string>(); saveHidden(e); setHidden(e) }

  const allPredefined = periodsState.flatMap(p => p.tasks)
  const doneTasks = allPredefined.filter(t => t.done).length + customTasks.filter(t => t.done).length
  const totalTasks = allPredefined.length + customTasks.length
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  async function togglePredefined(periodId: string, taskKey: string, currentDone: boolean) {
    setSaving(taskKey)
    setPeriodsState(prev => prev.map(p =>
      p.id === periodId ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: !currentDone } : t) } : p
    ))
    await fetch('/api/retro-planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, taskKey, done: !currentDone }),
    }).catch(() => {
      setPeriodsState(prev => prev.map(p =>
        p.id === periodId ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, done: currentDone } : t) } : p
      ))
    })
    setSaving(null)
  }

  async function savePredefinedMeta(periodId: string, taskKey: string, patch: { deadline?: string; assigned_to?: string }) {
    setPeriodsState(prev => prev.map(p =>
      p.id === periodId ? { ...p, tasks: p.tasks.map(t => t.key === taskKey ? { ...t, ...patch } : t) } : p
    ))
    await fetch('/api/retro-planning', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, taskKey, ...patch }),
    })
  }

  async function saveCustomMeta(id: string, patch: { deadline?: string; assigned_to?: string }) {
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    await fetch(`/api/retro-custom-tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }

  async function addCustomTask(periodId: string) {
    if (!newTitle.trim()) return
    const res = await fetch('/api/retro-custom-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, periodId, title: newTitle.trim(), assigned_to: newAssignee.trim() || null, deadline: newDeadline || null }),
    })
    if (res.ok) {
      const task = await res.json()
      setCustomTasks(prev => [...prev, task])
    }
    setNewTitle(''); setNewAssignee(''); setNewDeadline(''); setAddingTo(null)
  }

  async function toggleCustom(id: string, currentDone: boolean) {
    setSaving(id)
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t))
    await fetch(`/api/retro-custom-tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !currentDone }),
    }).catch(() => setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, done: currentDone } : t)))
    setSaving(null)
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, title: editTitle, assigned_to: editAssignee || null } : t))
    await fetch(`/api/retro-custom-tasks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), assigned_to: editAssignee.trim() || null }),
    })
    setEditingId(null)
  }

  async function deleteCustom(id: string) {
    setCustomTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/retro-custom-tasks/${id}`, { method: 'DELETE' })
  }

  type FlatTask = {
    id: string
    type: 'predefined' | 'custom'
    label: string
    done: boolean
    deadline: string | null
    assigned_to: string | null
    periodId: string
    periodLabel: string
    taskKey?: string
  }

  const flatTasks: FlatTask[] = [
    ...periodsState.flatMap(p => p.tasks.map(t => ({
      id: t.key, type: 'predefined' as const, label: t.label, done: t.done,
      deadline: t.deadline, assigned_to: t.assigned_to, periodId: p.id, periodLabel: p.label, taskKey: t.key,
    }))),
    ...customTasks.map(t => {
      const p = periodsState.find(p => p.id === t.period_id)
      return {
        id: t.id, type: 'custom' as const, label: t.title, done: t.done,
        deadline: t.deadline, assigned_to: t.assigned_to,
        periodId: t.period_id, periodLabel: p?.label ?? '',
      }
    }),
  ]

  const withDeadline = flatTasks.filter(t => t.deadline && !t.done).sort((a, b) => a.deadline!.localeCompare(b.deadline!))
  const noDeadline = flatTasks.filter(t => !t.deadline && !t.done)
  const doneFlat = flatTasks.filter(t => t.done)

  const byMonth: Record<string, FlatTask[]> = {}
  withDeadline.forEach(t => {
    const key = t.deadline!.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(t)
  })

  function toggleFlatTask(t: FlatTask) {
    if (t.type === 'predefined') {
      const p = periodsState.find(p => p.id === t.periodId)
      if (p) togglePredefined(p.id, t.taskKey!, t.done)
    } else {
      toggleCustom(t.id, t.done)
    }
  }

  const visiblePeriods = periodsState.filter(p => !hidden.has(p.id))

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 pb-28" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* ── Header ── */}
      <div className="mb-8">
        <h1
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2.4rem, 7vw, 3.4rem)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
          className="text-[#2d3228]">
          Guide de préparation
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem', marginTop: '0.4rem' }} className="text-stone-400">
          Toutes vos étapes — deadlines, responsables, vue chronologique.
        </p>
      </div>

      {/* ── Barre de progression + vue toggle ── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }} className="text-stone-400">
            Avancement
          </span>
          <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 tabular-nums">
            {pct === 100
              ? <span className="text-emerald-500">Tout est prêt ✓</span>
              : <>{doneTasks} / {totalTasks} tâches</>
            }
          </span>
        </div>
        <div className="h-px bg-stone-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: '#4a5240' }}
          />
        </div>

        <div className="flex bg-[#f5f0e8] rounded-xl p-1 gap-0.5">
          {([['periods', 'Par période'], ['timeline', 'Chronologie']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} className="flex-1 cursor-pointer"
              style={{
                fontFamily: 'var(--font-lato)',
                fontWeight: view === key ? 400 : 300,
                fontSize: '0.78rem',
                padding: '0.4rem 0',
                borderRadius: '0.625rem',
                background: view === key ? 'white' : 'transparent',
                color: view === key ? '#2d3228' : '#a8a29e',
                boxShadow: view === key ? '0 1px 3px rgba(0,0,0,0.07)' : 'none',
                transition: 'all 0.15s',
                border: 'none',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VUE PAR PÉRIODE ── */}
      {view === 'periods' && (
        <>
          {hidden.size > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                {hidden.size} période{hidden.size > 1 ? 's' : ''} masquée{hidden.size > 1 ? 's' : ''}
              </span>
              <button onClick={restoreAll}
                style={{ fontWeight: 300, fontSize: '0.72rem' }}
                className="text-[#4a5240] hover:underline cursor-pointer">
                Restaurer
              </button>
            </div>
          )}

          <div className="space-y-3">
            {visiblePeriods.map(period => {
              const color = PERIOD_COLORS[period.id] ?? '#4a5240'
              const periodCustom = customTasks.filter(t => t.period_id === period.id)
              const totalP = period.tasks.length + periodCustom.length
              const doneP = period.tasks.filter(t => t.done).length + periodCustom.filter(t => t.done).length
              const allDone = totalP > 0 && doneP === totalP
              const isCollapsed = collapsed.has(period.id)

              return (
                <div key={period.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

                  {/* Period header */}
                  <div className="flex items-center gap-0">
                    {/* Colored accent bar */}
                    <div className="w-1 self-stretch rounded-l-2xl flex-shrink-0" style={{ backgroundColor: color }} />

                    <button type="button" onClick={() => toggleCollapse(period.id)}
                      className="flex-1 flex items-center gap-4 px-5 py-4 text-left cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <p
                          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}
                          className={allDone ? 'text-stone-300' : 'text-[#2d3228]'}>
                          {period.label}
                        </p>
                      </div>

                      <span
                        className="flex-shrink-0 tabular-nums"
                        style={{ fontWeight: 300, fontSize: '0.7rem', color: allDone ? '#86efac' : '#a8a29e' }}>
                        {doneP}/{totalP}
                      </span>

                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                        className={`w-3.5 h-3.5 text-stone-300 flex-shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    <button type="button" onClick={() => hidePeriod(period.id)}
                      className="p-2 mr-1 text-stone-200 hover:text-stone-400 cursor-pointer rounded-lg hover:bg-stone-50 transition flex-shrink-0"
                      title="Masquer cette période">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    </button>
                  </div>

                  {/* Tasks */}
                  {!isCollapsed && (
                    <>
                      <div className="border-t border-stone-50 divide-y divide-stone-50">

                        {/* Predefined tasks */}
                        {period.tasks.map(task => (
                          <div key={task.key}
                            className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors group">
                            <div className="pt-0.5">
                              <CheckCircle checked={task.done} saving={saving === task.key} color={color} onChange={() => togglePredefined(period.id, task.key, task.done)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.5 }}
                                className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}>
                                {task.label}
                              </p>
                              {task.detail && !task.done && (
                                <p style={{ fontSize: '0.7rem', fontWeight: 300 }} className="text-stone-400 mt-0.5 leading-snug">
                                  {task.detail}
                                </p>
                              )}
                              {task.assigned_to && !task.done && (
                                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full"
                                  style={{ fontSize: '0.65rem', fontWeight: 300, background: `${color}12`, color }}>
                                  {task.assigned_to}
                                </span>
                              )}
                            </div>
                            {!task.done && (
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                                <DeadlineChip
                                  value={task.deadline}
                                  color={color}
                                  onChange={v => savePredefinedMeta(period.id, task.key, { deadline: v })}
                                />
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Custom tasks */}
                        {periodCustom.map(task => (
                          <div key={task.id}
                            className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors group">
                            {editingId === task.id ? (
                              <div className="flex-1 space-y-2 py-0.5">
                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240]/50 bg-white"
                                  style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} autoFocus />
                                <div className="flex gap-2">
                                  <input value={editAssignee} onChange={e => setEditAssignee(e.target.value)}
                                    placeholder="Assigné à… (optionnel)"
                                    className="flex-1 border border-stone-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#4a5240]/50 bg-white"
                                    style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} />
                                  <button onClick={() => saveEdit(task.id)}
                                    className="text-xs bg-[#4a5240] text-white px-4 py-1.5 rounded-xl cursor-pointer hover:bg-[#2d3228] transition"
                                    style={{ fontWeight: 300 }}>
                                    OK
                                  </button>
                                  <button onClick={() => setEditingId(null)}
                                    className="text-xs text-stone-400 cursor-pointer px-1 hover:text-stone-600 transition"
                                    style={{ fontWeight: 300 }}>
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="pt-0.5">
                                  <CheckCircle checked={task.done} saving={saving === task.id} color={color} onChange={() => toggleCustom(task.id, task.done)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p style={{ fontSize: '0.84rem', fontWeight: 300, lineHeight: 1.5 }}
                                    className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}>
                                    {task.title}
                                  </p>
                                  {task.assigned_to && !task.done && (
                                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full"
                                      style={{ fontSize: '0.65rem', fontWeight: 300, background: `${color}12`, color }}>
                                      {task.assigned_to}
                                    </span>
                                  )}
                                </div>
                                {!task.done && (
                                  <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
                                    <DeadlineChip value={task.deadline} color={color} onChange={v => saveCustomMeta(task.id, { deadline: v })} />
                                    <button
                                      onClick={() => { setEditingId(task.id); setEditTitle(task.title); setEditAssignee(task.assigned_to ?? '') }}
                                      className="p-1.5 text-stone-300 hover:text-stone-600 cursor-pointer rounded-lg hover:bg-stone-100 transition"
                                      title="Modifier">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => deleteCustom(task.id)}
                                      className="p-1.5 text-stone-300 hover:text-red-400 cursor-pointer rounded-lg hover:bg-red-50 transition"
                                      title="Supprimer">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add task area */}
                      {addingTo === period.id ? (
                        <div className="px-5 py-4 border-t border-stone-50 bg-[#f9f8f6] space-y-2.5">
                          <input ref={addInputRef} value={newTitle} onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addCustomTask(period.id); if (e.key === 'Escape') setAddingTo(null) }}
                            placeholder="Titre de la tâche…"
                            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4a5240]/50 bg-white"
                            style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} autoFocus />
                          <div className="grid grid-cols-2 gap-2">
                            <input value={newAssignee} onChange={e => setNewAssignee(e.target.value)}
                              placeholder="Assigné à…"
                              className="border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#4a5240]/50 bg-white"
                              style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} />
                            <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                              className="border border-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#4a5240]/50 bg-white text-stone-500"
                              style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addCustomTask(period.id)} disabled={!newTitle.trim()}
                              className="flex-1 bg-[#4a5240] text-white py-2 rounded-xl text-xs cursor-pointer disabled:opacity-40 hover:bg-[#2d3228] transition"
                              style={{ fontWeight: 300 }}>
                              Ajouter
                            </button>
                            <button onClick={() => { setAddingTo(null); setNewTitle(''); setNewAssignee(''); setNewDeadline('') }}
                              className="text-xs text-stone-400 cursor-pointer px-3 hover:text-stone-600 transition"
                              style={{ fontWeight: 300 }}>
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-3 border-t border-stone-50">
                          <button
                            onClick={() => { setAddingTo(period.id); setNewTitle(''); setNewAssignee(''); setNewDeadline('') }}
                            className="flex items-center gap-2 text-stone-400 hover:text-[#4a5240] transition cursor-pointer group/add"
                            style={{ fontWeight: 300, fontSize: '0.78rem' }}>
                            <span className="w-5 h-5 rounded-full border border-stone-200 group-hover/add:border-[#4a5240]/40 flex items-center justify-center transition text-xs leading-none">+</span>
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
        </>
      )}

      {/* ── VUE CHRONOLOGIE ── */}
      {view === 'timeline' && (
        <div className="space-y-8">
          {withDeadline.length === 0 && noDeadline.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 300, fontSize: '1.5rem' }} className="text-stone-300 mb-2">
                Aucune deadline définie
              </p>
              <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-400">
                Passez en vue "Par période" pour ajouter des dates.
              </p>
            </div>
          ) : (
            <>
              {Object.entries(byMonth).map(([month, tasks]) => {
                const hasOverdue = tasks.some(t => isOverdue(t.deadline!))
                return (
                  <div key={month}>
                    {/* Month separator */}
                    <div className="flex items-center gap-3 mb-3">
                      <p
                        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: hasOverdue ? 600 : 500, fontStyle: 'italic', fontSize: '1.1rem', letterSpacing: '0.01em' }}
                        className={hasOverdue ? 'text-red-400' : 'text-[#4a5240]'}>
                        {hasOverdue && <span style={{ fontStyle: 'normal', fontSize: '0.85rem' }}>⚠ </span>}{monthLabel(month)}
                      </p>
                      <div className="flex-1 h-px bg-stone-100" />
                    </div>

                    <div className="space-y-1.5">
                      {tasks.map(t => {
                        const color = PERIOD_COLORS[t.periodId] ?? '#4a5240'
                        const overdue = isOverdue(t.deadline!)
                        return (
                          <div key={t.id}
                            className="bg-white rounded-xl border border-stone-100 flex items-center gap-3 px-4 py-3 hover:shadow-sm transition-shadow">
                            <CheckCircle checked={t.done} saving={saving === t.id} color={color} onChange={() => toggleFlatTask(t)} />
                            <div className="flex-1 min-w-0">
                              <p style={{ fontWeight: 300, fontSize: '0.84rem' }} className="text-stone-700 truncate">{t.label}</p>
                              <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 mt-0.5 truncate">{t.periodLabel}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {t.assigned_to && (
                                <span className="px-2 py-0.5 rounded-full"
                                  style={{ fontWeight: 300, fontSize: '0.65rem', background: `${color}12`, color }}>
                                  {t.assigned_to}
                                </span>
                              )}
                              <span className="px-2.5 py-1 rounded-full"
                                style={{
                                  fontWeight: 300, fontSize: '0.7rem',
                                  background: overdue ? '#fef2f2' : `${color}15`,
                                  color: overdue ? '#dc2626' : color,
                                  border: `1px solid ${overdue ? '#fecaca' : `${color}25`}`,
                                }}>
                                {overdue && <span style={{ fontSize: '0.6rem' }}>! </span>}{formatDate(t.deadline!)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {noDeadline.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontStyle: 'italic', fontSize: '1rem' }} className="text-stone-300">
                      Sans date
                    </p>
                    <div className="flex-1 h-px bg-stone-100" />
                    <span style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-300">
                      {noDeadline.length} tâche{noDeadline.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {noDeadline.map(t => {
                      const color = PERIOD_COLORS[t.periodId] ?? '#4a5240'
                      return (
                        <div key={t.id} className="bg-white rounded-xl border border-stone-100 flex items-center gap-3 px-4 py-3 opacity-50">
                          <CheckCircle checked={t.done} saving={saving === t.id} color={color} onChange={() => toggleFlatTask(t)} />
                          <div className="flex-1 min-w-0">
                            <p style={{ fontWeight: 300, fontSize: '0.84rem' }} className="text-stone-600 truncate">{t.label}</p>
                            <p style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-400 mt-0.5 truncate">{t.periodLabel}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {doneFlat.length > 0 && (
                <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300 text-center pt-2">
                  {doneFlat.length} tâche{doneFlat.length > 1 ? 's' : ''} terminée{doneFlat.length > 1 ? 's' : ''} ✓
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
