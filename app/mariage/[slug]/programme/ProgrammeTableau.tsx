'use client'

import { useState, useTransition, useRef } from 'react'

type Step = {
  id: string
  title: string
  description?: string | null
  address?: string | null
  time?: string | null
  icon?: string | null
  position: number
  visible_to_guests: boolean
  responsible?: string | null
  vendor_ids?: string[]
}

type Vendor = { id: string; name: string; category: string }

type Props = {
  slug: string
  steps: Step[]
  vendors: Vendor[]
  addStep: (fd: FormData) => Promise<void>
  deleteStep: (fd: FormData) => Promise<void>
  updateStep: (fd: FormData) => Promise<void>
  toggleStepVendor: (fd: FormData) => Promise<void>
}

function VendorCheckbox({ step, vendor, slug, toggleStepVendor }: {
  step: Step
  vendor: Vendor
  slug: string
  toggleStepVendor: (fd: FormData) => Promise<void>
}) {
  const checked = (step.vendor_ids ?? []).includes(vendor.id)
  const [optimistic, setOptimistic] = useState(checked)
  const [pending, startTransition] = useTransition()

  function toggle() {
    setOptimistic(v => !v)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('step_id', step.id)
      fd.set('vendor_id', vendor.id)
      fd.set('slug', slug)
      await toggleStepVendor(fd)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition cursor-pointer mx-auto ${
        optimistic
          ? 'bg-[#4a5240] border-[#4a5240]'
          : 'bg-white border-stone-300 hover:border-[#4a5240]'
      }`}
    >
      {optimistic && (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function VisibleToggle({ step, slug, updateStep }: {
  step: Step
  slug: string
  updateStep: (fd: FormData) => Promise<void>
}) {
  const [optimistic, setOptimistic] = useState(step.visible_to_guests)
  const [pending, startTransition] = useTransition()

  function toggle() {
    setOptimistic(v => !v)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', step.id)
      fd.set('slug', slug)
      fd.set('title', step.title)
      fd.set('description', step.description ?? '')
      fd.set('address', step.address ?? '')
      fd.set('time', step.time ?? '')
      fd.set('icon', step.icon ?? '✨')
      fd.set('responsible', step.responsible ?? '')
      fd.set('visible_to_guests', optimistic ? 'false' : 'true')
      await updateStep(fd)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={optimistic ? 'Visible — cliquer pour masquer' : 'Masqué — cliquer pour rendre visible'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer mx-auto ${optimistic ? 'bg-[#4a5240]' : 'bg-stone-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${optimistic ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function InlineEdit({ value, onSave, placeholder, className }: {
  value: string | null | undefined
  onSave: (val: string) => void
  placeholder: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  function start() {
    setDraft(value ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commit() {
    setEditing(false)
    if (draft !== (value ?? '')) onSave(draft)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false) } }}
        className={`w-full bg-[#f5f0e8] border border-[#4a5240] rounded px-1.5 py-0.5 text-xs outline-none ${className ?? ''}`}
        style={{ fontWeight: 300 }}
      />
    )
  }

  return (
    <span
      onClick={start}
      className={`block cursor-text text-xs truncate max-w-[120px] ${value ? 'text-stone-700' : 'text-stone-300 italic'} ${className ?? ''}`}
      style={{ fontWeight: 300 }}
      title={value ?? placeholder}
    >
      {value || placeholder}
    </span>
  )
}

