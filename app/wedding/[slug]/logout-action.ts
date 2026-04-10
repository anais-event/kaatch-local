'use server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function logoutMaried() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/auth')
}
