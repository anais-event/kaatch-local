import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import ChecklistClient from './ChecklistClient'

export default async function ChecklistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: wedding } = await supabase.from('weddings').select('id').eq('slug', slug).single()
  if (!wedding) return <div className="p-8">Mariage introuvable</div>

  const { data: tasks } = await supabase
    .from('day_tasks')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('position')
    .order('created_at')

  async function addTask(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const title = (formData.get('title') as string).trim()
    const assigned_to = (formData.get('assigned_to') as string).trim() || null
    const moment = formData.get('moment') as string
    if (!title) return
    await supabase.from('day_tasks').insert({ wedding_id: wedding.id, title, assigned_to, moment })
    revalidatePath(`/mariage/${slug}/checklist`)
  }

  async function toggleTask(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const id = formData.get('id') as string
    const done = formData.get('done') === 'true'
    await supabase.from('day_tasks').update({ done: !done }).eq('id', id)
    revalidatePath(`/mariage/${slug}/checklist`)
  }

  async function deleteTask(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const id = formData.get('id') as string
    await supabase.from('day_tasks').delete().eq('id', id)
    revalidatePath(`/mariage/${slug}/checklist`)
  }

  async function updateTask(formData: FormData) {
    'use server'
    const supabase = await createSupabaseServerClient()
    const id = formData.get('id') as string
    const title = (formData.get('title') as string).trim()
    const assigned_to = (formData.get('assigned_to') as string).trim() || null
    const moment = formData.get('moment') as string
    if (!title) return
    await supabase.from('day_tasks').update({ title, assigned_to, moment }).eq('id', id)
    revalidatePath(`/mariage/${slug}/checklist`)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)' }}>
      <ChecklistClient
        tasks={tasks ?? []}
        addTask={addTask}
        toggleTask={toggleTask}
        deleteTask={deleteTask}
        updateTask={updateTask}
      />
    </div>
  )
}
