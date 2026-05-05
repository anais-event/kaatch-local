'use client'

import { useState, useEffect, useRef } from 'react'

interface Task {
  id: string
  wedding_id: string
  month: string
  label: string
  done: boolean
  created_at: string
}

interface Props {
  slug: string
  weddingId: string
  weddingDate: string | null
}

function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .replace(/^./, c => c.toUpperCase())
}

function buildMonthList(weddingDate: string | null): string[] {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)

  let end: Date
  if (weddingDate) {
    const wd = new Date(weddingDate)
    end = new Date(wd.getFullYear(), wd.getMonth(), 1)
  } else {
    end = new Date(today.getFullYear() + 2, today.getMonth(), 1)
  }

  const months: string[] = []
  const cur = new Date(start)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    months.push(`${y}-${m}`)
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function PlanningWidget({ slug, weddingId, weddingDate }: Props) {
  const months = buildMonthList(weddingDate)
  const [selectedMonth, setSelectedMonth] = useState(
    months.includes(currentMonth()) ? currentMonth() : (months[0] ?? currentMonth())
  )
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTasks(selectedMonth)
  }, [selectedMonth])

  async function fetchTasks(month: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/planning-tasks?wedding_id=${weddingId}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function addTask() {
    const label = newLabel.trim()
    if (!label) return
    const res = await fetch('/api/planning-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wedding_id: weddingId, month: selectedMonth, label }),
    })
    if (res.ok) {
      const task = await res.json()
      setTasks(prev => [...prev, task])
      setNewLabel('')
    }
  }

  async function toggleTask(task: Task) {
    const res = await fetch('/api/planning-tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    })
    if (res.ok) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))
    }
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/planning-tasks?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  const doneCount = tasks.filter(t => t.done).length

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-stone-50/50 transition"
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: '1.1rem' }}>📅</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.15rem' }}
              className="text-[#4a5240] flex-1">
          Agenda mensuel
        </span>

        {/* Month selector — stop propagation so clicking it doesn't toggle */}
        <select
          value={selectedMonth}
          onChange={e => { e.stopPropagation(); setSelectedMonth(e.target.value) }}
          onClick={e => e.stopPropagation()}
          className="text-xs border border-stone-200 rounded-lg px-2 py-1 text-stone-600 bg-white focus:outline-none focus:border-[#4a5240]/40"
          style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }}
        >
          {months.map(m => (
            <option key={m} value={m}>{getMonthLabel(m)}</option>
          ))}
        </select>

        {!expanded && (
          <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400 ml-1">
            {doneCount}/{tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
          </span>
        )}

        <span className={`text-stone-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              style={{ fontSize: '0.75rem' }}>▼</span>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5">
          {/* Tasks */}
          {loading ? (
            <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400 py-2">Chargement…</p>
          ) : tasks.length === 0 ? (
            <p style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-300 italic py-2">
              Aucune tâche pour ce mois. Ajoutez-en une ci-dessous.
            </p>
          ) : (
            <ul className="space-y-1.5 mb-3">
              {tasks.map(task => (
                <li
                  key={task.id}
                  className="flex items-center gap-2.5 group/item"
                  onMouseEnter={() => setHoveredId(task.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                    className="accent-[#4a5240] w-3.5 h-3.5 shrink-0 cursor-pointer"
                  />
                  <span
                    style={{ fontWeight: 300, fontSize: '0.82rem' }}
                    className={`flex-1 leading-snug ${task.done ? 'line-through text-stone-300' : 'text-stone-600'}`}
                  >
                    {task.label}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`text-stone-300 hover:text-red-400 transition text-xs leading-none shrink-0 ${hoveredId === task.id ? 'opacity-100' : 'opacity-0'}`}
                    style={{ fontWeight: 300 }}
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="h-1 bg-stone-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-[#4a5240] rounded-full transition-all duration-300"
                style={{ width: `${Math.round((doneCount / tasks.length) * 100)}%` }}
              />
            </div>
          )}

          {/* Add task */}
          <div className="flex gap-2 mt-1">
            <input
              ref={inputRef}
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask() }}
              placeholder="Nouvelle tâche…"
              className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#4a5240]/50 placeholder:text-stone-300"
              style={{ fontWeight: 300, fontFamily: 'var(--font-lato)' }}
            />
            <button
              onClick={addTask}
              className="w-8 h-8 flex items-center justify-center bg-[#4a5240] text-white rounded-lg hover:bg-[#2d3228] transition text-base leading-none shrink-0"
              aria-label="Ajouter"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
