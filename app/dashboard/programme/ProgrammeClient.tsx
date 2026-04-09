'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Trash2, GripVertical, Clock, MapPin, Car, Accessibility, Info } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'ceremonie', label: '💍 Cérémonie' },
  { value: 'vin_honneur', label: '🥂 Vin d\'honneur' },
  { value: 'reception', label: '🎉 Réception' },
  { value: 'autre', label: '✨ Autre' },
]

type Event = {
  id?: string
  wedding_id: string
  type: string
  title: string
  date: string
  time_start: string
  end_time: string
  address: string
  parking_info: string
  pmr_accessible: boolean
  practical_info: string
  position: number
}

export default function ProgrammeClient({ wedding, initialEvents }: { wedding: any, initialEvents: Event[] }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addEvent = () => {
    const newEvent: Event = {
      wedding_id: wedding.id,
      type: 'ceremonie',
      title: '',
      date: wedding.date || '',
      time_start: '',
      end_time: '',
      address: '',
      parking_info: '',
      pmr_accessible: false,
      practical_info: '',
      position: events.length,
    }
    setEvents([...events, newEvent])
    setExpandedId(`new-${events.length}`)
  }

  const updateEvent = (index: number, field: string, value: any) => {
    const updated = [...events]
    updated[index] = { ...updated[index], [field]: value }
    setEvents(updated)
  }

  const removeEvent = async (index: number) => {
    const event = events[index]
    if (event.id) {
      await supabase.from('events').delete().eq('id', event.id)
    }
    setEvents(events.filter((_, i) => i !== index))
  }

  const saveAll = async () => {
    setSaving(true)
    for (let i = 0; i < events.length; i++) {
      const event = { ...events[i], position: i }
      if (event.id) {
        await supabase.from('events').update(event).eq('id', event.id)
      } else {
        const { data } = await supabase.from('events').insert(event).select().single()
        if (data) {
          const updated = [...events]
          updated[i] = data
          setEvents(updated)
        }
      }
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Programme</h1>
        <p className="text-gray-500 mt-1">Ajoutez les étapes de votre journée</p>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => {
          const isExpanded = expandedId === (event.id || `new-${index}`)
          const key = event.id || `new-${index}`

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : key)}
              >
                <GripVertical className="w-4 h-4 text-gray-300" />
                <span className="text-lg">
                  {EVENT_TYPES.find(t => t.value === event.type)?.label.split(' ')[0] || '✨'}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {event.title || <span className="text-gray-400">Sans titre</span>}
                  </p>
                  {event.time_start && (
                    <p className="text-sm text-gray-500">{event.time_start}{event.end_time ? ` → ${event.end_time}` : ''}</p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeEvent(index) }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                      <select
                        value={event.type}
                        onChange={e => updateEvent(index, 'type', e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {EVENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Titre</label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={e => updateEvent(index, 'title', e.target.value)}
                        placeholder="Ex: Cérémonie civile"
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><Clock className="w-3 h-3" />Date</label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={e => updateEvent(index, 'date', e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Début</label>
                      <input
                        type="time"
                        value={event.time_start}
                        onChange={e => updateEvent(index, 'time_start', e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fin</label>
                      <input
                        type="time"
                        value={event.end_time}
                        onChange={e => updateEvent(index, 'end_time', e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" />Adresse</label>
                    <input
                      type="text"
                      value={event.address}
                      onChange={e => updateEvent(index, 'address', e.target.value)}
                      placeholder="123 rue de la Paix, Paris"
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><Car className="w-3 h-3" />Parking</label>
                    <input
                      type="text"
                      value={event.parking_info}
                      onChange={e => updateEvent(index, 'parking_info', e.target.value)}
                      placeholder="Parking gratuit disponible..."
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><Info className="w-3 h-3" />Infos pratiques</label>
                    <textarea
                      value={event.practical_info}
                      onChange={e => updateEvent(index, 'practical_info', e.target.value)}
                      placeholder="Tenue de soirée requise..."
                      rows={2}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`pmr-${index}`}
                      checked={event.pmr_accessible}
                      onChange={e => updateEvent(index, 'pmr_accessible', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor={`pmr-${index}`} className="text-sm text-gray-600 flex items-center gap-1">
                      <Accessibility className="w-4 h-4" /> Accessible PMR
                    </label>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={addEvent}
        className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter une étape
      </button>

      <button
        onClick={saveAll}
        disabled={saving}
        className="mt-6 w-full bg-rose-500 text-white rounded-xl py-3 font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
      >
        {saving ? 'Enregistrement...' : 'Sauvegarder'}
      </button>
    </div>
  )
}
