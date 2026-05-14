import Link from 'next/link'

interface Props {
  slug: string
  context: 'guests' | 'tables' | 'invitations' | 'programme' | 'menu'
}

const MESSAGES: Record<Props['context'], { emoji: string; text: string; sub: string }> = {
  guests:       { emoji: '✨', text: 'Créez la papeterie de votre mariage', sub: 'Faire-parts, menus, marque-places personnalisés — imprimés et livrés.' },
  tables:       { emoji: '✨', text: 'Plan de table prêt ?', sub: 'Intégrez-le dans votre papeterie et imprimez vos marque-places.' },
  invitations:  { emoji: '✨', text: 'Studio Créatif', sub: 'Créez et imprimez vos faire-parts personnalisés en quelques clics.' },
  programme:    { emoji: '✨', text: 'Imprimez votre programme', sub: 'Mettez en page et commandez vos programmes depuis le Studio.' },
  menu:         { emoji: '✨', text: 'Vos menus en impression pro', sub: 'Studio Créatif crée vos menus personnalisés aux couleurs de votre mariage.' },
}

export default function StudioBanner({ slug, context }: Props) {
  const { emoji, text, sub } = MESSAGES[context]
  return (
    <Link
      href={`/mariage/${slug}/studio`}
      className="flex items-center gap-4 bg-[#2d3228] rounded-xl px-5 py-4 hover:bg-[#2d3228]/90 transition-all group"
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p style={{ fontWeight: 500, fontSize: '0.88rem', color: '#fff' }}>{text}</p>
        <p style={{ fontWeight: 300, fontSize: '0.72rem', color: '#a8a29e' }} className="mt-0.5">{sub}</p>
      </div>
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-stone-400 group-hover:text-stone-200 transition flex-shrink-0">
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  )
}
