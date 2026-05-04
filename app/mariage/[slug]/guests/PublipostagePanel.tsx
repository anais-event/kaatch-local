'use client'

import { useState, useMemo } from 'react'

type Guest = {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  telephone: string | null
  relation: string | null
  rsvp_status: 'en_attente' | 'confirme' | 'decline'
  invite_sent_at: string | null
  invite_token: string | null
}

type Props = {
  guests: Guest[]
  weddingId: string
  slug: string
}

const RSVP_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  decline: 'Décliné',
}

const RSVP_COLORS: Record<string, string> = {
  en_attente: 'bg-stone-100 text-stone-500',
  confirme: 'bg-emerald-50 text-emerald-600',
  decline: 'bg-red-50 text-red-400',
}

type SendResult = { sent: number; skipped: number; errors: string[] }

export default function PublipostagePanel({ guests, weddingId, slug }: Props) {
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filterRsvp, setFilterRsvp] = useState<string>('all')
  const [filterSent, setFilterSent] = useState<string>('all')
  const [filterHasContact, setFilterHasContact] = useState<string>('all')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [waTexts, setWaTexts] = useState<{ name: string; phone: string; text: string }[]>([])

  // Invités filtrés selon les critères
  const filtered = useMemo(() => guests.filter(g => {
    if (filterRsvp !== 'all' && g.rsvp_status !== filterRsvp) return false
    if (filterSent === 'sent' && !g.invite_sent_at) return false
    if (filterSent === 'notsent' && g.invite_sent_at) return false
    if (channel === 'email') {
      if (filterHasContact === 'withcontact' && !g.email) return false
      if (filterHasContact === 'nocontact' && g.email) return false
      if (filterHasContact === 'all' && !g.email) return false // par défaut on ne montre que ceux avec email
    } else {
      if (filterHasContact === 'withcontact' && !g.telephone) return false
      if (filterHasContact === 'nocontact' && g.telephone) return false
      if (filterHasContact === 'all' && !g.telephone) return false
    }
    return true
  }), [guests, filterRsvp, filterSent, filterHasContact, channel])

  const allFilteredSelected = filtered.length > 0 && filtered.every(g => selected.has(g.id))

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(g => n.delete(g.id)); return n })
    } else {
      setSelected(prev => new Set([...prev, ...filtered.map(g => g.id)]))
    }
  }

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  // Sélection rapide par filtre
  function quickSelect(type: string) {
    if (type === 'attente') {
      const ids = guests.filter(g => g.rsvp_status === 'en_attente' && (channel === 'email' ? g.email : g.telephone)).map(g => g.id)
      setSelected(new Set(ids))
    } else if (type === 'confirme') {
      const ids = guests.filter(g => g.rsvp_status === 'confirme' && (channel === 'email' ? g.email : g.telephone)).map(g => g.id)
      setSelected(new Set(ids))
    } else if (type === 'notsent') {
      const ids = guests.filter(g => !g.invite_sent_at && (channel === 'email' ? g.email : g.telephone)).map(g => g.id)
      setSelected(new Set(ids))
    } else if (type === 'all') {
      const ids = guests.filter(g => channel === 'email' ? g.email : g.telephone).map(g => g.id)
      setSelected(new Set(ids))
    }
  }

  async function handleSend() {
    if (!selected.size) return
    setSending(true)
    setResult(null)
    setWaTexts([])

    if (channel === 'whatsapp') {
      // Générer les textes WhatsApp un par un et ouvrir le premier
      const texts: { name: string; phone: string; text: string }[] = []
      for (const id of selected) {
        const g = guests.find(gg => gg.id === id)
        if (!g?.telephone) continue
        const res = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weddingId, slug, guestIds: [id], mode: 'whatsapp-text' }),
        })
        const data = await res.json()
        if (data.text) texts.push({ name: `${g.first_name}${g.last_name ? ` ${g.last_name}` : ''}`, phone: g.telephone, text: data.text })
      }
      setWaTexts(texts)
      // Ouvrir le premier directement
      if (texts.length > 0) {
        const first = texts[0]
        const phone = first.phone.replace(/\D/g, '')
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(first.text)}`, '_blank')
      }
      setSending(false)
      return
    }

    // Email
    const res = await fetch('/api/send-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, slug, guestIds: [...selected], mode: 'email' }),
    })
    const data: SendResult = await res.json()
    setResult(data)
    setSending(false)
    if (data.sent > 0) setSelected(new Set())
  }

  const selectedGuests = guests.filter(g => selected.has(g.id))

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-white rounded-xl border border-stone-100 px-4 py-3.5 hover:bg-stone-50/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">💌</span>
          <div className="text-left">
            <p className="text-sm text-stone-700" style={{ fontWeight: 400 }}>Envoyer les invitations</p>
            <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
              Email · WhatsApp · Publipostage
            </p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
             className={`w-4 h-4 text-stone-300 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-xl border border-stone-100 p-5 space-y-5">

          {/* Canal */}
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2" style={{ fontWeight: 300 }}>Canal d'envoi</p>
            <div className="flex gap-2">
              {[
                { key: 'email', label: '✉️ Email', count: guests.filter(g => g.email).length },
                { key: 'whatsapp', label: '💬 WhatsApp', count: guests.filter(g => g.telephone).length },
              ].map(c => (
                <button key={c.key} onClick={() => { setChannel(c.key as 'email' | 'whatsapp'); setSelected(new Set()) }}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm border transition cursor-pointer ${channel === c.key ? 'bg-[#4a5240] text-white border-[#4a5240]' : 'bg-white text-stone-500 border-stone-200 hover:border-[#4a5240]'}`}
                  style={{ fontWeight: 300 }}>
                  {c.label}
                  <span className={`ml-1.5 text-xs ${channel === c.key ? 'opacity-70' : 'text-stone-400'}`}>({c.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sélection rapide */}
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2" style={{ fontWeight: 300 }}>Sélection rapide</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'attente', label: '⏳ En attente' },
                { key: 'confirme', label: '✓ Confirmés' },
                { key: 'notsent', label: '📭 Pas encore envoyé' },
              ].map(q => (
                <button key={q.key} onClick={() => quickSelect(q.key)}
                  className="px-3 py-1 text-xs rounded-full border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition cursor-pointer bg-white"
                  style={{ fontWeight: 300 }}>
                  {q.label}
                </button>
              ))}
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())}
                  className="px-3 py-1 text-xs rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  ✕ Tout désélectionner
                </button>
              )}
            </div>
          </div>

          {/* Liste avec checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
                Invités ({filtered.length} avec {channel === 'email' ? 'email' : 'téléphone'})
              </p>
              <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer" style={{ fontWeight: 300 }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} className="rounded" />
                Tout sélectionner
              </label>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto rounded-xl border border-stone-100 p-1">
              {filtered.length === 0 && (
                <p className="text-center text-xs text-stone-300 py-6 italic">
                  Aucun invité avec {channel === 'email' ? 'adresse email' : 'numéro de téléphone'}
                </p>
              )}
              {filtered.map(g => (
                <label key={g.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${selected.has(g.id) ? 'bg-[#f5f0e8]' : 'hover:bg-stone-50'}`}>
                  <input type="checkbox" checked={selected.has(g.id)} onChange={() => toggle(g.id)} className="rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate" style={{ fontWeight: 400 }}>
                      {g.first_name}{g.last_name ? ` ${g.last_name}` : ''}
                    </p>
                    <p className="text-xs text-stone-400 truncate" style={{ fontWeight: 300 }}>
                      {channel === 'email' ? g.email : g.telephone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RSVP_COLORS[g.rsvp_status]}`} style={{ fontWeight: 300 }}>
                      {RSVP_LABELS[g.rsvp_status]}
                    </span>
                    {g.invite_sent_at && (
                      <span className="text-[10px] text-emerald-500" style={{ fontWeight: 300 }}>✓ envoyé</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Récap sélection + bouton envoi */}
          {selected.size > 0 && (
            <div className="bg-[#f5f0e8] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#2d3228]" style={{ fontWeight: 400 }}>
                  {selected.size} invité{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                  {selectedGuests.filter(g => channel === 'email' ? g.email : g.telephone).length} avec {channel === 'email' ? 'email' : 'téléphone'}
                </p>
              </div>

              {channel === 'whatsapp' && selected.size > 1 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2" style={{ fontWeight: 300 }}>
                  ⚠️ WhatsApp s'ouvrira pour chaque invité — un message à la fois.
                </p>
              )}

              <button onClick={handleSend} disabled={sending}
                className="w-full bg-[#4a5240] text-white py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer disabled:opacity-40"
                style={{ fontWeight: 300, letterSpacing: '0.05em' }}>
                {sending ? 'Envoi en cours…' : channel === 'email'
                  ? `💌 Envoyer ${selected.size} invitation${selected.size > 1 ? 's' : ''} par email`
                  : `💬 Ouvrir WhatsApp pour ${selected.size} invité${selected.size > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Résultat envoi email */}
          {result && (
            <div className={`rounded-xl px-4 py-3 text-sm ${result.errors.length ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              <p style={{ fontWeight: 400 }} className={result.errors.length ? 'text-amber-700' : 'text-emerald-700'}>
                ✓ {result.sent} email{result.sent > 1 ? 's' : ''} envoyé{result.sent > 1 ? 's' : ''}
                {result.skipped > 0 && ` · ${result.skipped} sans email ignoré${result.skipped > 1 ? 's' : ''}`}
              </p>
              {result.errors.length > 0 && (
                <p className="text-xs text-amber-600 mt-1" style={{ fontWeight: 300 }}>
                  Erreurs : {result.errors.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Messages WhatsApp générés */}
          {waTexts.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>Messages prêts à envoyer</p>
              {waTexts.slice(1).map((w, i) => {
                const phone = w.phone.replace(/\D/g, '')
                return (
                  <a key={i}
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(w.text)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                    <p className="text-sm text-emerald-700" style={{ fontWeight: 300 }}>{w.name}</p>
                    <span className="text-xs text-emerald-600">Ouvrir WhatsApp →</span>
                  </a>
                )
              })}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
