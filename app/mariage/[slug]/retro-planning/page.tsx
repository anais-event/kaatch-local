import { createSupabaseServerClient } from '@/lib/supabase-server'
import RetroPlanningClient from './RetroPlanningClient'
import { PERIODS } from './tasks'

export default async function RetroPlanningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id, name').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const [{ data: doneRows }, { data: customRows }] = await Promise.all([
    supabase.from('retro_planning').select('task_key, done, deadline, assigned_to').eq('wedding_id', wedding.id),
    supabase.from('retro_custom_tasks').select('*').eq('wedding_id', wedding.id).order('created_at'),
  ])

  const rowMap = new Map((doneRows ?? []).map(r => [r.task_key, r]))

  const initialPeriods = PERIODS.map(p => ({
    ...p,
    tasks: p.tasks.map(t => {
      const row = rowMap.get(t.key)
      return {
        ...t,
        done: row?.done ?? false,
        deadline: row?.deadline ?? null,
        assigned_to: row?.assigned_to ?? null,
      }
    }),
  }))

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <a href={`/mariage/${slug}`} className="text-sm text-[#4a5240] hover:underline inline-block"
           style={{ fontWeight: 300 }}>
          ← Retour aux préparatifs
        </a>
      </div>
      <RetroPlanningClient
        weddingId={wedding.id}
        initialPeriods={initialPeriods}
        initialCustomTasks={(customRows ?? []).map(r => ({
          id: r.id,
          period_id: r.period_id,
          title: r.title,
          assigned_to: r.assigned_to ?? null,
          done: r.done,
          deadline: r.deadline ?? null,
        }))}
      />
    </div>
  )

}
