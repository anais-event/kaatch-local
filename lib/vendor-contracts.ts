// Contrats types par catégorie de prestataire.
// Champs spécifiques + clauses standards. Génération PDF côté client.

export type ContractFieldType = 'text' | 'number' | 'textarea' | 'date' | 'time'

export type ContractField = {
  key: string
  label: string
  type: ContractFieldType
  placeholder?: string
  defaultValue?: string
}

export type ContractClause = {
  title: string
  body: string
}

export type ContractTemplate = {
  category: string
  title: string
  prestationLabel: string
  prestationDefault: string
  extraFields: ContractField[]
  clauses: ContractClause[]
}

const CLAUSES_COMMUNES: ContractClause[] = [
  {
    title: 'Acompte et règlement',
    body:
      "Un acompte de 30 % du montant total est versé à la signature du présent contrat. Le solde est dû au plus tard le jour de la prestation, sauf accord écrit contraire. Tout retard de paiement entraîne l'application d'intérêts au taux légal en vigueur.",
  },
  {
    title: 'Annulation par les mariés',
    body:
      "En cas d'annulation par les mariés, l'acompte versé reste acquis au prestataire. Une annulation à moins de 30 jours de la date de prestation donne lieu au versement de 50 % du solde restant. À moins de 7 jours, la totalité du montant reste due, sauf cas de force majeure dûment justifié.",
  },
  {
    title: 'Annulation par le prestataire',
    body:
      "En cas d'annulation par le prestataire, l'acompte est intégralement restitué aux mariés sous 15 jours. Le prestataire s'engage à proposer, dans la mesure du possible, un confrère équivalent pour assurer la prestation.",
  },
  {
    title: 'Modifications',
    body:
      "Toute modification substantielle de la prestation (date, lieu, périmètre) doit faire l'objet d'un avenant écrit signé par les deux parties au moins 30 jours avant la date prévue.",
  },
  {
    title: 'Force majeure',
    body:
      "En cas de force majeure rendant la prestation impossible (catastrophe naturelle, décision administrative, etc.), les parties conviennent de reporter la prestation à une date ultérieure, sans pénalité de part et d'autre.",
  },
  {
    title: 'Litiges',
    body:
      "Les présentes sont soumises au droit français. En cas de litige, et à défaut de solution amiable, le tribunal compétent sera celui du domicile du prestataire.",
  },
]

const COMMON_FIELDS: ContractField[] = [
  { key: 'price_total', label: 'Montant total TTC (€)', type: 'number', placeholder: '0' },
  { key: 'price_deposit', label: 'Acompte versé (€)', type: 'number', placeholder: '0' },
  { key: 'deposit_date', label: "Date de versement de l'acompte", type: 'date' },
  { key: 'balance_date', label: 'Date de versement du solde', type: 'date' },
]

