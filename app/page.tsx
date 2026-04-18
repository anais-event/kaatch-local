export default function Home() {
  // Système typographique uniforme :
  // Titres    → Cormorant italic, 600, une taille par section
  // Corps     → Lato, weight 300, 0.9rem, lineHeight 1.8
  // Labels    → Lato, weight 300, 0.7rem, tracking 0.2em, uppercase
  // Couleurs  → #2d3228 (texte foncé), #4a5240 (vert), stone-500 (texte secondaire)

  const steps = [
    {
      n: '01',
      title: 'Vous créez votre compte organisateur',
      desc: 'En deux minutes, votre espace mariage est ouvert. Vous renseignez vos prénoms, la date, le lieu et une photo de couverture.',
      tag: 'Gratuit pour commencer',
    },
    {
      n: '02',
      title: 'Vous configurez votre événement',
      sub: [
        { icon: '📋', label: 'Préparatifs', detail: 'Liste des invités, faire-parts personnalisés, plan de table, budget & prestataires' },
        { icon: '🎊', label: 'Jour J', detail: 'Programme de la journée, options d\'hébergement, accès invités' },
        { icon: '💬', label: 'Messagerie', detail: 'Un espace de discussion dédié pour tous vos invités' },
        { icon: '📸', label: 'Album partagé', detail: 'Chacun contribue, tout le monde télécharge' },
      ],
    },
    {
      n: '03',
      title: 'Vos invités reçoivent leur lien',
      desc: 'Chaque invité accède à un espace à son nom : RSVP, programme, messagerie, album. Ils voient uniquement ce que vous choisissez de partager.',
      note: 'Pour les oublieux ou le jour J, un QR code imprimable permet à chacun de rejoindre l\'album facilement 😉',
    },
    {
      n: '04',
      title: 'L\'album se construit tout seul',
      desc: 'Vos invités déposent leurs photos depuis leur espace. Vous récupérez tout au même endroit, sans relancer personne.',
    },
    {
      n: '05',
      title: 'Vous êtes présents — vraiment',
      desc: 'Les informations sont centralisées. Les invités sont autonomes. Vous avez la tête à votre mariage.',
    },
  ]

  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <a href="/" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.5rem', fontStyle: 'italic' }}
             className="text-[#2d3228]">
            Kaatch
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#comment" className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              Comment ça marche
            </a>
            <a href="#offres" className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              Offres
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/auth" className="text-sm text-stone-500 hover:text-[#4a5240] transition hidden sm:block" style={{ fontWeight: 300 }}>
              Connexion
            </a>
            <a href="/auth"
               className="text-sm bg-[#4a5240] text-white px-5 py-2.5 rounded-xl hover:bg-[#2d3228] transition"
               style={{ fontWeight: 300 }}>
              Commencer
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO — layout 2 colonnes, pas de problème de contraste ── */}
      <section className="pt-16 min-h-screen grid md:grid-cols-2">

        {/* Colonne texte */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-20 max-w-xl mx-auto md:mx-0 md:ml-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-6" style={{ fontWeight: 300 }}>
            Organisation de mariage
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontStyle: 'italic', lineHeight: 1.15 }}
              className="text-[#2d3228] mb-6">
            Combien de groupes WhatsApp avez-vous créés pour ce mariage ?
          </h1>
          <p className="text-stone-600 mb-8" style={{ fontSize: '1rem', lineHeight: 1.85 }}>
            Les infos éparpillées, les tableurs qui ne sont jamais à jour, les invités qui n'ont pas vu le message…
            Kaatch regroupe tout en un seul endroit — pour vous, et pour eux.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/auth"
               className="inline-block bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm text-center"
               style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
              Créer mon espace mariage →
            </a>
            <a href="/rejoindre"
               className="inline-block border border-stone-300 text-stone-500 px-8 py-3.5 rounded-xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm text-center"
               style={{ fontWeight: 300 }}>
              Je suis invité(e)
            </a>
          </div>
        </div>

        {/* Colonne photo — fond foncé avec image */}
        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(30,28,24,0.18)' }} />
        </div>
      </section>

      {/* ── 3 BÉNÉFICES ── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Ce que Kaatch change</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic' }}
                className="text-[#2d3228]">
              Moins de logistique. Plus de présence.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                photo: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80&auto=format&fit=crop',
                title: 'Invitations sans prise de tête',
                desc: 'Chaque invité reçoit un faire-part à son prénom avec un lien unique. Il confirme sa présence en un clic. Vous voyez les réponses en temps réel.',
              },
              {
                photo: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80&auto=format&fit=crop',
                title: 'Plan de table toujours à jour',
                desc: "Vous créez vos tables, vous placez vos invités. Le récap est instantané. Modifiez jusqu'au dernier moment, sans refaire un tableur.",
              },
              {
                photo: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80&auto=format&fit=crop',
                title: 'Un album que tout le monde alimente',
                desc: "Vos invités déposent leurs photos directement depuis leur espace. Vous récupérez tout au même endroit, sans courir après personne.",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="rounded-2xl overflow-hidden h-52 mb-5">
                  <img src={item.photo} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.35rem', fontStyle: 'italic' }}
                    className="text-[#2d3228] mb-2">
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment" className="py-24 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">

          {/* Sticky intro */}
          <div className="md:sticky md:top-24">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Comment ça marche</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic', lineHeight: 1.2 }}
                className="text-[#2d3228] mb-5">
              De la création de compte à la dernière photo — cinq étapes.
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">
              Pas de formation. Pas de manuel. Vous commencez, vous comprenez.
            </p>
            <div className="mt-8">
              <a href="/auth"
                 className="inline-block bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
                 style={{ fontWeight: 300 }}>
                Commencer gratuitement →
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#4a5240] flex items-center justify-center shrink-0">
                    <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem', color: 'white' }}>{step.n}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-2 min-h-[2rem]" />}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                        className="text-[#2d3228]">
                      {step.title}
                    </h3>
                    {'tag' in step && step.tag && (
                      <span className="text-xs bg-[#4a5240]/10 text-[#4a5240] px-2 py-0.5 rounded-full mt-0.5"
                            style={{ fontWeight: 300, fontSize: '0.7rem' }}>
                        {step.tag}
                      </span>
                    )}
                  </div>

                  {'desc' in step && step.desc && (
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 mb-3">{step.desc}</p>
                  )}

                  {'sub' in step && step.sub && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {step.sub.map((s) => (
                        <div key={s.label} className="flex items-start gap-3 bg-[#f5f0e8] rounded-xl px-4 py-3">
                          <span className="text-base mt-0.5">{s.icon}</span>
                          <div>
                            <p style={{ fontWeight: 400, fontSize: '0.85rem' }} className="text-[#2d3228] mb-0.5">{s.label}</p>
                            <p style={{ fontWeight: 300, fontSize: '0.78rem', lineHeight: 1.6 }} className="text-stone-400">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {'note' in step && step.note && (
                    <div className="mt-3 flex items-start gap-2">
                      <span className="text-sm">💡</span>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.7, fontStyle: 'italic' }} className="text-stone-400">
                        {step.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRES (placeholder) ── */}
      <section id="offres" className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Offres</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic' }}
                className="text-[#2d3228] mb-3">
              Commencez gratuitement
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">
              Les détails de nos formules arrivent bientôt. En attendant, tout est accessible gratuitement.
            </p>
          </div>
          <a href="/auth"
             className="inline-block bg-[#4a5240] text-white px-10 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300 }}>
            Créer mon compte →
          </a>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4" style={{ fontWeight: 300 }}>
            Prêt ?
          </p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', fontStyle: 'italic', lineHeight: 1.2 }}
              className="text-[#2d3228] mb-5">
            Votre mariage mérite d'être bien organisé.
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 mb-8">
            Gratuit pour commencer. Votre espace est prêt en deux minutes.
          </p>
          <a href="/auth"
             className="inline-block bg-[#4a5240] text-white px-12 py-4 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
            Créer mon espace mariage →
          </a>
          <p className="mt-5 text-sm text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#4a5240] transition">
              Vous êtes invité(e) ? Rejoindre un mariage →
            </a>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.4rem', fontStyle: 'italic' }}
                className="text-stone-400">
            Kaatch
          </span>
          <div className="flex items-center gap-6">
            <a href="#comment" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Comment ça marche</a>
            <a href="#offres" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Offres</a>
            <a href="/rejoindre" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Espace invités</a>
          </div>
          <a href="/auth" className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>
            Connexion →
          </a>
        </div>
      </footer>
    </main>
  )
}
