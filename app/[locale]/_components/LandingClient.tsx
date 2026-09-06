'use client'

import { useEffect } from 'react'
import PublicNav from '../../_components/PublicNav'
import ContactForm from '../../_components/ContactForm'
import FeaturesTrack from '../../_components/FeaturesTrack'
import TopBanner from '../../_components/TopBanner'

const SAGE_DARK = '#2d3228'
const SAGE      = '#4a5240'
const CREAM     = '#f5f0e8'
const CREAM_MID = '#ece6db'
const WHITE     = '#fffdf9'
const TEXT_MID  = '#5a5549'
const TEXT_SOFT = '#847d73'
const SAGE_MUTED = '#5e6654'

const faqItems = [
  {
    q: "Mes invités doivent créer un compte ?",
    a: "Non, jamais. Chaque invité reçoit un lien unique. Un clic et il accède à tout — sans mot de passe, sans inscription, sans application à télécharger.",
  },
  {
    q: "Et les prestataires ?",
    a: "Vous leur donnez un accès en lecture seule. Le traiteur voit les régimes alimentaires à jour, le photographe a le programme — et personne ne vous appelle à 23h pour \"juste une petite info\".",
  },
  {
    q: "On peut garder un faire-part papier ?",
    a: "Évidemment. Le lien Kaatch ou le QR code se glisse sur n'importe quel support — papier, e-mail, WhatsApp, pigeon voyageur. Le digital complète le papier, il ne le remplace pas.",
  },
  {
    q: "Nos données et nos photos sont en sécurité ?",
    a: "Tout est chiffré et hébergé en Europe. On ne revend rien, on ne partage rien. Vous restez propriétaires de tout ce que vous publiez.",
  },
  {
    q: "Et après le mariage ?",
    a: "Votre espace reste actif. Les photos, le livre d'or, la playlist — tout est téléchargeable quand vous voulez, même 5 ans après pour une bonne crise de nostalgie.",
  },
  {
    q: "C'est compliqué à mettre en place ?",
    a: "Vous créez votre espace en 2 minutes. Vous ajoutez vos invités. Vous envoyez les liens. C'est tout. Si vous savez envoyer un message, vous savez utiliser Kaatch.",
  },
  {
    q: "Kaatch fonctionne sur téléphone ?",
    a: "Oui, entièrement. L'espace mariés comme l'espace invités sont conçus mobile-first. Aucune application à télécharger — tout fonctionne depuis le navigateur.",
  },
]

