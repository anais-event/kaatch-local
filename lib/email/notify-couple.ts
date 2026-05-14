import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaatch.fr'
const FROM = 'Kaatch <noreply@kaatch.fr>'

type NotifType = 'new_rsvp' | 'new_photo' | 'new_message' | 'new_guestbook' | 'order_shipped'

type CoupleNotifPayload = {
  to: string
  weddingName: string
  slug: string
  type: NotifType
  data?: Record<string, string>
}

const SUBJECTS: Record<NotifType, (d: Record<string, string>) => string> = {
  new_rsvp:       d => `${d.guestName ?? 'Un invité'} a répondu à votre invitation`,
  new_photo:      d => `${d.guestName ?? 'Un invité'} a partagé une photo`,
  new_message:    d => `Nouveau message de ${d.guestName ?? 'un invité'}`,
  new_guestbook:  d => `${d.guestName ?? 'Un invité'} a écrit dans le livre d'or`,
  order_shipped:  _ => `Votre commande de papeterie est en route ! 📦`,
}

function html(type: NotifType, weddingName: string, slug: string, data: Record<string, string> = {}) {
  const dashUrl = `${BASE_URL}/mariage/${slug}`

  const body: Record<NotifType, string> = {
    new_rsvp: `
      <p style="margin:0 0 12px;font-size:15px;color:#44403c;">
        <strong>${data.guestName ?? 'Un invité'}</strong> vient de répondre à votre invitation.<br/>
        Statut : <strong style="color:#4a5240;">${data.rsvpStatus ?? 'Confirmé'}</strong>
      </p>`,
    new_photo: `
      <p style="margin:0 0 12px;font-size:15px;color:#44403c;">
        <strong>${data.guestName ?? 'Un invité'}</strong> a ajouté une nouvelle photo à votre galerie.
      </p>`,
    new_message: `
      <p style="margin:0 0 12px;font-size:15px;color:#44403c;">
        <strong>${data.guestName ?? 'Un invité'}</strong> vous a envoyé un message :<br/>
        <em style="color:#78716c;">"${data.preview ?? ''}"</em>
      </p>`,
    new_guestbook: `
      <p style="margin:0 0 12px;font-size:15px;color:#44403c;">
        <strong>${data.guestName ?? 'Un invité'}</strong> a laissé un message dans le livre d'or :<br/>
        <em style="color:#78716c;">"${data.preview ?? ''}"</em>
      </p>`,
    order_shipped: `
      <p style="margin:0 0 12px;font-size:15px;color:#44403c;">
        Votre commande de papeterie pour <strong>${weddingName}</strong> a été expédiée.<br/>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="color:#4a5240;">Suivre votre colis →</a>` : ''}
      </p>`,
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr><td style="background:#4a5240;padding:6px 0;"></td></tr>
        <tr><td style="padding:32px 40px 24px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a8a29e;">Kaatch</p>
          <h1 style="margin:0 0 24px;font-size:22px;color:#2d3228;font-weight:400;">${weddingName}</h1>
          ${body[type]}
          <a href="${dashUrl}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#4a5240;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-family:sans-serif;">
            Voir mon espace →
          </a>
        </td></tr>
        <tr><td style="padding:16px 40px;border-top:1px solid #f5f0e8;">
          <p style="margin:0;font-size:11px;color:#a8a29e;font-family:sans-serif;">
            Pour modifier vos préférences de notifications : <a href="${dashUrl}/notifications" style="color:#4a5240;">paramètres</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function notifyCouple(payload: CoupleNotifPayload): Promise<void> {
  const d = payload.data ?? {}
  await resend.emails.send({
    from:    FROM,
    to:      payload.to,
    subject: SUBJECTS[payload.type](d),
    html:    html(payload.type, payload.weddingName, payload.slug, d),
  })
}
