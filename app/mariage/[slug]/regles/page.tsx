import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTranslations } from 'next-intl/server'
import { revalidatePath } from 'next/cache'

async function saveMessage(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const message = (formData.get('message') as string) || ''
  await supabase.from('weddings').update({ couple_message: message }).eq('slug', slug)
  revalidatePath(`/mariage/${slug}/regles`)
}

async function addRule(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string
  const text = formData.get('text') as string
  if (!text.trim()) return
  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return
  await supabase.from('wedding_rules').insert({ wedding_id: wedding.id, text: text.trim(), position: 0 })
  revalidatePath(`/mariage/${slug}/regles`)
}

async function deleteRule(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const id = formData.get('id') as string
  const slug = formData.get('slug') as string
  await supabase.from('wedding_rules').delete().eq('id', id)
  revalidatePath(`/mariage/${slug}/regles`)
}

const SUGGESTIONS_MESSAGE = [
  "Nous sommes tellement heureux de vous avoir à nos côtés pour ce jour si précieux. Merci d'être là !",
  "Ce jour n'aurait pas la même saveur sans vous. Préparez-vous à danser, rire et faire des souvenirs inoubliables !",
  "Avec tout notre amour, nous vous accueillons dans cette journée qui nous ressemble. Profitez de chaque instant !",
  "Vous êtes nos personnes préférées au monde — merci d'être présents pour vivre ce moment avec nous.",
]

const SUGGESTIONS_REGLES = [
  'Sans téléphone pendant la cérémonie',
  'Sans enfants',
  'Tenue de soirée exigée',
  'Parking disponible sur place',
  'Prévoir des chaussures confortables pour la soirée',
  'Photos bienvenues et encouragées !',
  'Régime végétarien disponible sur demande',
  'Covoiturage conseillé — pensez à vous organiser',
  'Ouvert de cœur et bonne humeur obligatoires',
]

export default async function ReglesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations('wedding.pages')
  const supabase = await createSupabaseServerClient()
  const { data: wedding } = await supabase.from('weddings').select('id, name, couple_message').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">{t('notFound')}</div>

  const { data: rules } = await supabase
    .from('wedding_rules')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto">
        <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline mb-6 block" style={{ fontWeight: 300 }}>
          ← Retour aux préparatifs
        </a>
        <h1 style={{ fontFamily: 'var(--font-lato)', fontWeight: 600, fontSize: '1.4rem' }}
            className="text-[#2d3228] mb-2">Le mot des mariés</h1>
        <p className="text-stone-400 text-sm mb-8" style={{ fontWeight: 300 }}>
          Un message personnel + des infos pratiques visibles par tous vos invités.
        </p>

        {/* Section : Petit mot libre */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.3rem' }}
              className="text-[#4a5240] mb-1">Votre message</h2>
          <p className="text-xs text-stone-400 mb-4" style={{ fontWeight: 300 }}>
            Ce texte apparaîtra en haut de la page d'accueil de vos invités.
          </p>
          <form action={saveMessage} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />
            <textarea name="message" rows={4}
              defaultValue={wedding.couple_message ?? ''}
              placeholder="Écrivez votre mot ici…"
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#4a5240] transition resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }} />
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTIONS_MESSAGE.map((s, i) => (
                <button key={i} type="button"
                  onClick={undefined}
                  data-suggestion={s}
                  className="suggestion-btn text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-400 hover:border-[#4a5240] hover:text-[#4a5240] transition bg-white text-left"
                  style={{ fontWeight: 300 }}>
                  « {s.slice(0, 40)}… »
                </button>
              ))}
            </div>
            <script dangerouslySetInnerHTML={{ __html: `
              document.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                  const ta = btn.closest('form').querySelector('textarea');
                  ta.value = btn.dataset.suggestion;
                  ta.focus();
                });
              });
            `}} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              Enregistrer le message
            </button>
          </form>
        </div>

        {/* Section : Infos pratiques / règles */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.3rem' }}
              className="text-[#4a5240] mb-1">Infos pratiques</h2>
          <p className="text-xs text-stone-400 mb-4" style={{ fontWeight: 300 }}>
            Courtes phrases pratiques affichées sous votre message.
          </p>

          {(rules ?? []).length > 0 && (
            <div className="divide-y divide-stone-50 mb-4 border border-stone-100 rounded-lg overflow-hidden">
              {(rules ?? []).map(rule => (
                <div key={rule.id} className="flex items-center justify-between px-4 py-3 gap-3 bg-[#f5f0e8]/40">
                  <p className="text-sm text-stone-700 flex-1" style={{ fontWeight: 300 }}>{rule.text}</p>
                  <form action={deleteRule}>
                    <input type="hidden" name="id" value={rule.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" className="text-xs text-stone-300 hover:text-red-400 transition cursor-pointer">
                      ×
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          <form action={addRule} className="flex gap-2 mb-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="text" name="text" placeholder="Ex: Tenue de soirée exigée…" required
              className="flex-1 border border-stone-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontWeight: 300 }} />
            <button type="submit"
              className="bg-[#4a5240] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d3228] transition cursor-pointer"
              style={{ fontWeight: 300 }}>
              + Ajouter
            </button>
          </form>

          <p className="text-xs text-stone-400 mb-2" style={{ fontWeight: 300 }}>Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS_REGLES.map(s => (
              <form key={s} action={addRule}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="text" value={s} />
                <button type="submit"
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:border-[#4a5240] hover:text-[#4a5240] transition bg-white cursor-pointer"
                  style={{ fontWeight: 300 }}>
                  {s}
                </button>
              </form>
            ))}
          </div>
        </div>

        {/* Aperçu */}
        {(wedding.couple_message || (rules ?? []).length > 0) && (
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-4" style={{ fontWeight: 300 }}>Aperçu côté invité</p>
            {wedding.couple_message && (
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.7 }}
                 className="text-stone-600 mb-4 whitespace-pre-wrap">{wedding.couple_message}</p>
            )}
            {(rules ?? []).length > 0 && (
              <ul className="space-y-1">
                {(rules ?? []).map(r => (
                  <li key={r.id} className="text-sm text-stone-500 flex items-start gap-2" style={{ fontWeight: 300 }}>
                    <span className="text-[#4a5240] mt-0.5">–</span> {r.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
