'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface GuestbookFormProps {
  submitEntry: (formData: FormData) => Promise<void>
  defaultName: string
}

const MAX_CHARS = 500
const MAX_AUDIO_SECONDS = 60

export default function GuestbookForm({ submitEntry, defaultName }: GuestbookFormProps) {
  const [authorName, setAuthorName] = useState(defaultName)
  const [plainText, setPlainText] = useState('')
  const [html, setHtml] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recStreamRef = useRef<MediaStream | null>(null)
  const recTimerRef = useRef<number | null>(null)

  // Sync editor text length
  function handleEditorInput() {
    const el = editorRef.current
    if (!el) return
    setHtml(el.innerHTML)
    setPlainText(el.innerText)
  }

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    handleEditorInput()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setPreviewUrl(null); return }
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 5 Mo.')
      e.target.value = ''
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recStreamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      const chunks: BlobPart[] = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        recStreamRef.current?.getTracks().forEach(t => t.stop())
        recStreamRef.current = null
      }
      mediaRecorderRef.current = mr
      mr.start()
      setRecording(true)
      setRecSeconds(0)
      recTimerRef.current = window.setInterval(() => {
        setRecSeconds(s => {
          if (s + 1 >= MAX_AUDIO_SECONDS) stopRecording()
          return s + 1
        })
      }, 1000)
    } catch {
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current)
      recTimerRef.current = null
    }
  }

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecSeconds(0)
  }

  useEffect(() => () => {
    if (recTimerRef.current) clearInterval(recTimerRef.current)
    recStreamRef.current?.getTracks().forEach(t => t.stop())
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!plainText.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('author_name', authorName)
      fd.set('message', plainText.trim())
      fd.set('message_html', html)
      const photo = fileInputRef.current?.files?.[0]
      if (photo) fd.set('photo', photo)
      if (audioBlob) {
        const ext = (audioBlob.type.split('/')[1] || 'webm').split(';')[0]
        fd.set('audio', new File([audioBlob], `note.${ext}`, { type: audioBlob.type }))
      }
      await submitEntry(fd)
      setSuccess(true)
      setPlainText('')
      setHtml('')
      if (editorRef.current) editorRef.current.innerHTML = ''
      setPreviewUrl(null)
      clearAudio()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center max-w-lg mx-auto">
        <p className="text-3xl mb-3">💌</p>
        <p className="text-[#2d3228] text-lg" style={{ fontFamily: 'var(--font-lato)', fontWeight: 600 }}>
          Merci, votre mot a été déposé
        </p>
        <p className="text-stone-400 text-sm mt-2" style={{ fontWeight: 300 }}>
          Votre message sera lu par les mariés 🌸
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm text-[#4a5240] underline underline-offset-2"
          style={{ fontWeight: 300 }}>
          Écrire un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Colonne gauche — champs */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Votre prénom
          </label>
          <input
            type="text"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            required
            className="w-full rounded-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30"
            style={{ fontWeight: 300 }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Votre message
          </label>

          {/* Toolbar */}
          <div className="flex items-center gap-1 border border-stone-200 border-b-0 rounded-t-xl bg-stone-50/80 px-2 py-1.5">
            <ToolbarButton onClick={() => exec('bold')} title="Gras"><strong>G</strong></ToolbarButton>
            <ToolbarButton onClick={() => exec('italic')} title="Italique"><em>I</em></ToolbarButton>
            <ToolbarButton onClick={() => exec('underline')} title="Souligné"><span className="underline">S</span></ToolbarButton>
            <span className="w-px h-4 bg-stone-300 mx-1" />
            <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Liste">•≡</ToolbarButton>
            <ToolbarButton onClick={() => exec('removeFormat')} title="Effacer mise en forme">⌫</ToolbarButton>
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            data-placeholder="Écrivez vos voeux, un souvenir, une pensée…"
            className="min-h-[140px] w-full rounded-b-xl border border-stone-200 bg-[#f5f0e8]/60 px-4 py-2.5 text-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a5240]/30 guestbook-editor"
            style={{ fontWeight: 300 }}
          />
          <p className={`text-right text-xs ${plainText.length >= MAX_CHARS ? 'text-red-400' : 'text-stone-300'}`} style={{ fontWeight: 300 }}>
            {plainText.length} / {MAX_CHARS}
          </p>

          <style jsx>{`
            .guestbook-editor:empty::before {
              content: attr(data-placeholder);
              color: #d6d3d1;
            }
            .guestbook-editor :global(ul) { list-style: disc; padding-left: 1.25rem; }
            .guestbook-editor :global(b), .guestbook-editor :global(strong) { font-weight: 600; }
          `}</style>
        </div>

        {/* Audio */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Message audio (optionnel — max {MAX_AUDIO_SECONDS}s)
          </label>
          {!audioUrl && !recording && (
            <button type="button" onClick={startRecording}
                    className="flex items-center gap-3 text-sm text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-3 hover:border-[#4a5240]/40 transition-colors bg-[#f5f0e8]/40"
                    style={{ fontWeight: 300 }}>
              <span className="text-lg">🎙️</span>
              Enregistrer un message
            </button>
          )}
          {recording && (
            <button type="button" onClick={stopRecording}
                    className="flex items-center gap-3 text-sm text-white bg-red-500 rounded-xl px-4 py-3 hover:bg-red-600 transition-colors"
                    style={{ fontWeight: 300 }}>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              Arrêter l&apos;enregistrement · {recSeconds}s / {MAX_AUDIO_SECONDS}s
            </button>
          )}
          {audioUrl && !recording && (
            <div className="flex items-center gap-2">
              <audio src={audioUrl} controls className="flex-1 h-10" />
              <button type="button" onClick={clearAudio}
                      className="px-3 py-2 rounded-xl text-xs text-stone-500 border border-stone-200 hover:bg-stone-50"
                      style={{ fontWeight: 300 }}>
                Refaire
              </button>
            </div>
          )}
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-stone-400 uppercase tracking-widest" style={{ fontWeight: 300 }}>
            Photo (optionnel)
          </label>
          <label className="cursor-pointer flex items-center gap-3 text-sm text-stone-500 border border-dashed border-stone-200 rounded-xl px-4 py-3 hover:border-[#4a5240]/40 transition-colors bg-[#f5f0e8]/40">
            <span className="text-lg">📷</span>
            <span style={{ fontWeight: 300 }}>Ajouter une photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {previewUrl && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
              <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="absolute top-1 right-1 bg-white/80 rounded-full w-5 h-5 text-xs flex items-center justify-center text-stone-500 hover:bg-white">
                ✕
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !plainText.trim()}
          className="w-full py-3 rounded-xl bg-[#4a5240] text-white text-sm transition-all hover:bg-[#2d3228] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontWeight: 300, letterSpacing: '0.03em' }}>
          {loading ? 'Envoi en cours…' : 'Déposer dans le livre d\'or 💌'}
        </button>
      </div>

      {/* Colonne droite — aperçu */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-3" style={{ fontWeight: 300 }}>
            Aperçu
          </p>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4a5240]/10 flex items-center justify-center text-[#4a5240]"
                   style={{ fontFamily: 'var(--font-lato)', fontWeight: 600 }}>
                {(authorName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-stone-700 text-sm" style={{ fontWeight: 500 }}>
                  {authorName || 'Votre prénom'}
                </p>
                <p className="text-xs text-stone-400" style={{ fontWeight: 300 }}>
                  à l&apos;instant
                </p>
              </div>
            </div>

            {html ? (
              <div
                className="text-stone-700 text-sm guestbook-preview"
                style={{ fontWeight: 300, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-stone-300 italic text-sm" style={{ fontWeight: 300 }}>
                Votre message apparaîtra ici…
              </p>
            )}

            {audioUrl && (
              <div className="mt-4">
                <audio src={audioUrl} controls className="w-full h-10" />
              </div>
            )}

            {previewUrl && (
              <div className="mt-4 relative w-full h-48 rounded-xl overflow-hidden border border-stone-100">
                <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
              </div>
            )}

            <style jsx>{`
              .guestbook-preview :global(ul) { list-style: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
              .guestbook-preview :global(ol) { list-style: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
              .guestbook-preview :global(b), .guestbook-preview :global(strong) { font-weight: 600; }
              .guestbook-preview :global(em), .guestbook-preview :global(i) { font-style: italic; }
            `}</style>
          </div>

          <p className="text-center text-xs text-stone-300 mt-4" style={{ fontWeight: 300 }}>
            Votre message sera lu par les mariés 🌸
          </p>
        </div>
      </div>
    </form>
  )
}

function ToolbarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className="w-8 h-7 rounded-md text-sm text-stone-600 hover:bg-stone-200 transition flex items-center justify-center"
      style={{ fontWeight: 300 }}>
      {children}
    </button>
  )
}
