'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const SAGE = '#4a5240'
const SAGE_DARK = '#2d3228'
const BODY = 'var(--font-body)'

type CheckItem = {
  id: string
  text: string
  tip?: string
  isKeyItem?: boolean
}

type Phase = {
  id: string
  label: string
  timing: string
  emoji: string
  items: CheckItem[]
}

const PHASES: Phase[] = [
  {
    id: 'p18',
    label: "Dès les fiançailles",
    timing: 'J-18 mois et avant',
    emoji: '💍',
    items: [
      { id: 'p18-1', text: "Fixer la date — vérifier que les familles proches sont disponibles avant de sortir le champagne", isKeyItem: true },
      { id: 'p18-2', text: "Définir un budget global, même approximatif", isKeyItem: true },
      { id: 'p18-3', text: "Faire la liste des invités — version honnête, pas optimiste", isKeyItem: true },
      { id: 'p18-4', text: "Réserver la date à la mairie pour la cérémonie civile", isKeyItem: true },
      { id: 'p18-5', text: "Visiter au moins 3 salles de réception — même si la première vous a tapé dans l'œil" },
      { id: 'p18-6', text: "Décider du style du mariage : intimiste, grande fête, champêtre, chic..." },
      { id: 'p18-7', text: "Ouvrir un compte épargne dédié au mariage", tip: "Ça rend les choses plus réelles — et les arbitrages moins douloureux" },
      { id: 'p18-8', text: "Prendre le temps de rêver ensemble avant de stresser ensemble" },
    ]
  },
  {
    id: 'p12',
    label: '12 mois avant',
    timing: 'J-12 mois',
    emoji: '📅',
    items: [
      { id: 'p12-1', text: "Réserver la salle de réception — c'est le nerf de la guerre", isKeyItem: true },
      { id: 'p12-2', text: "Contacter des officiant(e)s pour la cérémonie laïque si prévu" },
      { id: 'p12-3', text: "Choisir le traiteur — goûter minimum 3 propositions, c'est une obligation (presque)", isKeyItem: true, tip: "Les goûts de traiteur sont le seul moment où stresser est officiellement interdit" },
      { id: 'p12-4', text: "Prendre rendez-vous pour la robe et le costume — les délais de commande sont de 6 à 9 mois", isKeyItem: true },
      { id: 'p12-5', text: "Rencontrer des photographes — regarder des galeries entières, pas juste les meilleures photos", isKeyItem: true },
      { id: 'p12-6', text: "Réserver le DJ ou groupe musical" },
      { id: 'p12-7', text: "Constituer le cortège : témoins, demoiselles et garçons d'honneur" },
      { id: 'p12-8', text: "Créer la liste de mariage — diversifier les prix pour tous les budgets" },
      { id: 'p12-9', text: "Réfléchir à l'hébergement pour les invités venant de loin" },
      { id: 'p12-10', text: "Commencer à économiser — oui, vraiment" },
    ]
  },
  {
    id: 'p9',
    label: '9 mois avant',
    timing: 'J-9 mois',
    emoji: '📝',
    items: [
      { id: 'p9-1', text: "Faire signer les contrats prestataires avec les acomptes", isKeyItem: true },
      { id: 'p9-2', text: "Choisir les alliances — prévoir 3 mois minimum pour les personnalisées", isKeyItem: true },
      { id: 'p9-3', text: "Planifier le voyage de noces : destination, budget, période", isKeyItem: true },
      { id: 'p9-4', text: "Réfléchir aux animations et activités de la journée" },
      { id: 'p9-5', text: "Préparer la liste pour le DJ : les morceaux voulus ET ceux à ne jamais passer", isKeyItem: true, tip: "La liste des interdits est aussi importante que la playlist — le DJ vous remerciera" },
      { id: 'p9-6', text: "Premier rendez-vous avec le fleuriste : inspiration, budget, style" },
      { id: 'p9-7', text: "Commencer à réfléchir à la décoration ou trouver un décorateur" },
      { id: 'p9-8', text: "Prévoir un plan B météo si cérémonie en extérieur — même en plein été" },
    ]
  },
  {
    id: 'p6',
    label: '6 mois avant',
    timing: 'J-6 mois',
    emoji: '💌',
    items: [
      { id: 'p6-1', text: "Envoyer les save-the-date — les invités lointains en premier", isKeyItem: true },
      { id: 'p6-2', text: "Créer et commander les faire-part — prévoir 10% de plus que le nombre d'invités", isKeyItem: true, tip: "Les gens perdent, veulent en garder un en souvenir. Toujours en commander plus" },
      { id: 'p6-3', text: "Confirmer les menus avec le traiteur et collecter les allergies en même temps", isKeyItem: true },
      { id: 'p6-4', text: "Réserver l'hébergement pour les invités venant de loin" },
      { id: 'p6-5', text: "Choisir les tenues du cortège" },
      { id: 'p6-6', text: "Planifier le programme détaillé de la journée, heure par heure", isKeyItem: true },
      { id: 'p6-7', text: "Organiser le transport entre les lieux : navettes, voitures, taxi" },
      { id: 'p6-8', text: "Rencontrer l'officiant(e) pour construire la cérémonie ensemble" },
      { id: 'p6-9', text: "Commencer les essais coiffure et maquillage" },
      { id: 'p6-10', text: "Vérifier que la liste de mariage est accessible en ligne" },
    ]
  },
  {
    id: 'p3',
    label: '3 mois avant',
    timing: 'J-3 mois',
    emoji: '🪑',
    items: [
      { id: 'p3-1', text: "Envoyer les invitations avec carton RSVP — fixer une deadline claire pour les réponses", isKeyItem: true },
      { id: 'p3-2', text: "Suivre les RSVP et finaliser le nombre de couverts exact", isKeyItem: true },
      { id: 'p3-3', text: "Valider le plan de table — ça prend bien plus de temps qu'on ne l'imagine", isKeyItem: true },
      { id: 'p3-4', text: "Essais coiffure et maquillage : valider avec photos", isKeyItem: true },
      { id: 'p3-5', text: "Préparer le livret de cérémonie" },
      { id: 'p3-6', text: "Rédiger (ou commencer à rédiger) les discours" },
      { id: 'p3-7', text: "Finaliser la liste de morceaux du DJ avec le détail par moment de la soirée" },
      { id: 'p3-8', text: "Préparer les cadeaux pour les invités et le cortège si prévu" },
      { id: 'p3-9', text: "Vérifier et rassembler les documents requis pour la mairie" },
    ]
  },
  {
    id: 'pcivil',
    label: 'Mairie & cérémonie civile',
    timing: 'J-3 à J-1 mois',
    emoji: '🏛️',
    items: [
      { id: 'pcivil-1', text: "Constituer le dossier de mariage : acte de naissance de moins de 3 mois pour chacun (à demander sur service-public.fr), justificatif de domicile, pièce d'identité", isKeyItem: true, tip: "L'acte de naissance doit dater de moins de 3 mois. Prévoir 2 à 3 semaines pour l'obtenir en ligne — ne pas attendre la dernière minute" },
      { id: 'pcivil-2', text: "Déposer le dossier complet à la mairie — la publication des bans démarre automatiquement (10 jours ouvrables obligatoires avant la cérémonie)", isKeyItem: true, tip: "Sans dépôt de dossier, pas de mariage civil. C'est le point de départ légal. La mairie confirme la date et l'heure définitives à ce moment-là" },
      { id: 'pcivil-3', text: "Choisir les témoins civils — 2 minimum, 4 maximum, tous majeurs, pièce d'identité obligatoire le jour J", isKeyItem: true, tip: "Les témoins civils signent le registre. Ils peuvent être les mêmes que les témoins de la soirée — ou des personnes différentes" },
      { id: 'pcivil-4', text: "Confirmer l'heure exacte de passage à la mairie et la transmettre au photographe, au cortège et aux prestataires" },
      { id: 'pcivil-5', text: "Planifier le timing mairie → lieu de réception : photos de groupe, transport, accueil des invités" },
      { id: 'pcivil-6', text: "Si cérémonie religieuse prévue : entamer les démarches auprès de l'église, du temple ou de la synagogue — les délais sont souvent plus longs que prévu", isKeyItem: true },
    ]
  },
  {
    id: 'p1m',
    label: '1 mois avant',
    timing: 'J-1 mois',
    emoji: '📋',
    items: [
      { id: 'p1m-1', text: "Confirmer TOUS les prestataires par écrit : heure d'arrivée, adresse exacte, contact le jour J", isKeyItem: true },
      { id: 'p1m-2', text: "Préparer les enveloppes de paiement pour le jour J — les confier à un témoin", isKeyItem: true },
      { id: 'p1m-3', text: "Constituer le kit de survie mariée", isKeyItem: true, tip: "Épingles à nourrice, anti-transpirant, spray pieds, rouge à lèvres, paracétamol, pansements. Vous remercierez ce kit à 22h" },
      { id: 'p1m-4', text: "Tester les chaussures — les porter minimum 2h à la maison avant le jour J", tip: "Les ampoules pendant la cérémonie, c'est évitable. Les chaussures neuves le jour J, c'est un risque inutile" },
      { id: 'p1m-5', text: "Réserver une chambre pour la nuit de noces — même si la salle propose l'hébergement", tip: "Vous voudrez une chambre rien qu'à vous deux, garantie à l'avance, avec un itinéraire clair" },
      { id: 'p1m-6', text: "Préparer un sac pour le lendemain matin avec vos affaires et produits de toilette", tip: "On repart rarement en robe de mariée. Prévoir une tenue de sortie dans un sac séparé" },
      { id: 'p1m-7', text: "Désigner quelqu'un qui connaît le programme et peut gérer les imprévus le jour J" },
      { id: 'p1m-8', text: "Briefer votre témoin principal sur les détails de coordination" },
    ]
  },
  {
    id: 'p15j',
    label: '15 jours avant',
    timing: 'J-15 jours',
    emoji: '🌅',
    items: [
      { id: 'p15j-1', text: "Envoyer le plan de table définitif au traiteur et à la salle", isKeyItem: true },
      { id: 'p15j-2', text: "Informer le traiteur des allergies et régimes alimentaires MAINTENANT", isKeyItem: true, tip: "Pas la veille. Pas le matin même. 15 jours avant c'est la règle — le traiteur remerciera" },
      { id: 'p15j-3', text: "Préparer un document récap pour le DJ : ordre des moments, morceaux clés, annonces à faire", isKeyItem: true },
      { id: 'p15j-4', text: "Confirmer les horaires avec le photographe et le détail des shots souhaités", isKeyItem: true },
      { id: 'p15j-5', text: "Vérifier l'heure du coucher de soleil pour les photos en extérieur", tip: "En juin il se couche vers 22h, en octobre vers 19h — ça change tout pour la lumière dorée" },
      { id: 'p15j-6', text: "Rédiger et répéter les vœux si vous avez choisi d'en lire" },
      { id: 'p15j-7', text: "Vérifier les batteries et cartes mémoire de tous les appareils photo familiaux" },
    ]
  },
  {
    id: 'p1s',
    label: '1 semaine avant',
    timing: 'J-1 semaine',
    emoji: '✨',
    items: [
      { id: 'p1s-1', text: "Essayage final de la robe et du costume", isKeyItem: true },
      { id: 'p1s-2', text: "Rassembler tous les documents pour la mairie dans une pochette", isKeyItem: true },
      { id: 'p1s-3', text: "Dernière confirmation auprès de tous les prestataires", isKeyItem: true },
      { id: 'p1s-4', text: "Confier les cadeaux invités et accessoires de table à un témoin" },
      { id: 'p1s-5', text: "Désigner quelqu'un qui sait busculer votre robe aux toilettes", isKeyItem: true, tip: "On n'y pense jamais. Et le jour J, c'est une galère monumentale sans aide. Désignez cette personne maintenant" },
      { id: 'p1s-6', text: "Préparer une playlist pour les préparatifs du matin — ça donne le ton de toute la journée" },
      { id: 'p1s-7', text: "Dormir. Vraiment. Ce n'est pas négociable." },
    ]
  },
  {
    id: 'jj',
    label: 'Le Jour J',
    timing: 'Jour J',
    emoji: '🎊',
    items: [
      { id: 'jj-1', text: "Prendre un vrai petit-déjeuner", isKeyItem: true, tip: "Les mariés oublient souvent de manger de toute la journée. C'est une catastrophe. Mangez ce matin, vraiment" },
      { id: 'jj-2', text: "Donner les enveloppes prestataires à votre témoin principal avant la cérémonie", isKeyItem: true },
      { id: 'jj-3', text: "Profiter des préparatifs — c'est souvent le plus beau moment de la journée" },
      { id: 'jj-4', text: "Déléguer tous les imprévus à vos témoins — c'est exactement pour ça qu'ils sont là", isKeyItem: true },
      { id: 'jj-5', text: "Prendre 5 minutes seuls à deux dans la journée, vraiment", isKeyItem: true, tip: "5 minutes loin de tout le monde. C'est votre mariage à vous deux, pas à vos invités" },
      { id: 'jj-6', text: "Manger. Boire. Danser. Le reste est déjà réglé.", isKeyItem: true },
    ]
  },
]

