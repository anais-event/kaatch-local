'use client'

import { useEffect, useState } from 'react'

export default function MapEmbed({ address }: { address: string }) {
  const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(null)

  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'fr' }
    })
      .then(r => r.json())
      .then(data => {
        if (data[0]) setCoords({ lat: data[0].lat, lon: data[0].lon })
      })
      .catch(() => {})
  }, [address])

  if (!coords) return null

  const { lat, lon } = coords
  const delta = 0.008
  const bbox = `${parseFloat(lon) - delta},${parseFloat(lat) - delta},${parseFloat(lon) + delta},${parseFloat(lat) + delta}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-stone-100" style={{ height: '160px' }}>
      <iframe
        src={src}
        width="100%"
        height="160"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        title={`Carte — ${address}`}
      />
    </div>
  )
}
