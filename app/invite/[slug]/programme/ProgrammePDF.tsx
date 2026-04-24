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
      const half = Math.ceil(steps.length / 2)
      const col1 = steps.slice(0, half)
      const col2 = steps.slice(half)

      const stepHtml = (step: Step) => `
        <div style="display:flex;gap:10px;margin-bottom:14px;break-inside:avoid;">
          <div style="width:34px;height:34px;background:white;border:1.5px solid #4a5240;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;text-align:center;line-height:34px;flex-shrink:0;">${step.icon || '✦'}</div>
          <div style="background:white;border:1px solid #e4ddd4;border-radius:8px;padding:10px 14px;flex:1;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:${step.description || step.address ? '6px' : '0'};">
              <h2 style="font-family:Georgia,serif;font-size:14px;font-weight:600;color:#2d3228;margin:0;">${step.title}</h2>
              ${step.time ? `<span style="font-size:10px;color:#4a5240;background:#f5f0e8;padding:2px 8px;border-radius:20px;white-space:nowrap;font-weight:300;flex-shrink:0;font-family:Arial,sans-serif;">${step.time}</span>` : ''}
            </div>
            ${step.description ? `<p style="font-size:11px;font-weight:300;color:#6b6459;line-height:1.5;margin:0 0 4px;font-family:Arial,sans-serif;">${step.description}</p>` : ''}
            ${step.address ? `<p style="font-size:10px;font-weight:300;color:#9d8f7e;padding-left:8px;border-left:2px solid #c8c0b4;font-family:Arial,sans-serif;margin:0;">📍 ${step.address}</p>` : ''}
          </div>
        </div>`

      const container = document.createElement('div')
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#f5f0e8;padding:40px 48px;font-family:Georgia,serif;color:#2d3228;'
      document.body.appendChild(container)

      container.innerHTML = `
        <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #c8c0b4;">
          <p style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#9d8f7e;font-weight:300;margin:0 0 8px;">Programme de la journée</p>
          <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:300;font-style:italic;color:#2d3228;line-height:1;margin:0;">${weddingName}</h1>
        </div>
        <div style="display:flex;gap:24px;align-items:flex-start;">
          <div style="flex:1;">${col1.map(stepHtml).join('')}</div>
          <div style="width:1px;background:#e4ddd4;align-self:stretch;flex-shrink:0;"></div>
          <div style="flex:1;">${col2.map(stepHtml).join('')}</div>
        </div>
        <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #c8c0b4;">
          <p style="font-size:9px;color:#b0a898;font-weight:300;letter-spacing:0.15em;text-transform:uppercase;font-family:Arial,sans-serif;margin:0;">Kaatch — Partagez vos plus beaux moments</p>
        </div>
      `

      await new Promise(r => setTimeout(r, 150))

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
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

      // Si ça tient en une page, parfait ; sinon on laisse déborder sur 2
      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, imgH)
      } else {
        let y = 0
        while (y < imgH) {
          if (y > 0) pdf.addPage()
          pdf.addImage(imgData, 'JPEG', 0, -y, pdfW, imgH)
          y += pdfH
        }
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
