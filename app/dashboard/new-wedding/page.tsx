import { createWedding } from './actions'

export default function NewWedding() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-[#4a5240] mb-2"
             style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
            Bienvenue sur Kaatch
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.8rem' }}
              className="text-[#2d3228]">
            Créez votre mariage
          </h1>
        </div>

        <div className="bg-white/80 rounded-3xl shadow-sm p-8">
          <form action={createWedding} className="space-y-6">

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-3">
                Vos prénoms
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <input
                  name="first_name"
                  type="text"
                  placeholder="Votre prénom"
                  required
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                      className="text-stone-300 text-center shrink-0">et</span>
                <input
                  name="partner_name"
                  type="text"
                  placeholder="Son prénom"
                  required
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                />
              </div>
              <p style={{ fontWeight: 300, fontSize: '0.72rem' }} className="text-stone-300 mt-2">
                Apparaîtra comme <em>"Prénom et Prénom"</em> pour vos invités
              </p>
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-2">
                Date du mariage
              </label>
              <input
                name="date"
                type="date"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-[#4a5240] transition text-stone-700 bg-white"
                style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.15em' }}
                     className="block text-stone-400 uppercase mb-3">
                Ambiance
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'elegant', emoji: '✨', label: 'Élégant' },
                  { value: 'moderne', emoji: '🎨', label: 'Moderne' },
                  { value: 'romantique', emoji: '🌸', label: 'Romantique' },
                ].map((theme) => (
                  <label key={theme.value} className="cursor-pointer">
                    <input type="radio" name="theme" value={theme.value} className="peer sr-only"
                      defaultChecked={theme.value === 'elegant'} />
                    <div className="border-2 border-stone-200 rounded-2xl p-4 text-center peer-checked:border-[#4a5240] peer-checked:bg-[#f5f0e8] transition">
                      <div className="text-2xl mb-2">{theme.emoji}</div>
                      <div style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}
                           className="text-stone-600">{theme.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4a5240] text-white py-3 rounded-full hover:bg-[#2d3228] transition mt-2"
              style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, letterSpacing: '0.08em', fontSize: '0.85rem' }}
            >
              Créer mon espace mariage
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
