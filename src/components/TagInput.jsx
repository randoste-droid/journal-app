import { useId, useState } from 'react'
import { XIcon } from './Icons.jsx'

const normalize = (raw) => raw.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-')

export default function TagInput({ tags, onChange, suggestions = [] }) {
  const [text, setText] = useState('')
  const listId = useId()

  function commit(raw = text) {
    const tag = normalize(raw)
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setText('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !text && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input">
      {tags.map((tag) => (
        <span className="chip" key={tag}>
          #{tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <XIcon size={12} />
          </button>
        </span>
      ))}
      <input
        value={text}
        list={listId}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => text && commit()}
        placeholder={tags.length ? 'Add another…' : 'work, family, gratitude…'}
        aria-label="Add tag"
      />
      <datalist id={listId}>
        {suggestions.filter((s) => !tags.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  )
}
