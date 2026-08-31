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
  const now = new Date()

  const mainPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                              alternates: localeAlternates("/", baseUrl),              lastModified: now,                    changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/pricing`,                 alternates: localeAlternates("/pricing", baseUrl),       lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide`,                   lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`,                     lastModified: now,                    changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/budget-mariage`,          alternates: localeAlternates("/budget-mariage", baseUrl),          lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/checklist-mariage`,       alternates: localeAlternates("/checklist-mariage", baseUrl),       lastModified: now,                    changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/plan-de-table-mariage`,   alternates: localeAlternates("/plan-de-table-mariage", baseUrl),   lastModified: now,                    changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/discours-mariage`,        alternates: localeAlternates("/discours-mariage", baseUrl),        lastModified: now,                    changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/outils`,                  alternates: localeAlternates("/outils", baseUrl),                  lastModified: now,                    changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/studio`,                  alternates: localeAlternates("/studio", baseUrl),                  lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/inspirations`,            lastModified: now,                    changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/entre-nous`,              lastModified: new Date("2026-05-01"), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`,        lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/cgv`,                     lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/confidentialite`,         lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
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

  // getAllInspirations() lit dynamiquement content/inspirations/*.mdx — inclut tous les articles automatiquement
  const blogPosts: MetadataRoute.Sitemap = getAllInspirations().map((item) => ({
    url: `${baseUrl}/inspirations/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...mainPages, ...featurePages, ...blogPosts]
}
