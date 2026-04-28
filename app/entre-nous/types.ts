export type ForumCategory = 'question' | 'astuce' | 'bon-plan' | 'coup-de-coeur'

export const categoryLabel: Record<ForumCategory, string> = {
  question: '❓ Question',
  astuce: '💡 Astuce',
  'bon-plan': '✨ Bon plan',
  'coup-de-coeur': '❤️ Coup de cœur',
}
