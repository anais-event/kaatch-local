'use client'
import { useState } from 'react'

type Step = { icon?: string; title: string; time?: string; description?: string; address?: string }

export default function ProgrammePDF({ slug, weddingName, steps }: {
  slug: string
  weddingName: string
  steps: Step[]
}) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      // Géocoder les adresses
      const stepsWithMaps = await Promise.all(steps.map(async (step) => {
        if (!step.address) return { ...step, mapUrl: null }
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr' } }
          )
          const data = await res.json()
          if (data[0]) {
            const { lat, lon } = data[0]
            return { ...step, mapUrl: `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x200&markers=${lat},${lon},red-pushpin` }
          }
        } catch {}
        return { ...step, mapUrl: null }
      }))

      // Créer le conteneur HTML hors-écran
      const container = document.createElement('div')
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#f5f0e8;padding:60px 64px;font-family:Georgia,serif;color:#2d3228;'
      document.body.appendChild(container)

      container.innerHTML = `
        <div style="text-align:center;margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid #c8c0b4;">
          <p style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#9d8f7e;font-weight:300;margin-bottom:10px;">Programme de la journée</p>
          <h1 style="font-family:Georgia,serif;font-size:48px;font-weight:300;font-style:italic;color:#2d3228;line-height:1;">${weddingName}</h1>
        </div>
        <div style="position:relative;padding-left:64px;">
          <div style="position:absolute;left:20px;top:0;bottom:0;width:1px;background:#c8c0b4;"></div>
          ${stepsWithMaps.map(step => `
            <div style="position:relative;margin-bottom:32px;">
              <div style="position:absolute;left:-52px;top:2px;width:44px;height:44px;background:white;border:1.5px solid #4a5240;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;text-align:center;line-height:44px;">${step.icon || '✦'}</div>
              <div style="background:white;border:1px solid #e4ddd4;border-radius:10px;padding:20px 24px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:${step.description || step.address ? '10px' : '0'};">
                  <h2 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#2d3228;">${step.title}</h2>
                  ${step.time ? `<span style="font-size:11px;color:#4a5240;background:#f5f0e8;padding:3px 10px;border-radius:20px;white-space:nowrap;font-weight:300;flex-shrink:0;font-family:Arial,sans-serif;">${step.time}</span>` : ''}
                </div>
                ${step.description ? `<p style="font-size:13px;font-weight:300;color:#6b6459;line-height:1.6;margin-bottom:${step.address ? '10px' : '0'};font-family:Arial,sans-serif;">${step.description}</p>` : ''}
                ${step.address ? `<p style="font-size:12px;font-weight:300;color:#9d8f7e;padding-left:12px;border-left:2px solid #c8c0b4;font-family:Arial,sans-serif;${step.mapUrl ? 'margin-bottom:12px;' : ''}">${step.address}</p>` : ''}
                ${step.mapUrl ? `<img src="${step.mapUrl}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;display:block;" crossorigin="anonymous" />` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid #c8c0b4;">
          <p style="font-size:10px;color:#b0a898;font-weight:300;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;">Kaatch — Partagez vos plus beaux moments</p>
        </div>
      `

      // Attendre que les images chargent
      const imgs = Array.from(container.querySelectorAll('img'))
      if (imgs.length > 0) {
        await Promise.race([
          Promise.all(imgs.map(img => new Promise<void>(resolve => {
            if (img.complete) resolve()
            else { img.onload = () => resolve(); img.onerror = () => resolve() }
          }))),
          new Promise<void>(r => setTimeout(r, 5000))
        ])
      }

      await new Promise(r => setTimeout(r, 300))

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f5f0e8',
        logging: false,
        width: 794,
      })

      document.body.removeChild(container)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pdfW) / canvas.width
      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      let y = 0
      while (y < imgH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -y, pdfW, imgH)
        y += pdfH
      }

      pdf.save(`programme-${slug}.pdf`)
    } catch (e) {
      console.error(e)
      document.querySelectorAll('[style*="-9999px"]').forEach(el => el.remove())
    } finally {
      setLoading(false)
    }
  }

  if (!steps.length) return null

  return (
    <button onClick={handleDownload} disabled={loading}
      className="text-xs border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-lg hover:bg-[#4a5240] hover:text-white transition disabled:opacity-50 flex items-center gap-1.5"
      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border border-[#4a5240] border-t-transparent rounded-full animate-spin" />
          Génération…
        </>
      ) : 'Télécharger PDF'}
    </button>
  )
}
