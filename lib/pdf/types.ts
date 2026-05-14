export type UniversColors = {
  bg: string      // fond principal (couleur 0)
  subtle: string  // couleur secondaire (couleur 1)
  accent: string  // couleur accent (couleur 2)
  text: string    // couleur texte (couleur 3)
}

export type UniversSettings = {
  colors: UniversColors
  displayFont: string
  bodyFont: string
}

export type WeddingInfo = {
  name: string
  date: string | null
  location: string | null
}

export type GuestInfo = {
  id: string
  firstName: string
  lastName: string
  tableName?: string | null
}
