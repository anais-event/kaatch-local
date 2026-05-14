'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

type ModuleKey = 'collection' | 'destinataires' | 'univers' | 'reception'

export async function saveStudioModule(
  weddingId: string,
  slug: string,
  module: ModuleKey,
  data: unknown,
  progress: number
) {
  const supabase = await createSupabaseServerClient()

  const colData   = `module_${module}`
  const colProg   = `progress_${module}`

  const { error } = await supabase
    .from('studio_progress')
    .upsert(
      {
        wedding_id: weddingId,
        [colData]: data,
        [colProg]: Math.min(100, Math.max(0, progress)),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'wedding_id', ignoreDuplicates: false }
    )

  if (error) throw new Error(error.message)
  revalidatePath(`/mariage/${slug}/studio`)
}

export async function getStudioProgress(weddingId: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('studio_progress')
    .select('*')
    .eq('wedding_id', weddingId)
    .single()
  return data
}
