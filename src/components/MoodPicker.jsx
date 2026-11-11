import { ENERGY, MOODS } from '../lib/moods.js'

export function MoodPicker({ value, onChange }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Mood">
      {MOODS.map((m) => {
        const selected = value === m.value
        return (
          <button
            type="button"
            key={m.value}
            role="radio"
            aria-checked={selected}
            className={`mood-option${selected ? ' selected' : ''}`}
            style={{ '--mood': m.color }}
            onClick={() => onChange(selected ? null : m.value)}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function EnergyPicker({ value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Energy">
      {ENERGY.map((e) => {
        const selected = value === e.value
        return (
          <button
            type="button"
            key={e.value}
            role="radio"
            aria-checked={selected}
            className={selected ? 'selected' : ''}
            onClick={() => onChange(selected ? null : e.value)}
          >
            <span className="energy-bars" data-level={e.value} aria-hidden="true">
              <i /><i /><i />
            </span>
            {e.label}
          </button>
        )
      })}
    </div>
  )
}
