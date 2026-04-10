import GuestNav from './GuestNav'

export default async function InviteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <>
      <GuestNav slug={slug} />
      <div className="pt-12">
        {children}
      </div>
    </>
  )
}
