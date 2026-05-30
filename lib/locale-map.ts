/** Map short locale code to Intl-compatible locale string */
const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  it: 'it-IT',
  de: 'de-DE',
}

export function toDateLocale(locale: string): string {
  return LOCALE_MAP[locale] || 'fr-FR'
}
