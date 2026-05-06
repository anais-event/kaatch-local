export type PeriodTask = {
  key: string
  label: string
  detail?: string
}

export type PeriodDef = {
  id: string
  label: string
  emoji: string
  tasks: PeriodTask[]
}

export const PERIODS: PeriodDef[] = [
  {
    id: 'p18',
    label: '18 à 12 mois avant',
    emoji: '🌱',
    tasks: [
      { key: 'date', label: 'Fixer la date et le lieu de cérémonie' },
      { key: 'budget', label: 'Définir le budget global', detail: 'Apports, aides familiales, épargne' },
      { key: 'type', label: 'Choisir le type de mariage (civil, religieux, laïc…)' },
      { key: 'liste', label: 'Commencer la liste des invités' },
      { key: 'temoins', label: 'Choisir ses témoins' },
      { key: 'lieu', label: 'Visiter et réserver le lieu de réception' },
      { key: 'photo', label: 'Réserver le photographe', detail: 'Les bons se réservent très tôt' },
      { key: 'robe', label: 'Commencer à chercher la robe / le costume' },
    ],
  },
  {
    id: 'p12',
    label: '12 à 9 mois avant',
    emoji: '🌿',
    tasks: [
      { key: 'traiteur', label: 'Réserver le traiteur' },
      { key: 'musique', label: 'Réserver le DJ ou le groupe de musique' },
      { key: 'theme', label: 'Choisir le thème et les couleurs' },
      { key: 'liste_cadeaux', label: 'Ouvrir la liste de mariage' },
      { key: 'hebergements', label: 'Réserver les hébergements pour les invités lointains' },
      { key: 'faire_part_prep', label: 'Préparer les faire-parts (save the date)' },
      { key: 'fleuriste', label: 'Réserver le fleuriste' },
    ],
  },
  {
    id: 'p9',
    label: '9 à 6 mois avant',
    emoji: '📮',
    tasks: [
      { key: 'faire_part_envoi', label: 'Envoyer les faire-parts', detail: 'Ou save the date si la date est très anticipée' },
      { key: 'liste_finale', label: 'Finaliser la liste des invités' },
      { key: 'menu', label: 'Choisir le menu avec le traiteur' },
      { key: 'coiffeur', label: 'Réserver le coiffeur et le maquilleur' },
      { key: 'alliances', label: 'Choisir les alliances' },
      { key: 'voyage', label: 'Commencer à planifier le voyage de noces' },
      { key: 'kaatch', label: "Créer l'espace Kaatch — invités, programme, album 😉" },
    ],
  },
  {
    id: 'p6',
    label: '6 à 3 mois avant',
    emoji: '📋',
    tasks: [
      { key: 'prestataires_confirm', label: 'Confirmer les détails avec chaque prestataire' },
      { key: 'essayages', label: 'Organiser les essayages de robe / costume' },
      { key: 'ceremonie_laique', label: 'Préparer la cérémonie laïque (si applicable)' },
      { key: 'playlist', label: 'Choisir la musique pour chaque moment' },
      { key: 'jeux', label: 'Planifier les animations et jeux' },
      { key: 'cadeaux_temoins', label: 'Préparer les cadeaux pour les témoins et les parents' },
      { key: 'plan_table', label: 'Commencer le plan de table' },
    ],
  },
  {
    id: 'p1',
    label: 'Le dernier mois',
    emoji: '🗓️',
    tasks: [
      { key: 'confirmations', label: 'Confirmer les présences finales (RSVP)' },
      { key: 'plan_table_final', label: 'Finaliser le plan de table' },
      { key: 'enveloppes', label: 'Préparer les enveloppes / paiements prestataires', detail: 'Avoir les espèces ou chèques prêts' },
      { key: 'repetition', label: 'Répétition de la cérémonie', detail: 'Surtout pour les cérémonies laïques' },
      { key: 'sac_survie', label: 'Préparer le sac de survie du jour J', detail: 'Aiguilles, sparadraps, rouge à lèvres, lingettes…' },
      { key: 'planning_temoins', label: 'Envoyer le planning détaillé aux témoins' },
      { key: 'delegation', label: 'Déléguer les rôles du jour J à des personnes de confiance' },
    ],
  },
  {
    id: 'semaine',
    label: 'La semaine J',
    emoji: '✨',
    tasks: [
      { key: 'reconfirm', label: 'Reconfirmer chaque prestataire' },
      { key: 'deco_prep', label: 'Préparer la décoration et les petits cadeaux' },
      { key: 'dormir', label: 'Dormir (si possible 😅)' },
      { key: 'soi', label: 'Prendre soin de soi — massages, bien-être' },
      { key: 'numeros', label: 'Avoir le numéro de chaque prestataire sous la main' },
      { key: 'confier_planning', label: 'Confier la feuille de route du jour J à un témoin' },
    ],
  },
]

export const PERIOD_COLORS: Record<string, string> = {
  p18:     '#8b5cf6',
  p12:     '#3b82f6',
  p9:      '#06b6d4',
  p6:      '#10b981',
  p1:      '#f59e0b',
  semaine: '#f97316',
}

export const TASK_LABEL_MAP: Record<string, { label: string; periodId: string }> = Object.fromEntries(
  PERIODS.flatMap(p => p.tasks.map(t => [t.key, { label: t.label, periodId: p.id }]))
)
