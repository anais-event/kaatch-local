import { createSupabaseServerClient } from '@/lib/supabase-server'

const GUEST_CATS = [
  { key: 'tenue',  label: 'Tenues',  icon: '👗', desc: 'Code vestimentaire & tenues souhaitées' },
  { key: 'theme',  label: 'Thème',   icon: '✨', desc: 'Ambiance, décoration & couleurs' },
  { key: 'deco',   label: 'Déco',    icon: '🌸', desc: 'Inspirations décoration' },
  { key: 'menu',   label: 'Menu',    icon: '🍽️', desc: 'Idées menu & boissons' },
]

function isImage(url: string) { return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(url) }
function isPinterest(url: string) { return url.includes('pinterest') }
function isYoutube(url: string) { return url.includes('youtube.com') || url.includes('youtu.be') }

type InspiItem = {
  id: string
  category: string
  title: string
  description: string | null
  url: string | null
  image_url: string | null
  budget_note: string | null
}

function ItemCard({ item }: { item: InspiItem }) {
  const displayUrl = item.image_url || item.url
  const domain = (() => {
    try { return new URL(item.url ?? '').hostname.replace('www.', '') } catch { return item.url ?? '' }
  })()
  const linkIcon = isPinterest(item.url ?? '') ? '📌' : isYoutube(item.url ?? '') ? '▶️' : '🔗'

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-sm transition">
      {item.image_url && isImage(item.image_url) && (
        <img src={item.image_url} alt={item.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-4">
        <p style={{ fontWeight: 500, fontSize: '0.88rem' }} className="text-stone-800 mb-1">{item.title}</p>
        {item.description && (
          <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-stone-500 mb-2">
            {item.description}
          </p>
        )}
        {item.budget_note && (
          <p style={{ fontWeight: 300, fontSize: '0.72rem' }}
             className="text-[#4a5240] bg-[#f5f0e8] px-2.5 py-1 rounded-lg inline-block mb-2">
            💰 {item.budget_note}
          </p>
        )}
        {displayUrl && !item.image_url && (
          <a href={displayUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 mt-1 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100 hover:border-[#4a5240]/30 transition"
             style={{ fontWeight: 300, fontSize: '0.75rem', color: '#78716c' }}>
            <span>{linkIcon}</span>
            <span className="truncate">{domain}</span>
            <span className="ml-auto text-stone-300 shrink-0">↗</span>
          </a>
        )}
        {item.image_url && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 mt-2 text-xs text-stone-400 hover:text-[#4a5240] transition"
             style={{ fontWeight: 300 }}>
            <span>🔗</span>
            <span className="truncate">{domain}</span>
            <span className="ml-auto">↗</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default async function GuestInspirationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, inspirations_visible_cats')
    .eq('slug', slug)
    .single()

  if (!wedding) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} className="text-stone-400">
          Mariage introuvable.
        </p>
      </div>
    )
  }

  const visibleCats: string[] = wedding.inspirations_visible_cats ?? []

  if (visibleCats.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">✨</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.6rem' }}
              className="text-[#2d3228] mb-3">Bientôt disponible</h2>
          <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.7 }}
             className="text-stone-500">
            Les mariés partagent bientôt leurs inspirations avec vous.
          </p>
        </div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('inspiration_items')
    .select('*')
    .eq('wedding_id', wedding.id)
    .in('category', visibleCats)
    .order('created_at', { ascending: false })

  const allItems = items ?? []
  const defaultTab = GUEST_CATS.find(c => visibleCats.includes(c.key))?.key ?? visibleCats[0]
  const activeTab = (tab && visibleCats.includes(tab)) ? tab : defaultTab
  const cat = GUEST_CATS.find(c => c.key === activeTab) ?? GUEST_CATS[0]
  const catItems = allItems.filter(i => i.category === activeTab)

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p style={{ fontWeight: 300, fontSize: '0.68rem', letterSpacing: '0.2em' }}
             className="text-stone-400 uppercase mb-1">Inspirations des mariés</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.8rem', fontStyle: 'italic' }}
              className="text-[#2d3228] leading-none">{wedding.name}</h1>
        </div>

        {/* Tabs — only visible cats */}
        {visibleCats.length > 1 && (
          <div className="flex border-b-2 border-stone-200 mb-6 gap-1 overflow-x-auto">
            {GUEST_CATS.filter(c => visibleCats.includes(c.key)).map(c => {
              const count = allItems.filter(i => i.category === c.key).length
              return (
                <a key={c.key}
                   href={`/invite/${slug}/inspirations?tab=${c.key}`}
                   className={`px-5 py-3 text-sm rounded-t-lg border-b-2 -mb-0.5 transition-all whitespace-nowrap cursor-pointer ${
                     activeTab === c.key
                       ? 'bg-white border-[#4a5240] text-[#2d3228] shadow-sm'
                       : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-white/60'
                   }`}
                   style={{ fontWeight: activeTab === c.key ? 600 : 300, fontSize: '0.92rem' }}>
                  {c.icon} {c.label}
                  {count > 0 && (
                    <span style={{
                      fontSize: '0.62rem', marginLeft: 6,
                      background: activeTab === c.key ? '#4a5240' : '#e7e5e4',
                      color: activeTab === c.key ? 'white' : '#a8a29e',
                      borderRadius: 999, padding: '1px 6px',
                    }}>
                      {count}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        )}

        {catItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
            <p style={{ fontSize: '2rem' }} className="mb-3">{cat.icon}</p>
            <p style={{ fontWeight: 300, fontSize: '0.9rem' }} className="text-stone-400">
              Aucune inspiration pour cette catégorie
            </p>
          </div>
        ) : (
          <>
            {cat.desc && (
              <p style={{ fontWeight: 300, fontSize: '0.82rem' }} className="text-stone-400 mb-4">
                {cat.desc}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
