import { useNavigate } from 'react-router-dom'
import { useData } from '../../store/data.js'
import { MenuIcon, PlusIcon } from '../Icons.jsx'

export default function MobileBar({ section, onMenu }) {
  const navigate = useNavigate()
  const { createEntry } = useData()
  const isTodo = section === 'todo'
  const isCal = section === 'calendar'
  const title = isTodo ? 'Tasks' : isCal ? 'Calendar' : 'Journal'

  function onNew() {
    if (isTodo) navigate('/todo', { state: { focusNew: Date.now() } })
    else if (isCal) navigate('/calendar', { state: { newEvent: Date.now() } })
    else navigate(`/journal/${createEntry()}`)
  }

  return (
    <header className="mobile-bar">
      <button className="icon-btn" aria-label="Open menu" onClick={onMenu}>
        <MenuIcon size={20} />
      </button>
      <span className="mobile-title">{title}</span>
      <button className="icon-btn accent" aria-label={isTodo ? 'New task' : isCal ? 'New event' : 'New entry'} onClick={onNew}>
        <PlusIcon size={20} />
      </button>
    </header>
  )
}
