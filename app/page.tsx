export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Kaatch 💍</h1>
      <p className="text-gray-500 text-lg mb-8">
        Partagez vos plus beaux moments
      </p>
      <a
        href="/auth"
        className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition"
      >
        Commencer
      </a>
    </main>
  )
}
