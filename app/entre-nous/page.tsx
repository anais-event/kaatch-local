import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { NextIntlClientProvider } from 'next-intl'
import ForumFeed from './ForumFeed'
import type { ForumCategory } from './types'
import messages from '@/messages/fr.json'

async function createPost(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/entre-nous')

  const title = (formData.get('title') as string).trim().slice(0, 200)
  const content = (formData.get('content') as string).trim().slice(0, 2000)
  const category = formData.get('category') as ForumCategory

  if (!title || !content || !category) return

  const authorName = (user.user_metadata?.first_name as string) || user.email?.split('@')[0] || 'Anonyme'

  await supabase.from('forum_posts').insert({
    user_id: user.id,
    author_name: authorName,
    category,
    title,
    content,
  })

  revalidatePath('/entre-nous')
}

async function deletePost(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = formData.get('postId') as string
  await supabase.from('forum_posts').delete().eq('id', postId).eq('user_id', user.id)
  revalidatePath('/entre-nous')
}

async function editPost(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = formData.get('postId') as string
  const title = (formData.get('title') as string).trim().slice(0, 200)
  const content = (formData.get('content') as string).trim().slice(0, 2000)

  if (!title || !content) return

  await supabase.from('forum_posts').update({ title, content }).eq('id', postId).eq('user_id', user.id)
  revalidatePath('/entre-nous')
}

async function reportPost(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = formData.get('postId') as string
  await supabase.from('forum_reports').upsert({ post_id: postId, user_id: user.id })
  await supabase.from('forum_posts').update({ reported: true }).eq('id', postId)
  revalidatePath('/entre-nous')
}

export default async function EntreNousPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/entre-nous')

  const { data: posts } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('reported', false)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: myLikes } = await supabase
    .from('forum_likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set((myLikes ?? []).map(l => l.post_id))

  return (
    <NextIntlClientProvider locale="fr" messages={messages}>
    <ForumFeed
      posts={posts ?? []}
      likedPostIds={likedPostIds}
      userId={user.id}
      createPost={createPost}
      deletePost={deletePost}
      editPost={editPost}
      reportPost={reportPost}
    />
    </NextIntlClientProvider>
  )
}
