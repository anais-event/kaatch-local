export default function DesignPreview() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-center mb-2">Vert Olive — Choix de typographie</h1>
      <p className="text-center text-gray-500 mb-10">Option A = Serif élégant · Option B = Calligraphie + Serif</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">

        {/* Option A : Cormorant Garamond — Serif luxueux */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          <div className="relative h-56 bg-[#4a5240] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4a5240]/20 to-[#2d3228]/90" />
            <div className="relative p-8 text-white w-full">
              <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-3"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                31 août 2028
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2rem', lineHeight: 1.2 }}>
                Mariage de<br/>
                <span style={{ fontWeight: 600, fontStyle: 'normal', fontSize: '2.4rem' }}>Sophie & Julien</span>
              </h2>
            </div>
          </div>
          <div className="bg-[#f5f0e8] px-6 pt-5 pb-2 border-b border-stone-200">
            <div className="flex justify-around text-center gap-2">
              {['Infos', 'Invités', 'Lieux', 'Hébergements'].map((tab, i) => (
                <button key={tab}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: i === 0 ? 700 : 300, fontSize: '0.75rem', letterSpacing: '0.05em' }}
                  className={i === 0 ? 'text-[#4a5240] border-b-2 border-[#4a5240] pb-2' : 'text-stone-400 pb-2'}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#f5f0e8] p-6 space-y-3">
            {[['📍', 'Lieu', 'Brive-la-Gaillarde'], ['🕐', 'Cérémonie', '14h00 — Mairie']].map(([icon, label, val]) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/80">
                <span className="text-xl">{icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase">{label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
                     className="text-stone-700">{val}</p>
                </div>
              </div>
            ))}
            <p className="text-center pt-2"
               style={{ fontFamily: 'var(--font-display)', color: '#4a5240', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              ✦ Option A — Cormorant Garamond ✦
            </p>
          </div>
        </div>

        {/* Option B : Great Vibes + Cormorant */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          <div className="relative h-56 bg-[#4a5240] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4a5240]/20 to-[#2d3228]/90" />
            <div className="relative p-8 text-white w-full">
              <p className="text-xs tracking-[0.4em] uppercase text-stone-300 mb-2"
                 style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
                31 août 2028
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#d4c9a8', lineHeight: 1 }}>
                Mariage de
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '2.4rem', lineHeight: 1.1 }}>
                Sophie & Julien
              </h2>
            </div>
          </div>
          <div className="bg-[#f5f0e8] px-6 pt-5 pb-2 border-b border-stone-200">
            <div className="flex justify-around text-center gap-2">
              {['Infos', 'Invités', 'Lieux', 'Hébergements'].map((tab, i) => (
                <button key={tab}
                  style={{ fontFamily: 'var(--font-lato)', fontWeight: i === 0 ? 700 : 300, fontSize: '0.75rem', letterSpacing: '0.05em' }}
                  className={i === 0 ? 'text-[#4a5240] border-b-2 border-[#4a5240] pb-2' : 'text-stone-400 pb-2'}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#f5f0e8] p-6 space-y-3">
            {[['📍', 'Lieu', 'Brive-la-Gaillarde'], ['🕐', 'Cérémonie', '14h00 — Mairie']].map(([icon, label, val]) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/80">
                <span className="text-xl">{icon}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.15em' }}
                     className="text-stone-400 uppercase">{label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem' }}
                     className="text-stone-700">{val}</p>
                </div>
              </div>
            ))}
            <p className="text-center pt-2"
               style={{ fontFamily: 'var(--font-display)', color: '#4a5240', fontSize: '1.2rem' }}>
              Option B — Calligraphie & Serif
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
