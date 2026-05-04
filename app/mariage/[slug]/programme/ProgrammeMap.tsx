'use client'

import { useEffect, useRef } from 'react'

interface Step {
  id: string
  title: string
  address?: string | null
  time?: string | null
  icon?: string | null
}

export default function ProgrammeMap({ steps }: { steps: Step[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (!mapRef.current) return

      const map = L.map(mapRef.current).setView([46.5, 2.5], 6)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const stepsWithAddress = steps.filter(s => s.address)
      const bounds: [number, number][] = []

      for (let i = 0; i < stepsWithAddress.length; i++) {
        const step = stepsWithAddress[i]
        const index = i + 1

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address!)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr' } }
          )
          const data = await res.json()

          if (data[0]) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            bounds.push([lat, lon])

            const icon = L.divIcon({
              html: `<div style="background:#4a5240;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${index}</div>`,
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 28],
            })

            if (!mapInstanceRef.current) return

            L.marker([lat, lon], { icon })
              .addTo(map)
              .bindPopup(`<b>${step.title}</b>${step.time ? `<br/>🕐 ${step.time}` : ''}<br/><span style="color:#888">${step.address}</span>`)
          }
        } catch (e) {
          console.error('Geocoding error:', e)
        }
      }

      if (!mapInstanceRef.current) return

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [steps])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: '300px' }}
    />
  )
}
