'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  weddingName: string
  dateStr: string | null
  location: string | null
  coupleMessage: string | null
  coverImageUrl: string | null
  slug: string
  personalUrl: string
  paid?: boolean
}

type Phase = 'curtain-closed' | 'opening' | 'revealed'

const BG = '#4a5639'
const GOLD = '#c9a96e'

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 37 + 3) % 100,
  delay: ((i * 0.22) % 3).toFixed(2),
  duration: (3.5 + (i % 5) * 0.4).toFixed(2),
  size: 6 + (i % 4) * 2,
  color: ['rgba(201,169,110,0.45)', 'rgba(255,255,255,0.12)', 'rgba(180,200,150,0.35)', 'rgba(226,201,126,0.4)'][i % 4],
  side: i % 2 === 0 ? 'petal-l' : 'petal-r',
  rotate: (i * 53) % 360,
}))

function parseNames(name: string): [string, string | null] {
  const m = name.match(/^(.+?)\s+[&]\s+(.+)$/i)
  if (m) return [m[1].trim(), m[2].trim()]
  const m2 = name.match(/^(.+?)\s+et\s+(.+)$/i)
  if (m2) return [m2[1].trim(), m2[2].trim()]
  return [name, null]
}

function GoldRingDecor({ size }: { size: number }) {
  const r = size / 2
  const r2 = r - 12
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="goldRing1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="40%" stopColor="#c9a96e" />
          <stop offset="75%" stopColor="#a07840" />
          <stop offset="100%" stopColor="#d4b96e" />
        </linearGradient>
        <linearGradient id="goldRing2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b96e" />
          <stop offset="50%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#e2c97e" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke="url(#goldRing1)" strokeWidth="1.8" />
      {/* Inner ring */}
      <circle cx={r} cy={r} r={r2 - 2} fill="none" stroke="url(#goldRing2)" strokeWidth="1.2" opacity="0.7" />
      {/* Small decorative dots on outer ring */}
      {[0, 90, 180, 270].map(deg => {
        const rad = (deg * Math.PI) / 180
        const cx2 = r + (r - 2) * Math.cos(rad)
        const cy2 = r + (r - 2) * Math.sin(rad)
        return <circle key={deg} cx={cx2} cy={cy2} r="3" fill="none" stroke="url(#goldRing1)" strokeWidth="1.2" />
      })}
    </svg>
  )
}

function TopLeavesSVG({ size }: { size: number }) {
  const cx = size / 2
  return (
    <svg width={size * 0.7} height={50} viewBox={`0 0 ${size * 0.7} 50`} fill="none"
         style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <g opacity="0.85">
        {/* Center stem */}
        <path d={`M${size*0.35} 50 Q${size*0.35} 28 ${size*0.35} 8`} stroke="rgba(160,130,80,0.5)" strokeWidth="0.8" />
        {/* Left leaves */}
        <path d={`M${size*0.35} 30 C${size*0.2} 10 ${size*0.05} 15 ${size*0.12} 28 C${size*0.05} 15 ${size*0.22} 8 ${size*0.35} 30Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${size*0.35} 20 C${size*0.22} 3 ${size*0.1} 6 ${size*0.16} 18 C${size*0.1} 6 ${size*0.25} 0 ${size*0.35} 20Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${size*0.35} 38 C${size*0.15} 22 ${size*0} 28 ${size*0.08} 40 C${size*0} 28 ${size*0.18} 20 ${size*0.35} 38Z`} fill="rgba(165,195,140,0.65)" />
        {/* Right leaves */}
        <path d={`M${size*0.35} 30 C${size*0.5} 10 ${size*0.65} 15 ${size*0.58} 28 C${size*0.65} 15 ${size*0.48} 8 ${size*0.35} 30Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${size*0.35} 20 C${size*0.48} 3 ${size*0.6} 6 ${size*0.54} 18 C${size*0.6} 6 ${size*0.45} 0 ${size*0.35} 20Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${size*0.35} 38 C${size*0.55} 22 ${size*0.7} 28 ${size*0.62} 40 C${size*0.7} 28 ${size*0.52} 20 ${size*0.35} 38Z`} fill="rgba(165,195,140,0.65)" />
      </g>
    </svg>
  )
}

