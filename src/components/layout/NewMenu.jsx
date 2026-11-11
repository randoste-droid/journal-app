import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/data.js'
import { BookIcon, CalendarIcon, ListIcon, PlusIcon } from '../Icons.jsx'

export default function NewMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { createEntry } = useData()

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  function newEntry() {
    setOpen(false)
    navigate(`/journal/${createEntry()}`)
  }

  function newTask() {
    setOpen(false)
    navigate('/todo', { state: { focusNew: Date.now() } })
  }

  function newEvent() {
    setOpen(false)
    navigate('/calendar', { state: { newEvent: Date.now() } })
  }

  return (
    <div className="new-menu" ref={ref}>
      <button className="new-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="new-btn-icon"><PlusIcon size={16} strokeWidth={2.5} /></span>
        New
      </button>
      {open && (
        <div className="menu" role="menu">
          <button role="menuitem" onClick={newEntry}>
            <BookIcon size={16} />
            <span>Journal entry</span>
          </button>
          <button role="menuitem" onClick={newTask}>
            <ListIcon size={16} />
            <span>Task</span>
          </button>
          <button role="menuitem" onClick={newEvent}>
            <CalendarIcon size={16} />
            <span>Event</span>
          </button>
        </div>
      )}
    </div>
  )
}
