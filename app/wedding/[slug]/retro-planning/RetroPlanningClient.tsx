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

// Maps period id to the offset in months BEFORE the wedding (negative = before wedding)
// e.g. p18: tasks are due between -18 and -12 months → we use -15 as midpoint
const PERIOD_MONTH_OFFSETS: Record<string, number> = {
  p18: -18,
  p12: -12,
  p9:  -9,
  p6:  -6,
  p1:  -1,
  semaine: 0, // wedding month
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  // Monday = 0
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

// Build the list of months to show in calendar view
// From today (or earliest period) to wedding date (or +4 months from today)
function buildMonthRange(weddingDate: Date | null, periods: Period[]): Date[] {
  const today = startOfMonth(new Date())
  const weddingMonth = weddingDate ? startOfMonth(weddingDate) : addMonths(today, 4)

  // Find the earliest period that starts after today
  let earliest = today
  if (weddingDate) {
    for (const periodId of Object.keys(PERIOD_MONTH_OFFSETS)) {
      const offset = PERIOD_MONTH_OFFSETS[periodId]
      const periodStart = startOfMonth(addMonths(weddingDate, offset))
      if (periodStart < earliest) earliest = periodStart
    }
    // Don't go earlier than 18 months before wedding
  }

  const start = earliest < today ? today : earliest
  const end = weddingMonth

  const months: Date[] = []
  let current = new Date(start)
  while (current <= end) {
    months.push(new Date(current))
    current = addMonths(current, 1)
  }
  // Show at least 3 months
  while (months.length < 3) {
    months.push(addMonths(months[months.length - 1] ?? today, 1))
  }
  return months
}

// Get tasks that fall in a given month
function getTasksForMonth(month: Date, weddingDate: Date | null, periods: Period[]): { task: Task; period: Period }[] {
  if (!weddingDate) return []
  const result: { task: Task; period: Period }[] = []
  for (const period of periods) {
    const offset = PERIOD_MONTH_OFFSETS[period.id]
    if (offset === undefined) continue
    const periodMonth = startOfMonth(addMonths(weddingDate, offset))
    if (isSameMonth(periodMonth, month)) {
      for (const task of period.tasks) {
        result.push({ task, period })
      }
    }
  }
  return result
}

// Calendar month grid component
function CalendarMonth({
  month,
  weddingDate,
  periods,
  selectedDay,
  onSelectDay,
}: {
  month: Date
  weddingDate: Date | null
  periods: Period[]
  selectedDay: string | null
  onSelectDay: (key: string | null) => void
}) {
  const year = month.getFullYear()
  const monthIdx = month.getMonth()
  const daysInMonth = getDaysInMonth(year, monthIdx)
  const firstDow = getFirstDayOfWeek(year, monthIdx)
  const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  const tasksForMonth = weddingDate ? getTasksForMonth(month, weddingDate, periods) : []
  // All tasks fall on the same "month" – we'll show a dot on day 1 of the period month
  // For wedding month, show on the wedding day; otherwise show tasks on 1st of month
  const weddingIsThisMonth = weddingDate ? isSameMonth(weddingDate, month) : false

  // Build a map: day number → tasks
  const tasksByDay: Record<number, { task: Task; period: Period }[]> = {}
  if (tasksForMonth.length > 0) {
    // Spread tasks across days so they're visible — or show on day 1
    // Show as a cluster on day 1 (clean approach, no external lib needed)
    // Actually: show tasks on the "canonical" day for that period (1st of the month)
    tasksByDay[1] = tasksForMonth
  }
  if (weddingDate && weddingIsThisMonth) {
    const wd = weddingDate.getDate()
    if (!tasksByDay[wd]) tasksByDay[wd] = []
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === day

  const isWeddingDay = (day: number) =>
    weddingDate
      ? weddingDate.getFullYear() === year && weddingDate.getMonth() === monthIdx && weddingDate.getDate() === day
      : false

  const dayKey = (day: number) => `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // Total cells = firstDow blank + daysInMonth
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <h3
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.15rem', fontStyle: 'italic' }}
        className="text-[#2d3228] mb-4 capitalize"
      >
        {formatMonthLabel(month)}
      </h3>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="text-center" style={{ fontSize: '0.7rem', fontWeight: 300, color: '#a8a29e' }}>
            {d}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} />
          }
          const dk = dayKey(day)
          const hasTasks = !!tasksByDay[day]?.length
          const isSelected = selectedDay === dk
          const todayClass = isToday(day)
          const weddingDay = isWeddingDay(day)
          const allDone = hasTasks && tasksByDay[day].every(({ task }) => task.done)

          return (
            <button
              key={idx}
              onClick={() => {
                if (hasTasks || weddingDay) {
                  onSelectDay(isSelected ? null : dk)
                }
              }}
              className={`relative flex flex-col items-center justify-start pt-1 rounded-lg h-9 transition-all
                ${isSelected ? 'bg-[#4a5240] text-white' : ''}
                ${weddingDay && !isSelected ? 'bg-[#4a5240]/10 border border-[#4a5240]/30' : ''}
                ${todayClass && !isSelected && !weddingDay ? 'bg-stone-100' : ''}
                ${hasTasks || weddingDay ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <span
                style={{ fontSize: '0.78rem', fontWeight: 300, lineHeight: 1.1 }}
                className={`${isSelected ? 'text-white' : todayClass ? 'text-[#4a5240] font-medium' : weddingDay ? 'text-[#4a5240]' : 'text-stone-600'}`}
              >
                {day}
              </span>
              {hasTasks && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : allDone ? 'bg-[#4a5240]/40' : 'bg-[#4a5240]'
                  }`}
                />
              )}
              {weddingDay && !hasTasks && (
                <span className="text-[8px] leading-none mt-0.5">💍</span>
              )}
            </button>
          )
        })}
      </div>
      {/* Period badge */}
      {tasksForMonth.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-50">
          <p style={{ fontSize: '0.72rem', fontWeight: 300 }} className="text-stone-400">
            {tasksForMonth.length} tâche{tasksForMonth.length > 1 ? 's' : ''} • {tasksForMonth[0].period.label}
          </p>
        </div>
      )}
    </div>
  )
}

// Popover / day detail panel
function DayDetail({
  dayKey,
  weddingDate,
  periods,
  onToggle,
}: {
  dayKey: string
  weddingDate: Date | null
  periods: Period[]
  onToggle: (periodId: string, taskKey: string, currentDone: boolean) => void
}) {
  const [year, month, day] = dayKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const tasksForMonth = weddingDate ? getTasksForMonth(date, weddingDate, periods) : []

  if (tasksForMonth.length === 0) return null

  const doneTasks = tasksForMonth.filter(({ task }) => task.done).length

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
          className="text-[#2d3228]"
        >
          {tasksForMonth[0].period.emoji} {tasksForMonth[0].period.label}
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 300 }} className="text-stone-400">
          {doneTasks}/{tasksForMonth.length} fait{doneTasks > 1 ? 'es' : ''}
        </span>
      </div>
      <div className="divide-y divide-stone-50">
        {tasksForMonth.map(({ task, period }) => (
          <label
            key={task.key}
            className="flex items-start gap-4 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors rounded"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(period.id, task.key, task.done)}
              className="mt-0.5 w-4 h-4 rounded border-stone-300 cursor-pointer accent-[#4a5240]"
            />
            <div className="flex-1 min-w-0">
              <p
                style={{ fontSize: '0.88rem', fontWeight: 300 }}
                className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}
              >
                {task.label}
              </p>
              {task.detail && (
                <p style={{ fontSize: '0.73rem', fontWeight: 300 }} className="text-stone-400 mt-0.5">
                  {task.detail}
                </p>
              )}
            </div>
            {task.done && <span className="text-[#4a5240] text-sm mt-0.5 shrink-0">✓</span>}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function RetroPlanningClient({
  weddingId,
  initialPeriods,
  weddingDate,
}: {
  weddingId: string
  initialPeriods: Period[]
  weddingDate: string | null
}) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [saving, setSaving] = useState<string | null>(null)
  const [view, setView] = useState<'liste' | 'calendrier' | 'cartes'>('liste')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const parsedWeddingDate = weddingDate ? new Date(weddingDate) : null

  const totalTasks = periods.flatMap(p => p.tasks).length
  const doneTasks = periods.flatMap(p => p.tasks).filter(t => t.done).length
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  async function toggleTask(periodId: string, taskKey: string, currentDone: boolean) {
    setSaving(taskKey)
    setPeriods(prev =>
      prev.map(p =>
        p.id === periodId
          ? { ...p, tasks: p.tasks.map(t => (t.key === taskKey ? { ...t, done: !currentDone } : t)) }
          : p
      )
    )
    try {
      await fetch('/api/retro-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, taskKey, done: !currentDone }),
      })
    } catch {
      setPeriods(prev =>
        prev.map(p =>
          p.id === periodId
            ? { ...p, tasks: p.tasks.map(t => (t.key === taskKey ? { ...t, done: currentDone } : t)) }
            : p
        )
      )
    } finally {
      setSaving(null)
    }
  }

  const calendarMonths = view === 'calendrier' ? buildMonthRange(parsedWeddingDate, periods) : []

  return (
    <div className="max-w-3xl mx-auto px-6 pt-8 pb-24">
      <h1
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.2rem', fontStyle: 'italic' }}
        className="text-[#2d3228] mb-1"
      >
        Rétro-planning
      </h1>
      <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400 mb-6">
        Toutes les étapes clés, dans l'ordre. Cochez au fur et à mesure.
      </p>

      {/* Toggle Liste / Cartes / Calendrier */}
      <div className="flex items-center gap-1 bg-white border border-stone-100 rounded-xl p-1 w-fit mb-6 shadow-sm">
        {([['liste', 'Liste'], ['cartes', 'Cartes'], ['calendrier', 'Calendrier']] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => { setView(v); setSelectedDay(null) }}
            className={`px-4 py-1.5 rounded-lg transition-all text-sm ${
              view === v
                ? 'bg-[#4a5240] text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
            style={{ fontWeight: 300 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-500">
            {doneTasks} tâche{doneTasks > 1 ? 's' : ''} sur {totalTasks} complétée{doneTasks > 1 ? 's' : ''}
          </p>
          <p
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.3rem', fontStyle: 'italic' }}
            className="text-[#4a5240]"
          >
            {pct}%
          </p>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#4a5240] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && (
          <p
            className="text-center mt-3 text-sm text-[#4a5240]"
            style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic' }}
          >
            🎉 Tout est prêt — profitez de chaque moment !
          </p>
        )}
      </div>

      {/* LIST VIEW */}
      {view === 'liste' && (
        <div className="space-y-8">
          {periods.map(period => {
            const done = period.tasks.filter(t => t.done).length
            const total = period.tasks.length
            return (
              <div key={period.id}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{period.emoji}</span>
                  <div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontWeight: 600,
                        fontSize: '1.2rem',
                        fontStyle: 'italic',
                      }}
                      className="text-[#2d3228] leading-tight"
                    >
                      {period.label}
                    </h2>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                      {done}/{total} complété{done > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50">
                  {period.tasks.map(task => (
                    <label
                      key={task.key}
                      className="flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-stone-50/50 transition-colors group"
                    >
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
                        <p
                          style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.5 }}
                          className={`transition-colors ${task.done ? 'text-stone-300 line-through' : 'text-stone-700'}`}
                        >
                          {task.label}
                        </p>
                        {task.detail && (
                          <p style={{ fontSize: '0.75rem', fontWeight: 300, lineHeight: 1.5 }} className="text-stone-400 mt-0.5">
                            {task.detail}
                          </p>
                        )}
                      </div>
                      {task.done && <span className="text-[#4a5240] shrink-0 mt-0.5 text-sm">✓</span>}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CARDS VIEW */}
      {view === 'cartes' && (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6">
          {periods.map(period => {
            const done = period.tasks.filter(t => t.done).length
            const total = period.tasks.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div
                key={period.id}
                className="shrink-0 snap-start w-72 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-3 border-b border-stone-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{period.emoji}</span>
                    <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.1rem', fontStyle: 'italic' }}
                        className="text-[#2d3228] leading-tight">{period.label}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4a5240] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-400 shrink-0">{done}/{total}</span>
                  </div>
                </div>
                {/* Tasks */}
                <div className="flex-1 divide-y divide-stone-50 overflow-y-auto max-h-96">
                  {period.tasks.map(task => (
                    <label key={task.key}
                           className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-stone-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={task.done}
                        disabled={saving === task.key}
                        onChange={() => toggleTask(period.id, task.key, task.done)}
                        className="mt-0.5 shrink-0 w-4 h-4 rounded border-stone-300 accent-[#4a5240] cursor-pointer"
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.4 }}
                            className={task.done ? 'text-stone-300 line-through' : 'text-stone-600'}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
                {/* Footer */}
                {pct === 100 && (
                  <div className="px-5 py-3 border-t border-stone-50 text-center">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem' }}
                          className="text-[#4a5240]">✓ Période complète</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendrier' && (
        <div className="space-y-6">
          {!parsedWeddingDate && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
              <p style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-stone-400">
                Ajoutez la date de votre mariage pour voir les tâches placées dans le calendrier.
              </p>
            </div>
          )}

          {calendarMonths.map((month, i) => {
            const monthKey = `${month.getFullYear()}-${month.getMonth()}`
            const tasksHere = parsedWeddingDate ? getTasksForMonth(month, parsedWeddingDate, periods) : []
            // Find the dayKey used to show this month's tasks (always day 1 of period month)
            const dayKeyForMonth = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`
            const isExpanded = selectedDay === dayKeyForMonth

            return (
              <div key={monthKey}>
                <CalendarMonth
                  month={month}
                  weddingDate={parsedWeddingDate}
                  periods={periods}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
                {isExpanded && tasksHere.length > 0 && (
                  <div className="mt-3">
                    <DayDetail
                      dayKey={dayKeyForMonth}
                      weddingDate={parsedWeddingDate}
                      periods={periods}
                      onToggle={toggleTask}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {parsedWeddingDate && calendarMonths.length === 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
              <p style={{ fontWeight: 300, fontSize: '0.88rem' }} className="text-stone-400">
                Aucun mois à afficher.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
