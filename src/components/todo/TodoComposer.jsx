import { useState } from 'react'
import { parseTags } from '../../lib/todos.js'
import { PlusIcon } from '../Icons.jsx'
import { DuePicker, PrioritySelect } from './TodoControls.jsx'

export default function TodoComposer({ onAdd, inputRef }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('normal')
  const [due, setDue] = useState('')
  const parsed = parseTags(text)

  function submit(e) {
    e.preventDefault()
    if (!parsed.text) return
    onAdd({ text: parsed.text, tags: parsed.tags, priority, due })
    setText('')
    setPriority('normal')
    setDue('')
    inputRef.current?.focus()
  }

  return (
    <form className="card add-todo" onSubmit={submit}>
      <div className="add-todo-row">
        <span className="add-icon" aria-hidden="true">
          <PlusIcon size={16} />
        </span>
        <input
          ref={inputRef}
          className="add-todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task… use #tags to organize"
          aria-label="New task"
        />
      </div>
      <div className="add-todo-bar">
        <PrioritySelect value={priority} onChange={setPriority} />
        <DuePicker value={due} onChange={setDue} />
        {parsed.tags.length > 0 && (
          <div className="tag-preview">
            {parsed.tags.map((t) => (
              <span key={t} className="chip active">#{t}</span>
            ))}
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={!parsed.text}>
          Add task
        </button>
      </div>
    </form>
  )
}
