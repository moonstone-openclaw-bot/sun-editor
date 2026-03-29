import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'sun-editor-draft'

const starterText = `# Sunrise Notes

Watch the sun climb, then write about it.
`

const sunStops = [
  { label: 'Night', angle: -120, color: 'rgba(72, 92, 180, 0.95)' },
  { label: 'Dawn', angle: -60, color: 'rgba(255, 153, 94, 0.98)' },
  { label: 'Morning', angle: 0, color: 'rgba(255, 206, 96, 1)' },
  { label: 'Noon', angle: 60, color: 'rgba(255, 244, 170, 1)' },
  { label: 'Evening', angle: 120, color: 'rgba(255, 148, 109, 0.98)' },
]

function loadSavedState() {
  if (typeof window === 'undefined') return { text: starterText, sunIndex: 2, savedAt: null }
  try {
    const text = window.localStorage.getItem(STORAGE_KEY) ?? starterText
    return { text, sunIndex: 2, savedAt: new Date() }
  } catch {
    return { text: starterText, sunIndex: 2, savedAt: null }
  }
}

function saveText(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // ignore write failures in preview
  }
}

function formatStatus(savedAt) {
  if (!savedAt) return 'Not saved yet'
  return `Saved ${new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(savedAt)}`
}

function countWords(text) {
  const words = text.trim().match(/\S+/g)
  return words ? words.length : 0
}

function countLines(text) {
  return text.length === 0 ? 1 : text.split('\n').length
}

function ToolbarButton({ children, onClick }) {
  return (
    <button type="button" className="toolbar-button" onClick={onClick}>
      {children}
    </button>
  )
}

export default function App() {
  const [{ text, sunIndex, savedAt }, setState] = useState(loadSavedState)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => ({
        ...current,
        sunIndex: (current.sunIndex + 1) % sunStops.length,
      }))
    }, 2400)
    return () => window.clearInterval(timer)
  }, [])

  const setText = (value) => {
    setState((current) => {
      const nextText = typeof value === 'function' ? value(current.text) : value
      saveText(nextText)
      return { ...current, text: nextText, savedAt: new Date() }
    })
  }

  const stats = useMemo(() => ({
    chars: text.length,
    words: countWords(text),
    lines: countLines(text),
  }), [text])

  const sun = sunStops[sunIndex]

  const insertSnippet = (snippet) => {
    setText((current) => `${current}${current.endsWith('\n') ? '' : '\n'}${snippet}`)
  }

  return (
    <main className="app shell">
      <div className="sky-glow sky-glow-left" />
      <div className="sky-glow sky-glow-right" />

      <section className="editor-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">Preview Routine</p>
            <h1>Sun Editor</h1>
            <p className="subtitle">A calm editor with an animated sun that rises through the day.</p>
          </div>
          <div className="save-pill" aria-live="polite">{formatStatus(savedAt)}</div>
        </header>

        <div className="sun-stage" aria-label={`Sun position: ${sun.label}`}>
          <div className="sun-stage__track">
            {sunStops.map((stop, index) => (
              <span
                key={stop.label}
                className={`sun-stage__marker ${index === sunIndex ? 'is-active' : ''}`}
                style={{ '--marker-angle': `${stop.angle}deg` }}
                aria-hidden="true"
              />
            ))}
            <div
              className="sun-stage__sun"
              style={{
                '--sun-angle': `${sun.angle}deg`,
                '--sun-color': sun.color,
              }}
            >
              <span className="sun-stage__halo" />
            </div>
          </div>
          <div className="sun-stage__label">
            <strong>{sun.label}</strong>
            <span>{Math.round(((sunIndex + 1) / sunStops.length) * 100)}% through the arc</span>
          </div>
        </div>

        <div className="toolbar">
          <ToolbarButton onClick={() => insertSnippet('—')}>Insert dash</ToolbarButton>
          <ToolbarButton onClick={() => insertSnippet('**bold**')}>Bold</ToolbarButton>
          <ToolbarButton onClick={() => insertSnippet('`code`')}>Code</ToolbarButton>
          <ToolbarButton onClick={() => setText(starterText)}>Reset</ToolbarButton>
        </div>

        <div className="editor-grid">
          <label className="editor-wrap">
            <span className="label">Editor</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck="false"
              placeholder="Start typing..."
            />
          </label>

          <aside className="preview-wrap">
            <span className="label">Live preview</span>
            <article className="preview">
              {text.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </article>

            <div className="stats">
              <div><span>Chars</span><strong>{stats.chars}</strong></div>
              <div><span>Words</span><strong>{stats.words}</strong></div>
              <div><span>Lines</span><strong>{stats.lines}</strong></div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
