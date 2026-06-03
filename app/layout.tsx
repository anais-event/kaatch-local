import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { getLocale } from 'next-intl/server';

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kaatch — Organiser son mariage en ligne | RSVP, Plan de table, Album photo",
  description: "Invitations personnalisées, gestion des RSVP, plan de table drag & drop, album photo partagé entre tous les invités. Votre mariage, tout au même endroit. Essai gratuit.",
  keywords: "organisation mariage, application mariage, RSVP mariage en ligne, plan de table mariage, album photo mariage partagé, faire-part numérique, gestion invités mariage",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kaatch — Toute l'organisation de votre mariage, au même endroit",
    description: "Invitations personnalisées, RSVP, plan de table, album photo partagé. Tout pour votre mariage, au même endroit.",
    url: "https://kaatch.fr",
    siteName: "Kaatch",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaatch — Organiser son mariage en ligne",
    description: "Invitations personnalisées, RSVP, plan de table, album photo partagé. Essai gratuit.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${outfit.variable} ${jakarta.variable} ${cormorant.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-JZGV5T58NL" />
    </html>
  );
}
