import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import RSVPForm from './RSVPForm'

export default async function RSVPPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('rsvp_token', params.slug)
    .single()

  if (!guest) notFound()

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-serif text-rose-700 mb-2">
          Bonjour {guest.first_name} 👋
        </h1>
        <p className="text-gray-500 mb-6">Merci de confirmer votre présence</p>
        <RSVPForm guest={guest} />
      </div>
    </main>
  )
}
