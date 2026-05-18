import Link from 'next/link'

export default function CTAKaatch() {
  return (
    <div className="mt-8 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-rose-200 p-8 rounded-2xl">
      <h3 className="text-2xl font-light text-stone-800 mb-3">Envie de détailler ce budget ?</h3>
      <p className="text-stone-600 mb-6 leading-relaxed">
        Suivez vos vraies dépenses, vos devis et vos acomptes en temps réel. Kaatch vous aide à structurer votre
        budget mariage et à ne rien oublier.
      </p>
      <Link
        href="/dashboard"
        className="inline-block px-6 py-3 bg-[#4a5240] hover:bg-[#2d3228] text-white rounded-lg font-medium transition-colors"
      >
        Créer mon budget sur Kaatch →
      </Link>
    </div>
  )
}
