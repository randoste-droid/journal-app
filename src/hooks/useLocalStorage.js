import { useEffect, useState } from 'react'

// useState that persists to localStorage under the given key.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode, quota) — keep in-memory state
    }
  }, [key, value])

  return [value, setValue]
}
