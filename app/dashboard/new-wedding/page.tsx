import { createWedding } from './actions'

export default function NewWedding() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer mon mariage</h1>
        <p className="text-gray-500 mb-8">Configurez votre espace en quelques clics</p>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <form action={createWedding}>
            {/* Nom du mariage */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du mariage
              </label>
              <input
                name="name"
                type="text"
                placeholder="Mariage Julie & Thomas"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date du mariage
              </label>
              <input
                name="date"
                type="date"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* Thème */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choisissez votre thème
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="elegant" className="peer sr-only" defaultChecked />
                  <div className="border-2 border-gray-200 rounded-lg p-4 text-center peer-checked:border-black peer-checked:bg-gray-50">
                    <div className="text-2xl mb-2">✨</div>
                    <div className="text-sm font-medium">Élégant</div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="moderne" className="peer sr-only" />
                  <div className="border-2 border-gray-200 rounded-lg p-4 text-center peer-checked:border-black peer-checked:bg-gray-50">
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-sm font-medium">Moderne</div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="romantique" className="peer sr-only" />
                  <div className="border-2 border-gray-200 rounded-lg p-4 text-center peer-checked:border-black peer-checked:bg-gray-50">
                    <div className="text-2xl mb-2">🌸</div>
                    <div className="text-sm font-medium">Romantique</div>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
              Créer mon espace mariage
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}