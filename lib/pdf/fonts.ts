import { Font } from '@react-pdf/renderer'
import path from 'path'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  const dir = path.join(process.cwd(), 'public', 'fonts')

  Font.register({
    family: 'CormorantGaramond',
    fonts: [
      { src: `${dir}/CormorantGaramond-Regular.ttf`, fontWeight: 400, fontStyle: 'normal' },
      { src: `${dir}/CormorantGaramond-Italic.ttf`,  fontWeight: 400, fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Lato',
    fonts: [
      { src: `${dir}/Lato-Light.ttf`,   fontWeight: 300 },
      { src: `${dir}/Lato-Regular.ttf`, fontWeight: 400 },
    ],
  })

  Font.register({
    family: 'PlayfairDisplay',
    fonts: [
      { src: `${dir}/PlayfairDisplay-Regular.ttf`, fontWeight: 400 },
    ],
  })

  Font.registerHyphenationCallback(w => [w])
}

export const TYPO_FAMILIES = [
  { display: 'CormorantGaramond', body: 'Lato' },        // Classique & raffiné
  { display: 'PlayfairDisplay',   body: 'Lato' },         // Moderne & épuré
  { display: 'CormorantGaramond', body: 'Lato' },         // Romantique & aéré (fallback)
]
