import { useCallback, useEffect, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { blankEntry } from '../lib/entries.js'
import { DataContext } from './data.js'

// Single source of truth for journal entries and todos, so the sidebar,
// pages and counts always stay in sync.
export function DataProvider({ children }) {
  const [entries, setEntries] = useLocalStorage('journal-entries', [])
  const [todos, setTodos] = useLocalStorage('todos', [])

  // One-time migration: the old composer kept an unsaved draft separately.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('journal-draft')
      if (!raw) return
      localStorage.removeItem('journal-draft')
      const draft = JSON.parse(raw)
      if (draft && (draft.text?.trim() || draft.title?.trim())) {
        setEntries((prev) => [{ ...blankEntry(), ...draft }, ...prev])
      }
    } catch {
      // ignore malformed drafts
    }
  }, [setEntries])

  const createEntry = useCallback(
    (fields = {}) => {
      const entry = { ...blankEntry(), ...fields }
      setEntries((prev) => [entry, ...prev])
      return entry.id
    },
    [setEntries],
  )

  const value = useMemo(
    () => ({ entries, setEntries, todos, setTodos, createEntry }),
    [entries, setEntries, todos, setTodos, createEntry],
  )
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
