export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="text-center px-6">
        <p className="text-sm tracking-[0.5em] uppercase text-[#4a5240] mb-4"
           style={{ fontFamily: 'var(--font-lato)', fontWeight: 300 }}>
          Bienvenue sur
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '5rem', lineHeight: 1, fontStyle: 'italic' }}
            className="text-[#2d3228] mb-2">
          Kaatch
        </h1>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.3rem' }}
           className="text-stone-400 mb-10">
          Partagez vos plus beaux moments
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/auth"
            className="inline-block bg-[#4a5240] text-white px-10 py-2 rounded-lg hover:bg-[#2d3228] transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem', letterSpacing: '0.12em' }}
          >
            J'organise mon mariage
          </a>
          <a
            href="/rejoindre"
            className="inline-block border border-[#4a5240] text-[#4a5240] px-10 py-2 rounded-lg hover:bg-[#4a5240] hover:text-white transition"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.82rem', letterSpacing: '0.12em' }}
          >
            Je suis invité(e)
          </a>
        </div>
      </div>
    </main>
  )
}
