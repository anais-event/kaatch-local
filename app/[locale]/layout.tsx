import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ReactNode } from 'react'
import '../globals.css'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Kaatch — Simplifiez l\'organisation de votre mariage',
  description: 'L\'app qui remplace les feuilles de calcul, le chaos WhatsApp et les listes infinies.',
}

export async function generateStaticParams() {
  return [
    { locale: 'fr' },
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'it' },
    { locale: 'de' },
  ]
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
