'use client'

import dynamic from 'next/dynamic'

const HotelSuggestions = dynamic(() => import('./HotelSuggestions'), { ssr: false })

export default function HotelSuggestionsWrapper({ location }: { location: string }) {
  return <HotelSuggestions location={location} />
}

