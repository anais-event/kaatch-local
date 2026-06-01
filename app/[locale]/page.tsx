import LandingClient from './_components/LandingClient'
import ForumEmbed from '../_components/ForumEmbed'

export default async function Home() {
  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>
      <LandingClient />
      <ForumEmbed />
      <div className="flex justify-center py-4 bg-[#f5f0e8]">
        <a href="https://postyourstartup.co/startup/kaatch?ref=badge" target="_blank" rel="noopener noreferrer">
          <img src="https://postyourstartup.co/api/badge/kaatch?theme=neutral" alt="Featured on PostYourStartup" width="159" height="41" />
        </a>
      </div>
    </main>
  )
}
