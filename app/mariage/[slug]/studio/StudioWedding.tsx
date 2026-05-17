'use client'

import StudioWizard from '@/app/_components/StudioWizard'

type Props = {
  slug: string
  weddingName: string
  weddingDate: string | null
  weddingLocation: string | null
  guestNames: string[]
  tableNames: string[]
}

export default function StudioWedding({ slug, weddingName, weddingDate, weddingLocation, guestNames, tableNames }: Props) {
  const names = weddingName.split(/\s*[&+]\s*/)
  const name1 = names[0]?.trim() ?? ''
  const name2 = names[1]?.trim() ?? ''

  return (
    <StudioWizard
      mode="wedding"
      slug={slug}
      initialInfo={{
        name1,
        name2,
        date: weddingDate ?? '',
        lieu: weddingLocation ?? '',
      }}
      initialGuests={guestNames}
      initialTables={tableNames.length > 0 ? tableNames : undefined}
    />
  )
}
