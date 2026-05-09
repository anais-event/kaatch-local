import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import CookieBanner from './_components/CookieBanner'
import { Analytics } from '@vercel/analytics/next';

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

// Conservé uniquement pour le faire-part (carte d'invitation visuelle)
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
      className={`${outfit.variable} ${lato.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
