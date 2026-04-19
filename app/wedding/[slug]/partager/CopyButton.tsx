'use client'

import { useState } from 'react'

export default function CopyButton({ url, weddingName }: { url: string; weddingName?: string }) {
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const text = weddingName
    ? `Rejoins notre espace mariage "${weddingName}" sur Kaatch ! Tu peux voir les photos, le programme et nous envoyer un message 🎉`
    : `Rejoins notre espace mariage sur Kaatch !`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('Invitation - ' + (weddingName ?? 'Notre mariage'))}&body=${encodeURIComponent(text + '\n\n' + url)}`
  const smsUrl = `sms:?body=${encodeURIComponent(text + '\n\n' + url)}`

  return (
    <div className="flex flex-col gap-3">
      {/* Copy row */}
      <button onClick={copy}
        className="w-full flex items-center justify-center gap-2 border border-[#4a5240] text-[#4a5240] py-2.5 rounded-xl hover:bg-[#4a5240] hover:text-white transition text-sm cursor-pointer"
        style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
        {copied
          ? <><span>✓</span> Lien copié !</>
          : <><CopyIcon /> Copier le lien</>}
      </button>

      {/* Share options */}
      <div className="grid grid-cols-3 gap-2">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] py-3 rounded-xl transition text-xs cursor-pointer"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          <WhatsAppIcon />
          WhatsApp
        </a>
        <a href={emailUrl}
          className="flex flex-col items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl transition text-xs cursor-pointer"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          <EmailIcon />
          Email
        </a>
        <a href={smsUrl}
          className="flex flex-col items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 py-3 rounded-xl transition text-xs cursor-pointer"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          <SmsIcon />
          SMS
        </a>
      </div>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <rect x="7" y="7" width="10" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13V5a2 2 0 012-2h8" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.126 1.532 5.862L.057 23.986l6.306-1.453A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.895 0-3.664-.512-5.18-1.4l-.371-.22-3.845.885.929-3.72-.242-.383A9.816 9.816 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818 5.418 0 9.818 4.4 9.818 9.818 0 5.418-4.4 9.818-9.818 9.818z"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function SmsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}
