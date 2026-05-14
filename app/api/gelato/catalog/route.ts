import { NextRequest, NextResponse } from 'next/server'

// Route temporaire de diagnostic — à supprimer après usage
export async function GET(req: NextRequest) {
  const apiKey = process.env.GELATO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GELATO_API_KEY manquante' }, { status: 500 })

  const catalogUid = req.nextUrl.searchParams.get('catalog') ?? ''
  const search = req.nextUrl.searchParams.get('q') ?? ''

  // If catalogUid provided, fetch products in that catalog
  const url = catalogUid
    ? `https://product.gelatoapis.com/v3/catalogs/${catalogUid}/products`
    : `https://product.gelatoapis.com/v3/catalogs`

  const res = await fetch(url, { headers: { 'X-API-KEY': apiKey } })

  if (!res.ok) {
    const txt = await res.text()
    return NextResponse.json({ error: res.status, body: txt }, { status: res.status })
  }

  const data = await res.json()

  // Filter by search term
  if (search) {
    const term = search.toLowerCase()
    const arr = data.products ?? data.data ?? []
    const filtered = arr.filter((p: Record<string, string>) =>
      Object.values(p).some(v => String(v).toLowerCase().includes(term))
    )
    return NextResponse.json({ filtered, total: filtered.length })
  }

  return NextResponse.json(data)
}
