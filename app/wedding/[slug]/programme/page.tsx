import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import dynamic from 'next/dynamic'

const ProgrammeMap = dynamic(() => import('./ProgrammeMap'), { ssr: false })

const ICONS = ['💒', '🥂', '🍽️', '🎵', '🎂', '📸', '🚌', '🌸', '✨', '🎉']

async function addStep(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const slug = formData.get('slug') as string

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return

  const { data: last } = await supabase
    .from('program_steps')
    .select('position')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  await supabase.from('program_steps').insert({
    wedding_id: wedding.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    time: (formData.get('time') as string) || null,
    icon: (formData.get('icon') as string) || '✨',
    position: last ? last.position + 1 : 0,
  })

  revalidatePath(`/wedding/${slug}/programme`)
}

async function deleteStep(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.from('program_steps').delete().eq('id', formData.get('id') as string)
  revalidatePath(`/wedding/${formData.get('slug') as string}/programme`)
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: steps } = await supabase
    .from('program_steps')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <a href={`/wedding/${slug}`} className="text-sm text-[#4a5240] hover:underline"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            ← Retour au mariage
          </a>
        </div>

        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '2.5rem', fontStyle: 'italic' }}
            className="text-[#2d3228] mb-8">
          Programme de la journée
        </h1>

        {/* Carte */}
        {steps && steps.length > 0 && (
          <div className="mb-8 rounded-3xl overflow-hidden shadow-sm">
            <ProgrammeMap steps={steps} />
          </div>
        )}

        {/* Timeline */}
        {steps && steps.length > 0 && (
          <div className="mb-8 relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-stone-200" />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.id} className="flex gap-4 items-start">
                  {/* Pin numéroté */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#4a5240] text-white flex items-center justify-center text-sm font-semibold shadow z-10 relative">
                    {step.icon || i + 1}
                  </div>
                  {/* Contenu */}
                  <div className="flex-1 bg-white/80 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        {step.time && (
                          <p className="text-xs text-[#4a5240] mb-1"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.1em' }}>
                            🕐 {step.time}
                          </p>
                        )}
                        <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                            className="text-stone-800">{step.title}</h3>
                        {step.description && (
                          <p className="text-sm text-stone-500 mt-1"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>{step.description}</p>
                        )}
                        {step.address && (
                          <p className="text-xs text-stone-400 mt-1"
                             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                            📍 {step.address}
                          </p>
                        )}
                      </div>
                      <form action={deleteStep}>
                        <input type="hidden" name="id" value={step.id} />
                        <input type="hidden" name="slug" value={slug} />
                        <button type="submit" className="text-stone-300 hover:text-red-400 transition ml-2">✕</button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-sm">
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: '1.4rem', fontStyle: 'italic' }}
              className="text-[#4a5240] mb-4">Ajouter une étape</h2>
          <form action={addStep} className="space-y-3">
            <input type="hidden" name="slug" value={slug} />

            {/* Icône */}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-2"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>Icône</p>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((icon, i) => (
                  <label key={icon} className="cursor-pointer">
                    <input type="radio" name="icon" value={icon} className="peer sr-only" defaultChecked={i === 0} />
                    <span className="text-2xl peer-checked:ring-2 peer-checked:ring-[#4a5240] rounded-lg p-1 inline-block transition">
                      {icon}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="title" placeholder="Titre *" required
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
              <input type="text" name="time" placeholder="Heure (ex: 14h30)"
                className="border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            </div>
            <input type="text" name="address" placeholder="Adresse (pour la carte)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <textarea name="description" placeholder="Description (optionnelle)" rows={2}
              className="w-full border border-stone-200 rounded-xl px-4 py-2 bg-white outline-none focus:border-[#4a5240] transition text-stone-700 resize-none"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.9rem' }} />
            <button type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
              + Ajouter cette étape
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
