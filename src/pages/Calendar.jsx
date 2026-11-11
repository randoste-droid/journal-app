import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import EventForm from '../components/calendar/EventForm.jsx'
import { ArrowLeftIcon, CheckIcon, ClockIcon, FlagIcon, PlusIcon } from '../components/Icons.jsx'
import { useToast } from '../components/toast.js'
import { dayKey, dayLabel, keyToDate, longDate } from '../lib/dates.js'
import { blankEvent, byTime, cleanEvent, dayNum, formatClock, monthGrid, sameMonth, timeRange } from '../lib/events.js'
import { normalizeTodo } from '../lib/todos.js'
import { useData } from '../store/data.js'

const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Date(2023, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'short' }),
)
const MAX_CHIPS = 3

const firstOfMonth = (key) => {
  const d = keyToDate(key)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default function Calendar() {
  const { todos: rawTodos, setTodos, events: rawEvents, setEvents } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const today = dayKey(Date.now())

  const [selected, setSelected] = useState(today)
  const [month, setMonth] = useState(() => firstOfMonth(today))
  const [editing, setEditing] = useState(null) // { event, isNew }

  const openNew = (date) => setEditing({ event: blankEvent(date), isNew: true })

  // "New → Event" from the sidebar / mobile bar opens the form (once per request).
  const newEvent = location.state?.newEvent
  const [handledNew, setHandledNew] = useState(null)
  if (newEvent && newEvent !== handledNew) {
    setHandledNew(newEvent)
    setEditing({ event: blankEvent(today), isNew: true })
  }
  // Drop the request from history so a refresh doesn't reopen the form.
  useEffect(() => {
    if (newEvent) navigate(location.pathname, { replace: true, state: null })
  }, [newEvent, navigate, location.pathname])

  const events = useMemo(() => rawEvents.map(cleanEvent), [rawEvents])
  const todos = useMemo(() => rawTodos.map(normalizeTodo).filter((t) => t.due), [rawTodos])

  // Group everything by day key.
  const byDay = useMemo(() => {
    const map = new Map()
    const bucket = (key) => map.get(key) ?? map.set(key, { events: [], tasks: [] }).get(key)
    for (const e of events) bucket(e.date).events.push(e)
    for (const t of todos) bucket(t.due).tasks.push(t)
    for (const v of map.values()) {
      v.events.sort(byTime)
      v.tasks.sort((a, b) => a.done - b.done || (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0))
    }
    return map
  }, [events, todos])

  const days = monthGrid(month)
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const sel = byDay.get(selected) ?? { events: [], tasks: [] }

  function select(key) {
    setSelected(key)
    if (!sameMonth(key, month)) setMonth(firstOfMonth(key))
  }
  const shiftMonth = (n) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))
  function goToday() {
    setSelected(today)
    setMonth(firstOfMonth(today))
  }

  // ---- Mutations ----
  function saveEvent(ev) {
    const isNew = editing?.isNew
    setEvents((prev) =>
      isNew ? [...prev, ev] : prev.map((e) => (e.id === ev.id ? { ...ev, updatedAt: Date.now() } : e)),
    )
    setEditing(null)
    select(ev.date)
    toast({ message: isNew ? 'Event added' : 'Event saved' })
  }

  function deleteEvent(ev) {
    setEvents((prev) => prev.filter((e) => e.id !== ev.id))
    setEditing(null)
    toast({ message: 'Event deleted', action: { label: 'Undo', onClick: () => setEvents((prev) => [...prev, ev]) } })
  }

  function toggleTask(task) {
    const done = !task.done
    setTodos((prev) => prev.map((t) => (t.id === task.id ? { ...t, done, completedAt: done ? Date.now() : null } : t)))
  }

  const openCount = sel.tasks.filter((t) => !t.done).length

  return (
    <div className="page">
      <div className="page-inner page-wide">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate()}</p>
            <h1 className="page-title">Calendar</h1>
            <p className="page-sub">Events, appointments and task due dates.</p>
          </div>
          <button className="btn btn-primary" onClick={() => openNew(selected)}>
            <PlusIcon size={16} /> New event
          </button>
        </header>

        <div className="cal-layout">
          <section className="card cal-month" aria-label={monthLabel}>
            <div className="cal-toolbar">
              <h2 className="cal-month-label">{monthLabel}</h2>
              <div className="cal-nav">
                <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
                <button className="icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
                  <ArrowLeftIcon size={18} />
                </button>
                <button className="icon-btn" aria-label="Next month" onClick={() => shiftMonth(1)}>
                  <ArrowLeftIcon size={18} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
            </div>

            <div className="cal-grid" role="grid">
              {WEEKDAYS.map((w) => (
                <div key={w} className="cal-weekday" role="columnheader">{w}</div>
              ))}
              {days.map((key) => {
                const info = byDay.get(key)
                const items = info
                  ? [
                      ...info.events.map((e) => ({ type: 'event', id: e.id, label: e.title, time: e.allDay ? '' : formatClock(e.start), kind: e.kind })),
                      ...info.tasks.map((t) => ({ type: 'task', id: t.id, label: t.text, done: t.done, high: t.priority === 'high' })),
                    ]
                  : []
                const overdue = key < today && info?.tasks.some((t) => !t.done)
                const classes = ['cal-day']
                if (!sameMonth(key, month)) classes.push('outside')
                if (key === today) classes.push('today')
                if (key === selected) classes.push('selected')
                return (
                  <button
                    key={key}
                    role="gridcell"
                    className={classes.join(' ')}
                    aria-selected={key === selected}
                    aria-label={`${dayLabel(key)}${items.length ? `, ${items.length} item${items.length === 1 ? '' : 's'}` : ''}`}
                    onClick={() => select(key)}
                    onDoubleClick={() => openNew(key)}
                  >
                    <span className="cal-num">{dayNum(key)}</span>
                    <span className="cal-chips">
                      {items.slice(0, MAX_CHIPS).map((it) => (
                        <span
                          key={it.id}
                          className={`cal-chip ${it.type}${it.kind ? ` ${it.kind}` : ''}${it.done ? ' done' : ''}${it.high && !it.done ? ' high' : ''}${overdue && it.type === 'task' && !it.done ? ' overdue' : ''}`}
                        >
                          {it.type === 'task' && <CheckIcon size={10} strokeWidth={3} />}
                          {it.time && <span className="cal-chip-time">{it.time}</span>}
                          <span className="cal-chip-label">{it.label}</span>
                        </span>
                      ))}
                      {items.length > MAX_CHIPS && <span className="cal-more">+{items.length - MAX_CHIPS} more</span>}
                    </span>
                    {items.length > 0 && (
                      <span className="cal-dots" aria-hidden="true">
                        {info.events.length > 0 && <i className="dot event" />}
                        {info.tasks.some((t) => !t.done) && <i className={`dot task${overdue ? ' overdue' : ''}`} />}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="card cal-day-panel" aria-label={`Agenda for ${dayLabel(selected)}`}>
            <div className="cal-panel-head">
              <div>
                <h2 className="cal-panel-title">{dayLabel(selected)}</h2>
                <p className="faint cal-panel-sub">
                  {sel.events.length + sel.tasks.length === 0
                    ? 'Nothing scheduled'
                    : [
                        sel.events.length && `${sel.events.length} event${sel.events.length === 1 ? '' : 's'}`,
                        sel.tasks.length && `${openCount} of ${sel.tasks.length} task${sel.tasks.length === 1 ? '' : 's'} open`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
              </div>
              <button className="icon-btn accent" aria-label="Add event on this day" title="Add event" onClick={() => openNew(selected)}>
                <PlusIcon size={18} />
              </button>
            </div>

            {sel.events.length > 0 && (
              <div className="cal-section">
                <h3 className="group-label">Events</h3>
                <ul className="agenda">
                  {sel.events.map((e) => (
                    <li key={e.id}>
                      <button className={`agenda-event ${e.kind}`} onClick={() => setEditing({ event: e, isNew: false })}>
                        <span className="agenda-time">
                          <ClockIcon size={12} /> {timeRange(e)}
                          {e.kind === 'appointment' && <span className="kind-pill">Appointment</span>}
                        </span>
                        <span className="agenda-title">{e.title || 'Untitled'}</span>
                        {e.location && <span className="agenda-meta">{e.location}</span>}
                        {e.notes && <span className="agenda-meta notes">{e.notes}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sel.tasks.length > 0 && (
              <div className="cal-section">
                <h3 className="group-label">Tasks due</h3>
                <ul className="agenda">
                  {sel.tasks.map((t) => (
                    <li key={t.id} className={`agenda-task priority-${t.priority}${t.done ? ' done' : ''}`}>
                      <button
                        role="checkbox"
                        aria-checked={t.done}
                        aria-label={t.done ? `Mark "${t.text}" as not done` : `Complete "${t.text}"`}
                        className="check"
                        onClick={() => toggleTask(t)}
                      >
                        <CheckIcon size={13} strokeWidth={3.2} />
                      </button>
                      <button className="agenda-task-text" onClick={() => navigate('/todo')} title="Open in Tasks">
                        {t.text}
                        {t.priority === 'high' && !t.done && <FlagIcon size={12} className="flag" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sel.events.length + sel.tasks.length === 0 && (
              <div className="empty compact">
                <p>Free day.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => openNew(selected)}>
                  <PlusIcon size={14} /> Add event
                </button>
              </div>
            )}
          </aside>
        </div>

        <p className="footnote">Double-click a day to add an event · tasks appear on their due dates</p>
      </div>

      {editing && (
        <EventForm
          key={editing.event.id}
          event={editing.event}
          isNew={editing.isNew}
          onSave={saveEvent}
          onDelete={() => deleteEvent(editing.event)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
