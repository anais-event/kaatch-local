import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type InspirationCategory = 'astuce' | 'bon-plan' | 'article'

export type InspirationMeta = {
  slug: string
  title: string
  excerpt: string
  category: InspirationCategory
  date: string
  readTime: string
}

export type InspirationFull = InspirationMeta & {
  content: string
}

export const categoryLabel: Record<InspirationCategory, string> = {
  astuce: 'Astuce',
  'bon-plan': 'Bon plan',
  article: 'Article',
}

export const categoryColor: Record<InspirationCategory, string> = {
  astuce: '#4a5240',
  'bon-plan': '#7c6d52',
  article: '#5c6bc0',
}

export const categoryBg: Record<InspirationCategory, string> = {
  astuce: '#eef1ec',
  'bon-plan': '#f3ede4',
  article: '#eceef8',
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'inspirations')

export function getAllInspirations(): InspirationMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(filename => {
      const slug = filename.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title as string,
        excerpt: data.excerpt as string,
        category: data.category as InspirationCategory,
        date: data.date as string,
        readTime: data.readTime as string,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getInspiration(slug: string): InspirationFull | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title as string,
    excerpt: data.excerpt as string,
    category: data.category as InspirationCategory,
    date: data.date as string,
    readTime: data.readTime as string,
    content,
  }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
}
