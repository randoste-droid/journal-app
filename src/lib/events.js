import { addDays, dayKey, keyToDate } from './dates.js'

export const EVENT_KINDS = [
  { value: 'event', label: 'Event' },
  { value: 'appointment', label: 'Appointment' },
]

const TIME_RE = /^\d{2}:\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const blankEvent = (date = dayKey(Date.now())) => ({
  id: crypto.randomUUID(),
  title: '',
  kind: 'event',
  date,
  allDay: false,
  start: '09:00',
  end: '10:00',
  location: '',
  notes: '',
  createdAt: Date.now(),
})

// Validates and fills defaults; used for stored data and backup imports.
export function cleanEvent(e) {
  return {
    id: e.id,
    title: typeof e.title === 'string' ? e.title : '',
    kind: EVENT_KINDS.some((k) => k.value === e.kind) ? e.kind : 'event',
    date: e.date,
    allDay: Boolean(e.allDay),
    start: typeof e.start === 'string' && TIME_RE.test(e.start) ? e.start : '',
    end: typeof e.end === 'string' && TIME_RE.test(e.end) ? e.end : '',
    location: typeof e.location === 'string' ? e.location : '',
    notes: typeof e.notes === 'string' ? e.notes : '',
    createdAt: typeof e.createdAt === 'number' ? e.createdAt : 0,
    ...(typeof e.updatedAt === 'number' && { updatedAt: e.updatedAt }),
  }
}

export const validEvent = (e) =>
  e !== null && typeof e === 'object' && typeof e.id === 'string' && typeof e.date === 'string' && DATE_RE.test(e.date)

// "14:30" -> "2:30 PM" in the user's locale.
export function formatClock(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function timeRange(ev) {
  if (ev.allDay || !ev.start) return 'All day'
  return ev.end && ev.end > ev.start ? `${formatClock(ev.start)} – ${formatClock(ev.end)}` : formatClock(ev.start)
}

// All-day first, then by start time.
export const byTime = (a, b) =>
  (b.allDay || !b.start) - (a.allDay || !a.start) || (a.start || '').localeCompare(b.start || '') || a.title.localeCompare(b.title)

// 6-week grid of day keys for the month containing `month` (a Date), weeks starting Sunday.
export function monthGrid(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => dayKey(addDays(start, i)))
}

export const monthKey = (key) => key.slice(0, 7)
export const sameMonth = (key, month) => monthKey(key) === dayKey(month).slice(0, 7)
export const dayNum = (key) => keyToDate(key).getDate()