export default function LandingClient() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.landing .reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main className="landing" style={{ background: CREAM, color: SAGE_DARK, overflowX: 'hidden' }}>

      {/* ── BANDEAU COMPTEUR ── */}
      <TopBanner />

      {/* ── NAV ── */}
      <PublicNav />

      {/* ══════════════════════════════════════════════
          HERO — fond cream, aligné à gauche
      ══════════════════════════════════════════════ */}
      <header aria-label="Kaatch — organisation de mariage"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(9rem,12vw,11rem) 2.5rem 4rem', maxWidth: '68rem', margin: '0 auto' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.03em', color: SAGE, background: 'rgba(74,82,64,0.08)', padding: '0.35rem 0.9rem', borderRadius: 100, width: 'fit-content', marginBottom: '2rem', animation: 'fadeIn 0.5s ease both 0.1s' }}>
          Accès offert pour les 100 premiers couples
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.6rem, 5.8vw, 4.8rem)', lineHeight: 1.08, color: SAGE_DARK, marginBottom: '1.8rem', maxWidth: '44rem', animation: 'fadeUp 0.6s ease both 0.15s', letterSpacing: '-0.02em' }}>
          Toute l&apos;organisation de votre mariage au même endroit.
        </h1>

        <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, color: TEXT_MID, maxWidth: '38rem', marginBottom: '1rem', animation: 'fadeUp 0.6s ease both 0.3s' }}>
          Préparer un mariage, c&apos;est pas de l&apos;impro. C&apos;est 1000 décisions,
          20 prestataires, des dizaines d&apos;invités, un peu de stress
          et beaucoup d&apos;argent. On a peur d&apos;oublier quelque chose,
          il faut penser à chaque détail, et l&apos;on peut vite se sentir dépassé.
        </p>
        <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, color: TEXT_MID, maxWidth: '38rem', marginBottom: '2.5rem', animation: 'fadeUp 0.6s ease both 0.4s' }}>
          Kaatch centralise tout — c&apos;est un peu comme ranger sa chambre.
          Une fois qu&apos;on y voit plus clair, l&apos;esprit s&apos;apaise, la fête approche,
          et vous pouvez vous reconcentrer sur l&apos;essentiel&nbsp;: vous.
        </p>

        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease both 0.55s' }}>
          <a href="/auth"
             className="inline-flex items-center text-sm font-medium text-white bg-[#4a5240] hover:bg-[#2d3228] py-3.5 px-7 rounded-lg transition-all hover:-translate-y-px"
             style={{ fontWeight: 500 }}>
            Créer mon espace mariage
          </a>
          <a href="/p/rejoindre"
             className="text-sm text-[#5a5549] border-b border-black/10 hover:text-[#4a5240] hover:border-[#4a5240] pb-0.5 transition-all"
             style={{ fontWeight: 400 }}>
            Invité(e) à un mariage&nbsp;?
          </a>
        </div>

        <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: TEXT_SOFT, animation: 'fadeIn 0.5s ease both 0.8s' }}>
          Gratuit pour les 100 premiers couples.
          Ensuite&nbsp;: un seul paiement, pas d&apos;abonnement, pas de frais cachés.
        </p>
      </header>

      {/* ══════════════════════════════════════════════
          CONVERSATIONS — fond white
      ══════════════════════════════════════════════ */}
      <section aria-label="Les problèmes que Kaatch résout" style={{ padding: '5rem 2.5rem', background: WHITE }}>
        <div style={{ maxWidth: '62rem', margin: '0 auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', color: SAGE_DARK, textAlign: 'center', marginBottom: '0.6rem', lineHeight: 1.15 }}>
            Et pour gérer tout ça, on fait comment&nbsp;?
          </h2>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: TEXT_MID, textAlign: 'center', marginBottom: '3rem' }}>
            Encore un groupe WhatsApp&nbsp;? Un Drive&nbsp;? Un tableur&nbsp;? Ou alors...
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Côté invités */}
            <div style={{ background: CREAM, borderRadius: 18, padding: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: SAGE_MUTED, marginBottom: '1rem', textAlign: 'center' }}>
                Côté invités
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { s: 'l', t: '"C\'est quoi le programme demain ?"' },
                  { s: 'l', t: '"Vous pouvez m\'envoyer les photos ?"' },
                  { s: 'r', t: '"Regarde dans le groupe WhatsApp"' },
                  { s: 'l', t: '"Lequel ? Y en a 4"' },
                  { s: 'sys', t: 'Jean-Pierre a quitté le groupe' },
                  { s: 'l', t: '"... mamie a encore envoyé un GIF de chat"' },
                ].map((b, i) => (
                  <div key={i} className="reveal" style={{
                    padding: b.s === 'sys' ? '0.2rem 0' : '0.7rem 1rem',
                    borderRadius: b.s === 'sys' ? 0 : 16,
                    borderBottomLeftRadius:  b.s === 'l' ? 4 : undefined,
                    borderBottomRightRadius: b.s === 'r' ? 4 : undefined,
                    background: b.s === 'l' ? WHITE : b.s === 'r' ? SAGE : 'none',
                    color: b.s === 'r' ? WHITE : b.s === 'sys' ? TEXT_SOFT : SAGE_DARK,
                    fontSize: b.s === 'sys' ? '0.68rem' : '0.82rem',
                    lineHeight: 1.45, maxWidth: '85%',
                    alignSelf: b.s === 'l' ? 'flex-start' : b.s === 'r' ? 'flex-end' : 'center',
                  }}>
                    {b.t}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: TEXT_SOFT }}>
                On exagère à peine.
              </p>
            </div>

            {/* Côté prestataires */}
            <div style={{ background: CREAM, borderRadius: 18, padding: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: SAGE_MUTED, marginBottom: '1rem', textAlign: 'center' }}>
                Côté prestataires
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { s: 'l', t: '"Combien de végétariens finalement ?"' },
                  { s: 'r', t: '"Attends je vérifie... 6. Non 8. Non attends."' },
                  { s: 'l', t: '"Et les sans gluten ?"' },
                  { s: 'r', t: '"Je te renvoie le tableur ce soir"' },
                  { s: 'l', t: '"Celui de la semaine dernière était pas à jour"' },
                  { s: 'r', t: '"..."' },
                ].map((b, i) => (
                  <div key={i} className="reveal" style={{
                    padding: '0.7rem 1rem', borderRadius: 16,
                    borderBottomLeftRadius:  b.s === 'l' ? 4 : undefined,
                    borderBottomRightRadius: b.s === 'r' ? 4 : undefined,
                    background: b.s === 'l' ? WHITE : SAGE,
                    color: b.s === 'r' ? WHITE : SAGE_DARK,
                    fontSize: '0.82rem', lineHeight: 1.45, maxWidth: '85%',
                    alignSelf: b.s === 'l' ? 'flex-start' : 'flex-end',
                  }}>
                    {b.t}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.72rem', color: TEXT_SOFT }}>
                Spoiler&nbsp;: le tableur n&apos;a jamais été renvoyé.
              </p>
            </div>

          </div>

          <p className="reveal" style={{ marginTop: '3rem', textAlign: 'center', fontSize: '1.15rem', fontWeight: 600, color: SAGE_DARK, lineHeight: 1.45, maxWidth: '34rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Kaatch, c&apos;est la fin de ce bazar. Chacun accède à ce dont il a besoin,
            au même endroit, sans rien demander à personne.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TROIS PORTES — fond cream
      ══════════════════════════════════════════════ */}
      <section aria-label="Un mariage, trois portes d'entrée" style={{ padding: '5rem 2.5rem', background: CREAM }}>
        <div style={{ maxWidth: '62rem', margin: '0 auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', color: SAGE_DARK, textAlign: 'center', marginBottom: '0.6rem', lineHeight: 1.15 }}>
            Un mariage, trois portes d&apos;entrée.
          </h2>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: TEXT_MID, textAlign: 'center', marginBottom: '3.5rem', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}>
            Les mariés profitent de leur journée. Les invités ont tout sous la main.
            Les prestataires bossent sans vous déranger.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', alignItems: 'center' }}>

            {/* Centre */}
            <div className="reveal" style={{ background: SAGE, borderRadius: '50%', width: '10rem', height: '10rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 40px rgba(74,82,64,0.2)', justifySelf: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: WHITE, marginBottom: '0.2rem', lineHeight: 1 }}>K</span>
              <h3 style={{ fontWeight: 600, fontSize: '0.88rem', color: WHITE, textAlign: 'center', margin: 0 }}>
                Les mariés
              </h3>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: '0.2rem' }}>
                Organisent et profitent
              </p>
            </div>

            {[
              {
                label: 'Espace mariés',
                title: 'Le cockpit — simple et complet',
                items: ["Invitations animées et RSVP en direct", "Budget, prestataires, devis", "Programme du jour éditable", "Galerie photos avec modération", "Livre d'or, playlist, messagerie"],
              },
              {
                label: 'Espace invités',
                title: 'Tout ce qu\'il faut, sans rien demander',
                items: ["Faire-part personnel et RSVP en un clic", "Programme, contacts, hébergements", "Album photo partagé par QR code", "Livre d'or, messagerie entre invités", "Suggestions musicales par moment"],
              },
              {
                label: 'Espace prestataires',
                title: 'Les infos utiles, toujours à jour',
                items: ["Plan de table avec régimes alimentaires", "Nombre exact de couverts, en temps réel", "Programme et timing de la journée", "Export des données pour le traiteur", "Accès en lecture — sans interférer"],
              },
            ].map(card => (
              <div key={card.label} className="reveal hover:-translate-y-1 transition-transform duration-200" style={{ background: WHITE, borderRadius: 14, padding: '1.2rem 1.4rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <span style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: SAGE, background: 'rgba(74,82,64,0.08)', padding: '0.2rem 0.6rem', borderRadius: 3, marginBottom: '0.6rem' }}>
                  {card.label}
                </span>
                <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {card.title}
                </h4>
                <ul style={{ listStyle: 'none' }}>
                  {card.items.map(item => (
                    <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, paddingLeft: '0.7rem', position: 'relative', marginBottom: '0.3rem' }}>
                      <span style={{ position: 'absolute', left: 0, top: '0.45rem', width: 3, height: 3, borderRadius: '50%', background: SAGE_MUTED, display: 'block' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — fond white, scroll horizontal + flèches
      ══════════════════════════════════════════════ */}
      <section id="fonctionnalites" aria-label="Fonctionnalités de Kaatch" style={{ padding: '5rem 0', background: WHITE }}>
        <div style={{ padding: '0 2.5rem', marginBottom: '2.5rem', maxWidth: '68rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', color: SAGE_DARK, marginBottom: '0.6rem', lineHeight: 1.15 }}>
            Tout ce que vous allez enfin arrêter de chercher.
          </h2>
          <p style={{ fontSize: '0.92rem', fontWeight: 300, color: TEXT_MID, maxWidth: '34rem' }}>
            Chacune de ces fonctionnalités résout un problème que vous connaissez déjà
            — ou que vous découvrirez dans 3 mois.
          </p>
        </div>

        <FeaturesTrack />
      </section>

      {/* ══════════════════════════════════════════════
          TEASER — fond sage-dark
      ══════════════════════════════════════════════ */}
      <section aria-label="Ce qui vous attend encore" style={{ padding: '5rem 2.5rem', background: SAGE_DARK, color: CREAM, textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: CREAM, marginBottom: '1.2rem', lineHeight: 1.15 }}>
          Ce n&apos;est pas tout. Loin de là.
        </h2>
        <p style={{ fontSize: '0.92rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', maxWidth: '34rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Derrière votre espace mariage, il y a tout un monde de petites attentions
          que vos invités vont adorer — et que vous ne trouverez nulle part ailleurs.
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', maxWidth: '50rem', marginLeft: 'auto', marginRight: 'auto' }}>
          {[
            { label: "Livre d'or",          blur: false },
            { label: "Playlist par moment", blur: false },
            { label: "Messagerie de groupe",blur: false },
            { label: "Idées surprises",     blur: true  },
            { label: "Jeux et animations",  blur: true  },
            { label: "Contacts utiles",     blur: false },
            { label: "Hébergements",        blur: false },
            { label: "Et d'autres choses encore", blur: true },
          ].map(pill => (
            <span key={pill.label} style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', fontWeight: 400, color: 'rgba(245,240,232,0.8)', background: 'rgba(245,240,232,0.08)', border: '1px solid rgba(245,240,232,0.1)', padding: '0.45rem 1rem', borderRadius: 100 }}>
              <span style={pill.blur ? { filter: 'blur(4px)', userSelect: 'none' } : {}}>
                {pill.label}
              </span>
            </span>
          ))}
        </div>

        <div style={{ width: '3rem', height: 1, background: 'rgba(245,240,232,0.15)', margin: '2rem auto' }} />

        <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'rgba(245,240,232,0.5)', maxWidth: '30rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Et demain&nbsp;? Un studio créatif pour concevoir toute votre papeterie assortie,
          des suggestions de cadeaux, des mises en scène de tables...
          Et Kaatch s&apos;adaptera aussi aux baptêmes et aux événements d&apos;entreprise.
        </p>

        <a href="/auth"
           className="inline-flex items-center text-sm font-semibold text-[#2d3228] bg-[#f5f0e8] hover:bg-[#fffdf9] py-3.5 px-7 rounded-lg transition-colors">
          Découvrir tout ce qui vous attend
        </a>
        <p style={{ marginTop: '1.2rem', fontSize: '0.7rem', color: 'rgba(245,240,232,0.35)' }}>
          Créez votre espace en 2 minutes pour voir l&apos;intérieur.
        </p>
      </section>

      {/* ══════════════════════════════════════════════
          POURQUOI KAATCH — fond sage-dark
          Instrument Serif UNIQUEMENT pour les h3
      ══════════════════════════════════════════════ */}
      <section aria-label="Pourquoi Kaatch" style={{ padding: '5rem 2.5rem', background: SAGE_DARK, color: CREAM }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.6rem', color: CREAM, marginBottom: '0.5rem', lineHeight: 1.15 }}>
            Pourquoi &quot;Kaatch&quot;&nbsp;?
          </h2>
          <p className="why-serif" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'rgba(245,240,232,0.7)', marginBottom: '2.5rem', lineHeight: 1.3 }}>
            Good catch. Catch up.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="reveal" style={{ background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.08)', borderRadius: 14, padding: '2rem', textAlign: 'left' }}>
              <h3 className="why-serif" style={{ fontSize: '1.5rem', color: CREAM, marginBottom: '0.5rem' }}>
                Good catch.
              </h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', lineHeight: 1.6 }}>
                La bonne personne. Celle qu&apos;on ne laisse pas partir.
              </p>
            </div>
            <div className="reveal" style={{ background: 'rgba(245,240,232,0.06)', border: '1px solid rgba(245,240,232,0.08)', borderRadius: 14, padding: '2rem', textAlign: 'left' }}>
              <h3 className="why-serif" style={{ fontSize: '1.5rem', color: CREAM, marginBottom: '0.5rem' }}>
                Catch up.
              </h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', lineHeight: 1.6 }}>
                Se retrouver. Enfin tous au même endroit.
              </p>
            </div>
          </div>

          <p className="reveal" style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(245,240,232,0.7)', lineHeight: 1.75, maxWidth: '36rem', margin: '0 auto' }}>
            Un mariage, c&apos;est exactement ça. Le moment où tout le monde
            se retrouve pour célébrer votre <em>good catch</em>.
            Maintenant, on vous aide à <em>catch up</em>{' '}
            avec tous vos invités, chaque détail, chaque souvenir — sans rien oublier.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING — fond white
      ══════════════════════════════════════════════ */}
      <section id="tarifs" aria-label="Tarifs Kaatch" style={{ padding: '5rem 2.5rem', background: WHITE }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)', color: SAGE_DARK, marginBottom: '0.6rem', lineHeight: 1.15 }}>
            En ce moment, c&apos;est offert.
          </h2>
          <p style={{ fontSize: '0.92rem', fontWeight: 300, color: TEXT_MID, marginBottom: '2.5rem', maxWidth: '36rem', lineHeight: 1.7 }}>
            Kaatch est en lancement. Les 100 premiers couples accèdent à tout,
            gratuitement, sans limite de temps. En échange, votre avis pour améliorer Kaatch.
            C&apos;est tout. Pas de piège.
          </p>

          {/* Offre lancement */}
          <div className="reveal" style={{ background: SAGE, borderRadius: 16, padding: '2.5rem', color: CREAM, marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-4rem', right: '-4rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.12)', padding: '0.3rem 0.8rem', borderRadius: 4, marginBottom: '1rem' }}>
              Offre de lancement
            </span>
            <h3 style={{ fontWeight: 700, fontSize: '1.5rem', color: CREAM, marginBottom: '0.6rem', lineHeight: 1.25 }}>
              Accès complet offert pour les 100 premiers couples.
            </h3>
            <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.75)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '28rem' }}>
              Invités illimités, toutes les fonctionnalités, aucune restriction.
            </p>
            <a href="/auth"
               className="inline-flex items-center text-sm font-semibold text-[#2d3228] bg-[#f5f0e8] hover:bg-[#fffdf9] py-3.5 px-7 rounded-lg transition-colors">
              Réserver ma place
            </a>
            <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)' }}>
              Il reste quelques places — premier arrivé, premier servi.
            </p>
          </div>

          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_SOFT, marginBottom: '1.2rem' }}>
            Ensuite, voici comment les offres seront articulées
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'Essentiel', price: '0 €', sub: 'Pour tester, sans engagement', items: ["30 invités, 20 photos", "Faire-part digital et RSVP", "Programme du jour"] },
              { name: 'Mariage',   price: '45 €', sub: 'Paiement unique', items: ["Invités illimités, 200 photos", "Faire-part animé, plan de table", "Budget, livre d'or, export"] },
              { name: 'Studio',    price: '99 €', sub: 'Bientôt disponible', items: ["Tout le plan Mariage", "Papeterie assortie sur-mesure", "Templates exclusifs, support VIP"] },
            ].map(plan => (
              <div key={plan.name} style={{ background: CREAM, borderRadius: 12, padding: '1.4rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.92rem', color: SAGE_DARK, marginBottom: '0.2rem' }}>
                  {plan.name}
                </h4>
                <p style={{ fontWeight: 700, fontSize: '1.4rem', color: SAGE_DARK }}>{plan.price}</p>
                <p style={{ fontSize: '0.68rem', color: TEXT_SOFT, marginBottom: '0.8rem' }}>{plan.sub}</p>
                <ul style={{ listStyle: 'none' }}>
                  {plan.items.map(item => (
                    <li key={item} style={{ fontSize: '0.76rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.4, marginBottom: '0.3rem' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ — fond cream, blocs TOUJOURS ouverts
      ══════════════════════════════════════════════ */}
      <section id="faq" aria-label="Questions fréquentes" style={{ padding: '5rem 2.5rem', background: CREAM }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.6rem', color: SAGE_DARK, marginBottom: '2.5rem', lineHeight: 1.15 }}>
            On répond avant que vous demandiez.
          </h2>

          {faqItems.map((item, i) => (
            <div key={i} className="reveal" style={{ padding: '1.3rem 0', borderBottom: `1px solid ${CREAM_MID}` }}>
              <h3 style={{ fontWeight: 500, fontSize: '0.95rem', color: SAGE_DARK, marginBottom: '0.5rem' }}>
                {item.q}
              </h3>
              <p style={{ fontSize: '0.86rem', fontWeight: 300, color: TEXT_MID, lineHeight: 1.7 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA FINAL — fond sage-dark
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 2.5rem', textAlign: 'center', background: SAGE_DARK, color: CREAM }}>
        <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', marginBottom: '0.8rem', color: CREAM, lineHeight: 1.15 }}>
          Prêts à tout centraliser&nbsp;?
        </h2>
        <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'rgba(245,240,232,0.6)', marginBottom: '2rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Créez votre espace en 2 minutes. C&apos;est gratuit pour les 100 premiers couples,
          et on est là si vous avez des questions.
        </p>
        <a href="/auth"
           className="inline-flex items-center text-sm font-semibold text-[#2d3228] bg-[#f5f0e8] hover:bg-[#fffdf9] py-3.5 px-7 rounded-lg transition-colors">
          Créer mon espace mariage
        </a>
      </section>

      {/* ══════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: '4rem 2.5rem', background: CREAM, borderTop: `1px solid ${CREAM_MID}` }}>
        <div style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_SOFT, marginBottom: '1rem' }}>
            Contact
          </p>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: SAGE_DARK, marginBottom: '0.5rem', lineHeight: 1.15 }}>
            Une question&nbsp;? Une idée&nbsp;?
          </h2>
          <p style={{ fontSize: '0.88rem', fontWeight: 300, color: TEXT_MID, marginBottom: '2rem', lineHeight: 1.7 }}>
            On vous répond dans la journée.
          </p>
          <div style={{ background: WHITE, borderRadius: 16, padding: '2rem' }}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.72rem', color: TEXT_SOFT, background: CREAM, borderTop: `1px solid ${CREAM_MID}` }}>
        <span>Kaatch — fait à Paris, avec des vrais humains dedans.</span>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Fonctionnalités', href: '#fonctionnalites' },
            { label: 'Tarifs', href: '#tarifs' },
            { label: 'Questions', href: '#faq' },
            { label: 'Mentions légales', href: '/mentions-legales' },
            { label: 'Confidentialité', href: '/politique-de-confidentialite' },
            { label: 'Contact', href: '#contact' },
            { label: 'Instagram', href: 'https://instagram.com/kaatch.fr' },
          ].map(l => (
            <a key={l.href} href={l.href}
               className="text-[#847d73] hover:text-[#4a5240] transition-colors">
              {l.label}
            </a>
          ))}
          <a href="/blog" target="_blank" rel="noopener noreferrer"
             className="text-[#847d73] hover:text-[#4a5240] transition-colors">
            Blog&nbsp;↗
          </a>
        </div>
      </footer>

    </main>
  )
}
