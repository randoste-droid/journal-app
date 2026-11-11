import { useEffect, useMemo, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { ThemeContext } from './theme.js'

const query = '(prefers-color-scheme: dark)'

export function ThemeProvider({ children }) {
  const [pref, setPref] = useLocalStorage('theme', 'system')
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#1e1e1e' : '#ffffff')
  }, [resolved])

  const value = useMemo(() => ({ pref, setPref, resolved }), [pref, setPref, resolved])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
