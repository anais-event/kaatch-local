'use server'

import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import PostDetail from './PostDetail'

async function deleteReply(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const replyId = formData.get('replyId') as string
  const postId = formData.get('postId') as string
  await supabase.from('forum_replies').delete().eq('id', replyId).eq('user_id', user.id)
  revalidatePath(`/entre-nous/${postId}`)
}

async function editReply(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const replyId = formData.get('replyId') as string
  const postId = formData.get('postId') as string
  const content = (formData.get('content') as string).trim().slice(0, 2000)
  if (!content) return

  await supabase.from('forum_replies').update({ content }).eq('id', replyId).eq('user_id', user.id)
  revalidatePath(`/entre-nous/${postId}`)
}

async function addReply(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/entre-nous')

  const postId = formData.get('postId') as string
  const content = (formData.get('content') as string).trim().slice(0, 2000)
  if (!content) return

  const authorName = (user.user_metadata?.first_name as string) || user.email?.split('@')[0] || 'Anonyme'

  await supabase.from('forum_replies').insert({
    post_id: postId,
    user_id: user.id,
    author_name: authorName,
    content,
  })

  revalidatePath(`/entre-nous/${postId}`)
}

async function toggleLike(formData: FormData) {
  'use server'
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const postId = formData.get('postId') as string
  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('forum_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath(`/entre-nous/${postId}`)
}

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/entre-nous')

  const { data: post } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle()

  if (!post) notFound()

  const { data: replies } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  const { data: myLike } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <PostDetail
      post={post}
      replies={replies ?? []}
      isLiked={!!myLike}
      userId={user.id}
      addReply={addReply}
      editReply={editReply}
      deleteReply={deleteReply}
      toggleLike={toggleLike}
    />
  )
}
