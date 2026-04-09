'use client'

export default function ProgrammePDF({ slug, weddingName, steps }: {
  slug: string
  weddingName: string
  steps: { icon?: string; title: string; time?: string; description?: string; address?: string }[]
}) {
  function download() {
    const lines = [
      `Programme — ${weddingName}`,
      '',
      ...steps.flatMap(s => [
        `${s.icon || '✨'} ${s.time ? `[${s.time}]` : ''} ${s.title}`,
        s.description ? `   ${s.description}` : '',
        s.address ? `   📍 ${s.address}` : '',
        '',
      ])
    ].filter(l => l !== undefined)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `programme-${slug}.txt`
    a.click()
  }

  if (!steps.length) return null

  return (
    <button onClick={download}
      className="text-xs border border-[#4a5240] text-[#4a5240] px-4 py-2 rounded-full hover:bg-[#4a5240] hover:text-white transition"
      style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.05em' }}>
      ⬇️ Télécharger
    </button>
  )
}
