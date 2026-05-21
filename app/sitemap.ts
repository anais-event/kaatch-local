import type { MetadataRoute } from "next"
import { getAllInspirations } from "@/lib/inspirations"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kaatch.fr"
  const now = new Date()

  const mainPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                              lastModified: now,                    changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/pricing`,                 lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide`,                   lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`,                     lastModified: now,                    changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/budget-mariage`,          lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/studio`,                  lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/inspirations`,            lastModified: now,                    changeFrequency: "weekly",  priority: 0.8 },
    { url: `${baseUrl}/entre-nous`,              lastModified: new Date("2026-05-01"), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${baseUrl}/auth`,                    lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/rejoindre`,               lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/mentions-legales`,        lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/cgv`,                     lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
    { url: `${baseUrl}/confidentialite`,         lastModified: new Date("2025-01-01"), changeFrequency: "yearly",  priority: 0.1 },
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
    lastModified: new Date("2026-05-21"),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const blogPosts: MetadataRoute.Sitemap = getAllInspirations().map((item) => ({
    url: `${baseUrl}/inspirations/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...mainPages, ...featurePages, ...blogPosts]
}
