import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Lato, Great_Vibes } from "next/font/google";
import "./globals.css";
import CookieBanner from './_components/CookieBanner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kaatch — Organiser son mariage en ligne | RSVP, Plan de table, Album photo",
  description: "Invitations personnalisées, gestion des RSVP, plan de table drag & drop, album photo partagé entre tous les invités. Votre mariage, tout au même endroit. Essai gratuit.",
  keywords: "organisation mariage, application mariage, RSVP mariage en ligne, plan de table mariage, album photo mariage partagé, faire-part numérique, gestion invités mariage",
  openGraph: {
    title: "Kaatch — Organiser son mariage en ligne",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${lato.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
