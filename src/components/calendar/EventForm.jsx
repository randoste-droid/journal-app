import { useEffect, useRef, useState } from 'react'
import { EVENT_KINDS } from '../../lib/events.js'
import { TrashIcon, XIcon } from '../Icons.jsx'

// Modal form for creating or editing a calendar event / appointment.
export default function EventForm({ event, isNew, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(event)
  const titleRef = useRef(null)
  const closeRef = useRef(onClose)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    titleRef.current?.focus()
    const esc = (e) => e.key === 'Escape' && closeRef.current()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [])

  const endBeforeStart = !draft.allDay && draft.start && draft.end && draft.end <= draft.start
  const canSave = draft.title.trim() && draft.date && !endBeforeStart

  function submit(e) {
    e.preventDefault()
    if (!canSave) return
    onSave({ ...draft, title: draft.title.trim(), location: draft.location.trim() })
  }

  function setStart(start) {
    // Keep the duration sensible: if the new start passes the end, push the end out an hour.
    if (draft.end && start >= draft.end) {
      const [h, m] = start.split(':').map(Number)
      const end = h < 23 ? `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}` : '23:59'
      set({ start, end })
    } else set({ start })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" role="dialog" aria-modal="true" aria-label={isNew ? 'New event' : 'Edit event'} onSubmit={submit}>
        <div className="modal-head">
          <h2>{isNew ? 'New event' : 'Edit event'}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <input
          ref={titleRef}
          className="details-title"
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Title"
          aria-label="Title"
        />

        <div className="field">
          <span className="field-label">Type</span>
          <div className="segmented small" role="radiogroup" aria-label="Type">
            {EVENT_KINDS.map((k) => (
              <button
                type="button"
                key={k.value}
                role="radio"
                aria-checked={draft.kind === k.value}
                className={draft.kind === k.value ? 'selected' : ''}
                onClick={() => set({ kind: k.value })}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" className="text-input" value={draft.date} onChange={(e) => set({ date: e.target.value })} required />
          </label>
          <label className="toggle">
            <input type="checkbox" checked={draft.allDay} onChange={(e) => set({ allDay: e.target.checked })} />
            All day
          </label>
        </div>

        {!draft.allDay && (
          <div className="form-row">
            <label className="field">
              <span className="field-label">Starts</span>
              <input type="time" className="text-input" value={draft.start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Ends</span>
              <input type="time" className="text-input" value={draft.end} onChange={(e) => set({ end: e.target.value })} />
            </label>
          </div>
        )}
        {endBeforeStart && <p className="form-error">End time must be after the start time.</p>}

        <label className="field">
          <span className="field-label">Location</span>
          <input
            className="text-input"
            value={draft.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="Optional"
          />
        </label>

        <label className="field">
          <span className="field-label">Notes</span>
          <textarea
            className="details-notes"
            value={draft.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Optional"
            rows={3}
          />
        </label>

        <div className="details-footer">
          {!isNew ? (
            <button type="button" className="btn btn-secondary btn-danger" onClick={onDelete}>
              <TrashIcon size={14} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!canSave}>
              {isNew ? 'Add event' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
