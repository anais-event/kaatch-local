import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

const DISPLAY = 'var(--font-display)'
const GREEN = '#2C3B2E'
const SHADOW = '0 4px 24px rgba(44,59,46,0.08), 0 1px 4px rgba(44,59,46,0.04)'

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  question:      { bg: '#eceef8', text: '#4a5299', label: 'Question' },
  astuce:        { bg: '#eef1ec', text: '#4a5240', label: 'Astuce' },
  'bon-plan':    { bg: '#f3ede4', text: '#7c6d52', label: 'Bon plan' },
  'coup-de-coeur': { bg: '#fceef1', text: '#9c4a5a', label: 'Coup de ♥' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  return `il y a ${Math.floor(days / 7)}sem`
}

export default async function ForumEmbed() {
  const supabase = await createSupabaseServerClient()
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, title, category, author_name, likes_count, replies_count, created_at')
    .eq('reported', false)
    .order('created_at', { ascending: false })
    .limit(4)

  if (!posts?.length) return null

  return (
    <section className="py-24 px-6 md:px-10 bg-[#f5f0e8] border-t border-stone-100">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ fontFamily: DISPLAY, fontWeight: 500, color: GREEN }}>
              Entre nous · Le Forum
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: GREEN }}>
              Ce que les mariés se disent.
            </h2>
            <p className="text-stone-500 mt-3 max-w-md" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.95rem', lineHeight: 1.7 }}>
              Questions, astuces, bons plans — entre futurs mariés. Rejoignez la conversation.
            </p>
          </div>
          <Link href="/entre-nous"
            className="hidden md:block text-sm border border-stone-300 text-stone-500 px-5 py-2.5 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition shrink-0"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
            Voir tout →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {posts.map(post => {
            const cat = categoryColors[post.category] ?? { bg: '#f5f0e8', text: '#78716c', label: post.category }
            return (
              <Link key={post.id} href="/entre-nous"
                className="group bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all block"
                style={{ boxShadow: SHADOW }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: cat.bg, color: cat.text, fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-stone-400" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                    {timeAgo(post.created_at)}
                  </span>
                </div>
                <p className="text-[#2d3228] mb-3 leading-snug group-hover:text-[#2C3B2E] transition"
                   style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: '0.95rem' }}>
                  {post.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-stone-400" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                  <span>{post.author_name}</span>
                  <span>♥ {post.likes_count ?? 0}</span>
                  {post.replies_count > 0 && <span>💬 {post.replies_count}</span>}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/entre-nous"
            className="inline-block text-sm border border-stone-300 text-stone-500 px-6 py-3 rounded-full hover:border-[#2C3B2E] hover:text-[#2C3B2E] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 400 }}>
            Rejoindre la conversation →
          </Link>
        </div>

      </div>
    </section>
  )
}
