import { createSupabaseServerClient } from '@/lib/supabase-server'
import { TASK_LABEL_MAP, PERIOD_COLORS } from './retro-planning/tasks'

interface Props {
  slug: string
  weddingId: string
}

function formatRelative(dateStr: string): { label: string; urgent: boolean; overdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}j de retard`, urgent: true, overdue: true }
  if (diff === 0) return { label: "Aujourd'hui", urgent: true, overdue: false }
  if (diff === 1) return { label: 'Demain', urgent: true, overdue: false }
  if (diff <= 7) return { label: `Dans ${diff}j`, urgent: true, overdue: false }
  if (diff <= 30) return { label: `Dans ${diff}j`, urgent: false, overdue: false }
  const d2 = new Date(dateStr + 'T00:00:00')
  return {
    label: d2.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    urgent: false,
    overdue: false,
  }
}

export default async function EcheancesWidget({ slug, weddingId }: Props) {
  const supabase = await createSupabaseServerClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + 60)
  const todayStr = today.toISOString().slice(0, 10)
  const horizonStr = horizon.toISOString().slice(0, 10)

  const [{ data: predefined }, { data: custom }] = await Promise.all([
    supabase
      .from('retro_planning')
      .select('task_key, deadline, done, assigned_to')
      .eq('wedding_id', weddingId)
      .eq('done', false)
      .not('deadline', 'is', null)
      .lte('deadline', horizonStr),
    supabase
      .from('retro_custom_tasks')
      .select('id, title, deadline, done, period_id')
      .eq('wedding_id', weddingId)
      .eq('done', false)
      .not('deadline', 'is', null)
      .lte('deadline', horizonStr),
  ])

  type Item = {
    key: string
    label: string
    deadline: string
    periodId: string
    assigned_to?: string | null
    href: string
  }

  const items: Item[] = []

  for (const row of predefined ?? []) {
    const meta = TASK_LABEL_MAP[row.task_key]
    if (!meta) continue
    items.push({
      key: row.task_key,
      label: meta.label,
      deadline: row.deadline,
      periodId: meta.periodId,
      assigned_to: row.assigned_to,
      href: `/mariage/${slug}/retro-planning`,
    })
  }

  for (const row of custom ?? []) {
    items.push({
      key: `custom-${row.id}`,
      label: row.title,
      deadline: row.deadline,
      periodId: row.period_id,
      href: `/mariage/${slug}/retro-planning`,
    })
  }

  items.sort((a, b) => a.deadline.localeCompare(b.deadline))

  if (items.length === 0) {
    return (
      <a href={`/mariage/${slug}/retro-planning`}
         className="flex items-center gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 hover:border-[#4a5240]/30 hover:shadow transition-all mb-6">
        <span style={{ fontSize: '1.1rem' }}>📅</span>
        <div className="flex-1">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.05rem' }} className="text-[#4a5240]">
            Prochaines échéances
          </p>
          <p style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-400 mt-0.5">
            Ajoutez des dates dans le rétro-planning pour les voir ici
          </p>
        </div>
        <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300">→</span>
      </a>
    )
  }

  const overdue = items.filter(i => i.deadline < todayStr)
  const upcoming = items.filter(i => i.deadline >= todayStr)

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-6 overflow-hidden">
      <a href={`/mariage/${slug}/retro-planning`}
         className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50/50 transition border-b border-stone-50">
        <span style={{ fontSize: '1.1rem' }}>📅</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.1rem' }} className="text-[#4a5240] flex-1">
          Prochaines échéances
        </span>
        {overdue.length > 0 && (
          <span className="bg-red-50 text-red-500 rounded-full px-2 py-0.5" style={{ fontWeight: 300, fontSize: '0.65rem' }}>
            {overdue.length} en retard
          </span>
        )}
        <span style={{ fontWeight: 300, fontSize: '0.75rem' }} className="text-stone-300">→</span>
      </a>

      <ul className="divide-y divide-stone-50">
        {items.slice(0, 6).map(item => {
          const rel = formatRelative(item.deadline)
          const color = PERIOD_COLORS[item.periodId] ?? '#9ca3af'
          return (
            <li key={item.key} className="flex items-center gap-3 px-5 py-3">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span
                style={{ fontWeight: 300, fontSize: '0.82rem' }}
                className="flex-1 text-stone-600 leading-snug line-clamp-1">
                {item.label}
              </span>
              {item.assigned_to && (
                <span style={{ fontWeight: 300, fontSize: '0.65rem' }} className="text-stone-300 shrink-0">
                  {item.assigned_to}
                </span>
              )}
              <span
                style={{ fontWeight: 300, fontSize: '0.72rem' }}
                className={`shrink-0 ${rel.overdue ? 'text-red-400' : rel.urgent ? 'text-amber-500' : 'text-stone-400'}`}>
                {rel.label}
              </span>
            </li>
          )
        })}
        {items.length > 6 && (
          <li className="px-5 py-2.5">
            <a href={`/mariage/${slug}/retro-planning`}
               style={{ fontWeight: 300, fontSize: '0.75rem' }}
               className="text-[#4a5240]/70 hover:text-[#4a5240] transition">
              + {items.length - 6} autre{items.length - 6 > 1 ? 's' : ''} échéance{items.length - 6 > 1 ? 's' : ''} →
            </a>
          </li>
        )}
      </ul>
    </div>
  )
}
