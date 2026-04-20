import PptxGenJS from 'pptxgenjs'

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE' // 16:9

// ---- Palette ----
const BEIGE   = 'F5F0E8'
const GREEN   = '4A5240'
const DARK    = '2D3228'
const WHITE   = 'FFFFFF'
const STONE   = 'A8A29E'
const AMBER   = 'D97706'

// ---- Helpers ----
function slide(fn) {
  const s = pptx.addSlide()
  s.background = { color: BEIGE }
  fn(s)
}

function title(s, text, y = 1.2, size = 48, color = DARK) {
  s.addText(text, {
    x: 0.8, y, w: 11.4, h: 1.4,
    fontSize: size, bold: false, italic: true,
    fontFace: 'Georgia', color,
    align: 'left',
  })
}

function body(s, text, x = 0.8, y = 2.8, w = 11.4, h = 3.5, size = 18, color = '44403C') {
  s.addText(text, {
    x, y, w, h,
    fontSize: size, fontFace: 'Lato', color,
    align: 'left', valign: 'top',
  })
}

function tag(s, text, x = 0.8, y = 0.4) {
  s.addText(text.toUpperCase(), {
    x, y, w: 4, h: 0.3,
    fontSize: 9, fontFace: 'Lato', color: GREEN,
    charSpacing: 4, bold: false,
  })
}

function accent(s, x = 0.8, y = 1.0, w = 1.0) {
  s.addShape(pptx.ShapeType.rect, {
    x, y, w, h: 0.03,
    fill: { color: GREEN }, line: { color: GREEN },
  })
}

function bullet(s, items, x, y, w, size = 17) {
  const bullets = items.map(t => ({ text: t, options: { bullet: { code: '2013' }, paraSpaceAfter: 8 } }))
  s.addText(bullets, {
    x, y, w, h: 4,
    fontSize: size, fontFace: 'Lato', color: '44403C',
    valign: 'top',
  })
}

function pill(s, text, x, y, bg = GREEN, fg = WHITE) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 2.8, h: 0.55,
    fill: { color: bg },
    line: { color: bg },
    rectRadius: 0.28,
  })
  s.addText(text, {
    x, y, w: 2.8, h: 0.55,
    fontSize: 13, fontFace: 'Lato', color: fg,
    align: 'center', valign: 'middle',
  })
}

function card(s, icon, label, desc, x, y) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 3.4, h: 1.9,
    fill: { color: WHITE },
    line: { color: 'E7E5E4', width: 0.5 },
    rectRadius: 0.15,
  })
  s.addText(icon, { x, y: y + 0.2, w: 3.4, h: 0.6, fontSize: 28, align: 'center' })
  s.addText(label, {
    x, y: y + 0.85, w: 3.4, h: 0.4,
    fontSize: 13, fontFace: 'Lato', color: DARK,
    align: 'center', bold: false,
  })
  s.addText(desc, {
    x, y: y + 1.25, w: 3.4, h: 0.5,
    fontSize: 10, fontFace: 'Lato', color: STONE,
    align: 'center',
  })
}

function stepCircle(s, num, label, x, y) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: 0.9, h: 0.9,
    fill: { color: GREEN }, line: { color: GREEN },
  })
  s.addText(String(num), {
    x, y, w: 0.9, h: 0.9,
    fontSize: 20, fontFace: 'Georgia', color: WHITE, italic: true,
    align: 'center', valign: 'middle',
  })
  s.addText(label, {
    x: x - 0.5, y: y + 1.0, w: 1.9, h: 0.4,
    fontSize: 12, fontFace: 'Lato', color: DARK,
    align: 'center',
  })
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
slide(s => {
  // Big decorative circle
  s.addShape(pptx.ShapeType.ellipse, {
    x: 7.5, y: -1.5, w: 7, h: 7,
    fill: { color: '4A5240', transparency: 88 },
    line: { color: BEIGE },
  })
  s.addText('KAATCH', {
    x: 0.8, y: 1.6, w: 8, h: 1.4,
    fontSize: 72, fontFace: 'Georgia', italic: true,
    color: DARK, bold: false,
  })
  accent(s, 0.8, 3.2, 2.5)
  s.addText('Votre mariage, organisé avec soin', {
    x: 0.8, y: 3.5, w: 8, h: 0.6,
    fontSize: 20, fontFace: 'Lato', color: GREEN,
    charSpacing: 1,
  })
  s.addText('L\'espace numérique pensé pour les mariés et leurs invités', {
    x: 0.8, y: 4.3, w: 7.5, h: 0.5,
    fontSize: 14, fontFace: 'Lato', color: STONE,
  })
  s.addText('2026', {
    x: 0.8, y: 6.7, w: 2, h: 0.4,
    fontSize: 11, fontFace: 'Lato', color: STONE,
    charSpacing: 3,
  })
})