function BottomLeavesSVG({ size }: { size: number }) {
  const hw = size * 0.9
  return (
    <svg width={hw} height={65} viewBox={`0 0 ${hw} 65`} fill="none"
         style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <g opacity="0.85">
        <path d={`M${hw*0.5} 0 Q${hw*0.5} 30 ${hw*0.5} 58`} stroke="rgba(160,130,80,0.5)" strokeWidth="0.8" />
        {/* Center large leaves */}
        <path d={`M${hw*0.5} 15 C${hw*0.28} -5 ${hw*0.08} 5 ${hw*0.18} 22 C${hw*0.08} 5 ${hw*0.3} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 15 C${hw*0.72} -5 ${hw*0.92} 5 ${hw*0.82} 22 C${hw*0.92} 5 ${hw*0.7} -8 ${hw*0.5} 15Z`} fill="rgba(155,185,130,0.75)" />
        <path d={`M${hw*0.5} 28 C${hw*0.22} 8 ${hw*0} 18 ${hw*0.1} 34 C${hw*0} 18 ${hw*0.24} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 28 C${hw*0.78} 8 ${hw} 18 ${hw*0.9} 34 C${hw} 18 ${hw*0.76} 6 ${hw*0.5} 28Z`} fill="rgba(145,175,120,0.7)" />
        <path d={`M${hw*0.5} 40 C${hw*0.3} 22 ${hw*0.12} 30 ${hw*0.2} 44 C${hw*0.12} 30 ${hw*0.32} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${hw*0.5} 40 C${hw*0.7} 22 ${hw*0.88} 30 ${hw*0.8} 44 C${hw*0.88} 30 ${hw*0.68} 20 ${hw*0.5} 40Z`} fill="rgba(165,195,140,0.65)" />
        <path d={`M${hw*0.5} 50 C${hw*0.35} 38 ${hw*0.22} 44 ${hw*0.28} 55 C${hw*0.22} 44 ${hw*0.37} 36 ${hw*0.5} 50Z`} fill="rgba(150,180,125,0.6)" />
        <path d={`M${hw*0.5} 50 C${hw*0.65} 38 ${hw*0.78} 44 ${hw*0.72} 55 C${hw*0.78} 44 ${hw*0.63} 36 ${hw*0.5} 50Z`} fill="rgba(150,180,125,0.6)" />
      </g>
    </svg>
  )
}

