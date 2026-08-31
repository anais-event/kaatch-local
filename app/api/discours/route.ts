import Anthropic from '@anthropic-ai/sdk'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

let anthropic: Anthropic | null = null
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY manquante sur le serveur')
  }
  if (!anthropic) {
    const opts: ConstructorParameters<typeof Anthropic>[0] = { apiKey: process.env.ANTHROPIC_API_KEY }
    if (process.env.ANTHROPIC_WORKSPACE_ID) {
      opts.defaultHeaders = { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
    }
    anthropic = new Anthropic(opts)
  }
  return anthropic
}

const TYPE_LABELS: Record<string, string> = {
  'temoin-mariee': "témoin de la mariée",
  'temoin-marie':  "témoin du marié",
  'maries':        "des mariés (vœux)",
  'parents':       "des parents des mariés",
  'toast':         "toast / remerciements",
}

const TON_LABELS: Record<string, string> = {
  'humour':    "léger et drôle, avec humour et anecdotes marrantes, sans être vulgaire",
  'emotion':   "sincère et touchant, avec profondeur émotionnelle",
  'equilibre': "mélange d'humour et d'émotion, alternant les moments drôles et sincères",
}

const DUREE_LABELS: Record<string, string> = {
  'court': "environ 2 minutes (300 à 350 mots)",
  'moyen': "environ 5 minutes (650 à 750 mots)",
  'long':  "environ 10 minutes (1300 à 1500 mots)",
}

const SYSTEM = `Tu es un expert en rédaction de discours de mariage en français. Tu écris des discours personnels, mémorables et authentiques. Ton français est naturel et chaleureux, jamais pompeux. Tu n'utilises jamais de phrases clichées comme "En ce jour si spécial", "Aujourd'hui est un jour magique" ou "Nous sommes réunis aujourd'hui". Tu respectes exactement le format, le ton et le niveau de détail demandés.`

export async function POST(req: NextRequest) {
  try {
    const { type, auteur, prenom1, prenom2, ton, niveau, duree, infos } = await req.json() as {
      type: string; auteur: string; prenom1: string; prenom2: string
      ton: string; niveau: string; duree: string; infos: string
    }

    if (!type || !prenom1 || !prenom2 || !ton || !niveau) {
      return new Response('Champs manquants', { status: 400 })
    }

    const typeLabel = TYPE_LABELS[type] ?? type
    const tonLabel  = TON_LABELS[ton]  ?? ton
    const auteurLine = auteur?.trim() ? `Auteur du discours : ${auteur}` : "Auteur : non précisé"
    const infosLine  = infos?.trim()
      ? `Informations personnelles fournies : ${infos}`
      : "Aucune information personnelle — utilise [TON ANECDOTE ICI] pour les passages à personnaliser."

    let prompt = ''
    let maxTokens = 800

    if (niveau === 'structure') {
      prompt = `Génère la STRUCTURE d'un discours de ${typeLabel} pour le mariage de ${prenom1} et ${prenom2}.
${auteurLine}
Ton souhaité : ${tonLabel}
${infosLine}

Format attendu — commence directement sans introduction :
## [Titre de section]
→ Indication de ce qu'on pourrait dire ici (1-2 phrases, pas de texte rédigé)
⏱ ~[X] secondes

Produis 6 à 7 sections. Commence directement.`
      maxTokens = 700

    } else if (niveau === 'points-cles') {
      prompt = `Génère les POINTS CLÉS d'un discours de ${typeLabel} pour le mariage de ${prenom1} et ${prenom2}.
${auteurLine}
Ton : ${tonLabel}
Durée cible : ~2 minutes (300 à 320 mots)
${infosLine}

Format attendu — commence directement :
## [Titre de section]
[2-4 phrases semi-rédigées, prêtes à adapter — [TON ANECDOTE] pour les passages personnels]

Structure : ouverture originale + 4 sections + conclusion avec toast. Commence directement.`
      maxTokens = 900

    } else {
      const dureeLabel = DUREE_LABELS[duree ?? 'moyen'] ?? DUREE_LABELS['moyen']
      prompt = `Rédige un DISCOURS COMPLET de ${typeLabel} pour le mariage de ${prenom1} et ${prenom2}.
${auteurLine}
Ton : ${tonLabel}
Longueur : ${dureeLabel}
${infosLine}

Règles :
- Discours intégral, fluide, prêt à lire à voix haute
- Ouverture originale (JAMAIS "En ce jour si spécial")
- Développement naturel en 3-4 temps
- Conclusion avec toast mémorable en nommant ${prenom1} et ${prenom2}
- [TON ANECDOTE ICI] uniquement si l'info est absente

Commence DIRECTEMENT par le discours, sans titre.`
      maxTokens = duree === 'long' ? 2200 : duree === 'moyen' ? 1300 : 700
    }

    const stream = getClient().messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    // Pre-fetch the first event OUTSIDE the ReadableStream: if Anthropic rejects
    // (bad key, bad model, rate limit...), it surfaces here — before any byte is
    // flushed — so the outer catch can return a clean Response instead of Next
    // swapping in its generic error page once the stream has already errored.
    const iterator = stream[Symbol.asyncIterator]()
    const first = await iterator.next()

    const encoder = new TextEncoder()
    function textOf(event: Awaited<ReturnType<typeof iterator.next>>['value']): string {
      if (event && event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        return event.delta.text
      }
      return ''
    }

    const readable = new ReadableStream({
      async start(controller) {
        try {
          if (!first.done) {
            const t = textOf(first.value)
            if (t) controller.enqueue(encoder.encode(t))
          }
          while (true) {
            const { done, value } = await iterator.next()
            if (done) break
            const t = textOf(value)
            if (t) controller.enqueue(encoder.encode(t))
          }
        } catch (err) {
          console.error('discours stream error (mid-stream):', err)
          controller.error(err)
        } finally {
          controller.close()
        }
      },
      cancel() {
        stream.abort()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
      },
    })
  } catch (err) {
    console.error('discours API error:', err)
    const msg = err instanceof Error ? err.message : 'Erreur serveur'
    return new Response(msg, { status: 500 })
  }
}
