'use client'

import { useState, useRef } from 'react'

export type TextEl = {
  id: string
  content: string
  x: number   // % of card width
  y: number   // % of card height
  fontSize: number
  fontFamily: string
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  italic: boolean
}

export type EditorColors = { fond: string; doux: string; accent: string; texte: string }

function uid() { return `el_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` }

export function defaultElements(
  productId: string,
  info: { name1: string; name2: string; date: string; lieu: string },
  c: EditorColors,
  displayFamily: string,
  displayWeight: number,
): TextEl[] {
  const n1 = info.name1 || 'Prénom'
  const n2 = info.name2 || 'Prénom'
  const names = `${n1} & ${n2}`
  const dateStr = info.date
    ? new Date(info.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date du mariage'
  const lieu = info.lieu || 'Lieu de la cérémonie'

  const D = (content: string, x: number, y: number, sz: number, p?: Partial<TextEl>): TextEl => ({
    id: uid(), content, x, y, fontSize: sz,
    fontFamily: p?.fontFamily ?? displayFamily, fontWeight: p?.fontWeight ?? displayWeight,
    color: p?.color ?? c.texte, align: p?.align ?? 'center', italic: p?.italic ?? false,
  })
  const B = (content: string, x: number, y: number, sz: number, p?: Partial<TextEl>): TextEl =>
    D(content, x, y, sz, { fontFamily: 'var(--font-lato)', fontWeight: 300, ...p })

  switch (productId) {
    case 'faire_part': return [
      B('INVITATION AU MARIAGE', 50, 12, 6, { color: c.texte + '66' }),
      D(names, 50, 42, 22),
      B(dateStr, 50, 61, 8, { color: c.texte + 'aa' }),
      B(lieu, 50, 70, 7.5, { color: c.texte + '88' }),
      B('Nous avons la joie de vous convier', 50, 80, 7.5, { color: c.texte + '77' }),
    ]
    case 'save_the_date': return [
      B('SAVE THE DATE', 50, 16, 6.5, { color: c.texte + '66' }),
      D(names, 50, 44, 24),
      B(dateStr, 50, 62, 9, { color: c.texte + 'aa' }),
    ]
    case 'menu': return [
      D(names, 50, 12, 15),
      B(dateStr, 50, 23, 7.5, { color: c.texte + '88' }),
      B('ENTRÉE', 12, 38, 6.5, { align: 'left', color: c.accent, fontWeight: 600 }),
      B('PLAT', 12, 53, 6.5, { align: 'left', color: c.accent, fontWeight: 600 }),
      B('FROMAGE', 12, 68, 6.5, { align: 'left', color: c.accent, fontWeight: 600 }),
      B('DESSERT', 12, 82, 6.5, { align: 'left', color: c.accent, fontWeight: 600 }),
    ]
    case 'marque_place': return [
      D('Sophie Durand', 50, 38, 14),
      B('Table 1', 50, 60, 8, { color: c.texte + '88' }),
    ]
    case 'numero_table': return [
      D('3', 50, 40, 42),
      B('TABLE', 50, 66, 6.5, { color: c.texte + '88' }),
    ]
    default: return [
      D(names, 50, 22, 16),
      B(dateStr, 50, 34, 8, { color: c.texte + '88' }),
    ]
  }
}

const ASPECT: Record<string, [number, number]> = {
  faire_part:    [240, 338],
  save_the_date: [240, 338],
  menu:          [240, 338],
  marque_place:  [320, 200],
  numero_table:  [320, 200],
  plan_table:    [260, 185],
  plan_ceremonie:[260, 185],
}

export default function StudioEditor({
  productId,
  colors,
  elements,
  onChange,
}: {
  productId: string
  colors: EditorColors
  elements: TextEl[]
  onChange: (els: TextEl[]) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; sx: number; sy: number; ex: number; ey: number } | null>(null)

  const [W, H] = ASPECT[productId] ?? [240, 338]
  const selected = elements.find(e => e.id === selectedId) ?? null

  function upd(id: string, p: Partial<TextEl>) {
    onChange(elements.map(e => e.id === id ? { ...e, ...p } : e))
  }

  function addEl() {
    const id = uid()
    onChange([...elements, { id, content: 'Nouveau texte', x: 50, y: 50, fontSize: 10, fontFamily: 'var(--font-lato)', fontWeight: 300, color: colors.texte, align: 'center', italic: false }])
    setSelectedId(id)
  }

  function delEl(id: string) {
    onChange(elements.filter(e => e.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function onPD(e: React.PointerEvent, id: string) {
    e.preventDefault(); e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const el = elements.find(el => el.id === id)!
    drag.current = { id, sx: e.clientX, sy: e.clientY, ex: el.x, ey: el.y }
    setSelectedId(id); setEditingId(null)
  }

  function onPM(e: React.PointerEvent) {
    if (!drag.current) return
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    const dx = ((e.clientX - drag.current.sx) / r.width) * 100
    const dy = ((e.clientY - drag.current.sy) / r.height) * 100
    upd(drag.current.id, {
      x: Math.max(1, Math.min(99, drag.current.ex + dx)),
      y: Math.max(1, Math.min(99, drag.current.ey + dy)),
    })
  }

  function downloadPNG() {
    const sc = 3
    const cv = document.createElement('canvas')
    cv.width = W * sc; cv.height = H * sc
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = colors.fond
    ctx.beginPath()
    ctx.roundRect(0, 0, cv.width, cv.height, 12 * sc)
    ctx.fill()
    ctx.fillStyle = colors.accent
    ctx.fillRect(W * sc / 2 - 18 * sc, H * sc * 0.28, 36 * sc, 1.5 * sc)
    ctx.fillRect(W * sc / 2 - 18 * sc, H * sc * 0.72, 36 * sc, 1.5 * sc)
    elements.forEach(el => {
      const ff = el.fontFamily.includes('cormorant') ? 'Georgia, serif' : 'Arial, sans-serif'
      ctx.font = `${el.italic ? 'italic ' : ''}${el.fontWeight} ${el.fontSize * sc}px ${ff}`
      ctx.fillStyle = el.color
      ctx.textAlign = el.align
      ctx.fillText(el.content, (el.x / 100) * cv.width, (el.y / 100) * cv.height)
    })
    const a = document.createElement('a')
    a.download = `apercu-${productId}.png`
    a.href = cv.toDataURL()
    a.click()
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-lato)' }}>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center relative" onClick={() => { setSelectedId(null); setEditingId(null) }}>
        <button onClick={e => { e.stopPropagation(); addEl() }} className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: `${colors.texte}12`, color: colors.texte, fontSize: '0.62rem', fontWeight: 400 }}>
          + Texte
        </button>
        <button onClick={e => { e.stopPropagation(); downloadPNG() }} className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: `${colors.texte}12`, color: colors.texte, fontSize: '0.62rem', fontWeight: 400 }}>
          ↓ PNG
        </button>

        <div
          ref={cardRef}
          onPointerMove={onPM}
          onPointerUp={() => { drag.current = null }}
          className="relative"
          style={{ width: W, height: H, background: colors.fond, borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'background 0.4s' }}
        >
          <div style={{ position: 'absolute', left: '50%', top: '28%', transform: 'translate(-50%,-50%)', width: 36, height: 1.5, background: colors.accent, borderRadius: 1 }} />
          <div style={{ position: 'absolute', left: '50%', top: '72%', transform: 'translate(-50%,-50%)', width: 36, height: 1.5, background: colors.accent, borderRadius: 1 }} />

          {elements.map(el => (
            <div
              key={el.id}
              onPointerDown={e => onPD(e, el.id)}
              onDoubleClick={e => { e.stopPropagation(); setEditingId(el.id) }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: `${el.x}%`, top: `${el.y}%`,
                transform: 'translate(-50%,-50%)',
                fontFamily: el.fontFamily, fontSize: el.fontSize,
                fontWeight: el.fontWeight, fontStyle: el.italic ? 'italic' : 'normal',
                color: el.color, textAlign: el.align,
                cursor: 'grab', userSelect: 'none', touchAction: 'none',
                outline: selectedId === el.id ? `1.5px dashed ${colors.accent}88` : 'none',
                outlineOffset: 4, borderRadius: 2, padding: '1px 3px',
                whiteSpace: 'nowrap',
              }}
            >
              {editingId === el.id ? (
                <input autoFocus value={el.content}
                  onChange={e2 => upd(el.id, { content: e2.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={e2 => { if (e2.key === 'Enter') setEditingId(null) }}
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: el.fontFamily, fontSize: el.fontSize, fontWeight: el.fontWeight, color: el.color, textAlign: el.align, minWidth: 60, padding: 0, cursor: 'text' }}
                />
              ) : el.content}
            </div>
          ))}
        </div>
      </div>

      {/* Properties bar */}
      <div style={{ borderTop: `1px solid ${colors.texte}10`, background: `${colors.fond}ee`, backdropFilter: 'blur(12px)' }}>
        {!selected ? (
          <p className="text-center py-2.5" style={{ fontSize: '0.6rem', fontWeight: 300, color: colors.texte, opacity: 0.4 }}>
            Cliquer · Glisser · Double-clic pour modifier
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5 p-3 items-end">

            {/* Text */}
            <div className="flex-1 min-w-28">
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Texte</label>
              <input value={selected.content} onChange={e => upd(selected.id, { content: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border focus:outline-none" style={{ fontSize: '0.78rem', fontWeight: 300, color: '#2d3228', borderColor: '#e7e5e4' }} />
            </div>

            {/* Font */}
            <div>
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Police</label>
              <div className="flex gap-1">
                {[['var(--font-cormorant)', 'Cormor.', 'cormorant'], ['var(--font-lato)', 'Lato', 'lato']].map(([ff, label, key]) => (
                  <button key={key} onClick={() => upd(selected.id, { fontFamily: ff })} className="px-2 py-1.5 rounded-lg border transition-all" style={{ fontSize: '0.7rem', fontFamily: ff, fontWeight: key === 'cormorant' ? 600 : 300, borderColor: selected.fontFamily.includes(key) ? colors.accent : '#e7e5e4', background: selected.fontFamily.includes(key) ? `${colors.accent}18` : '#fff', color: '#2d3228' }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Taille</label>
              <div className="flex items-center gap-0.5">
                <button onClick={() => upd(selected.id, { fontSize: Math.max(6, selected.fontSize - 1) })} className="w-6 h-7 flex items-center justify-center rounded border" style={{ borderColor: '#e7e5e4', color: '#78716c' }}>−</button>
                <input type="number" min={6} max={72} value={selected.fontSize} onChange={e => upd(selected.id, { fontSize: parseInt(e.target.value) || 10 })} className="w-9 h-7 rounded-lg border text-center focus:outline-none" style={{ fontSize: '0.75rem', color: '#2d3228', borderColor: '#e7e5e4' }} />
                <button onClick={() => upd(selected.id, { fontSize: Math.min(72, selected.fontSize + 1) })} className="w-6 h-7 flex items-center justify-center rounded border" style={{ borderColor: '#e7e5e4', color: '#78716c' }}>+</button>
              </div>
            </div>

            {/* Weight + italic */}
            <div>
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Style</label>
              <div className="flex gap-0.5">
                {([300, 400, 600, 700] as const).map(w => (
                  <button key={w} onClick={() => upd(selected.id, { fontWeight: w })} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all" style={{ borderColor: selected.fontWeight === w ? colors.accent : '#e7e5e4', background: selected.fontWeight === w ? `${colors.accent}18` : '#fff', fontSize: '0.6rem', fontWeight: w, color: '#2d3228' }}>
                    {w === 300 ? 'L' : w === 400 ? 'R' : w === 600 ? 'S' : 'B'}
                  </button>
                ))}
                <button onClick={() => upd(selected.id, { italic: !selected.italic })} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all" style={{ borderColor: selected.italic ? colors.accent : '#e7e5e4', background: selected.italic ? `${colors.accent}18` : '#fff', fontSize: '0.78rem', fontStyle: 'italic', fontFamily: 'Georgia', color: '#2d3228' }}>i</button>
              </div>
            </div>

            {/* Align */}
            <div>
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Align.</label>
              <div className="flex gap-0.5">
                {(['left', 'center', 'right'] as const).map(a => (
                  <button key={a} onClick={() => upd(selected.id, { align: a })} className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all" style={{ borderColor: selected.align === a ? colors.accent : '#e7e5e4', background: selected.align === a ? `${colors.accent}18` : '#fff', fontSize: '0.65rem', color: '#78716c' }}>
                    {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ fontSize: '0.55rem', color: colors.texte, opacity: 0.5, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Couleur</label>
              <div className="flex gap-1 items-center">
                {[colors.texte, colors.accent, colors.doux, '#ffffff', '#000000'].map(col => (
                  <button key={col} onClick={() => upd(selected.id, { color: col })} className="w-6 h-6 rounded-full border-2 transition-all flex-shrink-0" style={{ background: col, borderColor: selected.color === col ? colors.accent : 'transparent', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }} />
                ))}
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                  <input type="color" value={selected.color} onChange={e => upd(selected.id, { color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Delete */}
            <button onClick={() => delEl(selected.id)} className="px-2.5 py-1.5 rounded-lg border self-end transition-all" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#ef4444', fontSize: '0.72rem' }}>
              Suppr.
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
