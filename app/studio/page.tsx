import type { Metadata } from 'next'
import StudioPublic from './StudioPublic'

export const metadata: Metadata = {
  title: 'Studio Créatif — Papeterie de mariage | Kaatch',
  description: 'Créez votre collection de papeterie de mariage : faire-parts, menus, marque-places, plan de table. Impression professionnelle, livraison à domicile.',
}

export default function StudioPage() {
  return <StudioPublic />
}
