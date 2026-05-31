import { createSupabaseServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import GuestbookForm from './GuestbookForm'
import { notifyCouple } from '@/lib/email/notify-couple'
import { getTranslations } from 'next-intl/server'

const ALLOWED_TAGS = /<\/?(?:b|strong|i|em|u|br|p|ul|ol|li|span)(?:\s[^>]*)?>/gi

function sanitizeHtml(input: string): string {
  if (!input) return ''
  // Strip everything but our whitelist
  let out = input.replace(/<(?!\/?(?:b|strong|i|em|u|br|p|ul|ol|li|span)(?:\s|>|\/))/gi, '&lt;')
  // Drop on* attributes and javascript: hrefs
  out = out.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  out = out.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  out = out.replace(/javascript:/gi, '')
  // Limit size to avoid abuse
  if (out.length > 8000) out = out.slice(0, 8000)
  return out
}

async function submitEntry(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()

  const slug = formData.get('slug') as string
  const author_name = formData.get('author_name') as string
  const message = formData.get('message') as string
  const message_html_raw = formData.get('message_html') as string | null
  const guest_id = (formData.get('guest_id') as string) || null
  const photo = formData.get('photo') as File | null
  const audio = formData.get('audio') as File | null

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

  let audio_url: string | null = null
  if (audio && audio.size > 0) {
    const ext = (audio.type.split('/')[1] || 'webm').split(';')[0]
    const path = `${wedding.id}/guestbook/audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await audio.arrayBuffer()
    const { error } = await supabase.storage
      .from('wedding-photos')
      .upload(path, Buffer.from(bytes), { contentType: audio.type || 'audio/webm' })
    if (!error) {
      const { data: urlData } = supabase.storage.from('wedding-photos').getPublicUrl(path)
      audio_url = urlData.publicUrl
    }
  }

  const message_html = message_html_raw ? sanitizeHtml(message_html_raw) : null

  await supabase.from('guestbook_entries').insert({
    wedding_id: wedding.id,
    guest_id: guest_id || null,
    author_name,
    message,
    message_html,
    photo_url,
    audio_url,
  })

  revalidatePath(`/invite/${slug}/livre-dor`)

  // Notification email couple
  const { data: w } = await supabase
    .from('weddings')
    .select('name, slug, notification_prefs, notification_email')
    .eq('slug', slug).single()
  if (w) {
    const prefs = (w.notification_prefs ?? {}) as Record<string, boolean>
    if (prefs.new_guestbook) {
      const toEmail = w.notification_email || null
      if (toEmail) {
        const preview = message.slice(0, 80) + (message.length > 80 ? '…' : '')
        notifyCouple({ to: toEmail, weddingName: w.name ?? '', slug, type: 'new_guestbook', data: { guestName: author_name, preview } }).catch(() => {})
      }
    }
  }
}

export default async function LivreDorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const guestCookie = cookieStore.get(`guest_${slug}`)
  const guest = guestCookie ? JSON.parse(guestCookie.value) : { firstName: '', lastName: '', id: null }
  const guestName = [guest.firstName, guest.lastName].filter(v => v && v !== 'null').join(' ')
  const t = await getTranslations('invite.guestbook')

  async function boundSubmit(formData: FormData) {
    'use server'
    formData.set('slug', slug)
    formData.set('guest_id', guest.id ?? '')
    await submitEntry(formData)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">

        <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.5rem' }}
            className="text-[#2d3228] mb-2">
          {t('title')}
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400 mb-8">
          {t('subtitle')}
        </p>

        <GuestbookForm submitEntry={boundSubmit} defaultName={guestName} />
      </div>
    </div>
  )
}
