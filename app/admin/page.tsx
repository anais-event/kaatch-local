import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'anais@kaatch.fr'

async function setPlan(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const weddingId = formData.get('wedding_id') as string
  const plan = formData.get('plan') as string | null
  await supabase.from('weddings').update({ plan: plan || null }).eq('id', weddingId)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, slug, name, date, plan, user_id, created_at')
    .order('created_at', { ascending: false })

  const weddingIds = (weddings ?? []).map(w => w.id)

  const { data: guestCounts } = weddingIds.length > 0
    ? await supabase.from('guests').select('wedding_id').in('wedding_id', weddingIds)
    : { data: [] }

  const countByWedding: Record<string, number> = {}
  for (const g of guestCounts ?? []) {
    countByWedding[g.wedding_id] = (countByWedding[g.wedding_id] ?? 0) + 1
  }

  const total = weddings?.length ?? 0
  const paid = weddings?.filter(w => w.plan === 'mariage' || w.plan === 'pro').length ?? 0
  const free = total - paid

  const LATO = 'var(--font-lato)'
  const DISPLAY = 'var(--font-cormorant)'

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>

      {/* Header */}
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>
            Kaatch Admin
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.6rem', fontStyle: 'italic' }}
              className="text-white">
            Dashboard administrateur
          </h1>
        </div>
        <a href="/dashboard"
           className="text-white/50 text-xs hover:text-white transition"
           style={{ fontWeight: 300 }}>
          ← Mon espace
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Mariages total', value: total, color: 'text-[#2d3228]' },
            { label: 'Plan gratuit', value: free, color: 'text-stone-500' },
            { label: 'Plan Mariage', value: paid, color: 'text-[#4a5240]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-5 text-center shadow-sm">
              <p style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '2.4rem', lineHeight: 1 }}
                 className={s.color}>{s.value}</p>
              <p className="text-stone-400 text-xs mt-1 uppercase tracking-wide" style={{ fontWeight: 400 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <p style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.08em' }}
               className="text-stone-500 uppercase">
              Tous les mariages
            </p>
          </div>

          {(weddings ?? []).length === 0 ? (
            <p className="px-6 py-10 text-center text-stone-400 text-sm">Aucun mariage pour l'instant.</p>
          ) : (
            <div className="divide-y divide-stone-50">
              {(weddings ?? []).map(w => {
                const isPaidPlan = w.plan === 'mariage' || w.plan === 'pro'
                const dateStr = w.date
                  ? new Date(w.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'

                return (
                  <div key={w.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">

                    {/* Info mariage */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }} className="text-[#2d3228]">
                          {w.name || '—'}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isPaidPlan
                            ? 'bg-[#4a5240]/10 text-[#4a5240]'
                            : 'bg-stone-100 text-stone-400'
                        }`} style={{ fontWeight: 500 }}>
                          {w.plan ?? 'gratuit'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-stone-400">{dateStr}</span>
                        <span className="text-xs text-stone-400">·</span>
                        <a href={`/wedding/${w.slug}`}
                           className="text-xs text-[#4a5240] hover:underline"
                           target="_blank" rel="noopener noreferrer">
                          /{w.slug}
                        </a>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-400">
                          {countByWedding[w.id] ?? 0} invité{(countByWedding[w.id] ?? 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Actions plan */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPaidPlan ? (
                        <form action={setPlan}>
                          <input type="hidden" name="wedding_id" value={w.id} />
                          <input type="hidden" name="plan" value="" />
                          <button type="submit"
                            className="text-xs border border-stone-200 text-stone-400 px-3 py-1.5 rounded-lg hover:border-red-200 hover:text-red-400 transition cursor-pointer"
                            style={{ fontWeight: 400 }}>
                            Repasser en gratuit
                          </button>
                        </form>
                      ) : (
                        <form action={setPlan}>
                          <input type="hidden" name="wedding_id" value={w.id} />
                          <input type="hidden" name="plan" value="mariage" />
                          <button type="submit"
                            className="text-xs bg-[#4a5240] text-white px-3 py-1.5 rounded-lg hover:bg-[#2d3228] transition cursor-pointer"
                            style={{ fontWeight: 400 }}>
                            ✓ Activer plan Mariage
                          </button>
                        </form>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
