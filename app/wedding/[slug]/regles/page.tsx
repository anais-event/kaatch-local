import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function addRule(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const text = formData.get('text') as string
  if (!text.trim()) return
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  const { data: existing } = await supabase.from('wedding_rules').select('id').eq('wedding_id', wedding.id).order('position', { ascending: false }).limit(1).single()
  const position = existing ? 1 : 0
  await supabase.from('wedding_rules').insert({ wedding_id: wedding.id, text: text.trim(), position })
  revalidatePath(`/wedding/${slug}/regles`)
}

async function deleteRule(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('wedding_rules').delete().eq('id', id)
  revalidatePath(`/wedding/${slug}/regles`)
}

const SUGGESTIONS = [
  'Sans téléphone pendant la cérémonie',
  'Sans enfants',
  'Tenue de soirée exigée',
  'Parking disponible sur place',
  'Prévoir des chaussures confortables pour la soirée',
  'Photos bienvenues et encouragées !',
  'Régime végétarien disponible sur demande',
]

export default async function ReglesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: rules } = await supabase
    .from('wedding_rules')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto">
        <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-6 block" style={{ fontWeight: 300 }}>
          ← Retour
        </a>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-2">Règles du mariage</h1>
        <p className="text-stone-400 text-sm mb-8" style={{ fontWeight: 300 }}>
          Informations pratiques et règles affichées aux invités.
        </p>

        {/* Règles existantes */}
        {(rules ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-stone-100 divide-y divide-stone-50 mb-6">
            {(rules ?? []).map(rule => (
              <div key={rule.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <p className="text-sm text-stone-700 flex-1" style={{ fontWeight: 300 }}>
                  {rule.text}
                </p>
                <form action={deleteRule}>
                  <input type="hidden" name="id" value={rule.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button type="submit" className="text-xs text-stone-300 hover:text-red-400 transition">
                    Supprimer
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Ajouter */}
        <div className="bg-white rounded-xl border border-stone-100 p-5 mb-6">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.2rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Ajouter une règle</h2>
          <form action={addRule} className="flex gap-2 mb-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="text" placeholder="Ex: Tenue de soirée exigée…" required
              className="flex-1 border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontWeight: 300 }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d3228] transition"
              style={{ fontWeight: 300 }}>
              + Ajouter
            </button>
          </form>
          <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <form key={s} action={addRule}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="text" value={s} />
                <button type="submit"
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition bg-white"
                  style={{ fontWeight: 300 }}>
                  {s}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
