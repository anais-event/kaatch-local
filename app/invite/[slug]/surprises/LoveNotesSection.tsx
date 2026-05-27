'use client'

import { useState } from 'react'

type LoveNote = {
  id: string
  author_name: string
  message: string
  open_at: string
  created_at: string
}

const PRESETS = [
  { label: '1 an de mariage', months: 12 },
  { label: '5 ans', months: 60 },
  { label: '10 ans', months: 120 },
]

function addMonths(months: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function formatFr(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function LoveNotesSection({
  defaultAuthor,
  myNotes,
  submit,
}: {
  defaultAuthor: string
  myNotes: LoveNote[]
  submit: (formData: FormData) => Promise<void>
}) {
  const [message, setMessage] = useState('')
  const [openAt, setOpenAt] = useState(addMonths(12))
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      await submit(fd)
      setMessage('')
      setOpenAt(addMonths(12))
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg">💌</span>
        <h2 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.3rem' }}
            className="text-[#2d3228]">Love Notes</h2>
        <span className="text-[10px] bg-[#4a5240]/10 text-[#4a5240] px-2 py-0.5 rounded-full uppercase tracking-widest"
              style={{ fontWeight: 300 }}>Nouveau</span>
      </div>
      <p style={{ fontWeight: 300, fontSize: '0.88rem', lineHeight: 1.7 }} className="text-stone-500 mb-5">
        Écrivez un mot scellé pour les mariés, à ouvrir plus tard — leur 1er anniversaire, dans 5 ans, dans 10 ans…
        Une capsule temporelle de votre voeu pour eux.
      </p>

      <form onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-5 flex flex-col gap-4">
        <input type="hidden" name="open_at" value={openAt} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Votre prénom
          </label>
          <input
            name="author_name"
            type="text"
            defaultValue={defaultAuthor}
            required
            className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
            style={{ fontWeight: 300 }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Votre mot scellé
          </label>
          <textarea
            name="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            required
            placeholder="Une pensée, un souhait, un secret pour eux à découvrir plus tard…"
            className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
            style={{ fontWeight: 300 }}
          />
          <p className="text-right text-xs text-stone-300" style={{ fontWeight: 300 }}>{message.length} / 500</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            À ouvrir le
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.months} type="button"
                      onClick={() => setOpenAt(addMonths(p.months))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        openAt === addMonths(p.months)
                          ? 'bg-[#4a5240] text-white border-[#4a5240]'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-[#4a5240]/40'
                      }`}
                      style={{ fontWeight: 300 }}>
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={openAt}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setOpenAt(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
            style={{ fontWeight: 300 }}
          />
          <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Les mariés verront ce mot à partir du <strong>{formatFr(openAt)}</strong>.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full py-3 rounded-xl bg-[#4a5240] text-white text-sm transition-all hover:bg-[#2d3228] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontWeight: 300, letterSpacing: '0.03em' }}>
          {loading ? 'Sceller le mot…' : 'Sceller mon mot 💌'}
        </button>

        {done && (
          <p className="text-center text-xs text-[#4a5240]" style={{ fontWeight: 300 }}>
            ✨ Votre mot est scellé. Les mariés le découvriront le {formatFr(openAt)}.
          </p>
        )}
      </form>

      {myNotes.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-3" style={{ fontWeight: 300 }}>
            Mes mots scellés
          </p>
          <div className="space-y-2">
            {myNotes.map(n => (
              <div key={n.id} className="bg-white/70 rounded-xl border border-stone-100 p-3 flex items-start gap-3">
                <span className="text-lg shrink-0">🔒</span>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-600 text-sm truncate" style={{ fontWeight: 300 }}>
                    {n.message.length > 80 ? n.message.slice(0, 80) + '…' : n.message}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5" style={{ fontWeight: 300 }}>
                    Ouverture le {formatFr(n.open_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
