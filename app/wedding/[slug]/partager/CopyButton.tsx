'use client'

import { useState } from 'react'

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className="w-full border border-[#4a5240] text-[#4a5240] py-2 rounded-full hover:bg-[#4a5240] hover:text-white transition text-sm"
      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
      {copied ? '✅ Lien copié !' : '📋 Copier le lien'}
    </button>
  )
}
