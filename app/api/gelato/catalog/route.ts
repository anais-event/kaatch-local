import { NextRequest, NextResponse } from 'next/server'

// Route temporaire de diagnostic — à supprimer après usage
export async function GET(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY manquante' }, { status: 500 })

  const search = req.nextUrl.searchParams.get('q') ?? ''

  const res = await fetch(
    `https://product.gelatoapis.com/v3/catalogs`,
    { headers: { 'X-API-KEY': apiKey } }
  )

  if (!res.ok) {
    const txt = await res.text()
    return NextResponse.json({ error: res.status, body: txt }, { status: res.status })
  }

  const data = await res.json()

  // Filter by search term if provided
  if (search) {
    const term = search.toLowerCase()
    if (Array.isArray(data.catalogs)) {
      data.catalogs = data.catalogs.filter((c: { catalogId?: string; title?: string }) =>
        (c.catalogId ?? '').toLowerCase().includes(term) ||
        (c.title ?? '').toLowerCase().includes(term)
      )
    }
  }

  return NextResponse.json(data)
}