const ALL_ITEMS = PHASES.flatMap(p => p.items)
const TOTAL = ALL_ITEMS.length

type FilterType = 'all' | 'todo' | 'done'
type ViewType = 'global' | 'full'

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M3 5L7 9L11 5" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function sanitize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^ -~]/g, '')
}

function CheckboxCircle({ checked: isChecked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
        isChecked ? 'border-[#4a5240] bg-[#4a5240]' : 'border-stone-300 group-hover:border-[#4a5240]'
      }`}
    >
      {isChecked && <CheckIcon />}
    </div>
  )
}

export default function ChecklistMariage() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [view, setView] = useState<ViewType>('global')
  const [filter, setFilter] = useState<FilterType>('all')
  const [ctaDismissed, setCtaDismissed] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(PHASES.map(p => p.id)))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('kaatch-checklist-v1')
      if (saved) {
        setChecked(new Set(JSON.parse(saved) as string[]))
      }
    } catch {
      // localStorage not available
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem('kaatch-checklist-v1', JSON.stringify([...checked]))
    } catch {
      // localStorage not available
    }
  }, [checked, mounted])

  const toggle = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const togglePhase = useCallback((phaseId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }, [])

  const pct = Math.round((checked.size / TOTAL) * 100)
  const showCTA = pct >= 40 && !ctaDismissed

  const handlePDF = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      let y = 20
      doc.setFontSize(22)
      doc.setTextColor(45, 50, 40)
      doc.text('Checklist Mariage', 20, y)
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(120, 113, 108)
      doc.text(sanitize(`Progression : ${pct}% - ${checked.size}/${TOTAL} etapes cochees`), 20, y)
      y += 5
      doc.text('kaatch.fr/checklist-mariage', 20, y)
      y += 14

      for (const phase of PHASES) {
        if (y > 255) { doc.addPage(); y = 20 }
        doc.setFontSize(12)
        doc.setTextColor(74, 82, 64)
        doc.text(sanitize(`${phase.label} - ${phase.timing}`), 20, y)
        y += 8

        for (const item of phase.items) {
          if (y > 272) { doc.addPage(); y = 20 }
          const isDone = checked.has(item.id)
          doc.setFontSize(8.5)
          doc.setTextColor(isDone ? 170 : 50, isDone ? 170 : 47, isDone ? 170 : 43)
          const prefix = isDone ? '[x] ' : '[ ] '
          const lines = doc.splitTextToSize(sanitize(prefix + item.text), 168)
          doc.text(lines, 26, y)
          y += (lines as string[]).length * 5 + 1
        }
        y += 6
      }

      doc.setFontSize(8)
      doc.setTextColor(180, 180, 180)
      doc.text('Genere par Kaatch - kaatch.fr/checklist-mariage', 20, 287)

      doc.save('checklist-mariage-kaatch.pdf')
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'pdf_download', { tool: 'checklist', progression: pct, checked: checked.size })
      }
    } catch (err) {
      console.error('PDF error:', err)
    }
  }, [checked, pct])

  const handleReset = useCallback(() => {
    if (window.confirm('Remettre toutes les cases à zéro ?')) {
      setChecked(new Set())
    }
  }, [])

  const filteredPhases = PHASES.map(phase => {
    const originalItems = phase.items
    const visibleItems = originalItems.filter(item => {
      if (filter === 'done') return checked.has(item.id)
      if (filter === 'todo') return !checked.has(item.id)
      return true
    })
    return { ...phase, items: visibleItems }
  }).filter(phase => phase.items.length > 0)

  return (
    <div style={{ fontFamily: BODY }} className="pt-24 pb-20 px-5 md:px-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-stone-400 mb-3 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Outils gratuits · Kaatch
          </p>
          <h1 className="text-3xl md:text-4xl text-stone-800 mb-3" style={{ fontWeight: 300 }}>
            Checklist mariage
          </h1>
          <p className="text-stone-500 text-base leading-relaxed max-w-xl" style={{ fontWeight: 300 }}>
            Toutes les étapes pour organiser votre mariage, mois par mois — avec les détails
            auxquels on ne pense pas toujours. Vos cases cochées sont sauvegardées automatiquement.
          </p>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-stone-600" style={{ fontWeight: 400 }}>
              Progression globale
            </span>
            <span className="text-sm" style={{ color: SAGE, fontWeight: 500 }}>
              {mounted ? checked.size : 0} / {TOTAL} · {mounted ? pct : 0}%
            </span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${mounted ? pct : 0}%`,
                background: `linear-gradient(90deg, ${SAGE} 0%, #6b7c5e 100%)`
              }}
            />
          </div>
          {mounted && pct > 0 && (
            <p className="text-xs text-stone-400 mt-2" style={{ fontWeight: 300 }}>
              {pct < 30
                ? "Le voyage commence ✨"
                : pct < 60
                ? "Bien parti(e)s ! La moitié approche 💪"
                : pct < 90
                ? "La grande ligne droite ! 🎊"
                : "Presque prêt(e)s — félicitations 🎉"}
            </p>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex bg-white border border-stone-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('global')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${view === 'global' ? 'bg-[#4a5240] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              style={{ fontWeight: view === 'global' ? 500 : 300 }}
            >
              Vue globale
            </button>
            <button
              onClick={() => setView('full')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${view === 'full' ? 'bg-[#4a5240] text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              style={{ fontWeight: view === 'full' ? 500 : 300 }}
            >
              Liste complète
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-500 text-sm hover:border-stone-300 hover:text-stone-700 transition"
              style={{ fontWeight: 300 }}
            >
              📄 PDF
            </button>
            {mounted && checked.size > 0 && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-400 text-xs hover:text-stone-600 hover:border-stone-300 transition"
                style={{ fontWeight: 300 }}
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Filter (full view only) */}
        {view === 'full' && (
          <div className="flex gap-2 mb-5">
            {(['all', 'todo', 'done'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs border transition-all ${
                  filter === f
                    ? 'bg-[#4a5240] text-white border-[#4a5240]'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
                style={{ fontWeight: 300 }}
              >
                {f === 'all' ? 'Tout' : f === 'todo' ? 'À faire' : 'Déjà fait'}
              </button>
            ))}
          </div>
        )}

        {/* CTA banner */}
        {mounted && showCTA && (
          <div className="mb-5 rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: SAGE_DARK }}>
            <div>
              <p className="text-white text-sm mb-0.5" style={{ fontWeight: 500 }}>
                Vous êtes bien parti(e)s 🎊
              </p>
              <p className="text-stone-300 text-xs" style={{ fontWeight: 300 }}>
                Gérez tout sur Kaatch — invités, plan de table, photos, programme. Gratuit.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/auth"
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-stone-100 transition whitespace-nowrap"
                style={{ color: SAGE_DARK }}
              >
                Essayer Kaatch →
              </Link>
              <button
                onClick={() => setCtaDismissed(true)}
                className="text-stone-400 hover:text-white text-xl leading-none transition"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* ─── VUE GLOBALE ─────────────────────────────────────────── */}
        {view === 'global' && (
          <div className="space-y-4">
            {PHASES.map(phase => {
              const keyItems = phase.items.filter(i => i.isKeyItem)
              const phaseDone = phase.items.filter(i => mounted && checked.has(i.id)).length
              const phaseTotal = phase.items.length

              return (
                <div key={phase.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{phase.emoji}</span>
                      <div>
                        <p className="text-stone-800 text-base" style={{ fontWeight: 500 }}>
                          {phase.label}
                        </p>
                        <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                          {phase.timing}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm" style={{ color: phaseDone === phaseTotal && phaseDone > 0 ? SAGE : '#9ca3af', fontWeight: 500 }}>
                        {mounted ? phaseDone : 0}/{phaseTotal}
                      </p>
                      {mounted && phaseDone === phaseTotal && phaseTotal > 0 && (
                        <p className="text-xs" style={{ color: SAGE }}>Complet ✓</p>
                      )}
                    </div>
                  </div>

                  {/* Phase mini progress */}
                  <div className="mx-5 mb-4 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${mounted ? (phaseDone / phaseTotal) * 100 : 0}%`, backgroundColor: SAGE }}
                    />
                  </div>

                  {/* Key items */}
                  <div className="px-5 pb-5 space-y-2.5">
                    {keyItems.map(item => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={mounted ? checked.has(item.id) : false}
                            onChange={() => toggle(item.id)}
                            className="sr-only"
                          />
                          <CheckboxCircle checked={mounted ? checked.has(item.id) : false} />
                        </div>
                        <span
                          className={`text-sm leading-relaxed transition-colors ${
                            mounted && checked.has(item.id) ? 'text-stone-400 line-through' : 'text-stone-700'
                          }`}
                          style={{ fontWeight: 300 }}
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}

                    {phaseTotal > keyItems.length && (
                      <button
                        onClick={() => setView('full')}
                        className="mt-1 text-xs transition hover:underline"
                        style={{ color: SAGE, fontWeight: 300 }}
                      >
                        + {phaseTotal - keyItems.length} autre{phaseTotal - keyItems.length > 1 ? 's' : ''} étape{phaseTotal - keyItems.length > 1 ? 's' : ''} dans la liste complète →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── LISTE COMPLÈTE ──────────────────────────────────────── */}
        {view === 'full' && (
          <div className="space-y-4">
            {filteredPhases.length === 0 ? (
              <div className="text-center py-16 text-stone-400" style={{ fontWeight: 300 }}>
                {filter === 'done' ? "Rien de coché pour l'instant." : "Tout est coché — bravo 🎉"}
              </div>
            ) : (
              filteredPhases.map(phase => {
                const originalPhase = PHASES.find(p => p.id === phase.id)!
                const phaseDone = originalPhase.items.filter(i => mounted && checked.has(i.id)).length
                const phaseTotal = originalPhase.items.length
                const isExpanded = expanded.has(phase.id)

                return (
                  <div key={phase.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{phase.emoji}</span>
                        <div>
                          <p className="text-stone-800 text-sm" style={{ fontWeight: 500 }}>
                            {phase.label}
                          </p>
                          <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                            {phase.timing} · {mounted ? phaseDone : 0}/{phaseTotal}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {mounted && phaseDone === phaseTotal && phaseTotal > 0 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${SAGE}18`, color: SAGE }}
                          >
                            Complet
                          </span>
                        )}
                        <ChevronIcon open={isExpanded} />
                      </div>
                    </button>

                    {/* Phase progress */}
                    <div className="mx-5 h-0.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${mounted ? (phaseDone / phaseTotal) * 100 : 0}%`, backgroundColor: SAGE }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="px-5 py-4 space-y-3">
                        {phase.items.map(item => (
                          <div key={item.id}>
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <div className="mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={mounted ? checked.has(item.id) : false}
                                  onChange={() => toggle(item.id)}
                                  className="sr-only"
                                />
                                <CheckboxCircle checked={mounted ? checked.has(item.id) : false} />
                              </div>
                              <span
                                className={`text-sm leading-relaxed transition-colors ${
                                  mounted && checked.has(item.id)
                                    ? 'text-stone-400 line-through'
                                    : 'text-stone-700'
                                }`}
                                style={{ fontWeight: 300 }}
                              >
                                {item.text}
                              </span>
                            </label>
                            {item.tip && !(mounted && checked.has(item.id)) && (
                              <p className="ml-8 mt-1 text-xs text-stone-400 leading-relaxed" style={{ fontWeight: 300 }}>
                                💡 {item.tip}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 rounded-2xl p-7 text-center" style={{ background: SAGE_DARK }}>
          <p className="text-white text-xl mb-2" style={{ fontWeight: 300 }}>
            La checklist, c'est bien. Tout au même endroit, c'est mieux.
          </p>
          <p className="text-stone-300 text-sm mb-5 max-w-md mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            Kaatch centralise invités, faire-part, plan de table, photos et programme — tout ça,
            gratuitement, pour vous et vos invités.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-white rounded-xl text-sm font-medium hover:bg-stone-100 transition"
            style={{ color: SAGE_DARK }}
          >
            Organiser mon mariage sur Kaatch →
          </Link>
        </div>

      </div>
    </div>
  )
}