function GoldLeafSVG() {
  return (
    <svg width="45" height="70" viewBox="0 0 45 70" fill="none"
         style={{ position: 'absolute', left: -6, top: '42%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="50%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#a07840" />
        </linearGradient>
      </defs>
      {/* Main leaf shape */}
      <path d="M38 5 Q12 15 8 45 Q14 58 26 52 Q40 46 38 5Z" fill="url(#gLeaf)" opacity="0.9" />
      {/* Highlight */}
      <path d="M33 10 Q16 18 14 40 Q18 50 27 46 Q36 42 33 10Z" fill="rgba(226,201,126,0.35)" />
      {/* Veins */}
      <path d="M38 5 Q22 25 16 52" stroke="rgba(120,80,30,0.5)" strokeWidth="0.8" fill="none" />
      <path d="M30 12 Q22 28 20 46" stroke="rgba(120,80,30,0.35)" strokeWidth="0.5" fill="none" />
      <path d="M36 20 Q28 32 24 50" stroke="rgba(120,80,30,0.3)" strokeWidth="0.5" fill="none" />
      {/* Sub-leaf at bottom */}
      <path d="M20 52 Q5 45 3 58 Q8 66 18 62 Q28 58 20 52Z" fill="url(#gLeaf)" opacity="0.7" />
    </svg>
  )
}

function GeometricFrame({ width, height }: { width: number; height: number }) {
  const w = width, h = height
  const cx = w / 2
  const inset = 10
  const pts = (scale: number, offset: number) => {
    const s = scale
    const o = offset
    return [
      [cx, o],
      [cx + w * 0.3 * s, h * 0.12 * s + o],
      [w * s + (w - w * s) / 2, h * 0.36 * s + o],
      [w * s + (w - w * s) / 2, h * 0.64 * s + o],
      [cx + w * 0.3 * s, h * 0.88 * s + o],
      [cx, h * s + o],
      [cx - w * 0.3 * s, h * 0.88 * s + o],
      [w * (1 - s) / 2, h * 0.64 * s + o],
      [w * (1 - s) / 2, h * 0.36 * s + o],
      [cx - w * 0.3 * s, h * 0.12 * s + o],
    ].map(([x, y]) => `${x},${y}`).join(' ')
  }

  const outerPts = [
    cx, 0,
    cx + w * 0.3, h * 0.12,
    w, h * 0.36,
    w, h * 0.64,
    cx + w * 0.3, h * 0.88,
    cx, h,
    cx - w * 0.3, h * 0.88,
    0, h * 0.64,
    0, h * 0.36,
    cx - w * 0.3, h * 0.12,
  ].reduce((acc: string, v, i) => acc + (i % 2 === 0 ? (i > 0 ? ' ' : '') + v : ',' + v), '')

  const innerOff = inset
  const innerPts = [
    cx, innerOff,
    cx + (w - innerOff * 2) * 0.3, h * 0.12 + innerOff * 0.6,
    w - innerOff, h * 0.36 + innerOff * 0.4,
    w - innerOff, h * 0.64 - innerOff * 0.4,
    cx + (w - innerOff * 2) * 0.3, h * 0.88 - innerOff * 0.6,
    cx, h - innerOff,
    cx - (w - innerOff * 2) * 0.3, h * 0.88 - innerOff * 0.6,
    innerOff, h * 0.64 - innerOff * 0.4,
    innerOff, h * 0.36 + innerOff * 0.4,
    cx - (w - innerOff * 2) * 0.3, h * 0.12 + innerOff * 0.6,
  ].reduce((acc: string, v, i) => acc + (i % 2 === 0 ? (i > 0 ? ' ' : '') + v : ',' + v), '')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="frameGradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2c97e" />
          <stop offset="35%" stopColor="#c9a96e" />
          <stop offset="65%" stopColor="#8b6430" />
          <stop offset="100%" stopColor="#c9a96e" />
        </linearGradient>
        <linearGradient id="frameGradB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b96e" />
          <stop offset="50%" stopColor="#a07840" />
          <stop offset="100%" stopColor="#e2c97e" />
        </linearGradient>
      </defs>
      <polygon points={outerPts} fill="none" stroke="url(#frameGradA)" strokeWidth="1.8" />
      <polygon points={innerPts} fill="none" stroke="url(#frameGradB)" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

async function drawFairePartCanvasNew(
  personalUrl: string,
  weddingName: string,
  dateStr: string | null,
  location: string | null,
  coupleMessage: string | null,
  qrCanvas: HTMLCanvasElement | null
): Promise<string> {
  const W = 600, H = 1700
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'

  // ─── PAGE 1 BACKGROUND ───
  ctx.fillStyle = '#4a5639'
  ctx.fillRect(0, 0, W, 850)

  // ─── PAGE 2 BACKGROUND ───
  ctx.fillStyle = '#4c5a3b'
  ctx.fillRect(0, 860, W, H - 860)

  // ─── THIN PAGE SEPARATOR ───
  ctx.strokeStyle = 'rgba(201,169,110,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(40, 855); ctx.lineTo(560, 855); ctx.stroke()

  // ─── HELPER FUNCTIONS ───
  function goldGrad(x0: number, y0: number, x1: number, y1: number) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, '#e2c97e')
    g.addColorStop(0.4, '#c9a96e')
    g.addColorStop(0.75, '#a07840')
    g.addColorStop(1, '#d4b96e')
    return g
  }

  function drawLeaf(lx: number, ly: number, size: number, angle: number, color: string, alpha = 0.75) {
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(angle)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.bezierCurveTo(-size * 0.32, -size * 0.45, -size * 0.22, -size * 1.05, 0, -size * 1.15)
    ctx.bezierCurveTo(size * 0.22, -size * 1.05, size * 0.32, -size * 0.45, 0, 0)
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 0.2
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -size * 1.15)
    ctx.strokeStyle = '#2d3a22'; ctx.lineWidth = 0.6; ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  function drawGoldLeaf(lx: number, ly: number) {
    ctx.save()
    ctx.translate(lx, ly)
    const g = ctx.createLinearGradient(0, 0, 35, 60)
    g.addColorStop(0, '#e2c97e'); g.addColorStop(0.5, '#c9a96e'); g.addColorStop(1, '#a07840')
    ctx.beginPath()
    ctx.moveTo(35, 0)
    ctx.bezierCurveTo(8, 10, 4, 38, 8, 50)
    ctx.bezierCurveTo(14, 62, 32, 56, 35, 0)
    ctx.fillStyle = g; ctx.fill()
    ctx.beginPath(); ctx.moveTo(35, 0); ctx.bezierCurveTo(20, 20, 14, 44, 10, 54)
    ctx.strokeStyle = 'rgba(120,80,30,0.5)'; ctx.lineWidth = 0.8; ctx.stroke()
    // sub-leaf
    ctx.beginPath()
    ctx.moveTo(12, 50)
    ctx.bezierCurveTo(-2, 45, -5, 58, 2, 64)
    ctx.bezierCurveTo(10, 68, 18, 62, 12, 50)
    ctx.fillStyle = g; ctx.fill()
    ctx.restore()
  }

  // ─── PAGE 1: TOP TEXT ───
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = 'italic 22px Georgia, serif'
  ctx.fillText('Vous êtes invités au mariage de', W / 2, 58)

  // ─── RING ───
  const ringCX = W / 2, ringCY = 330, ringR = 175, ringR2 = 160

  // outer ring
  ctx.beginPath(); ctx.arc(ringCX, ringCY, ringR, 0, Math.PI * 2)
  ctx.strokeStyle = goldGrad(ringCX - ringR, ringCY, ringCX + ringR, ringCY)
  ctx.lineWidth = 2.2; ctx.stroke()
  // inner ring
  ctx.beginPath(); ctx.arc(ringCX, ringCY, ringR2, 0, Math.PI * 2)
  ctx.strokeStyle = goldGrad(ringCX + ringR2, ringCY, ringCX - ringR2, ringCY)
  ctx.globalAlpha = 0.65; ctx.lineWidth = 1.4; ctx.stroke()
  ctx.globalAlpha = 1

  // decorative dots on ring
  ;[0, 90, 180, 270].forEach(deg => {
    const rad = (deg * Math.PI) / 180
    const dx = ringCX + ringR * Math.cos(rad)
    const dy = ringCY + ringR * Math.sin(rad)
    ctx.beginPath(); ctx.arc(dx, dy, 3.5, 0, Math.PI * 2)
    ctx.strokeStyle = goldGrad(dx - 4, dy, dx + 4, dy); ctx.lineWidth = 1.5; ctx.stroke()
  })

  // ─── BOTANICAL TOP LEAVES ───
  const leafColors = ['#9bb982', '#8aad72', '#a3c48a', '#7aa068', '#b0cc96']
  // center cluster top
  ;[
    [ringCX, ringCY - ringR - 2, 22, -Math.PI / 2, 0],
    [ringCX - 30, ringCY - ringR + 8, 18, -Math.PI * 0.6, 1],
    [ringCX + 30, ringCY - ringR + 8, 18, -Math.PI * 0.4, 2],
    [ringCX - 55, ringCY - ringR + 20, 16, -Math.PI * 0.7, 3],
    [ringCX + 55, ringCY - ringR + 20, 16, -Math.PI * 0.3, 4],
    [ringCX - 75, ringCY - ringR + 36, 14, -Math.PI * 0.75, 2],
    [ringCX + 75, ringCY - ringR + 36, 14, -Math.PI * 0.25, 3],
    [ringCX - 22, ringCY - ringR - 10, 16, -Math.PI * 0.55, 1],
    [ringCX + 22, ringCY - ringR - 10, 16, -Math.PI * 0.45, 4],
  ].forEach(([lx, ly, size, angle, ci]) => {
    drawLeaf(lx as number, ly as number, size as number, angle as number, leafColors[ci as number])
  })

  // ─── BOTANICAL BOTTOM LEAVES ───
  ;[
    [ringCX, ringCY + ringR + 2, 22, Math.PI / 2, 0],
    [ringCX - 32, ringCY + ringR - 8, 18, Math.PI * 0.62, 1],
    [ringCX + 32, ringCY + ringR - 8, 18, Math.PI * 0.38, 2],
    [ringCX - 60, ringCY + ringR - 18, 16, Math.PI * 0.7, 3],
    [ringCX + 60, ringCY + ringR - 18, 16, Math.PI * 0.3, 4],
    [ringCX - 85, ringCY + ringR - 32, 14, Math.PI * 0.78, 2],
    [ringCX + 85, ringCY + ringR - 32, 14, Math.PI * 0.22, 3],
    [ringCX - 22, ringCY + ringR + 12, 16, Math.PI * 0.55, 1],
    [ringCX + 22, ringCY + ringR + 12, 16, Math.PI * 0.45, 4],
    [ringCX - 100, ringCY + ringR - 42, 12, Math.PI * 0.8, 0],
    [ringCX + 100, ringCY + ringR - 42, 12, Math.PI * 0.2, 1],
  ].forEach(([lx, ly, size, angle, ci]) => {
    drawLeaf(lx as number, ly as number, size as number, angle as number, leafColors[ci as number])
  })

  // ─── GOLD LEAF (LEFT) ───
  drawGoldLeaf(ringCX - ringR - 28, ringCY - 30)

  // ─── NAMES INSIDE RING ───
  const [name1, name2] = parseNames(weddingName)

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 36px Georgia, serif'
  ctx.letterSpacing = '0.12em'

  if (name2) {
    ctx.fillText(name1.toUpperCase(), ringCX, ringCY - 34)
    ctx.fillStyle = GOLD
    ctx.font = 'normal 20px Georgia, serif'
    ctx.letterSpacing = '0'
    ctx.fillText('&', ringCX, ringCY - 8)
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 36px Georgia, serif'
    ctx.letterSpacing = '0.12em'
    ctx.fillText(name2.toUpperCase(), ringCX, ringCY + 30)
  } else {
    ctx.fillText(name1.toUpperCase(), ringCX, ringCY + 8)
  }
  ctx.letterSpacing = '0'

  // date
  if (dateStr) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = 'italic 17px Georgia, serif'
    const d = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    // wrap if long
    const words = d.split(' ')
    let line = '', lines: string[] = []
    for (const w of words) {
      const t = line + (line ? ' ' : '') + w
      if (ctx.measureText(t).width > 280) { lines.push(line); line = w } else line = t
    }
    lines.push(line)
    let dateY = name2 ? ringCY + 60 : ringCY + 42
    for (const l of lines) { ctx.fillText(l, ringCX, dateY); dateY += 22 }
  }

  // ─── BOTTOM LOCATION ───
  if (location) {
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = 'italic 16px Georgia, serif'
    const locLines = location.split('\n')
    let ly = 760
    for (const l of locLines) { ctx.fillText(l, W / 2, ly); ly += 24 }
  }

  // small bottom text page 1
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = 'italic 13px Georgia, serif'
  ctx.fillText('pour célébrer ce moment d\'amour', W / 2, 820)

  // ─── PAGE 2: GEOMETRIC FRAME ───
  const fX = 55, fY = 920, fW = W - 110, fH = 620

  function geoPoints(x: number, y: number, fw: number, fh: number) {
    const cx2 = x + fw / 2
    return [
      [cx2, y],
      [x + fw * 0.78, y + fh * 0.12],
      [x + fw, y + fh * 0.35],
      [x + fw, y + fh * 0.65],
      [x + fw * 0.78, y + fh * 0.88],
      [cx2, y + fh],
      [x + fw * 0.22, y + fh * 0.88],
      [x, y + fh * 0.65],
      [x, y + fh * 0.35],
      [x + fw * 0.22, y + fh * 0.12],
    ]
  }

  const outerPts = geoPoints(fX, fY, fW, fH)
  const inset2 = 10
  const innerPts = geoPoints(fX + inset2, fY + inset2 * 0.5, fW - inset2 * 2, fH - inset2)

  function strokePolygon(pts: number[][], grad: CanvasGradient, lw: number, alpha = 1) {
    ctx.globalAlpha = alpha
    ctx.beginPath()
    pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py))
    ctx.closePath()
    ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.stroke()
    ctx.globalAlpha = 1
  }

  const frameGrad1 = goldGrad(fX, fY, fX + fW, fY + fH)
  const frameGrad2 = goldGrad(fX + fW, fY + fH, fX, fY)
  strokePolygon(outerPts, frameGrad1, 2)
  strokePolygon(innerPts, frameGrad2, 1, 0.55)

  // ─── PAGE 2: MESSAGE ───
  if (coupleMessage) {
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = 'italic 17px Georgia, serif'
    const maxW = fW - 80
    const allWords = coupleMessage.split(/\n/)
    let msgY = fY + 80
    for (const para of allWords) {
      if (!para.trim()) { msgY += 14; continue }
      const ws = para.trim().split(' ')
      let cl = ''
      const cls: string[] = []
      for (const w of ws) {
        const t = cl + (cl ? ' ' : '') + w
        if (ctx.measureText(t).width > maxW) { cls.push(cl); cl = w } else cl = t
      }
      cls.push(cl)
      for (const l of cls) { ctx.fillText(l, W / 2, msgY); msgY += 26 }
      msgY += 10
    }
  }

  // ─── MERCI CONFIRMER ───
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = '300 13px Arial, sans-serif'
  ctx.letterSpacing = '0.14em'
  ctx.fillText('MERCI DE NOUS CONFIRMER VOTRE PRÉSENCE', W / 2, fY + fH - 120)
  ctx.letterSpacing = '0'
  ctx.fillStyle = GOLD
  ctx.font = '20px Georgia, serif'
  ctx.fillText('↓', W / 2, fY + fH - 96)

  // ─── QR CODE ───
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, W / 2 - 50, fY + fH - 85, 100, 100)
  } else {
    const QR = await import('qrcode')
    const qrDataUrl = await QR.default.toDataURL(personalUrl, {
      width: 120, margin: 1,
      color: { dark: '#2d3a22', light: '#f0ede4' },
    })
    const qrImg = new Image()
    await new Promise<void>(r => { qrImg.onload = () => r(); qrImg.src = qrDataUrl })
    ctx.drawImage(qrImg, W / 2 - 60, fY + fH - 90, 120, 120)
  }

  // ─── HEARTS AROUND QR ───
  const hearts = [[-70, -20], [70, -20], [-55, 30], [55, 30]]
  const heartCX = W / 2, heartCY = fY + fH - 30
  ctx.fillStyle = 'rgba(201,169,110,0.5)'
  ctx.font = '14px sans-serif'
  hearts.forEach(([hx, hy]) => ctx.fillText('♡', heartCX + hx, heartCY + hy))

  return canvas.toDataURL('image/png')
}

