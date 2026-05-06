'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  assigned_to: string | null
  moment: string
  done: boolean
}

type Props = {
  tasks: Task[]
  addTask: (formData: FormData) => Promise<void>
  toggleTask: (formData: FormData) => Promise<void>
  deleteTask: (formData: FormData) => Promise<void>
  updateTask: (formData: FormData) => Promise<void>
}

const MOMENTS = [
  { id: 'preparation', label: 'Préparatifs', emoji: '🌅' },
  { id: 'ceremonie', label: 'Cérémonie', emoji: '💒' },
  { id: 'cocktail', label: 'Cocktail', emoji: '🥂' },
  { id: 'diner', label: 'Dîner', emoji: '🍽️' },
  { id: 'soiree', label: 'Soirée', emoji: '🎊' },
  { id: 'autre', label: 'Autre', emoji: '📌' },
]

const MOMENT_COLORS: Record<string, string> = {
  preparation: '#6b7a8d',
  ceremonie: '#7c6a8e',
  cocktail: '#4a7c59',
  diner: '#8e6a4a',
  soiree: '#4a5240',
  autre: '#9a9a9a',
}

export default function ChecklistClient({ tasks, addTask, toggleTask, deleteTask, updateTask }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterMoment, setFilterMoment] = useState<string>('all')

  function run(action: () => Promise<void>) {
    startTransition(async () => { await action(); router.refresh() })
  }

  const doneCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length

  const visibleMoments = filterMoment === 'all'
    ? MOMENTS
    : MOMENTS.filter(m => m.id === filterMoment)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
            className="text-[#2d3228] mb-1">Checklist Jour J</h1>
        <p style={{ fontWeight: 300, fontSize: '0.85rem' }} className="text-stone-400">
          Organisez les tâches par moment et assignez-les à vos témoins, prestataires ou proches.
        </p>
      </div>

      {/* Stats + filtre */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl border border-stone-100 px-4 py-2 flex items-center gap-2 shadow-sm">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem' }} className="text-[#4a5240]">
              {doneCount}
            </span>
            <span style={{ fontWeight: 300, fontSize: '0.78rem' }} className="text-stone-400">/ {totalCount} fait{doneCount > 1 ? 'es' : ''}</span>
          </div>
          {totalCount > 0 && (
            <div className="h-2 w-24 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#4a5240] rounded-full transition-all"
                   style={{ width: `${totalCount ? Math.round(doneCount / totalCount * 100) : 0}%` }} />
            </div>
          )}
        </div>

        {/* Filtre moment */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMoment('all')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${filterMoment === 'all' ? 'bg-[#4a5240] text-white border-[#4a5240]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}
            style={{ fontWeight: 300 }}>
            Tout
          </button>
          {MOMENTS.map(m => {
            const count = tasks.filter(t => t.moment === m.id).length
            return (
              <button key={m.id}
                onClick={() => setFilterMoment(m.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${filterMoment === m.id ? 'text-white border-transparent' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}
                style={{ fontWeight: 300, background: filterMoment === m.id ? MOMENT_COLORS[m.id] : undefined }}>
                {m.emoji} {m.label} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sections par moment */}
      <div className="space-y-5">
        {visibleMoments.map(moment => {
          const momentTasks = tasks.filter(t => t.moment === moment.id)
          const doneMoment = momentTasks.filter(t => t.done).length
          const color = MOMENT_COLORS[moment.id]

          return (
            <div key={moment.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Header moment */}
              <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-50"
                   style={{ borderLeftWidth: 3, borderLeftColor: color, borderLeftStyle: 'solid' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{moment.emoji}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem' }}
                       className="text-[#2d3228]">{moment.label}</p>
                    {momentTasks.length > 0 && (
                      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400">
                        {doneMoment}/{momentTasks.length} fait{doneMoment > 1 ? 'es' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tâches */}
              {momentTasks.length === 0 && addingTo !== moment.id && (
                <div className="px-5 py-6 text-center">
                  <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-300">
                    Aucune tâche pour ce moment
                  </p>
                </div>
              )}

              <div className="divide-y divide-stone-50">
                {momentTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    editing={editingId === task.id}
                    color={color}
                    onToggle={() => run(async () => {
                      const fd = new FormData()
                      fd.append('id', task.id)
                      fd.append('done', String(task.done))
                      await toggleTask(fd)
                    })}
                    onDelete={() => run(async () => {
                      const fd = new FormData()
                      fd.append('id', task.id)
                      await deleteTask(fd)
                    })}
                    onEdit={() => setEditingId(task.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={(title, assignedTo, moment) => {
                      run(async () => {
                        const fd = new FormData()
                        fd.append('id', task.id)
                        fd.append('title', title)
                        fd.append('assigned_to', assignedTo)
                        fd.append('moment', moment)
                        await updateTask(fd)
                      })
                      setEditingId(null)
                    }}
                    isPending={isPending}
                  />
                ))}
              </div>

              {/* Formulaire ajout */}
              {addingTo === moment.id ? (
                <AddTaskForm
                  defaultMoment={moment.id}
                  onAdd={(title, assignedTo, momentId) => {
                    run(async () => {
                      const fd = new FormData()
                      fd.append('title', title)
                      fd.append('assigned_to', assignedTo)
                      fd.append('moment', momentId)
                      await addTask(fd)
                    })
                    setAddingTo(null)
                  }}
                  onCancel={() => setAddingTo(null)}
                />
              ) : (
                <div className="px-5 py-2.5">
                  <button
                    onClick={() => setAddingTo(moment.id)}
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

function TaskRow({ task, editing, color, onToggle, onDelete, onEdit, onCancelEdit, onSaveEdit, isPending }: {
  task: Task
  editing: boolean
  color: string
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (title: string, assignedTo: string, moment: string) => void
  isPending: boolean
}) {
  const [editTitle, setEditTitle] = useState(task.title)
  const [editAssignee, setEditAssignee] = useState(task.assigned_to ?? '')
  const [editMoment, setEditMoment] = useState(task.moment)

  if (editing) {
    return (
      <div className="px-5 py-3 bg-stone-50/60 space-y-2">
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(editTitle, editAssignee, editMoment); if (e.key === 'Escape') onCancelEdit() }}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white"
          style={{ fontWeight: 300 }}
          autoFocus
        />
        <div className="flex gap-2 flex-wrap">
          <input
            value={editAssignee}
            onChange={e => setEditAssignee(e.target.value)}
            placeholder="Assigné à..."
            className="flex-1 min-w-[120px] border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
            style={{ fontWeight: 300 }}
          />
          <select
            value={editMoment}
            onChange={e => setEditMoment(e.target.value)}
            className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
            style={{ fontWeight: 300 }}>
            {MOMENTS.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
          </select>
          <button onClick={() => onSaveEdit(editTitle, editAssignee, editMoment)}
                  className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg cursor-pointer" style={{ fontWeight: 300 }}>
            OK
          </button>
          <button onClick={onCancelEdit}
                  className="text-xs text-stone-400 px-2 py-1.5 cursor-pointer">✕</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 px-5 py-3.5 hover:bg-stone-50/60 transition-colors group">
      <button
        onClick={onToggle}
        disabled={isPending}
        className="mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-all"
        style={{ borderColor: task.done ? color : '#d6d3d1', background: task.done ? color : 'transparent' }}>
        {task.done && (
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.5 }}
           className={task.done ? 'text-stone-300 line-through' : 'text-stone-700'}>
          {task.title}
        </p>
        {task.assigned_to && (
          <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full"
                style={{ fontWeight: 400, background: `${color}18`, color }}>
            👤 {task.assigned_to}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="p-1 text-stone-300 hover:text-stone-500 cursor-pointer" title="Modifier">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button onClick={onDelete} className="p-1 text-stone-300 hover:text-red-400 cursor-pointer" title="Supprimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function AddTaskForm({ defaultMoment, onAdd, onCancel }: {
  defaultMoment: string
  onAdd: (title: string, assignedTo: string, moment: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [moment, setMoment] = useState(defaultMoment)

  return (
    <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/50 space-y-2">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { if (title.trim()) onAdd(title, assignee, moment) }; if (e.key === 'Escape') onCancel() }}
        placeholder="Titre de la tâche..."
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a5240] bg-white"
        style={{ fontWeight: 300 }}
        autoFocus
      />
      <div className="flex gap-2 flex-wrap">
        <input
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          placeholder="Assigné à... (ex : Témoin Marie)"
          className="flex-1 min-w-[120px] border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
          style={{ fontWeight: 300 }}
        />
        <select
          value={moment}
          onChange={e => setMoment(e.target.value)}
          className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#4a5240] bg-white"
          style={{ fontWeight: 300 }}>
          {MOMENTS.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
        </select>
        <button
          onClick={() => { if (title.trim()) onAdd(title, assignee, moment) }}
          disabled={!title.trim()}
          className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-40"
          style={{ fontWeight: 300 }}>
          Ajouter
        </button>
        <button onClick={onCancel} className="text-xs text-stone-400 px-2 py-1.5 cursor-pointer">✕</button>
      </div>
    </div>
  )
}
