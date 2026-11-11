import { useEffect, useRef } from 'react'
import { fullDate, formatTime, relativeTime } from '../../lib/dates.js'
import { wordCount } from '../../lib/entries.js'
import { ArrowLeftIcon, SmileIcon, TagIcon, TrashIcon, ZapIcon } from '../Icons.jsx'
import { EnergyPicker, MoodPicker } from '../MoodPicker.jsx'
import TagInput from '../TagInput.jsx'

const PROMPTS = [
  "What's on your mind today?",
  'What made you smile today?',
  'What are you grateful for?',
  'What is one thing you learned today?',
  'How did today feel, honestly?',
]

export default function EntryEditor({ entry, allTags, onChange, onDelete, onBack }) {
  const bodyRef = useRef(null)
  const titleRef = useRef(null)
  const isNew = !entry.title && !entry.text
  const words = wordCount(entry.text)
  const prompt = PROMPTS[new Date(entry.createdAt).getDate() % PROMPTS.length]

  // Focus the title on a brand-new entry.
  useEffect(() => {
    if (isNew) titleRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-grow the body to fit its content.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [entry.text])

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button className="icon-btn back-btn" aria-label="Back to entries" onClick={onBack}>
          <ArrowLeftIcon size={18} />
        </button>
        <span className="crumb">
          Journal <span className="crumb-sep">/</span> <span className="crumb-current">{entry.title || 'Untitled'}</span>
        </span>
        <span className="save-state">{entry.updatedAt ? `Saved · edited ${relativeTime(entry.updatedAt)}` : 'Saved'}</span>
        <button className="icon-btn danger" aria-label="Delete entry" title="Delete entry" onClick={onDelete}>
          <TrashIcon size={17} />
        </button>
      </div>

      <div className="editor-scroll">
        <article className="editor-doc">
          <p className="editor-date">
            {fullDate(entry.createdAt)} · {formatTime(entry.createdAt)}
          </p>
          <input
            ref={titleRef}
            className="editor-title"
            value={entry.title}
            onChange={(e) => onChange({ title: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), bodyRef.current?.focus())}
            placeholder="Title"
            aria-label="Title"
          />

          <div className="props">
            <div className="prop">
              <span className="prop-label"><SmileIcon size={15} /> Mood</span>
              <MoodPicker value={entry.mood} onChange={(mood) => onChange({ mood })} />
            </div>
            <div className="prop">
              <span className="prop-label"><ZapIcon size={15} /> Energy</span>
              <EnergyPicker value={entry.energy} onChange={(energy) => onChange({ energy })} />
            </div>
            <div className="prop">
              <span className="prop-label"><TagIcon size={15} /> Tags</span>
              <TagInput tags={entry.tags} onChange={(tags) => onChange({ tags })} suggestions={allTags} />
            </div>
          </div>

          <textarea
            ref={bodyRef}
            className="editor-body"
            value={entry.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder={prompt}
            aria-label="Entry text"
          />
        </article>
      </div>

      <div className="editor-status">
        <span>{words} {words === 1 ? 'word' : 'words'}</span>
        <span>Changes save automatically</span>
      </div>
    </div>
  )
}
