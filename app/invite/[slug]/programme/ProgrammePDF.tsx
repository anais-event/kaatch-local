'use client'

export default function ProgrammePDF({ slug, weddingName, steps }: {
  slug: string
  weddingName: string
  steps: { icon?: string; title: string; time?: string; description?: string; address?: string }[]
}) {
  async function handlePrint() {
    // Géocoder les adresses via Nominatim
    const stepsWithMaps = await Promise.all(steps.map(async (step) => {
      if (!step.address) return { ...step, mapUrl: null }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address)}&format=json&limit=1`, {
          headers: { 'Accept-Language': 'fr' }
        })
        const data = await res.json()
        if (data[0]) {
          const { lat, lon } = data[0]
          const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=500x180&markers=${lat},${lon},red-pushpin`
          return { ...step, mapUrl }
        }
      } catch {}
      return { ...step, mapUrl: null }
    }))

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Programme — ${weddingName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Lato:wght@300;400&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Lato', sans-serif;
      background: #f5f0e8;
      color: #2d3228;
      padding: 40px;
      max-width: 700px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid #d5cfc4;
    }

    .label {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #9d8f7e;
      font-weight: 300;
      margin-bottom: 8px;
    }

    .wedding-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 3rem;
      font-weight: 300;
      font-style: italic;
      color: #2d3228;
      line-height: 1;
      margin-bottom: 6px;
    }

    .subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-style: italic;
      color: #9d8f7e;
    }

    .timeline {
      position: relative;
      padding-left: 60px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 22px;
      top: 8px;
      bottom: 8px;
      width: 1px;
      background: #d5cfc4;
    }

    .step {
      position: relative;
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .step-dot {
      position: absolute;
      left: -46px;
      top: 4px;
      width: 46px;
      height: 46px;
      background: white;
      border: 1.5px solid #4a5240;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .step-card {
      background: white;
      border: 1px solid #e8e2d9;
      border-radius: 10px;
      padding: 20px 24px;
    }

    .step-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .step-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2d3228;
    }

    .step-time {
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #4a5240;
      background: #f5f0e8;
      padding: 4px 10px;
      border-radius: 20px;
      white-space: nowrap;
      font-weight: 300;
      flex-shrink: 0;
    }

    .step-description {
      font-size: 13px;
      font-weight: 300;
      color: #6b6459;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .step-address {
      font-size: 12px;
      font-weight: 300;
      color: #9d8f7e;
      margin-bottom: 12px;
      padding-left: 16px;
      border-left: 2px solid #d5cfc4;
    }

    .step-map {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 6px;
      margin-top: 10px;
    }

    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #d5cfc4;
      font-size: 11px;
      color: #9d8f7e;
      font-weight: 300;
      letter-spacing: 0.1em;
    }

    @media print {
      body { background: white; padding: 20px; }
      .step-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="label">Programme de la journée</p>
    <h1 class="wedding-name">${weddingName}</h1>
  </div>

  <div class="timeline">
    ${stepsWithMaps.map(step => `
    <div class="step">
      <div class="step-dot">${step.icon || '✦'}</div>
      <div class="step-card">
        <div class="step-header">
          <h2 class="step-title">${step.title}</h2>
          ${step.time ? `<span class="step-time">${step.time}</span>` : ''}
        </div>
        ${step.description ? `<p class="step-description">${step.description}</p>` : ''}
        ${step.address ? `<p class="step-address">${step.address}</p>` : ''}
        ${step.mapUrl ? `<img class="step-map" src="${step.mapUrl}" alt="Carte" />` : ''}
      </div>
    </div>
    `).join('')}
  </div>

  <p class="footer">Kaatch — Partagez vos plus beaux moments</p>

  <script>
    window.onload = () => {
      // Laisser les images charger puis imprimer
      const imgs = document.querySelectorAll('img')
      if (imgs.length === 0) { window.print(); return; }
      let loaded = 0
      imgs.forEach(img => {
        if (img.complete) { loaded++; if (loaded === imgs.length) window.print() }
        else { img.onload = () => { loaded++; if (loaded === imgs.length) window.print() } }
      })
      setTimeout(() => window.print(), 3000)
    }
  </script>
</body>
</html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
    }
  }

  if (!steps.length) return null

  return (
    <button onClick={handlePrint}
      className="text-xs border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-lg hover:bg-[#4a5240] hover:text-white transition"
      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
      Télécharger PDF
    </button>
  )
}
