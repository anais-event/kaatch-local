export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8]">
      <div className="text-center px-6">
        <p className="text-sm tracking-[0.4em] uppercase text-[#4a5240] mb-4"
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
        <a
          href="/auth"
          className="inline-block bg-[#4a5240] text-white px-10 py-3 rounded-full hover:bg-[#2d3228] transition"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.85rem', letterSpacing: '0.1em' }}
        >
          Commencer
        </a>
        <p className="mt-6" style={{ fontFamily: 'var(--font-lato)', fontWeight: 300, fontSize: '0.8rem' }}>
          <span className="text-stone-400">Pas encore de compte ? </span>
          <a href="/register" className="text-[#4a5240] hover:underline">S'inscrire</a>
        </p>
      </div>
    </main>
  )
}
