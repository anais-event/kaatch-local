export default function Home() {
  const steps = [
    {
      n: '01',
      title: 'Tu crées ton espace en deux minutes',
      desc: 'Tes prénoms, la date, le lieu, une photo de couverture — et c\'est parti. Pas de paramétrage complexe, pas de manuel à lire.',
    },
    {
      n: '02',
      title: 'Tu configures ton mariage',
      sub: [
        { icon: '💌', label: 'Invités & faire-parts', detail: 'Liste, RSVP, faire-parts personnalisés à chaque prénom' },
        { icon: '🪑', label: 'Plan de table', detail: 'Glisse-dépose, récap imprimable, mise à jour instantanée' },
        { icon: '💰', label: 'Budget', detail: 'Devis, dépenses, prestataires — tout au même endroit' },
        { icon: '📅', label: 'Programme & Jour J', detail: 'Déroulé de la journée visible par tes invités en temps réel' },
      ],
    },
    {
      n: '03',
      title: 'Tes invités reçoivent leur lien personnel',
      desc: 'Chaque invité accède à un espace à son prénom — RSVP, programme, messagerie, album. Sans créer de compte. Sans t\'appeler pour savoir où se garer.',
    },
    {
      n: '04',
      title: 'Le jour J, tu lèves les yeux',
      desc: 'Un QR code posé sur les tables, tes invités déposent leurs photos, le programme est accessible depuis leur téléphone. Toi, tu profites.',
    },
    {
      n: '05',
      title: 'Après le mariage, tu gardes tout',
      desc: 'Photos, messages, souvenirs — tout est centralisé, consultable, téléchargeable. Pour toujours.',
    },
  ]

  return (
    <main className="bg-[#f5f0e8]" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, color: '#2d3228' }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
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
              Créer mon espace
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-16 min-h-screen grid md:grid-cols-2">

        {/* Texte */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-20 max-w-xl mx-auto md:mx-0 md:ml-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-6" style={{ fontWeight: 300 }}>
            Organisation de mariage
          </p>

          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontStyle: 'italic', lineHeight: 1.15 }}
              className="text-[#2d3228] mb-6">
            Combien de groupes WhatsApp tu as créés pour ce mariage ?
          </h1>

          <p className="text-stone-600 mb-8" style={{ fontSize: '1rem', lineHeight: 1.9 }}>
            Les infos éparpillées, les tableurs jamais à jour, les invités qui n'ont pas vu le message…
            <br />
            Kaatch regroupe tout — pour toi, et pour eux.
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

          {/* Petite social proof discrète */}
          <p className="mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Aucune carte bleue demandée. Ton espace est prêt en 2 minutes.
          </p>
        </div>

        {/* Photo */}
        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(30,28,24,0.15)' }} />

          {/* Petite carte flottante — preuve de concept */}
          <div className="absolute bottom-12 left-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-5 py-4 max-w-[220px]">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
               className="text-[#2d3228] mb-1">Emma & Luc 💍</p>
            <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-500">
              127 invités · 12 tables · 3 groupes WhatsApp de moins
            </p>
          </div>
        </div>
      </section>

      {/* ── 3 BÉNÉFICES ── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Ce que ça change</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontStyle: 'italic', lineHeight: 1.2 }}
                className="text-[#2d3228] max-w-xl">
              Ton mariage mérite une organisation aux petits oignons.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                photo: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80&auto=format&fit=crop',
                title: 'Des invitations qui font leur effet',
                desc: 'Chaque invité reçoit un faire-part avec son prénom et un lien unique. Il confirme sa présence en un clic. Tu vois les réponses en temps réel, sans relancer personne.',
              },
              {
                photo: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80&auto=format&fit=crop',
                title: 'Un plan de table sans prise de tête',
                desc: "Tu glisses tes invités sur leurs tables, tu ajustes jusqu'au dernier moment. Le récap est prêt à imprimer. Fini le tableur partagé que personne n'arrive à modifier.",
              },
              {
                photo: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80&auto=format&fit=crop',
                title: 'Un album qui se remplit tout seul',
                desc: "Tes invités déposent leurs photos depuis leur téléphone. Toi tu récupères tout au même endroit, sans courir après les AirDrops et les Google Drive partagés.",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="rounded-2xl overflow-hidden h-52 mb-5">
                  <img src={item.photo} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.35rem', fontStyle: 'italic' }}
                    className="text-[#2d3228] mb-2">
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.85 }} className="text-stone-500">
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
              Simple comme bonjour.
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">
              Pas de formation, pas de manuel. Tu commences et tu comprends. Tes invités aussi — ils n'ont même pas besoin de créer un compte.
            </p>
            <div className="mt-8">
              <a href="/auth"
                 className="inline-block bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
                 style={{ fontWeight: 300 }}>
                C'est parti →
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
                  <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.2rem' }}
                      className="text-[#2d3228] mb-2">
                    {step.title}
                  </h3>

                  {'desc' in step && step.desc && (
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">{step.desc}</p>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section id="offres" className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Offres</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic' }}
                className="text-[#2d3228] mb-4">
              Aucune mauvaise surprise.
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 max-w-lg">
              Nos formules arrivent bientôt. En attendant, tout est disponible sans engagement et sans te demander ta carte bleue.
            </p>
          </div>

          {/* Carte unique placeholder */}
          <div className="bg-[#f5f0e8] rounded-2xl border border-stone-200 p-8 max-w-sm">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1.4rem', fontStyle: 'italic' }}
               className="text-[#2d3228] mb-2">Accès complet</p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.8 }} className="text-stone-500 mb-6">
              Invités, plan de table, budget, programme, photos, messagerie — tout, maintenant.
            </p>
            <a href="/auth"
               className="inline-block bg-[#4a5240] text-white px-8 py-3 rounded-xl hover:bg-[#2d3228] transition text-sm w-full text-center"
               style={{ fontWeight: 300 }}>
              Créer mon espace →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4" style={{ fontWeight: 300 }}>
            Alors ?
          </p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', fontStyle: 'italic', lineHeight: 1.2 }}
              className="text-[#2d3228] mb-5">
            Ton mariage mérite une organisation aux petits oignons.
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 mb-8">
            Ton espace est prêt en deux minutes. Tes invités n'ont pas besoin de créer un compte. Et toi, tu pourras enfin fermer quelques groupes WhatsApp.
          </p>
          <a href="/auth"
             className="inline-block bg-[#4a5240] text-white px-12 py-4 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
            Créer mon espace mariage →
          </a>
          <p className="mt-5 text-sm text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#4a5240] transition">
              Tu es invité(e) ? Rejoindre un mariage →
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
