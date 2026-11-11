import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { normalizeEntry, isBlankEntry } from '../../lib/entries.js'
import { dayKey } from '../../lib/dates.js'
import { bucketOf, normalizeTodo } from '../../lib/todos.js'
import { useData } from '../../store/data.js'
import { BookIcon, CalendarIcon, ListIcon, TagIcon, XIcon } from '../Icons.jsx'
import NewMenu from './NewMenu.jsx'
import BackupControls from './BackupControls.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function Sidebar({ open, onClose }) {
  const { entries, todos, events } = useData()
  const location = useLocation()
  const activeTag = new URLSearchParams(location.search).get('tag')

  const { entryCount, tags } = useMemo(() => {
    const real = entries.map(normalizeEntry).filter((e) => !isBlankEntry(e))
    const counts = new Map()
    for (const e of real) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return { entryCount: real.length, tags: [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) }
  }, [entries])

  const { openCount, overdue } = useMemo(() => {
    const active = todos.map(normalizeTodo).filter((t) => !t.done)
    return { openCount: active.length, overdue: active.filter((t) => bucketOf(t) === 'overdue').length }
  }, [todos])

  const todayEvents = useMemo(() => {
    const today = dayKey(Date.now())
    return events.filter((e) => e.date === today).length
  }, [events])

  return (
    <>
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Main navigation">
        <div className="sb-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Daybook</span>
          <button className="sb-close icon-btn" aria-label="Close menu" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <NewMenu />

        <nav className="sb-nav">
          <NavLink to="/journal" className={({ isActive }) => `sb-link${isActive && !activeTag ? ' active' : ''}`}>
            <BookIcon size={17} />
            <span>Journal</span>
            <span className="sb-count">{entryCount || ''}</span>
          </NavLink>
          <NavLink to="/todo" className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
            <ListIcon size={17} />
            <span>Tasks</span>
            {overdue > 0 ? (
              <span className="sb-badge" title={`${overdue} overdue`}>{overdue}</span>
            ) : (
              <span className="sb-count">{openCount || ''}</span>
            )}
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}>
            <CalendarIcon size={17} />
            <span>Calendar</span>
            <span className="sb-count" title={todayEvents ? `${todayEvents} today` : undefined}>{todayEvents || ''}</span>
          </NavLink>
        </nav>

        {tags.length > 0 && (
          <div className="sb-section">
            <div className="sb-heading">Tags</div>
            <div className="sb-tags">
              {tags.slice(0, 12).map(([tag, n]) => (
                <NavLink
                  key={tag}
                  to={`/journal?tag=${encodeURIComponent(tag)}`}
                  className={() => `sb-link sb-tag${activeTag === tag ? ' active' : ''}`}
                >
                  <TagIcon size={14} />
                  <span>{tag}</span>
                  <span className="sb-count">{n}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="sb-footer">
          <BackupControls />
          <ThemeToggle />
        </div>
      </aside>
      <div className={`scrim${open ? ' show' : ''}`} onClick={onClose} aria-hidden="true" />
    </>
  )
}