export const CONTRACT_TEMPLATES: Record<string, ContractTemplate> = {
  'Traiteur': {
    category: 'Traiteur',
    title: 'Contrat de prestation traiteur',
    prestationLabel: 'Prestation',
    prestationDefault: "Prestation de service traiteur pour le repas de mariage : cocktail apéritif, dîner assis, vins et boissons, service en salle, vaisselle et matériel.",
    extraFields: [
      { key: 'guest_count', label: 'Nombre de couverts adultes', type: 'number', placeholder: '0' },
      { key: 'kids_count', label: "Nombre d'enfants (menu enfant)", type: 'number', placeholder: '0' },
      { key: 'menu_choice', label: 'Menu retenu', type: 'textarea', placeholder: 'Détail des plats, options végétariennes, allergies prises en compte…' },
      { key: 'drinks', label: 'Boissons incluses', type: 'textarea', placeholder: 'Champagne, vins, soft, café…' },
      { key: 'staff', label: 'Personnel mis à disposition', type: 'text', placeholder: 'Ex : 1 chef + 4 serveurs' },
      { key: 'service_hours', label: "Horaires de service", type: 'text', placeholder: '18h00 à 02h00' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Photo & vidéo': {
    category: 'Photo & vidéo',
    title: 'Contrat de prestation photo / vidéo',
    prestationLabel: 'Prestation',
    prestationDefault: "Reportage photo et/ou vidéo de la journée de mariage, de la préparation à la soirée, incluant retouche, post-production et livraison numérique.",
    extraFields: [
      { key: 'coverage_hours', label: 'Durée de couverture', type: 'text', placeholder: 'Ex : 10h (10h00 à 20h00)' },
      { key: 'deliverables', label: 'Livrables', type: 'textarea', placeholder: 'Ex : 400 photos retouchées HD, galerie en ligne 1 an, film 5min…' },
      { key: 'delivery_delay', label: 'Délai de livraison', type: 'text', placeholder: 'Ex : 6 semaines après la date' },
      { key: 'usage_rights', label: "Droits d'utilisation", type: 'textarea', placeholder: 'Usage privé non commercial. Le prestataire conserve les droits d\'auteur.' },
      ...COMMON_FIELDS,
    ],
    clauses: [
      ...CLAUSES_COMMUNES,
      {
        title: "Droit à l'image",
        body:
          "Les mariés autorisent le prestataire à utiliser les images réalisées pour la promotion de son activité (book, site web, réseaux sociaux), sauf opposition écrite signifiée avant la prestation. Cette autorisation est consentie à titre gracieux et sans limitation de durée.",
      },
    ],
  },
  'Musique & DJ': {
    category: 'Musique & DJ',
    title: 'Contrat de prestation musicale / DJ',
    prestationLabel: 'Prestation',
    prestationDefault: "Animation musicale du mariage : sonorisation cérémonie, vin d'honneur, ambiance dîner et soirée dansante, animation micro selon programme.",
    extraFields: [
      { key: 'start_time', label: 'Heure de début', type: 'time' },
      { key: 'end_time', label: 'Heure de fin', type: 'time' },
      { key: 'equipment', label: 'Matériel fourni', type: 'textarea', placeholder: 'Sono, table de mixage, micros HF, éclairage…' },
      { key: 'space_needed', label: 'Espace technique requis', type: 'text', placeholder: 'Ex : 3m × 2m + alimentation 16A' },
      { key: 'playlist_notes', label: 'Style musical / playlist', type: 'textarea', placeholder: 'Préférences, morceaux imposés, morceaux à proscrire…' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Lieu & réception': {
    category: 'Lieu & réception',
    title: 'Contrat de location de lieu de réception',
    prestationLabel: 'Location',
    prestationDefault: "Mise à disposition du lieu de réception pour la célébration du mariage, incluant les espaces de cérémonie, vin d'honneur, dîner et soirée.",
    extraFields: [
      { key: 'access_start', label: "Début de mise à disposition", type: 'text', placeholder: 'Ex : la veille à 14h pour l\'installation' },
      { key: 'access_end', label: 'Fin de mise à disposition', type: 'text', placeholder: 'Ex : lendemain à 12h' },
      { key: 'capacity', label: 'Capacité maximale (personnes)', type: 'number', placeholder: '0' },
      { key: 'deposit_caution', label: 'Caution (€)', type: 'number', placeholder: '0' },
      { key: 'included', label: 'Inclus dans la location', type: 'textarea', placeholder: 'Mobilier, vaisselle, ménage, personnel d\'accueil…' },
      { key: 'restrictions', label: 'Restrictions / règlement intérieur', type: 'textarea', placeholder: 'Horaire fin de musique, feux d\'artifice interdits, etc.' },
      ...COMMON_FIELDS,
    ],
    clauses: [
      ...CLAUSES_COMMUNES,
      {
        title: 'État des lieux et caution',
        body:
          "Un état des lieux contradictoire est réalisé à l'arrivée et au départ. La caution est restituée sous 15 jours, déduction faite des éventuelles dégradations constatées et chiffrées.",
      },
    ],
  },
  'Fleurs & déco': {
    category: 'Fleurs & déco',
    title: 'Contrat de prestation florale et décoration',
    prestationLabel: 'Prestation',
    prestationDefault: "Création et installation des compositions florales et éléments de décoration pour la cérémonie, le vin d'honneur et la réception.",
    extraFields: [
      { key: 'bouquet_bride', label: 'Bouquet de la mariée', type: 'textarea', placeholder: 'Style, fleurs, coloris…' },
      { key: 'ceremony_deco', label: 'Décoration cérémonie', type: 'textarea', placeholder: 'Arche, allée, autel…' },
      { key: 'tables_deco', label: 'Décoration des tables', type: 'textarea', placeholder: 'Centres de table, chemins, vaisselle complémentaire…' },
      { key: 'install_time', label: "Horaire d'installation", type: 'text', placeholder: 'Ex : la veille de 14h à 18h' },
      { key: 'removal', label: 'Démontage et reprise du matériel', type: 'text', placeholder: 'Ex : lendemain matin avant 10h' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Décorateur/trice': {
    category: 'Décorateur/trice',
    title: 'Contrat de prestation décoration',
    prestationLabel: 'Prestation',
    prestationDefault: "Conception et mise en place de la scénographie et de la décoration du lieu de réception selon le brief des mariés.",
    extraFields: [
      { key: 'zones', label: 'Zones à décorer', type: 'textarea', placeholder: 'Cérémonie, vin d\'honneur, salle de dîner, photobooth…' },
      { key: 'furniture', label: 'Mobilier et matériel fournis', type: 'textarea', placeholder: 'Mange-debout, fauteuils lounge, bougies, signalétique…' },
      { key: 'install_time', label: "Horaire d'installation", type: 'text', placeholder: 'Ex : la veille' },
      { key: 'removal', label: 'Démontage', type: 'text', placeholder: 'Ex : lendemain matin' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Coiffure & maquillage': {
    category: 'Coiffure & maquillage',
    title: 'Contrat de prestation coiffure / maquillage',
    prestationLabel: 'Prestation',
    prestationDefault: "Prestation de coiffure et/ou maquillage le jour du mariage pour la mariée et personnes associées, avec essai préalable.",
    extraFields: [
      { key: 'people_count', label: 'Nombre de personnes', type: 'number', placeholder: '1' },
      { key: 'trial', label: 'Essai préalable', type: 'text', placeholder: 'Inclus ou en supplément, date prévue…' },
      { key: 'arrival_time', label: "Heure d'arrivée", type: 'time' },
      { key: 'location_intervention', label: "Lieu d'intervention", type: 'text', placeholder: 'À domicile, à l\'hôtel, sur le lieu de réception…' },
      { key: 'travel_fees', label: 'Frais de déplacement (€)', type: 'number', placeholder: '0' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Gâteau': {
    category: 'Gâteau',
    title: 'Contrat de commande de pièce montée / wedding cake',
    prestationLabel: 'Commande',
    prestationDefault: "Conception, réalisation et livraison de la pièce de pâtisserie principale (wedding cake, pièce montée ou équivalent) pour le mariage.",
    extraFields: [
      { key: 'portions', label: 'Nombre de parts', type: 'number', placeholder: '0' },
      { key: 'flavors', label: 'Parfums et compositions', type: 'textarea', placeholder: 'Étages, parfums, garnitures, allergènes à éviter…' },
      { key: 'design', label: 'Design / décor', type: 'textarea', placeholder: 'Style, couleurs, fleurs fraîches, topper…' },
      { key: 'delivery_time', label: 'Heure de livraison', type: 'time' },
      { key: 'delivery_place', label: 'Lieu de livraison', type: 'text', placeholder: 'Sur le lieu de réception' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Animation': {
    category: 'Animation',
    title: "Contrat de prestation d'animation",
    prestationLabel: 'Prestation',
    prestationDefault: "Animation lors du mariage selon programme défini avec les mariés (jeux, spectacle, intervention artistique, etc.).",
    extraFields: [
      { key: 'animation_type', label: "Type d'animation", type: 'text', placeholder: 'Ex : magicien close-up, photobooth, groupe live…' },
      { key: 'duration', label: 'Durée', type: 'text', placeholder: 'Ex : 2h pendant le vin d\'honneur' },
      { key: 'start_time', label: 'Heure de début', type: 'time' },
      { key: 'equipment', label: 'Matériel apporté / requis', type: 'textarea', placeholder: 'Détail du matériel et besoins techniques…' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
  'Transport': {
    category: 'Transport',
    title: 'Contrat de prestation transport',
    prestationLabel: 'Prestation',
    prestationDefault: "Mise à disposition d'un véhicule avec chauffeur pour le transport des mariés et/ou des invités le jour du mariage.",
    extraFields: [
      { key: 'vehicle', label: 'Type de véhicule', type: 'text', placeholder: 'Ex : voiture de collection, minibus 9 places, navette 50 places…' },
      { key: 'trip', label: 'Trajet et itinéraire', type: 'textarea', placeholder: 'Points de départ et d\'arrivée, étapes…' },
      { key: 'start_time', label: 'Heure de prise en charge', type: 'time' },
      { key: 'end_time', label: 'Heure de fin de mission', type: 'time' },
      { key: 'driver_notes', label: 'Notes pour le chauffeur', type: 'textarea' },
      ...COMMON_FIELDS,
    ],
    clauses: CLAUSES_COMMUNES,
  },
}

export const GENERIC_TEMPLATE: ContractTemplate = {
  category: 'Autre',
  title: 'Contrat de prestation',
  prestationLabel: 'Prestation',
  prestationDefault: 'Prestation de service dans le cadre du mariage selon les modalités décrites ci-dessous.',
  extraFields: [
    { key: 'prestation_detail', label: 'Détail de la prestation', type: 'textarea', placeholder: 'Décrivez précisément la prestation attendue…' },
    { key: 'start_time', label: 'Horaire de début', type: 'time' },
    { key: 'end_time', label: 'Horaire de fin', type: 'time' },
    ...COMMON_FIELDS,
  ],
  clauses: CLAUSES_COMMUNES,
}

export function getContractTemplate(category: string): ContractTemplate {
  return CONTRACT_TEMPLATES[category] ?? GENERIC_TEMPLATE
}
