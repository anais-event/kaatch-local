'use client'

import { useState, useRef } from 'react'

interface ShareButtonProps {
  total: number
}

export default function ShareButton({ total }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(total)

  const shareText = `On vient de simuler le budget de notre mariage : ${totalFormatted} 😱 Faites le vôtre sur Kaatch 👉 https://kaatch.fr/budget-calculator`
  const shareUrl = 'https://kaatch.fr/budget-calculator'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Simulateur de budget mariage',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled
      }
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank')
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
  }

  const hasShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => (hasShare ? handleShare() : setIsOpen(!isOpen))}
        className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors text-sm"
      >
        ✌️ Partager
      </button>

      {!hasShare && isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden z-10 min-w-[200px]">
          <button
            onClick={handleTwitterShare}
            className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm text-stone-700 border-b border-stone-100"
          >
            𝕏 Twitter
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm text-stone-700 border-b border-stone-100"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full text-left px-4 py-3 hover:bg-stone-50 text-sm text-stone-700"
          >
            {copied ? '✓ Copié' : '🔗 Copier le lien'}
          </button>
        </div>
      )}
    </div>
  )
}
