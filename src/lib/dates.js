const pad = (n) => String(n).padStart(2, '0')

export function dayKey(input) {
  const d = new Date(input)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const daysBetween = (fromKey, toKey) =>
  Math.round((keyToDate(toKey) - keyToDate(fromKey)) / 86_400_000)

export function dayLabel(key) {
  const diff = daysBetween(key, dayKey(Date.now()))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  const date = keyToDate(key)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

export const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export const longDate = (ts = Date.now()) =>
  new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

// Consecutive days with at least one entry, counting back from today (or yesterday).
export function streak(timestamps) {
  const days = new Set(timestamps.map(dayKey))
  let d = new Date()
  if (!days.has(dayKey(d))) d = addDays(d, -1)
  let count = 0
  while (days.has(dayKey(d))) {
    count++
    d = addDays(d, -1)
  }
  return count
}

// Human label + tone for a todo due date ("YYYY-MM-DD").
export function dueInfo(due, done = false) {
  if (!due) return null
  const diff = daysBetween(dayKey(Date.now()), due)
  const date = keyToDate(due)
  const short = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (diff < 0) return { label: done ? short : `Overdue · ${short}`, tone: done ? '' : 'overdue' }
  if (diff === 0) return { label: 'Today', tone: done ? '' : 'soon' }
  if (diff === 1) return { label: 'Tomorrow', tone: '' }
  if (diff < 7) return { label: date.toLocaleDateString(undefined, { weekday: 'long' }), tone: '' }
  return { label: short, tone: '' }
}

// "just now", "5m ago", "3h ago", "yesterday", "Nov 3"
export function relativeTime(ts) {
  const minutes = Math.round((Date.now() - ts) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (dayKey(ts) === dayKey(Date.now())) return `${Math.round(minutes / 60)}h ago`
  if (dayKey(ts) === dayKey(addDays(new Date(), -1))) return 'yesterday'
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const dateShortcut = (days) => dayKey(addDays(new Date(), days))

export const fullDate = (ts) =>
  new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

export const shortDate = (ts) => {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}
