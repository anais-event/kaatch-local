import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Clock, CheckCircle2, ListChecks, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function PreparerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('*').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [
    { count: programSteps },
    { count: guestCount },
    { data: daysUntil },
  ] = await Promise.all([
    supabase.from('program_steps').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', wedding.id),
    supabase.from('program_steps').select('created_at').eq('wedding_id', wedding.id).limit(1),
  ])

  const daysRemaining = wedding.date
    ? Math.ceil((new Date(wedding.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '2.5rem' }} className="text-[#4a5240] mb-6">
          Préparer
        </h1>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: daysRemaining ?? 0, label: 'Jours restants', href: null },
            { value: programSteps ?? 0, label: 'Étapes programme', href: 'programme' },
            { value: guestCount ?? 0, label: 'Invités à gérer', href: null },
            { value: 0, label: 'Checklist complétée', href: null },
          ].map(s => (
            s.href ? (
              <Link key={s.label} href={`/mariage/${slug}/${s.href}`}
                className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition group">
                <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
                <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
              </Link>
            ) : (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-4">
                <p style={{ fontWeight: 600, fontSize: '1.75rem', lineHeight: 1 }} className="text-[#4a5240] mb-1">{s.value}</p>
                <p style={{ fontWeight: 400, fontSize: '0.75rem' }} className="text-stone-500">{s.label}</p>
              </div>
            )
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
                  { label: 'Finaliser le rétro-planning', done: false },
                  { label: 'Créer le programme du jour J', done: false },
                  { label: 'Confirmer les hébergements', done: false },
                  { label: 'Valider la playlist avec DJ', done: false },
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
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Planning</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Rétro-planning créé hier</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• 3 étapes du programme confirmées</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Chauffeur réservé pour le jour J</li>
                  </ul>
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.8rem' }} className="text-stone-500 mb-2">Logistique</p>
                  <ul className="space-y-2">
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Hôtel confirmé (20 chambres)</li>
                    <li style={{ fontWeight: 400, fontSize: '0.9rem' }} className="text-stone-700">• Playlist initiale créée</li>
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
                  { label: 'Rétro-planning', sub: 'Avant le jour J', href: 'retro-planning' },
                  { label: 'Programme', sub: 'Déroulé jour J', href: 'programme' },
                  { label: 'Checklist', sub: 'Qui fait quoi', href: 'retro-planning' },
                  { label: 'Hébergements', sub: 'Logements invités', href: 'hebergements' },
                  { label: 'Playlist', sub: 'Musique par moment', href: 'musique' },
                  { label: 'Documents', sub: 'Ressources & fichiers', href: 'studio' },
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
