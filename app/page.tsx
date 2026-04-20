import KaatchChatLanding from './_components/KaatchChatLanding'

export default function Home() {
  const steps = [
    {
      n: '01',
      title: 'Un espace créé en deux minutes',
      desc: 'Les prénoms, la date, le lieu, une photo de couverture — et c\'est parti. Aucun paramétrage complexe, aucun manuel à lire.',
    },
    {
      n: '02',
      title: 'Un mariage configuré à sa mesure',
      sub: [
        { icon: '💌', label: 'Invités & faire-parts', detail: 'Liste, RSVP, faire-parts personnalisés à chaque prénom' },
        { icon: '🪑', label: 'Plan de table', detail: 'Glisse-dépose, récap imprimable, mise à jour instantanée' },
        { icon: '💰', label: 'Budget', detail: 'Devis, dépenses, prestataires — tout au même endroit' },
        { icon: '📅', label: 'Programme & Jour J', detail: 'Déroulé de la journée visible par les invités en temps réel' },
      ],
    },
    {
      n: '03',
      title: 'Chaque invité reçoit son lien personnel',
      desc: 'Chaque invité accède à un espace à son prénom — RSVP, programme, messagerie, album. Sans créer de compte. Sans appeler les mariés pour savoir où se garer.',
    },
    {
      n: '04',
      title: 'Le jour J, on lève les yeux',
      desc: 'Un QR code posé sur les tables, les invités déposent leurs photos, le programme est accessible depuis leur téléphone. Les mariés profitent.',
    },
    {
      n: '05',
      title: 'Après le mariage, tout reste',
      desc: 'Photos, messages, souvenirs — tout est centralisé, consultable, téléchargeable. Pour toujours.',
    },
  ]

  const avis = [
    {
      nom: 'Camille & Théo',
      date: 'Mariés en septembre 2024',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80&auto=format&fit=crop&crop=face',
      note: '★★★★★',
      texte: 'On avait 4 groupes WhatsApp différents avant de découvrir Kaatch. Le jour du mariage, mes invités avaient tout — le programme, le plan de table, le QR code photo.',
    },
    {
      nom: 'Laura & Maxime',
      date: 'Mariés en juin 2024',
      photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80&auto=format&fit=crop&crop=face',
      note: '★★★★★',
      texte: 'Le plan de table en glisse-dépose, les faire-parts personnalisés avec le prénom de chaque invité… C\'est tellement bien pensé. Et mes parents ont réussi à l\'utiliser sans que je leur explique — c\'est dire !',
    },
    {
      nom: 'Sophie & Julien',
      date: 'Mariés en mai 2025',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80&auto=format&fit=crop&crop=face',
      note: '★★★★★',
      texte: 'L\'album partagé, c\'est LA fonctionnalité. J\'ai récupéré 600 photos sans courir après personne. Mes invités ont joué le jeu parce que c\'était vraiment simple pour eux.',
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
            <a href="#avis" className="text-sm text-stone-500 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>
              Avis
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
        <div className="flex flex-col justify-center px-8 md:px-16 py-20 max-w-xl mx-auto md:mx-0 md:ml-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-6" style={{ fontWeight: 300 }}>
            Organisation de mariage
          </p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontStyle: 'italic', lineHeight: 1.15 }}
              className="text-[#2d3228] mb-6">
            Combien de groupes WhatsApp pour ce mariage ?
          </h1>
          <p className="text-stone-600 mb-8" style={{ fontSize: '1rem', lineHeight: 1.9 }}>
            Les infos éparpillées, les tableurs jamais à jour, les invités qui n'ont pas vu le message…
            <br />
            Kaatch regroupe tout — pour les mariés, et pour les invités.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/auth"
               className="inline-block bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm text-center"
               style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
              Créer son espace mariage →
            </a>
            <a href="https://app.supademo.com/video/cmo6zgf590l9037n2na9km76d" target="_blank" rel="noopener noreferrer"
               className="inline-block border border-stone-300 text-stone-500 px-8 py-3.5 rounded-xl hover:border-[#4a5240] hover:text-[#4a5240] transition text-sm text-center"
               style={{ fontWeight: 300 }}>
              ▶ Voir la démo
            </a>
          </div>
          <p className="mt-3 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#4a5240] transition">Invité(e) à un mariage ? →</a>
          </p>
          <p className="mt-8 text-xs text-stone-400" style={{ fontWeight: 300 }}>
            Aucune carte bleue demandée. L'espace est prêt en 2 minutes.
          </p>
        </div>

        <div className="hidden md:block relative">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(30,28,24,0.15)' }} />
          <div className="absolute bottom-12 left-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-5 py-4 max-w-[230px]">
            <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
               className="text-[#2d3228] mb-1">Emma & Luc 💍</p>
            <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-500">
              127 invités · 12 tables · 3 groupes WhatsApp de moins
            </p>
          </div>
        </div>
      </section>

      {/* ── VIDÉO DÉMO ── */}
      <section className="py-20 px-8 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>En action</p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontStyle: 'italic', lineHeight: 1.2 }}
              className="text-[#2d3228] mb-8">
            Kaatch en 2 minutes
          </h2>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-stone-200"
               style={{ paddingBottom: '56.25%' }}>
            <iframe
              src="https://app.supademo.com/embed/cmo6zgf590l9037n2na9km76d"
              className="absolute inset-0 w-full h-full"
              allow="fullscreen"
              style={{ border: 0 }}
            />
          </div>
          <a href="/auth" className="inline-block mt-8 bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300 }}>
            Créer son espace gratuitement →
          </a>
        </div>
      </section>

      {/* ── 3 BÉNÉFICES ── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Ce que ça change</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontStyle: 'italic', lineHeight: 1.2 }}
                className="text-[#2d3228] max-w-xl">
              Un mariage mérite une organisation aux petits oignons.
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
                    className="text-[#2d3228] mb-2">{item.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.85 }} className="text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment" className="py-24 px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="md:sticky md:top-24">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Comment ça marche</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic', lineHeight: 1.2 }}
                className="text-[#2d3228] mb-5">
              Simple comme bonjour.
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500">
              Aucune formation, aucun manuel. On commence et on comprend. Les invités aussi — sans même créer un compte.
            </p>
            <div className="mt-8">
              <a href="/auth"
                 className="inline-block bg-[#4a5240] text-white px-8 py-3.5 rounded-xl hover:bg-[#2d3228] transition text-sm"
                 style={{ fontWeight: 300 }}>
                Commencer →
              </a>
            </div>
          </div>

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
                      className="text-[#2d3228] mb-2">{step.title}</h3>
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

      {/* ── AVIS ── */}
      <section id="avis" className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Ils l'ont utilisé</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic' }}
                className="text-[#2d3228]">
              Ce qu'ils en disent.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {avis.map((a, i) => (
              <div key={i} className="bg-[#f5f0e8] rounded-2xl p-6 flex flex-col gap-4">
                {/* Étoiles */}
                <p className="text-amber-400 text-sm tracking-widest">{a.note}</p>
                {/* Texte */}
                <p style={{ fontSize: '0.9rem', lineHeight: 1.85, fontStyle: 'italic' }} className="text-stone-600 flex-1">
                  "{a.texte}"
                </p>
                {/* Auteur */}
                <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                  <img src={a.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: '1rem', fontStyle: 'italic' }}
                       className="text-[#2d3228]">{a.nom}</p>
                    <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-400">{a.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section id="offres" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-3" style={{ fontWeight: 300 }}>Offres</p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontStyle: 'italic' }}
                className="text-[#2d3228] mb-4">
              Aucune mauvaise surprise.
            </h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 max-w-lg">
              Nos formules arrivent bientôt. En attendant, tout est disponible sans engagement et sans carte bleue.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-sm">
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
      <section className="py-28 px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-[#4a5240] mb-4" style={{ fontWeight: 300 }}>Alors ?</p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, fontSize: 'clamp(2rem, 4vw, 3rem)', fontStyle: 'italic', lineHeight: 1.2 }}
              className="text-[#2d3228] mb-5">
            Un mariage mérite une organisation aux petits oignons.
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }} className="text-stone-500 mb-8">
            L'espace est prêt en deux minutes. Les invités n'ont pas besoin de créer un compte. Et quelques groupes WhatsApp de moins, ça ne fait pas de mal.
          </p>
          <a href="/auth"
             className="inline-block bg-[#4a5240] text-white px-12 py-4 rounded-xl hover:bg-[#2d3228] transition text-sm"
             style={{ fontWeight: 300, letterSpacing: '0.06em' }}>
            Créer mon espace mariage →
          </a>
          <p className="mt-5 text-sm text-stone-400" style={{ fontWeight: 300 }}>
            <a href="/rejoindre" className="hover:text-[#4a5240] transition">Tu es invité(e) ? Rejoindre un mariage →</a>
          </p>
        </div>
      </section>

      {/* ── CHATBOT ── */}
      <KaatchChatLanding />

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 py-10 px-8 bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.4rem', fontStyle: 'italic' }}
                className="text-stone-400">Kaatch</span>
          <div className="flex items-center gap-6">
            <a href="#comment" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Comment ça marche</a>
            <a href="#avis" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Avis</a>
            <a href="#offres" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Offres</a>
            <a href="/rejoindre" className="text-sm text-stone-400 hover:text-[#4a5240] transition" style={{ fontWeight: 300 }}>Espace invités</a>
          </div>
          <a href="/auth" className="text-sm text-[#4a5240] hover:underline" style={{ fontWeight: 300 }}>Connexion →</a>
        </div>
      </footer>
    </main>
  )
}
