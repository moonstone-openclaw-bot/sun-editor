import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'sun-notes-draft'

const starterText = `# Untitled

Write something beautiful.
`

function loadSavedText() {
  if (typeof window === 'undefined') return starterText
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? starterText
  } catch {
    return starterText
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
  const [text, setText] = useState(loadSavedText)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    saveText(text)
    setSavedAt(new Date())
  }, [text])

  const stats = useMemo(() => ({
    chars: text.length,
    words: countWords(text),
    lines: countLines(text),
  }), [text])

  const insertSnippet = (snippet) => {
    setText((current) => `${current}${current.endsWith('\n') ? '' : '\n'}${snippet}`)
  }

  return (
    <main className="app shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="editor-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">Preview Routine</p>
            <h1>Pretty Text Editor</h1>
            <p className="subtitle">Simple, calm, and actually persistent.</p>
          </div>
          <div className="save-pill" aria-live="polite">{formatStatus(savedAt)}</div>
        </header>

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