export default function FairePartEnvelope({
  weddingName, dateStr, location, coupleMessage, coverImageUrl, slug, personalUrl, paid = true,
}: Props) {
  const [phase, setPhase] = useState<Phase>('curtain-closed')
  const [showPetals, setShowPetals] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [name1, name2] = parseNames(weddingName)

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('opening'); setShowPetals(true) }, 600)
    const t2 = setTimeout(() => setPhase('revealed'), 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'revealed' || !qrRef.current) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(qrRef.current!, personalUrl, {
        width: 100, margin: 1,
        color: { dark: '#2d3a22', light: '#f0ede4' },
      }).catch(() => {})
    })
  }, [phase, personalUrl])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const dataUrl = await drawFairePartCanvasNew(
        personalUrl, weddingName, dateStr, location, coupleMessage, qrRef.current
      )
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `faire-part-${weddingName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  const RING = 270

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: phase === 'curtain-closed' ? '#2d3a22' : BG,
      transition: 'background 0.8s ease',
      overflow: phase === 'revealed' ? 'auto' : 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: phase === 'revealed' ? 'flex-start' : 'center',
      zIndex: 50,
    }}>
      <style>{`
        @keyframes open-left  { from { transform:translateX(0) } to { transform:translateX(-100%) } }
        @keyframes open-right { from { transform:translateX(0) } to { transform:translateX(100%) } }
        @keyframes card-rise  { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fade-up    { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes star-pulse { 0%,100% { opacity:.4; transform:scale(1) } 50% { opacity:1; transform:scale(1.25) } }
        .curtain-l { animation: open-left  1.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .curtain-r { animation: open-right 1.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .card-rise { animation: card-rise  0.8s ease forwards; }
        .fade-up   { animation: fade-up    0.5s ease forwards 0.7s; opacity:0; }
        .star-pulse { animation: star-pulse 1.6s ease-in-out infinite; }
        @keyframes petal-fall-l {
          0%   { transform:translateY(-60px) rotate(0deg) translateX(0px); opacity:1; }
          80%  { transform:translateY(80vh) rotate(240deg) translateX(-28px); opacity:0.5; }
          100% { transform:translateY(110vh) rotate(360deg) translateX(-14px); opacity:0; }
        }
        @keyframes petal-fall-r {
          0%   { transform:translateY(-60px) rotate(0deg) translateX(0px); opacity:1; }
          80%  { transform:translateY(80vh) rotate(-240deg) translateX(28px); opacity:0.5; }
          100% { transform:translateY(110vh) rotate(-360deg) translateX(14px); opacity:0; }
        }
        .petal-l { animation-name:petal-fall-l; animation-timing-function:ease-in; animation-fill-mode:forwards; }
        .petal-r { animation-name:petal-fall-r; animation-timing-function:ease-in; animation-fill-mode:forwards; }
      `}</style>

      {/* Curtains */}
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-l' : ''}
        style={{ position:'absolute', top:0, left:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#2d3a22 0%,#1a2419 100%)',
          boxShadow:'inset -8px 0 20px rgba(0,0,0,0.4)' }} />
      <div className={phase === 'opening' || phase === 'revealed' ? 'curtain-r' : ''}
        style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', zIndex:30,
          background:'linear-gradient(180deg,#2d3a22 0%,#1a2419 100%)',
          boxShadow:'inset 8px 0 20px rgba(0,0,0,0.4)' }} />

      {/* Gold center line */}
      {phase === 'curtain-closed' && (
        <div style={{ position:'absolute', left:'50%', top:0, width:1, height:'100%',
          background:'rgba(201,169,110,0.4)', zIndex:35 }} />
      )}

      {/* Pulsing star */}
      {phase === 'curtain-closed' && (
        <div className="star-pulse"
          style={{ position:'absolute', zIndex:40, color:GOLD, fontSize:'2.2rem' }}>✦</div>
      )}

      {/* Petals */}
      {showPetals && PETALS.map(p => (
        <div key={p.id} className={p.side}
          style={{ position:'absolute', top:0, left:`${p.left}%`,
            width:p.size, height:p.size, borderRadius:'50% 0 50% 0',
            background:p.color, opacity:0.9, zIndex:28, pointerEvents:'none',
            animationDuration:`${p.duration}s`, animationDelay:`${p.delay}s`,
            transform:`rotate(${p.rotate}deg)` }} />
      ))}

      {/* Main content */}
      {phase === 'revealed' && (
        <div style={{ position:'relative', zIndex:20, width:'100%', maxWidth:440,
          margin:'0 auto', padding:'28px 16px 60px' }}>

          {/* ── RECTO ── */}
          <div className="card-rise" style={{
            background: BG,
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            padding: '36px 20px 44px',
            textAlign: 'center',
            marginBottom: 4,
            border: '1px solid rgba(201,169,110,0.15)',
          }}>
            {/* Top text */}
            <p style={{ color:'rgba(255,255,255,0.82)', fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'1rem', margin:'0 0 28px' }}>
              Vous êtes invités au mariage de
            </p>

            {/* Ring */}
            <div style={{ position:'relative', width:RING, height:RING, margin:'0 auto 28px' }}>
              <GoldRingDecor size={RING} />
              <TopLeavesSVG size={RING} />
              <BottomLeavesSVG size={RING} />
              <GoldLeafSVG />

              {/* Names */}
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:2 }}>
                <p style={{ color:'#fff', fontFamily:'Georgia, serif', fontWeight:600,
                  fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                  textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                  {name1}
                </p>
                <p style={{ color:GOLD, fontFamily:'Georgia, serif', fontSize:'1.1rem',
                  margin:'3px 0', lineHeight:1 }}>
                  &amp;
                </p>
                {name2 && (
                  <p style={{ color:'#fff', fontFamily:'Georgia, serif', fontWeight:600,
                    fontSize:'clamp(1.2rem,5vw,1.65rem)', letterSpacing:'0.12em',
                    textTransform:'uppercase', margin:0, lineHeight:1.1 }}>
                    {name2}
                  </p>
                )}
                {dateStr && (
                  <p style={{ color:'rgba(255,255,255,0.78)', fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.85rem', marginTop:10, lineHeight:1.4,
                    padding:'0 20px' }}>
                    {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {location && (
              <p style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem', lineHeight:1.7, margin:0 }}>
                {location}
              </p>
            )}
            <p style={{ color:'rgba(255,255,255,0.45)', fontFamily:'Georgia, serif',
              fontStyle:'italic', fontSize:'0.78rem', marginTop:8 }}>
              pour célébrer ce moment d&apos;amour
            </p>
          </div>

          {/* ── VERSO ── */}
          <div style={{ position:'relative', background:'#4c5a3b', borderRadius:3,
            padding:'50px 32px 52px', textAlign:'center', marginBottom:20,
            boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
            border:'1px solid rgba(201,169,110,0.15)' }}>
            <GeometricFrame width={370} height={480} />

            {/* Message */}
            {coupleMessage ? (
              <div style={{ position:'relative', zIndex:1, padding:'10px 16px' }}>
                {coupleMessage.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} style={{ color:'rgba(255,255,255,0.88)', fontFamily:'Georgia, serif',
                    fontStyle:'italic', fontSize:'0.95rem', lineHeight:1.85,
                    margin:'0 0 10px' }}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ color:'rgba(255,255,255,0.5)', fontFamily:'Georgia, serif',
                fontStyle:'italic', fontSize:'0.9rem' }}>
                Nous sommes ravis de vous compter parmi nous.
              </p>
            )}

            {/* Confirm */}
            <div style={{ position:'relative', zIndex:1, marginTop:24 }}>
              <p style={{ color:'rgba(255,255,255,0.7)', fontFamily:'Arial, sans-serif',
                fontWeight:300, fontSize:'0.62rem', letterSpacing:'0.16em',
                textTransform:'uppercase', margin:'0 0 4px' }}>
                Merci de nous confirmer votre présence
              </p>
              <p style={{ color:GOLD, fontSize:'1.1rem', margin:'0 0 14px' }}>↓</p>

              {/* QR */}
              <canvas ref={qrRef} width={100} height={100}
                style={{ borderRadius:8, display:'block', margin:'0 auto' }} />

              {/* Hearts */}
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8,
                color:'rgba(201,169,110,0.55)', fontSize:'12px' }}>
                <span>♡</span><span>♡</span><span>♡</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="fade-up" style={{ display:'flex', flexDirection:'column',
            alignItems:'center', gap:10 }}>
            {paid ? (
              <button onClick={handleDownload} disabled={downloading}
                style={{ background:GOLD, color:'#2d3a22', borderRadius:10,
                  padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:600,
                  border:'none', cursor:'pointer', letterSpacing:'0.05em',
                  opacity: downloading ? 0.6 : 1 }}>
                {downloading ? '…Génération' : '↓ Télécharger le faire-part'}
              </button>
            ) : (
              <div style={{ textAlign:'center' }}>
                <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10,
                  padding:'11px 32px', fontSize:'0.82rem',
                  fontFamily:'var(--font-lato)', fontWeight:400, color:'rgba(255,255,255,0.35)',
                  letterSpacing:'0.05em', cursor:'default' }}>
                  🔒 Téléchargement — Formule Mariage
                </div>
              </div>
            )}
            <a href={`/invite/${slug}`}
              style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)',
                fontFamily:'var(--font-lato)', fontWeight:300, textDecoration:'none' }}>
              ← Retour à mon espace
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
