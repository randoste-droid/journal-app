export const blankEntry = () => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  title: '',
  text: '',
  mood: null,
  energy: null,
  tags: [],
})

const DEFAULTS = { title: '', text: '', mood: null, energy: null }

// Older entries may be missing newer fields.
export const normalizeEntry = (e) => ({ ...DEFAULTS, ...e, tags: e.tags ?? [] })

export const isBlankEntry = (e) => !e.title?.trim() && !e.text?.trim() && !e.mood && !e.energy

export const snippet = (text, max = 160) => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

export const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)
