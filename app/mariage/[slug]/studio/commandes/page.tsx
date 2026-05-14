import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: 'En attente',      color: '#92400e', bg: '#fef3c7' },
  in_production:    { label: 'En production',   color: '#1e40af', bg: '#dbeafe' },
  printed:          { label: 'Imprimé',         color: '#065f46', bg: '#d1fae5' },
  shipped:          { label: 'Expédié 📦',      color: '#4a5240', bg: '#e7ede3' },
  delivered:        { label: 'Livré ✓',         color: '#4a5240', bg: '#d1fae5' },
  canceled:         { label: 'Annulé',          color: '#991b1b', bg: '#fee2e2' },
  failed:           { label: 'Erreur',          color: '#991b1b', bg: '#fee2e2' },
}

export default async function CommandesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: wedding } = await supabase
    .from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8 text-stone-500">Mariage introuvable</div>

  const { data: orders } = await supabase
    .from('studio_orders')
    .select('id, created_at, status, item_count, order_reference, tracking_url, shipped_at, gelato_order_id')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">

        <a href={`/mariage/${slug}/studio`}
          className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors mb-5"
          style={{ fontWeight: 300, fontSize: '0.75rem' }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Studio créatif
        </a>

        <h1 style={{ fontWeight: 600, fontSize: '1.3rem' }} className="text-[#2d3228] mb-1">
          Mes commandes
        </h1>
        <p style={{ fontWeight: 300, fontSize: '0.8rem' }} className="text-stone-500 mb-6">
          Historique de vos commandes de papeterie.
        </p>

        {(!orders || orders.length === 0) ? (
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-10 text-center">
            <p style={{ fontSize: '2rem' }} className="mb-3">📦</p>
            <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-[#2d3228] mb-2">
              Aucune commande pour l'instant
            </p>
            <a href={`/mariage/${slug}/studio`}
              style={{ fontWeight: 400, fontSize: '0.8rem' }}
              className="text-[#4a5240] underline hover:text-[#2d3228]">
              Créer ma collection →
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const st = STATUS_LABELS[order.status] ?? { label: order.status, color: '#57534e', bg: '#f5f5f4' }
              return (
                <div key={order.id}
                  className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">
                        {order.item_count} produit{order.item_count > 1 ? 's' : ''}
                      </p>
                      <p style={{ fontWeight: 300, fontSize: '0.7rem' }} className="text-stone-400 mt-0.5">
                        Commande du {fmt(order.created_at)}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: st.bg, color: st.color, fontWeight: 400 }}
                    >
                      {st.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">
                        Réf. {order.order_reference}
                      </span>
                      {order.gelato_order_id && (
                        <span style={{ fontWeight: 300, fontSize: '0.68rem' }} className="text-stone-300">
                          Gelato #{order.gelato_order_id.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    {order.shipped_at && (
                      <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-500">
                        Expédié le {fmt(order.shipped_at)}
                      </p>
                    )}

                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#4a5240] hover:text-[#2d3228] transition-colors"
                        style={{ fontWeight: 400, fontSize: '0.78rem' }}
                      >
                        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                          <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M1 7h14M5 4V2.5a2.5 2.5 0 015 0V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Suivre mon colis →
                      </a>
                    )}
                  </div>

                  {/* CTA re-télécharger si livré */}
                  {(order.status === 'delivered' || order.status === 'shipped') && (
                    <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/50">
                      <a
                        href={`/mariage/${slug}/studio/finaliser`}
                        style={{ fontWeight: 300, fontSize: '0.75rem' }}
                        className="text-stone-500 hover:text-[#4a5240] transition-colors"
                      >
                        Revoir votre collection ou passer une nouvelle commande →
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
