import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'anais@kaatch.fr'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function updateCode(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return

  const id = formData.get('id') as string
  const code = (formData.get('code') as string).trim().toUpperCase()
  const maxUsesRaw = formData.get('max_uses') as string
  const maxUses = maxUsesRaw === '' || maxUsesRaw === '0' ? 9999 : (parseInt(maxUsesRaw) || 1)
  const expiresAtRaw = formData.get('expires_at') as string
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null

  await adminClient()
    .from('promo_codes')
    .update({ code, max_uses: maxUses, expires_at: expiresAt })
    .eq('id', id)

  redirect('/admin')
}

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) redirect('/auth')

  const { data: code } = await adminClient()
    .from('promo_codes')
    .select('id, code, max_uses, uses_count, active, expires_at')
    .eq('id', id)
    .single()

  if (!code) notFound()

  const expiresAtValue = code.expires_at
    ? new Date(code.expires_at).toISOString().split('T')[0]
    : ''

  const LATO = 'var(--font-lato)'
  const DISPLAY = 'var(--font-display)'

  return (
    <main className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: LATO, fontWeight: 300 }}>
      <div className="bg-[#2d3228] px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-1" style={{ fontWeight: 500 }}>
            Kaatch Admin
          </p>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.4rem' }} className="text-white">
            Modifier le code
          </h1>
        </div>
        <a href="/admin" className="text-white/50 text-xs hover:text-white transition" style={{ fontWeight: 300 }}>
          ← Retour
        </a>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1" style={{ fontWeight: 400 }}>Code actuel</p>
          <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.08em' }}
             className="text-[#2d3228] mb-6">
            {code.code}
            <span className="ml-3 text-xs text-stone-400" style={{ fontFamily: LATO, fontWeight: 300, letterSpacing: 0 }}>
              {code.uses_count} / {code.max_uses >= 9999 ? '∞' : code.max_uses} utilisations
            </span>
          </p>

          <form action={updateCode} className="flex flex-col gap-5">
            <input type="hidden" name="id" value={code.id} />

            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1.5" style={{ fontWeight: 400 }}>
                Code
              </label>
              <input type="text" name="code" defaultValue={code.code} required
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4a5240] transition uppercase"
                style={{ fontWeight: 300, letterSpacing: '0.05em' }} />
            </div>

            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1.5" style={{ fontWeight: 400 }}>
                Nb utilisations max <span className="normal-case">(vide = illimité)</span>
              </label>
              <input type="number" name="max_uses" min="0"
                defaultValue={code.max_uses >= 9999 ? '' : code.max_uses}
                placeholder="∞"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
            </div>

            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wide mb-1.5" style={{ fontWeight: 400 }}>
                Date limite <span className="normal-case">(optionnel)</span>
              </label>
              <input type="date" name="expires_at" defaultValue={expiresAtValue}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4a5240] transition"
                style={{ fontWeight: 300 }} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-[#4a5240] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#2d3228] transition cursor-pointer"
                style={{ fontWeight: 400 }}>
                Enregistrer
              </button>
              <a href="/admin"
                className="flex-1 text-center border border-stone-200 text-stone-400 px-5 py-2.5 rounded-xl text-sm hover:border-stone-300 hover:text-stone-600 transition"
                style={{ fontWeight: 300 }}>
                Annuler
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
