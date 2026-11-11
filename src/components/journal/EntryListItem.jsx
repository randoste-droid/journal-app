import { formatTime } from '../../lib/dates.js'
import { snippet } from '../../lib/entries.js'
import { getMood } from '../../lib/moods.js'

export default function EntryListItem({ entry, selected, onSelect }) {
  const mood = getMood(entry.mood)
  const preview = snippet(entry.text)
  return (
    <button
      className={`entry-item${selected ? ' selected' : ''}`}
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      style={{ '--mood': mood?.color ?? 'transparent' }}
    >
      <span className="entry-item-head">
        <span className={`entry-item-title${entry.title ? '' : ' untitled'}`}>{entry.title || 'Untitled'}</span>
        {mood && <span className="entry-item-mood" title={mood.label}>{mood.emoji}</span>}
      </span>
      {preview && <span className="entry-item-snippet">{preview}</span>}
      <span className="entry-item-foot">
        <span>{formatTime(entry.createdAt)}</span>
        {entry.tags.slice(0, 3).map((t) => (
          <span key={t} className="entry-item-tag">#{t}</span>
        ))}
        {entry.tags.length > 3 && <span className="entry-item-tag">+{entry.tags.length - 3}</span>}
      </span>
    </button>
  )
}
