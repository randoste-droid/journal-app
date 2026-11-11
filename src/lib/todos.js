import { dayKey, keyToDate } from './dates.js'

export const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]
const RANK = { high: 0, normal: 1, low: 2 }

export const BUCKETS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Next 7 days' },
  { value: 'later', label: 'Later' },
  { value: 'none', label: 'No date' },
]

// Older todos may be missing newer fields.
export const normalizeTodo = (t) => ({
  priority: 'normal',
  due: '',
  notes: '',
  createdAt: 0,
  completedAt: null,
  ...t,
  tags: t.tags ?? [],
})

// "Call mom #family #weekend" -> { text: "Call mom", tags: ["family", "weekend"] }
export function parseTags(input) {
  const tags = []
  const text = input
    .replace(/(^|\s)#([\w-]+)/g, (_, space, tag) => {
      tags.push(tag.toLowerCase())
      return space
    })
    .replace(/\s+/g, ' ')
    .trim()
  return { text, tags: [...new Set(tags)] }
}

export function bucketOf(todo) {
  if (!todo.due) return 'none'
  const diff = Math.round((keyToDate(todo.due) - keyToDate(dayKey(Date.now()))) / 86_400_000)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'upcoming'
  return 'later'
}

const byPriority = (a, b) => RANK[a.priority] - RANK[b.priority]
const byDue = (a, b) => (a.due === b.due ? 0 : !a.due ? 1 : !b.due ? -1 : a.due.localeCompare(b.due))

export const SORTS = {
  smart: { label: 'Smart groups', fn: (a, b) => byPriority(a, b) || byDue(a, b) || a.createdAt - b.createdAt },
  due: { label: 'Due date', fn: (a, b) => byDue(a, b) || byPriority(a, b) },
  priority: { label: 'Priority', fn: (a, b) => byPriority(a, b) || byDue(a, b) },
  newest: { label: 'Newest first', fn: (a, b) => b.createdAt - a.createdAt },
}
