'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { routing } from '@/i18n/routing'

export async function setLocale(locale: string) {
  if (!routing.locales.includes(locale as any)) return

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })

  revalidatePath('/')
}
