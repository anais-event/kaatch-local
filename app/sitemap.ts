import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kaatch.fr"

  const mainPages = [
    { url: baseUrl, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/guide`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/budget-mariage`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/studio`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/inspirations`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/entre-nous`, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${baseUrl}/auth`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/rejoindre`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: "yearly" as const, priority: 0.1 },
    { url: `${baseUrl}/cgv`, changeFrequency: "yearly" as const, priority: 0.1 },
    { url: `${baseUrl}/confidentialite`, changeFrequency: "yearly" as const, priority: 0.1 },
  ]

  const featurePages = [
    "faire-part-rsvp",
    "plan-de-table",
    "album-photo",
    "programme-jour-j",
    "espace-invites",
    "livre-dor",
  ].map((slug) => ({
    url: `${baseUrl}/fonctionnalites/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }))

  const blogPosts = [
    "budget-3fbi",
    "budget-moyen-mariage-france",
    "photographe-mariage-questions-a-poser",
    "liste-invites-sans-prise-de-tete",
  ].map((slug) => ({
    url: `${baseUrl}/inspirations/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...mainPages, ...featurePages, ...blogPosts]
}
