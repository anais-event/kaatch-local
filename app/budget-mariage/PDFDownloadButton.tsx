'use client'

import { useCallback } from 'react'
import { track } from '@vercel/analytics'
import type { CostBreakdown, WeddingLevel, Region } from '@/lib/calculator/budget-formulas'

interface PDFDownloadButtonProps {
  breakdown: CostBreakdown
  guestCount: number
  level: WeddingLevel
  region: Region
  includeHoneymoon: boolean
  breakdownData: Array<{ name: string; value: number; color: string }>
}

export default function PDFDownloadButton({
  breakdown,
  guestCount,
  level,
  region,
  includeHoneymoon,
  breakdownData,
}: PDFDownloadButtonProps) {
  const handleDownloadPDF = useCallback(async () => {
    try {
      // Dynamic import jsPDF to avoid build issues
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      // Create a hidden container with the budget summary
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.width = '800px'
      container.style.padding = '40px'
      container.style.backgroundColor = '#f5f0e8'
      container.style.fontFamily = 'Arial, sans-serif'
      container.style.fontSize = '14px'
      container.style.color = '#2d3228'

      const totalFormatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
      }).format(breakdown.grandTotal)

      const perGuestFormatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
      }).format(breakdown.grandTotalPerGuest)

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 32px; margin: 0 0 10px 0; font-weight: normal;">Simulateur de Budget Mariage</h1>
          <p style="color: #666; margin: 0; font-size: 12px;">Estimation réalisée le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin-bottom: 30px; text-align: center;">
          <p style="font-size: 12px; color: #999; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Budget Total Estimé</p>
          <p style="font-size: 48px; color: #4a5240; margin: 0 0 15px 0; font-weight: bold;">${totalFormatted}</p>
          <p style="font-size: 16px; color: #666; margin: 0;">Soit ${perGuestFormatted} par invité</p>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin: 0 0 15px 0; color: #2d3228;">Paramètres de la simulation</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; width: 50%; text-align: left;">Nombre d'invités:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${guestCount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">Gamme:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; text-transform: capitalize;">${level}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">Région:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; text-transform: capitalize;">
                ${region === 'province' ? 'Province (référence)' : region === 'grandes-villes' ? 'Grandes villes / Côte d\'Azur (+15%)' : 'Paris & Île-de-France (+25%)'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Voyage de noces:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${includeHoneymoon ? 'Inclus' : 'Exclu'}</td>
            </tr>
          </table>
        </div>

        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin: 0 0 15px 0; color: #2d3228;">Répartition des coûts</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${breakdownData
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; text-align: left;">${item.name}</td>
                <td style="padding: 8px 0; text-align: right;">
                  ${new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(item.value)}
                </td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #999; font-size: 11px;">
          <p style="margin: 0;">Simulateur de budget mariage — Kaatch</p>
          <p style="margin: 5px 0 0 0;">https://kaatch.fr/budget-calculator</p>
        </div>
      `

      document.body.appendChild(container)

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#f5f0e8',
      })

      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 - 20
      const pageHeight = 297 - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`budget-mariage-${guestCount}-invites.pdf`)
      track('pdf_download', { tool: 'budget', guests: guestCount, level, region })
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Impossible de générer le PDF. Veuillez réessayer.')
    }
  }, [breakdown, guestCount, level, region, includeHoneymoon, breakdownData])

  return (
    <button
      onClick={handleDownloadPDF}
      className="flex-1 px-4 py-3 bg-[#4a5240] hover:bg-[#2d3228] text-white rounded-lg font-medium transition-colors text-sm"
    >
      📄 Télécharger PDF
    </button>
  )
}
