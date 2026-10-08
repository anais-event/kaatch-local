import type { ReactNode } from 'react'

// Segment privé : jamais indexé (données personnelles / espace protégé)
export const metadata = { robots: { index: false, follow: false } }

export default function PrivateSegmentLayout({ children }: { children: ReactNode }) {
  return children
}
