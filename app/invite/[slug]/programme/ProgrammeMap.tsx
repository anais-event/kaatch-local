'use client'
import { useEffect, useRef } from 'react'

type Step = { title: string; time?: string; address?: string; icon?: string }

export default function ProgrammeMap({ steps }: { steps: Step[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const stepsWithAddress = steps.filter(s => s.address)
  if (stepsWithAddress.length === 0) return null

  useEffect(() => {
    if (!mapRef.current) return
    let map: any = null

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current) return
      // Éviter double init
      if ((mapRef.current as any)._leaflet_id) return

      map = L.map(mapRef.current, { scrollWheelZoom: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const markers: any[] = []

      await Promise.all(stepsWithAddress.map(async (step) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address!)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr' } }
          )
          const data = await res.json()
          if (data[0]) {
            const { lat, lon } = data[0]
            const marker = L.marker([parseFloat(lat), parseFloat(lon)])
              .addTo(map)
              .bindPopup(`<strong>${step.icon || ''} ${step.title}</strong>${step.time ? `<br/><span style="color:#4a5240">${step.time}</span>` : ''}<br/><small>${step.address}</small>`)
            markers.push(marker)
          }
        } catch {}
      }))

      if (markers.length > 0) {
        const group = L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.2))
      }
    }

    init()
    return () => { if (map) map.remove() }
  }, [])

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="px-4 py-2.5 bg-white border-b border-stone-100">
        <p className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
          Tous les lieux
        </p>
      </div>
      <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
    </div>
  )
}
