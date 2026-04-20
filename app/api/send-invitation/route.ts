import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

function emailHtml({
  guestFirstName,
  coupleName,
  weddingDate,
  weddingLocation,
  coupleMessage,
  inviteLink,
  coverImageUrl,
}: {
  guestFirstName: string
  coupleName: string
  weddingDate: string | null
  weddingLocation: string | null
  coupleMessage: string | null
  inviteLink: string
  coverImageUrl: string | null
}) {
  const dateStr = weddingDate
    ? new Date(weddingDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vous êtes invité(e) 💌</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2d3228;letter-spacing:2px;">Kaatch</p>
        </td></tr>

        <!-- Photo de couverture -->
        ${coverImageUrl ? `
        <tr><td style="border-radius:16px 16px 0 0;overflow:hidden;">
          <img src="${coverImageUrl}" width="560" style="display:block;width:100%;max-height:260px;object-fit:cover;border-radius:16px 16px 0 0;" alt="${coupleName}"/>
        </td></tr>` : ''}

        <!-- Carte principale -->
        <tr><td style="background:#ffffff;border-radius:${coverImageUrl ? '0 0 16px 16px' : '16px'};padding:40px 40px 36px;text-align:center;">

          <!-- Ligne décorative -->
          <div style="width:40px;height:2px;background:#4a5240;margin:0 auto 28px;"></div>

          <!-- Bonjour -->
          <p style="margin:0 0 8px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#a8a29e;">
            Cher(e) ${guestFirstName},
          </p>

          <!-- Titre -->
          <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-style:italic;font-weight:normal;font-size:32px;color:#2d3228;line-height:1.2;">
            Vous êtes invité(e)<br/>à notre mariage 💍
          </h1>

          <!-- Couple -->
          <p style="margin:0 0 6px;font-family:Georgia,serif;font-style:italic;font-size:22px;color:#4a5240;">
            ${coupleName}
          </p>

          ${dateStr ? `<p style="margin:0 0 4px;font-family:Arial,sans-serif;font-weight:300;font-size:14px;color:#78716c;text-transform:capitalize;">${dateStr}</p>` : ''}
          ${weddingLocation ? `<p style="margin:0 0 0;font-family:Arial,sans-serif;font-weight:300;font-size:13px;color:#a8a29e;">📍 ${weddingLocation}</p>` : ''}

          <div style="width:40px;height:1px;background:#e7e5e4;margin:28px auto;"></div>

          <!-- Message des mariés -->
          ${coupleMessage ? `
          <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-weight:300;font-size:14px;color:#57534e;line-height:1.7;font-style:italic;">
            "${coupleMessage}"
          </p>` : `
          <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-weight:300;font-size:14px;color:#57534e;line-height:1.7;">
            Nous sommes tellement heureux de vous compter parmi nos invités.<br/>
            Votre présence à nos côtés rendra ce jour encore plus inoubliable. 🌸
          </p>`}

          <!-- CTA -->
          <a href="${inviteLink}" style="display:inline-block;background:#4a5240;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:300;font-size:14px;letter-spacing:1px;padding:16px 36px;border-radius:50px;">
            Voir mon invitation →
          </a>

          <p style="margin:20px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#d6d3d1;">
            Programme, plan de table, album photos… tout est là pour vous.
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding:28px 0 0;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#a8a29e;font-weight:300;">
            Envoyé avec ♥ via <span style="font-family:Georgia,serif;font-style:italic;">Kaatch</span>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: Request) {
  const { weddingId, slug, guestIds, mode } = await req.json()
  // mode: 'email' | 'whatsapp-text' (pour générer le texte WA)

  const supabase = await createSupabaseServerClient()

  // Vérifier que c'est bien le couple propriétaire
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, name, date, location, couple_message, cover_image_url, couple_id')
    .eq('id', weddingId)
    .single()

  if (!wedding || wedding.couple_id !== user.id)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  // Récupérer les invités
  const { data: guests } = await supabase
    .from('guests')
    .select('id, first_name, last_name, email, invite_token')
    .in('id', guestIds)
    .eq('wedding_id', weddingId)

  if (!guests?.length) return NextResponse.json({ error: 'Aucun invité' }, { status: 400 })

  // Générer les tokens manquants
  const toUpdate = guests.filter(g => !g.invite_token)
  for (const g of toUpdate) {
    const token = generateToken()
    await supabase.from('guests').update({ invite_token: token }).eq('id', g.id)
    g.invite_token = token
  }

  if (mode === 'whatsapp-text') {
    // Retourner juste le texte WhatsApp pour un invité
    const g = guests[0]
    const token = g.invite_token!
    const link = `${BASE_URL}/i/${token}`
    const dateStr = wedding.date
      ? new Date(wedding.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : ''
    const salutation = g.first_name
    const text = `💌 *${wedding.name}*\n\nChèr(e) ${salutation},\n\nIl y a des jours qui marquent une vie à jamais… et nous avons la joie immense de vous compter parmi les personnes qui partageront le nôtre. 🌿✨\n\nNous vous invitons à célébrer notre mariage${dateStr ? ` le *${dateStr}*` : ''}${wedding.location ? `, dans l'écrin de *${wedding.location}*` : ''}.\n\nVotre présence sera, pour nous, le plus beau des cadeaux. 🥂\n\nVotre espace personnel (RSVP, programme, plan de table…) vous attend ici :\n👉 ${link}\n\nAvec tout notre amour,\n_${wedding.name}_ 💍`
    return NextResponse.json({ text })
  }

  // Envoi email
  const results = { sent: 0, skipped: 0, errors: [] as string[] }

  for (const guest of guests) {
    if (!guest.email) { results.skipped++; continue }

    const token = guest.invite_token!
    const inviteLink = `${BASE_URL}/i/${token}`

    try {
      await resend.emails.send({
        from: `${wedding.name} via Kaatch <invitations@kaatch.fr>`,
        to: guest.email,
        subject: `💌 ${guest.first_name}, vous êtes invité(e) à notre mariage`,
        html: emailHtml({
          guestFirstName: guest.first_name,
          coupleName: wedding.name,
          weddingDate: wedding.date,
          weddingLocation: wedding.location,
          coupleMessage: wedding.couple_message,
          inviteLink,
          coverImageUrl: wedding.cover_image_url,
        }),
      })

      await supabase.from('guests').update({ invite_sent_at: new Date().toISOString() }).eq('id', guest.id)
      results.sent++
    } catch (e: unknown) {
      results.errors.push(guest.email)
    }
  }

  return NextResponse.json(results)
}