// ============================================================
// SLIDE 2 — Le problème
// ============================================================
slide(s => {
  tag(s, 'Le problème')
  accent(s)
  title(s, 'Organiser un mariage,\nc\'est du chaos.', 1.1, 40)

  const problems = [
    ['📊', 'Des dizaines d\'Excel\nà maintenir à jour'],
    ['💬', 'Des groupes WhatsApp\nqui explosent'],
    ['📧', 'Des prestataires éparpillés\ndans les emails'],
    ['❓', '"C\'est quoi l\'adresse\ndéjà ?" × 50 fois'],
  ]
  problems.forEach(([icon, text], i) => {
    const x = 0.8 + (i % 2) * 5.8
    const y = 3.0 + Math.floor(i / 2) * 1.6
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.2, h: 1.3,
      fill: { color: WHITE },
      line: { color: 'E7E5E4', width: 0.5 },
      rectRadius: 0.12,
    })
    s.addText(icon + '  ' + text, {
      x: x + 0.2, y: y + 0.1, w: 4.8, h: 1.1,
      fontSize: 13, fontFace: 'Lato', color: '44403C',
      valign: 'middle',
    })
  })
})

// ============================================================
// SLIDE 3 — La solution
// ============================================================
slide(s => {
  // Left panel (dark)
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 5.8, h: 7.5,
    fill: { color: GREEN }, line: { color: GREEN },
  })
  s.addText('La\nsolution', {
    x: 0.5, y: 1.5, w: 4.8, h: 2,
    fontSize: 44, fontFace: 'Georgia', italic: true,
    color: WHITE, bold: false,
  })
  s.addText('Un seul espace, pensé pour les mariés et leurs invités. Accessible en 2 minutes, sans installation.', {
    x: 0.5, y: 3.8, w: 4.8, h: 2,
    fontSize: 15, fontFace: 'Lato', color: 'E8E4DC',
    lineSpacingMultiple: 1.4,
  })

  // Right panel
  s.addText('KAATCH', {
    x: 6.2, y: 1.4, w: 5.5, h: 1,
    fontSize: 52, fontFace: 'Georgia', italic: true,
    color: DARK,
  })
  s.addShape(pptx.ShapeType.rect, {
    x: 6.2, y: 2.6, w: 1.5, h: 0.03,
    fill: { color: STONE }, line: { color: STONE },
  })
  s.addText('kaatch.fr', {
    x: 6.2, y: 2.8, w: 5.5, h: 0.4,
    fontSize: 13, fontFace: 'Lato', color: STONE,
    charSpacing: 2,
  })

  const points = ['✦  Invités & RSVP', '✦  Budget & prestataires', '✦  Programme & playlist', '✦  Plan de table', '✦  Espace photos']
  points.forEach((p, i) => {
    s.addText(p, {
      x: 6.2, y: 3.5 + i * 0.55, w: 5.5, h: 0.45,
      fontSize: 14, fontFace: 'Lato', color: DARK,
    })
  })
})

// ============================================================
// SLIDE 4 — Pour les mariés
// ============================================================
slide(s => {
  tag(s, 'Pour les mariés')
  accent(s)
  title(s, 'Un espace de préparation\ncomplet et intuitif', 1.1, 36)

  card(s, '👥', 'Invités & RSVP',    'Import Excel, suivi des réponses, régimes', 0.6, 3.1)
  card(s, '💶', 'Budget',            'Devis, acomptes, suivi par catégorie',       4.2, 3.1)
  card(s, '📅', 'Programme',         'Moment par moment, visible aux invités',     7.8, 3.1)
  card(s, '🎵', 'Playlist',          'Par moment, export DJ, lien Spotify',        0.6, 5.2)
  card(s, '🏛️', 'Prestataires',      'Contacts, montants, synchro budget',         4.2, 5.2)
  card(s, '📸', 'Photos',            'Espace partagé avec les invités',            7.8, 5.2)
})

// ============================================================
// SLIDE 5 — Pour les invités
// ============================================================
slide(s => {
  // Split layout
  s.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 0, w: 6.2, h: 7.5,
    fill: { color: '2D3228' }, line: { color: '2D3228' },
  })

  tag(s, 'Pour les invités')
  accent(s)
  title(s, 'Une page dédiée,\nsans compte à créer.', 1.1, 36, DARK)

  const items = [
    ['📍', 'Infos pratiques', 'Lieu, date, hébergements proches'],
    ['✅', 'RSVP & menu',    'Réponse en 30 secondes'],
    ['🗺️', 'Plan de table',  'Révélé au moment choisi par les mariés'],
    ['📸', 'Photos',         'Dépôt et consultation des souvenirs'],
  ]
  items.forEach(([icon, label, desc], i) => {
    s.addText(icon + '  ' + label, {
      x: 0.8, y: 2.8 + i * 0.95, w: 5.5, h: 0.4,
      fontSize: 14, fontFace: 'Lato', color: DARK, bold: false,
    })
    s.addText(desc, {
      x: 1.5, y: 3.15 + i * 0.95, w: 5.1, h: 0.35,
      fontSize: 11, fontFace: 'Lato', color: STONE,
    })
  })

  s.addText('Un simple lien.\nPas d\'app. Pas de compte.\nJuste le grand jour.', {
    x: 7.2, y: 2.5, w: 5.4, h: 2.5,
    fontSize: 22, fontFace: 'Georgia', italic: true,
    color: 'E8E4DC', lineSpacingMultiple: 1.5,
    align: 'center', valign: 'middle',
  })
})

