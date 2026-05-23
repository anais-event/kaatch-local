import LandingClient from './_components/LandingClient'
import ForumEmbed from '../_components/ForumEmbed'

export default async function Home() {
  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>
      <LandingClient />
      <ForumEmbed />
    </main>
  )
}
