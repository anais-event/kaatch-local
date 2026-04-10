'use client'
import { useEffect, useRef } from 'react'

type Step = { title: string; time?: string; address?: string; icon?: string }

export default function ProgrammeMap({ steps }: { steps: Step[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const stepsWithAddress = steps.filter(s => s.address)

  useEffect(() => {
    // Pas d'adresses → rien à faire
    if (stepsWithAddress.length === 0) return
    if (!mapRef.current) return
    let map: ReturnType<typeof import('leaflet').default.map> | null = null

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current) return
      // Éviter double init
      if ((mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return

      map = L.map(mapRef.current, { scrollWheelZoom: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Fix icône Leaflet (webpack asset path)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const markers: ReturnType<typeof L.marker>[] = []

      // Geocoder séquentiellement pour respecter le rate-limit Nominatim
      for (const step of stepsWithAddress) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(step.address!)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr', 'User-Agent': 'kaatch-wedding-app' } }
          )
          const data = await res.json()
          if (data[0]) {
            const { lat, lon } = data[0]
            const marker = L.marker([parseFloat(lat), parseFloat(lon)])
              .addTo(map!)
              .bindPopup(
                `<strong>${step.icon ? step.icon + ' ' : ''}${step.title}</strong>` +
                (step.time ? `<br/><span style="color:#4a5240;font-size:0.8rem">${step.time}</span>` : '') +
                `<br/><small style="color:#888">${step.address}</small>`
              )
            markers.push(marker)
          }
          // Pause entre requêtes Nominatim (évite le rate-limit)
          await new Promise(r => setTimeout(r, 300))
        } catch {
          // adresse non trouvée, on continue
        }
      }

      if (markers.length > 0) {
        const group = L.featureGroup(markers)
        map!.fitBounds(group.getBounds().pad(0.25))
      }
    }

    init()
    return () => { if (map) map.remove() }
  }, [steps.map(s => s.address).join('|')])  // re-init si les adresses changent

  if (stepsWithAddress.length === 0) return null

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="px-4 py-2.5 bg-white border-b border-stone-100">
        <p className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
          Tous les lieux
        </p>
      </div>
      <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
    </div>
  )
}
