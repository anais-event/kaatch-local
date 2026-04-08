'use client'

import { useEffect, useState } from 'react'

type Hotel = {
  id: string
  name: string
  address: string
  lat: number
  lon: number
  distance?: number
}

export default function HotelSuggestions({ location }: { location: string }) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchHotels() {
      try {
        // Géocoder l'adresse du mariage
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
        )
        const geoData = await geoRes.json()
        if (!geoData[0]) { setError(true); setLoading(false); return }

        const lat = parseFloat(geoData[0].lat)
        const lon = parseFloat(geoData[0].lon)

        // Chercher les hôtels dans un rayon de 5km
        const query = `
          [out:json][timeout:25];
          (
            node["tourism"="hotel"](around:5000,${lat},${lon});
            way["tourism"="hotel"](around:5000,${lat},${lon});
            node["tourism"="guest_house"](around:5000,${lat},${lon});
            node["tourism"="hostel"](around:5000,${lat},${lon});
          );
          out body center 10;
        `
        const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        })
        const overpassData = await overpassRes.json()

        const results: Hotel[] = overpassData.elements
          .filter((el: { tags?: { name?: string } }) => el.tags?.name)
          .slice(0, 8)
          .map((el: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags: { name: string; 'addr:street'?: string; 'addr:city'?: string } }) => {
            const elLat = el.lat ?? el.center?.lat ?? lat
            const elLon = el.lon ?? el.center?.lon ?? lon
            const dist = Math.round(
              Math.sqrt(Math.pow((elLat - lat) * 111, 2) + Math.pow((elLon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)) * 10
            ) / 10

            const addr = [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ')

            return {
              id: String(el.id),
              name: el.tags.name,
              address: addr || 'Adresse non renseignée',
              lat: elLat,
              lon: elLon,
              distance: dist,
            }
          })
          .sort((a: Hotel, b: Hotel) => (a.distance ?? 0) - (b.distance ?? 0))

        setHotels(results)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [location])

  if (loading) return (
    <p className="text-stone-400 italic text-center py-6"
       style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
      Recherche d'hébergements à proximité…
    </p>
  )

  if (error || hotels.length === 0) return (
    <p className="text-stone-400 italic text-center py-6"
       style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
      Aucun hébergement trouvé automatiquement. Ajoutez-en manuellement ci-dessous.
    </p>
  )

  return (
    <div className="space-y-3">
      {hotels.map(hotel => (
        <div key={hotel.id}
             className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-stone-100">
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.1rem' }}
               className="text-stone-800">{hotel.name}</p>
            <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
               className="text-stone-400">📍 {hotel.address}</p>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            {hotel.distance !== undefined && (
              <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.75rem' }}
                 className="text-[#4a5240]">{hotel.distance} km</p>
            )}
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(hotel.name + ' ' + hotel.address)}`}
               target="_blank" rel="noopener noreferrer"
               className="text-xs text-stone-400 hover:text-[#4a5240] transition"
               style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
              Voir →
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
