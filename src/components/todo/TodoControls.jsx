import { dateShortcut } from '../../lib/dates.js'
import { PRIORITIES } from '../../lib/todos.js'
import { CalendarIcon, FlagIcon, XIcon } from '../Icons.jsx'

export function PrioritySelect({ value, onChange }) {
  return (
    <div className="segmented small" role="radiogroup" aria-label="Priority">
      {PRIORITIES.map((p) => (
        <button
          type="button"
          key={p.value}
          role="radio"
          aria-checked={value === p.value}
          className={value === p.value ? `selected prio-${p.value}` : ''}
          onClick={() => onChange(p.value)}
        >
          {p.value === 'high' && <FlagIcon size={12} />}
          {p.label}
        </button>
      ))}
    </div>
  )
}

const QUICK_DATES = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
]

export function DuePicker({ value, onChange }) {
  const quickKeys = QUICK_DATES.map((q) => dateShortcut(q.days))
  const isCustom = value && !quickKeys.includes(value)
  return (
    <div className="due-picker">
      {QUICK_DATES.map((q, i) => (
        <button
          type="button"
          key={q.label}
          className={`quick-chip${value === quickKeys[i] ? ' active' : ''}`}
          aria-pressed={value === quickKeys[i]}
          onClick={() => onChange(value === quickKeys[i] ? '' : quickKeys[i])}
        >
          {q.label}
        </button>
      ))}
      <label className={`date-field${isCustom ? ' has-value' : ''}`} title="Pick a date">
        <CalendarIcon size={14} />
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Due date" />
      </label>
      {value && (
        <button type="button" className="icon-btn small" aria-label="Clear due date" onClick={() => onChange('')}>
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}
