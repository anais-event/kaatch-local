import type { MetadataRoute } from "next"
import { getAllInspirations } from "@/lib/inspirations"

const LOCALES = ["en", "es", "it", "de"] as const

function localeAlternates(path: string, baseUrl: string) {
  const frUrl = path === "/" ? baseUrl : `${baseUrl}${path}`
  const languages: Record<string, string> = { fr: frUrl }
  for (const locale of LOCALES) {
    languages[locale] = path === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`
  }
  return { languages }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kaatch.fr"

  // getAllInspirations() lit dynamiquement content/inspirations/*.mdx
  const inspirations = getAllInspirations()

  // lastmod stable des articles : date du plus récent article publié.
  // On n'utilise JAMAIS `new Date()` (= timestamp du build) pour lastmod :
  // un lastmod qui change à chaque déploiement est ignoré par Google.
  const latestPostDate = inspirations.reduce<Date>((max, item) => {
    const d = new Date(item.date)
    return d > max ? d : max
  }, new Date("2026-05-01"))

  // Stamp manuel des pages outils/landing : à bumper quand leur contenu change réellement.
  const SITE_UPDATED = new Date("2026-10-22")

  const mainPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                              alternates: localeAlternates("/", baseUrl),              lastModified: SITE_UPDATED,           changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/pricing`,                 alternates: localeAlternates("/pricing", baseUrl),       lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide`,                   lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`,                     lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/budget-mariage`,          alternates: localeAlternates("/budget-mariage", baseUrl),          lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/checklist-mariage`,       alternates: localeAlternates("/checklist-mariage", baseUrl),       lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/plan-de-table-mariage`,   alternates: localeAlternates("/plan-de-table-mariage", baseUrl),   lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/discours-mariage`,        alternates: localeAlternates("/discours-mariage", baseUrl),        lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/outils`,                  alternates: localeAlternates("/outils", baseUrl),                  lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/liste-invites-mariage`,   alternates: localeAlternates("/liste-invites-mariage", baseUrl),   lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/programme-mariage`,       alternates: localeAlternates("/programme-mariage", baseUrl),       lastModified: SITE_UPDATED,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/studio`,                  alternates: localeAlternates("/studio", baseUrl),                  lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/inspirations`,            lastModified: latestPostDate,         changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/entre-nous`,              lastModified: new Date("2026-05-01"), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`,        lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/cgv`,                     lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/politique-de-confidentialite`, lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/kaatch-vs-excel`,          lastModified: new Date("2026-05-21"), changeFrequency: "monthly", priority: 0.8 },
  ]

  const featurePages: MetadataRoute.Sitemap = [
    "faire-part-rsvp",
    "plan-de-table",
    "album-photo",
    "programme-jour-j",
    "espace-invites",
    "livre-dor",
  ].map((slug) => ({
    url: `${baseUrl}/fonctionnalites/${slug}`,
    alternates: localeAlternates(`/fonctionnalites/${slug}`, baseUrl),
    lastModified: new Date("2026-05-21"),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const blogPosts: MetadataRoute.Sitemap = inspirations.map((item) => ({
    url: `${baseUrl}/inspirations/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...mainPages, ...featurePages, ...blogPosts]
}
