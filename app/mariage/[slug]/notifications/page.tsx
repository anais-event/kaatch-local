import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import NotificationsClient from './NotificationsClient'

export default async function NotificationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, notification_prefs, notification_email')
    .eq('slug', slug)
    .single()
  if (!wedding) return <div className="p-8 text-stone-500">{t('notFound')}</div>

  async function savePrefs(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const email = (formData.get('notification_email') as string)?.trim() || null
    const prefs = {
      new_rsvp:      formData.get('new_rsvp')      === 'on',
      new_photo:     formData.get('new_photo')     === 'on',
      new_message:   formData.get('new_message')   === 'on',
      new_guestbook: formData.get('new_guestbook') === 'on',
      order_shipped: formData.get('order_shipped') === 'on',
    }
    await supabase
      .from('weddings')
      .update({ notification_prefs: prefs, notification_email: email })
      .eq('slug', slug)
    revalidatePath(`/mariage/${slug}/notifications`)
  }

  const prefs = (wedding.notification_prefs ?? {}) as Record<string, boolean>

  return (
    <NotificationsClient
      slug={slug}
      userEmail={user.email ?? ''}
      notificationEmail={wedding.notification_email ?? ''}
      prefs={prefs}
      savePrefs={savePrefs}
    />
  )
}
