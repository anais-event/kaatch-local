import { cookies } from 'next/headers'
import GuestNav from './GuestNav'

export default async function InviteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const isPreview = !cookieStore.get(`guest_${slug}`)

  return (
    <>
      <GuestNav slug={slug} isPreview={isPreview} />
      <div className="pt-12">
        {children}
      </div>
    </>
  )
}
