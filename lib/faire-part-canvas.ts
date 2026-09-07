// Générateur unique du faire-part en PNG (client-only : utilise canvas / Image / qrcode).
// Remplace les 3 implémentations divergentes (InvitationsList, FairePartEnvelope, CopyLinkButton).

export type FairePartOptions = {
  weddingName: string
  dateStr?: string | null
  location?: string | null
  coupleMessage?: string | null
  coverImageUrl?: string | null
  /** Si fourni, un QR code vers cette URL est dessiné en bas. */
  qrUrl?: string | null
  /** Optionnel : « Chère/Cher Prénom, » au-dessus du titre. */
  salutation?: string | null
}

const WIDTH = 600
const HEIGHT = 900
const CENTER = WIDTH / 2

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line + (line ? ' ' : '') + w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function divider(ctx: CanvasRenderingContext2D, y: number) {
  const g = ctx.createLinearGradient(150, 0, 450, 0)
  g.addColorStop(0, 'rgba(231,229,228,0)')
  g.addColorStop(0.5, '#e7e5e4')
  g.addColorStop(1, 'rgba(231,229,228,0)')
  ctx.strokeStyle = g
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(150, y)
  ctx.lineTo(450, y)
  ctx.stroke()
}

/** Rend le faire-part et renvoie une data URL PNG. */
export async function drawFairePartDataUrl(opts: FairePartOptions): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.textAlign = 'center'

  // Fond crème
  ctx.fillStyle = '#fdfcf8'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Bande haute
  const topGrad = ctx.createLinearGradient(0, 0, WIDTH, 0)
  topGrad.addColorStop(0, '#4a5240')
  topGrad.addColorStop(1, '#2d3228')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, WIDTH, 6)

  let y = 60

  // Photo de couverture (cercle)
  if (opts.coverImageUrl) {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = opts.coverImageUrl as string
      })
      const r = 48
      ctx.save()
      ctx.beginPath()
      ctx.arc(CENTER, y + r, r, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, CENTER - r, y, r * 2, r * 2)
      ctx.restore()
      ctx.strokeStyle = 'rgba(74,82,64,0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(CENTER, y + r, r + 2, 0, Math.PI * 2)
      ctx.stroke()
      y += 120
    } catch {
      y += 10
    }
  }

  // Ornement
  ctx.fillStyle = '#c9a96e'
  ctx.font = '16px Georgia, serif'
  ctx.fillText('✦', CENTER, y)
  y += 40

  // Salutation optionnelle
  if (opts.salutation) {
    ctx.fillStyle = '#6b6459'
    ctx.font = 'italic 22px Georgia, serif'
    ctx.fillText(opts.salutation, CENTER, y)
    y += 40
  }

  // « VOUS ÊTES INVITÉ(E) »
  ctx.fillStyle = '#b8b0a6'
  ctx.font = '300 11px Arial, sans-serif'
  ctx.fillText('VOUS ÊTES INVITÉ(E)', CENTER, y)
  y += 52

  // Nom du mariage — italic serif large
  ctx.fillStyle = '#2d3228'
  ctx.font = 'italic 52px Georgia, serif'
  for (const l of wrapLines(ctx, opts.weddingName, 500)) {
    ctx.fillText(l, CENTER, y)
    y += 58
  }
  y += 8

  divider(ctx, y)
  y += 32

  // Date
  if (opts.dateStr) {
    ctx.fillStyle = '#57534e'
    ctx.font = '500 20px Georgia, serif'
    ctx.fillText(opts.dateStr.charAt(0).toUpperCase() + opts.dateStr.slice(1), CENTER, y)
    y += 30
  }

  // Lieu
  if (opts.location) {
    ctx.fillStyle = '#a8a29e'
    ctx.font = '300 14px Arial, sans-serif'
    ctx.fillText(opts.location, CENTER, y)
    y += 20
  }

  if (opts.dateStr || opts.location) {
    y += 12
    divider(ctx, y)
    y += 32
  }

  // Message des mariés (première ligne)
  if (opts.coupleMessage) {
    ctx.fillStyle = '#78716c'
    ctx.font = 'italic 15px Georgia, serif'
    for (const l of wrapLines(ctx, opts.coupleMessage.split('\n')[0], 460)) {
      ctx.fillText(`“${l}”`, CENTER, y)
      y += 24
    }
    y += 20
  }

  // QR code
  if (opts.qrUrl) {
    const QR = await import('qrcode')
    const qrDataUrl = await QR.default.toDataURL(opts.qrUrl, {
      width: 130,
      margin: 1,
      color: { dark: '#2d3228', light: '#fdfcf8' },
    })
    const qrImg = new Image()
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve()
      qrImg.src = qrDataUrl
    })
    ctx.drawImage(qrImg, CENTER - 65, y, 130, 130)
    y += 142
    ctx.fillStyle = '#c8c4c0'
    ctx.font = '300 10px Arial, sans-serif'
    ctx.fillText('Flashez pour accéder à votre espace', CENTER, y)
  }

  // Bande basse
  const botGrad = ctx.createLinearGradient(0, 0, WIDTH, 0)
  botGrad.addColorStop(0, '#2d3228')
  botGrad.addColorStop(1, '#4a5240')
  ctx.fillStyle = botGrad
  ctx.fillRect(0, HEIGHT - 6, WIDTH, 6)

  return canvas.toDataURL('image/png')
}

/** Déclenche le téléchargement du PNG. */
export async function downloadFairePart(opts: FairePartOptions, fileName: string): Promise<void> {
  const dataUrl = await drawFairePartDataUrl(opts)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  a.click()
}
