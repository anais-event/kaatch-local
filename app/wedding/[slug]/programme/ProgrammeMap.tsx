'use client'

import { useEffect, useRef } from 'react'

type Step = {
  id: string
  title: string
  address: string | null
  position: number
}

export default function ProgrammeMap({ steps }: { steps: Step[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const stepsWithAddress = steps.filter(s => s.address)

  useEffect(() => {
    if (!mapRef.current || stepsWithAddress.length === 0) return
    if (mapInstanceRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current!).setView([46.5, 2.5], 6)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const bounds: [number, number][] = []

      for (const step of stepsWithAddress) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address!)}&format=json&limit=1`
        )
        const data = await res.json()
        if (!data[0]) continue

        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        bounds.push([lat, lon])

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:#4a5240;color:white;
            width:28px;height:28px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:13px;font-weight:600;
            border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)
          ">${step.position + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        L.marker([lat, lon], { icon })
          .addTo(map)
          .bindPopup(`<b>${step.title}</b><br/><small>${step.address}</small>`)
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (stepsWithAddress.length === 0) return null

  return (
    <div ref={mapRef} style={{ height: '320px', borderRadius: '1rem', overflow: 'hidden', zIndex: 0 }} />
  )
}
