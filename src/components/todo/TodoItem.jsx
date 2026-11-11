import { useEffect, useRef, useState } from 'react'
import { dueInfo, relativeTime } from '../../lib/dates.js'
import { CalendarIcon, CheckIcon, FlagIcon, NoteIcon, TrashIcon } from '../Icons.jsx'
import TagInput from '../TagInput.jsx'
import { DuePicker, PrioritySelect } from './TodoControls.jsx'

function TodoDetails({ todo, allTags, onUpdate, onDelete, onClose }) {
  const [text, setText] = useState(todo.text)

  function commitText() {
    const t = text.trim()
    if (t && t !== todo.text) onUpdate({ text: t })
    else setText(todo.text)
  }

  return (
    <div className="todo-details" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <input
        className="details-title"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Task name"
        autoFocus
      />
      <textarea
        className="details-notes"
        value={todo.notes}
        onChange={(e) => onUpdate({ notes: e.target.value })}
        placeholder="Add notes…"
        rows={2}
        aria-label="Notes"
      />
      <div className="details-grid">
        <div className="field">
          <span className="field-label">Priority</span>
          <PrioritySelect value={todo.priority} onChange={(priority) => onUpdate({ priority })} />
        </div>
        <div className="field">
          <span className="field-label">Due</span>
          <DuePicker value={todo.due} onChange={(due) => onUpdate({ due })} />
        </div>
        <div className="field wide">
          <span className="field-label">Tags</span>
          <TagInput tags={todo.tags} onChange={(tags) => onUpdate({ tags })} suggestions={allTags} />
        </div>
      </div>
      <div className="details-footer">
        <span className="hint">
          {todo.createdAt ? `Added ${relativeTime(todo.createdAt)}` : ''}
        </span>
        <div className="actions">
          <button type="button" className="btn btn-secondary btn-danger" onClick={onDelete}>
            <TrashIcon size={14} /> Delete
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TodoItem({ todo, expanded, allTags, onExpand, onToggleDone, onUpdate, onDelete }) {
  const [completing, setCompleting] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const checked = todo.done || completing
  const due = dueInfo(todo.due)
  const hasMeta = todo.done || due || todo.priority !== 'normal' || todo.tags.length > 0 || todo.notes

  function check() {
    if (todo.done) return onToggleDone()
    if (completing) return
    // Let the check + strike-through animation play before the task moves.
    setCompleting(true)
    timer.current = setTimeout(onToggleDone, 450)
  }

  const classes = ['todo', `priority-${todo.priority}`]
  if (todo.done) classes.push('done')
  if (completing) classes.push('completing')
  if (expanded) classes.push('expanded')

  return (
    <li className={classes.join(' ')}>
      <div className="todo-row">
        <button
          role="checkbox"
          aria-checked={checked}
          aria-label={todo.done ? `Mark "${todo.text}" as not done` : `Complete "${todo.text}"`}
          className="check"
          onClick={check}
        >
          <CheckIcon size={13} strokeWidth={3.2} />
        </button>
        <button className="todo-main" onClick={onExpand} aria-expanded={expanded}>
          <span className="todo-text-wrap">
            <span className="todo-text">{todo.text}</span>
          </span>
          {hasMeta && (
            <span className="todo-meta">
              {todo.done ? (
                <span className="meta-item completed-at">
                  <CheckIcon size={12} strokeWidth={3} /> Completed {relativeTime(todo.completedAt ?? Date.now())}
                </span>
              ) : (
                <>
                  {todo.priority === 'high' && (
                    <span className="meta-item priority-high-text">
                      <FlagIcon size={12} /> High
                    </span>
                  )}
                  {todo.priority === 'low' && <span className="meta-item faint">Low</span>}
                  {due && (
                    <span className={`meta-item due ${due.tone}`}>
                      <CalendarIcon size={12} /> {due.label}
                    </span>
                  )}
                </>
              )}
              {todo.notes && (
                <span className="meta-item faint" title="Has notes">
                  <NoteIcon size={12} />
                </span>
              )}
              {todo.tags.map((t) => (
                <span key={t} className="meta-tag">#{t}</span>
              ))}
            </span>
          )}
        </button>
        <button className="icon-btn danger row-delete" aria-label="Delete task" title="Delete" onClick={onDelete}>
          <TrashIcon size={16} />
        </button>
      </div>
      {expanded && (
        <TodoDetails todo={todo} allTags={allTags} onUpdate={onUpdate} onDelete={onDelete} onClose={onExpand} />
      )}
    </li>
  )
}
