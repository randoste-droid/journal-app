export const MOODS = [
  { value: 1, label: 'Awful', emoji: '😣', color: 'var(--mood-1)' },
  { value: 2, label: 'Low', emoji: '😕', color: 'var(--mood-2)' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'var(--mood-3)' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'var(--mood-4)' },
  { value: 5, label: 'Great', emoji: '😄', color: 'var(--mood-5)' },
]

export const ENERGY = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

export const getMood = (value) => MOODS.find((m) => m.value === value) ?? null
export const getEnergy = (value) => ENERGY.find((e) => e.value === value) ?? null

// Map an average (1–5) to the nearest mood.
export const nearestMood = (avg) => (avg == null ? null : getMood(Math.round(avg)))
