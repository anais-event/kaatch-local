'use client'

import { useState } from 'react'

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
        copied
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
          : 'border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240]'
      }`}
      style={{ fontWeight: 300 }}>
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  )
}
