import { useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'
import { useI18n } from '../i18n/LanguageProvider'

/** Reads the main page content aloud — a low-literacy and accessibility aid. */
export function ReadAloud({ label, className }: { label: string; className?: string }) {
  const { lang } = useI18n()
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    return () => window.speechSynthesis.cancel()
  }, [supported])

  if (!supported) return null

  function toggle() {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const main = document.querySelector('main')
    const text = (main?.innerText ?? document.body.innerText).replace(/\s+/g, ' ').trim()
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 6000))
    utterance.lang = document.documentElement.lang || lang
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.cancel()
    synth.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={label}
      title={label}
      className={
        className ??
        'rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95'
      }
    >
      {speaking ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  )
}
