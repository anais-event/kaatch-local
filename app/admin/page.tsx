import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'anais@kaatch.fr'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function createCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const code = (formData.get('code') as string).trim().toUpperCase()
  const maxUses = parseInt(formData.get('max_uses') as string) || 1
  await adminClient().from('promo_codes').insert({ code, max_uses: maxUses, plan: 'mariage' })
  revalidatePath('/admin')
}

async function toggleCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  await adminClient().from('promo_codes').update({ active: !active }).eq('id', id)
  revalidatePath('/admin')
}

async function setPlan(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const weddingId = formData.get('wedding_id') as string
  const plan = formData.get('plan') as string | null
  await adminClient().from('weddings').update({ plan: plan || null }).eq('id', weddingId)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const { data: weddings } = await adminClient()
    .from('weddings')
    .select('id, slug, name, date, plan, couple_id, created_at')
    .order('created_at', { ascending: false })

  const weddingIds = (weddings ?? []).map(w => w.id)

  const { data: guestCounts } = weddingIds.length > 0
    ? await supabase.from('guests').select('wedding_id').in('wedding_id', weddingIds)
    : { data: [] }

  const countByWedding: Record<string, number> = {}
  for (const g of guestCounts ?? []) {
    countByWedding[g.wedding_id] = (countByWedding[g.wedding_id] ?? 0) + 1
  }

  const { data: promoCodes } = await adminClient()
    .from('promo_codes')
    .select('id, code, plan, max_uses, uses_count, active, created_at')
    .order('created_at', { ascending: false })

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

        {/* Codes avantage */}
        <div className="mt-10">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#2d3228] mb-5">Codes avantage</h2>

          {/* Créer un code */}
          <form action={createCode} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm mb-5 flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>
                Code
              </label>
              <input type="text" name="code" placeholder="KAATCH-BETA" required
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition uppercase"
                style={{ fontWeight: 300, letterSpacing: '0.05em' }} />
            </div>
            <div className="w-36">
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>
                Nb d'utilisations
              </label>
              <select name="max_uses"
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4a5240] transition bg-white"
                style={{ fontWeight: 300 }}>
                <option value="1">1 fois</option>
                <option value="5">5 fois</option>
                <option value="10">10 fois</option>
                <option value="50">50 fois</option>
                <option value="9999">Illimité (∞)</option>
              </select>
            </div>
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 400 }}>
              + Créer
            </button>
          </form>

          {/* Liste des codes */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {(promoCodes ?? []).length === 0 ? (
              <p className="px-6 py-8 text-center text-stone-400 text-sm">Aucun code créé pour l'instant.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {(promoCodes ?? []).map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                    <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.08em' }}
                       className={`flex-1 ${c.active ? 'text-[#2d3228]' : 'text-stone-300 line-through'}`}>
                      {c.code}
                    </p>
                    <span className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                      {c.uses_count} / {c.max_uses >= 9999 ? '∞' : c.max_uses} utilisations
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}
                          style={{ fontWeight: 500 }}>
                      {c.active ? 'Actif' : 'Désactivé'}
                    </span>
                    <form action={toggleCode}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={String(c.active)} />
                      <button type="submit"
                        className="text-xs border border-stone-200 text-stone-400 px-3 py-1 rounded-lg hover:border-stone-300 hover:text-stone-600 transition cursor-pointer"
                        style={{ fontWeight: 300 }}>
                        {c.active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
