import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import RSVPForm from './RSVPForm'

export default async function RSVPPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('rsvp_token', slug)
    .single()

  if (!guest) notFound()

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 max-w-md w-full">
        <h1 className="text-[#2d3228] mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.8rem' }}>
          Bonjour {guest.first_name} 👋
        </h1>
        <p className="text-stone-400 mb-6" style={{ fontWeight: 300, fontSize: '0.9rem' }}>Merci de confirmer votre présence</p>
        <RSVPForm guest={guest} />
      </div>
    </main>
  )
}
