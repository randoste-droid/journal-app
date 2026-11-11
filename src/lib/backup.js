import { dayKey } from './dates.js'
import { cleanEvent, validEvent } from './events.js'

const APP = 'daybook'
const VERSION = 1

export function buildBackup(entries, todos, events = []) {
  return { app: APP, version: VERSION, exportedAt: new Date().toISOString(), entries, todos, events }
}

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const backupFilename = () => `daybook-backup-${dayKey(Date.now())}.json`

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const validEntry = (e) => isObj(e) && typeof e.id === 'string' && typeof e.createdAt === 'number'
const validTodo = (t) => isObj(t) && typeof t.id === 'string' && typeof t.text === 'string'

const cleanEntry = (e) => ({
  id: e.id,
  createdAt: e.createdAt,
  ...(typeof e.updatedAt === 'number' && { updatedAt: e.updatedAt }),
  title: typeof e.title === 'string' ? e.title : '',
  text: typeof e.text === 'string' ? e.text : '',
  mood: Number.isInteger(e.mood) && e.mood >= 1 && e.mood <= 5 ? e.mood : null,
  energy: Number.isInteger(e.energy) && e.energy >= 1 && e.energy <= 3 ? e.energy : null,
  tags: Array.isArray(e.tags) ? e.tags.filter((t) => typeof t === 'string') : [],
})

const cleanTodo = (t) => ({
  id: t.id,
  text: t.text,
  done: Boolean(t.done),
  priority: ['low', 'normal', 'high'].includes(t.priority) ? t.priority : 'normal',
  due: typeof t.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.due) ? t.due : '',
  notes: typeof t.notes === 'string' ? t.notes : '',
  tags: Array.isArray(t.tags) ? t.tags.filter((x) => typeof x === 'string') : [],
  createdAt: typeof t.createdAt === 'number' ? t.createdAt : 0,
  completedAt: typeof t.completedAt === 'number' ? t.completedAt : null,
})

// Parse and validate a backup file's text. Throws with a readable message on bad input.
export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("That file isn't valid JSON.")
  }
  if (!isObj(data) || (!Array.isArray(data.entries) && !Array.isArray(data.todos) && !Array.isArray(data.events))) {
    throw new Error("That file doesn't look like a Daybook backup.")
  }
  const rawEntries = Array.isArray(data.entries) ? data.entries : []
  const rawTodos = Array.isArray(data.todos) ? data.todos : []
  const rawEvents = Array.isArray(data.events) ? data.events : []
  const entries = rawEntries.filter(validEntry).map(cleanEntry)
  const todos = rawTodos.filter(validTodo).map(cleanTodo)
  const events = rawEvents.filter(validEvent).map(cleanEvent)
  const skipped =
    rawEntries.length - entries.length + (rawTodos.length - todos.length) + (rawEvents.length - events.length)
  return { entries, todos, events, skipped }
}

const stamp = (item) => item.updatedAt ?? item.completedAt ?? item.createdAt ?? 0

// Merge by id: new items are added; for items in both, the more recently changed copy wins.
export function mergeById(current, incoming) {
  const byId = new Map(current.map((item) => [item.id, item]))
  let added = 0
  let updated = 0
  for (const item of incoming) {
    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      added++
    } else if (stamp(item) > stamp(existing)) {
      byId.set(item.id, item)
      updated++
    }
  }
  return { merged: [...byId.values()], added, updated }
}