export default function ProgrammeTableau({ slug, steps, vendors, addStep, deleteStep, updateStep, toggleStepVendor }: Props) {
  const [addFormKey, setAddFormKey] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function saveField(step: Step, field: 'title' | 'time' | 'address' | 'description' | 'responsible', val: string) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', step.id)
      fd.set('slug', slug)
      fd.set('title', field === 'title' ? val : step.title)
      fd.set('description', field === 'description' ? val : (step.description ?? ''))
      fd.set('address', field === 'address' ? val : (step.address ?? ''))
      fd.set('time', field === 'time' ? val : (step.time ?? ''))
      fd.set('icon', step.icon ?? '✨')
      fd.set('responsible', field === 'responsible' ? val : (step.responsible ?? ''))
      fd.set('visible_to_guests', step.visible_to_guests ? 'true' : 'false')
      await updateStep(fd)
    })
  }

  const cellBase = 'px-3 py-2.5 border-b border-stone-100 align-middle'
  const thBase = 'px-3 py-2 text-left text-[10px] text-stone-400 uppercase tracking-wider bg-stone-50 border-b border-stone-100 whitespace-nowrap'

  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 600 + vendors.length * 80 }}>
            <thead>
              <tr>
                <th className={thBase} style={{ width: 70 }}>Heure</th>
                <th className={thBase} style={{ width: 160 }}>Moment</th>
                <th className={thBase} style={{ width: 130 }}>Description</th>
                <th className={thBase} style={{ width: 120 }}>{"Où"}</th>
                <th className={thBase} style={{ width: 110 }}>Qui</th>
                <th className={`${thBase} text-center`} style={{ width: 70 }}>
                  <span title="Visible par les invités">{"👁"} Invités</span>
                </th>
                {vendors.map(v => (
                  <th key={v.id} className={`${thBase} text-center`} style={{ width: 80 }}>
                    <span className="block truncate max-w-[72px]" title={`${v.name} (${v.category})`}>
                      {v.name}
                    </span>
                    <span className="text-[9px] text-stone-300 font-normal normal-case tracking-normal block truncate max-w-[72px]">
                      {v.category}
                    </span>
                  </th>
                ))}
                <th className={thBase} style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {steps.length === 0 && (
                <tr>
                  <td colSpan={6 + vendors.length} className="text-center py-12 text-stone-300 text-sm" style={{ fontWeight: 300 }}>
                    Aucun moment — ajoutez-en un ci-dessous
                  </td>
                </tr>
              )}
              {steps.map((step, i) => (
                <tr key={step.id} className={`group hover:bg-stone-50/50 transition ${!step.visible_to_guests ? 'opacity-50' : ''}`}>
                  {/* Heure */}
                  <td className={cellBase}>
                    <InlineEdit value={step.time} placeholder="--:--" onSave={v => saveField(step, 'time', v)} />
                  </td>
                  {/* Moment */}
                  <td className={cellBase}>
                    <InlineEdit value={step.title} placeholder="Titre" onSave={v => saveField(step, 'title', v)} />
                  </td>
                  {/* Description */}
                  <td className={cellBase}>
                    <InlineEdit value={step.description} placeholder="Description..." onSave={v => saveField(step, 'description', v)} />
                  </td>
                  {/* Où */}
                  <td className={cellBase}>
                    <InlineEdit value={step.address} placeholder="Lieu..." onSave={v => saveField(step, 'address', v)} />
                  </td>
                  {/* Qui */}
                  <td className={cellBase}>
                    <InlineEdit value={step.responsible} placeholder="Responsable..." onSave={v => saveField(step, 'responsible', v)} />
                  </td>
                  {/* Visible invités */}
                  <td className={`${cellBase} text-center`}>
                    <VisibleToggle step={step} slug={slug} updateStep={updateStep} />
                  </td>
                  {/* Vendor checkboxes */}
                  {vendors.map(v => (
                    <td key={v.id} className={`${cellBase} text-center`}>
                      <VendorCheckbox step={step} vendor={v} slug={slug} toggleStepVendor={toggleStepVendor} />
                    </td>
                  ))}
                  {/* Delete */}
                  <td className={cellBase}>
                    {confirmDelete === step.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const fd = new FormData()
                            fd.set('id', step.id)
                            fd.set('slug', slug)
                            startTransition(() => deleteStep(fd))
                            setConfirmDelete(null)
                          }}
                          className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer"
                          style={{ fontWeight: 400 }}
                        >OK</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-[10px] text-stone-300 hover:text-stone-500 cursor-pointer"
                          style={{ fontWeight: 300 }}>Non</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(step.id)}
                        className="text-stone-200 hover:text-red-400 transition text-base cursor-pointer opacity-0 group-hover:opacity-100"
                      >×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add row */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
        <p className="text-xs text-stone-400 mb-3" style={{ fontWeight: 300 }}>Ajouter un moment</p>
        <form
          key={addFormKey}
          action={async (fd) => { await addStep(fd); setAddFormKey(k => k + 1) }}
        >
          <input type="hidden" name="slug" value={slug} />
          <div className="flex gap-2 flex-wrap">
            <input name="time" placeholder="Heure"
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300, width: 90 }} />
            <input name="title" placeholder="Moment *" required
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition flex-1"
              style={{ fontWeight: 300, minWidth: 140 }} />
            <input name="address" placeholder="Lieu"
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition"
              style={{ fontWeight: 300, width: 130 }} />
            <input name="description" placeholder="Description"
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-[#f5f0e8] outline-none focus:border-[#4a5240] transition flex-1"
              style={{ fontWeight: 300, minWidth: 120 }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d3228] transition cursor-pointer shrink-0"
              style={{ fontWeight: 400 }}>
              + Ajouter
            </button>
          </div>
        </form>
      </div>

      {vendors.length === 0 && (
        <p className="text-xs text-stone-300 mt-3 text-center" style={{ fontWeight: 300 }}>
          {"Ajoutez des prestataires depuis"}{' '}
          <a href={`/mariage/${slug}/prestataires`} className="text-[#4a5240] underline">
            Prestataires
          </a>
          {' '}{"pour voir les colonnes prestataires"}
        </p>
      )}
    </div>
  )
}
