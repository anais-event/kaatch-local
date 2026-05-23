import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Clock, Palette, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function ImaginerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.5rem' }} className="text-[#4a5240] mb-6">
          Imaginer
        </h1>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: 0, label: 'Moodboards' },
            { value: 0, label: 'Inspirations' },
            { value: 1, label: 'Palette définie' },
            { value: 0, label: 'Tenues validées' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-4">
              <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
              <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: À faire + Derniers mouvements */}
          <div className="lg:col-span-2 space-y-6">

            {/* À faire maintenant */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">À faire maintenant</h2>
                <Zap className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Finaliser la direction artistique', done: false },
                  { label: 'Valider la palette couleurs', done: false },
                  { label: 'Choisir les typographies', done: false },
                  { label: 'Approuver les tenues du couple', done: false },
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-[#4a5240] border-[#4a5240]' : 'border-stone-300'}`}>
                      {task.done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <p style={{ fontWeight: 400, fontSize: '0.95rem' }} className={task.done ? 'text-stone-400 line-through' : 'text-stone-700'}>{task.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Derniers mouvements */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800">Derniers mouvements</h2>
                <Clock className="w-5 h-5 text-[#4a5240]" strokeWidth={2} />
              </div>
              <div className="space-y-2.5">
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Direction artistique</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Palette couleurs validée</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Moodboard principal créé</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Typos choisies avec décorateur</li>
                  </ul>
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Préparation des tenues</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Dress code défini</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Tenues parents validées</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Accès rapides */}
          <div className="space-y-6">

            {/* Accès rapides */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6">
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }} className="text-stone-800 mb-4">Accès rapides</h2>
              <div className="space-y-2.5">
                {[
                  { label: 'Direction artistique', sub: 'Concept global', href: 'studio' },
                  { label: 'Moodboards', sub: 'Inspirations visuelles', href: 'studio' },
                  { label: 'Palette couleurs', sub: 'Charte chromatique', href: 'studio' },
                  { label: 'Typographies', sub: 'Polices & styles', href: 'studio' },
                  { label: 'Tenues', sub: 'Dress code & looks', href: 'studio' },
                  { label: 'Mood photos', sub: 'Référence photographe', href: 'studio' },
                ].map(link => (
                  <Link key={link.href} href={`/mariage/${slug}/${link.href}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-[#4a5240]/5 transition group">
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9rem' }} className="text-stone-700">{link.label}</p>
                      <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{link.sub}</p>
                    </div>
                    <span className="text-stone-300 text-lg group-hover:text-[#4a5240]">→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
