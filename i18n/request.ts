import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // For routes outside [locale]/ (mariage/, invite/, dashboard/),
  // requestLocale is undefined — fall back to NEXT_LOCALE cookie
  if (!locale || !routing.locales.includes(locale as any)) {
    try {
      const cookieStore = await cookies()
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
      if (cookieLocale && routing.locales.includes(cookieLocale as any)) {
        locale = cookieLocale
      } else {
        locale = routing.defaultLocale
      }
    } catch {
      locale = routing.defaultLocale
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
