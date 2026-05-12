'use client'

const items = [
  { icon: '💌', label: 'Faire-parts & RSVP' },
  { icon: '🪑', label: 'Plan de table' },
  { icon: '📸', label: 'Album photo partagé' },
  { icon: '📅', label: 'Programme jour J' },
  { icon: '🔗', label: 'Espace invités' },
  { icon: '📝', label: "Livre d'or" },
  { icon: '💰', label: 'Budget global' },
  { icon: '🎵', label: 'Playlist & animations' },
]

export default function FeatureTicker() {
  const doubled = [...items, ...items]

  return (
    <div
      className="overflow-hidden border-y border-stone-200/70 py-3.5"
      style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}
      aria-hidden="true"
    >
      <div className="flex animate-marquee" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-8 text-sm text-stone-400 whitespace-nowrap"
            style={{ fontWeight: 300 }}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
            <span className="ml-6 text-stone-200">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
