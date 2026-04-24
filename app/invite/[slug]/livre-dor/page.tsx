import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import GuestbookForm from './GuestbookForm'

async function submitEntry(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()

  const slug = formData.get('slug') as string
  const author_name = formData.get('author_name') as string
  const message = formData.get('message') as string
  const guest_id = (formData.get('guest_id') as string) || null
  const photo = formData.get('photo') as File | null

  const { data: wedding } = await supabase
    .from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop()
    const path = `${wedding.id}/guestbook/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await photo.arrayBuffer()
    const { error } = await supabase.storage
      .from('wedding-photos')
      .upload(path, Buffer.from(bytes), { contentType: photo.type })
    if (!error) {
      const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)
      photo_url = urlData.publicUrl
    }
  }

  await supabase.from('guestbook_entries').insert({
    wedding_id: wedding.id,
    guest_id: guest_id || null,
    author_name,
    message,
    photo_url,
  })

  revalidatePath(`/invite/${slug}/livre-dor`)
}

export default async function LivreDorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', lastName: '', id: null }
  const guestName = [guest.firstName, guest.lastName].filter(v => v && v !== 'null').join(' ')

  // Bind slug and guest_id into the action via hidden fields on the form side
  // We wrap submitEntry to forward those via a bound action
  async function boundSubmit(formData: FormData) {
    'use server'
    formData.set('slug', slug)
    formData.set('guest_id', guest.id ?? '')
    await submitEntry(formData)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] pt-20 pb-32 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">📖</p>
          <h1
            className="text-3xl text-[#2d3228] mb-2"
            style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 600 }}
          >
            Livre d&apos;Or
          </h1>
          <p className="text-stone-400 text-sm" style={{ fontWeight: 300 }}>
            Laissez un mot aux mariés pour immortaliser ce jour
          </p>
        </div>

        <GuestbookForm submitEntry={boundSubmit} defaultName={guestName} />
      </div>
    </div>
  )
}