// ============================================================
// SLIDE 6 — Comment ça marche
// ============================================================
slide(s => {
  tag(s, 'En 3 étapes')
  accent(s)
  title(s, 'Prêt en 2 minutes.', 1.1, 44)

  // Ligne de connexion
  s.addShape(pptx.ShapeType.rect, {
    x: 1.75, y: 3.85, w: 9.3, h: 0.03,
    fill: { color: 'E7E5E4' }, line: { color: 'E7E5E4' },
  })

  stepCircle(s, 1, 'Créez votre espace',    1.3, 3.4)
  stepCircle(s, 2, 'Partagez le lien',       5.55, 3.4)
  stepCircle(s, 3, 'Profitez du grand jour', 9.8, 3.4)

  s.addText('Sans installation · Sans carte bancaire · Opérationnel immédiatement', {
    x: 1, y: 6.0, w: 11, h: 0.4,
    fontSize: 12, fontFace: 'Lato', color: STONE,
    align: 'center', charSpacing: 1,
  })
})

// ============================================================
// SLIDE 7 — Différenciation
// ============================================================
slide(s => {
  tag(s, 'Pourquoi Kaatch ?')
  accent(s)
  title(s, 'Simple, élégant,\npensé pour vous.', 1.1, 40)

  const cols = [
    { icon: '🚀', title: 'Prêt en 2 min',    desc: 'Aucune configuration. Vous créez votre espace, vous partagez le lien.' },
    { icon: '📱', title: '100% mobile',       desc: 'Parfait sur téléphone, pour vous comme pour vos invités.' },
    { icon: '🔒', title: 'Espace privé',      desc: 'Accessible uniquement sur invitation. Vos données vous appartiennent.' },
    { icon: '✨', title: 'Tout en un',        desc: 'Invités, budget, programme, musique — plus besoin de jongler entre les outils.' },
  ]

  cols.forEach(({ icon, title: t, desc }, i) => {
    const x = 0.6 + i * 2.95
    s.addText(icon, { x, y: 3.2, w: 2.7, h: 0.7, fontSize: 28, align: 'center' })
    s.addShape(pptx.ShapeType.rect, {
      x: x + 1.1, y: 4.1, w: 0.5, h: 0.03,
      fill: { color: GREEN }, line: { color: GREEN },
    })
    s.addText(t, {
      x, y: 4.2, w: 2.7, h: 0.5,
      fontSize: 13, fontFace: 'Lato', color: DARK,
      align: 'center', bold: false,
    })
    s.addText(desc, {
      x, y: 4.8, w: 2.7, h: 1.5,
      fontSize: 11, fontFace: 'Lato', color: STONE,
      align: 'center', lineSpacingMultiple: 1.3,
    })
  })
})

// ============================================================
// SLIDE 8 — Call to action
// ============================================================
slide(s => {
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 12.8, h: 7.5,
    fill: { color: GREEN }, line: { color: GREEN },
  })
  s.addText('Commencez\nmaintenant.', {
    x: 1, y: 1.2, w: 10.8, h: 2.8,
    fontSize: 64, fontFace: 'Georgia', italic: true,
    color: WHITE, align: 'center', bold: false,
  })
  s.addText('Créez votre espace mariage en 2 minutes.', {
    x: 1, y: 4.2, w: 10.8, h: 0.6,
    fontSize: 18, fontFace: 'Lato', color: 'C8C4BC',
    align: 'center',
  })

  // CTA button
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.3, y: 5.1, w: 4.2, h: 0.85,
    fill: { color: WHITE },
    line: { color: WHITE },
    rectRadius: 0.42,
  })
  s.addText('kaatch.fr', {
    x: 4.3, y: 5.1, w: 4.2, h: 0.85,
    fontSize: 22, fontFace: 'Georgia', italic: true,
    color: GREEN, align: 'center', valign: 'middle',
  })
})

// ---- Export ----
const outPath = 'C:/Users/anais/Desktop/Kaatch-Pitch.pptx'
await pptx.writeFile({ fileName: outPath })
console.log('✅ Fichier généré :', outPath)
