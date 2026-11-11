import { createContext, useContext } from 'react'

export const ThemeContext = createContext({ pref: 'system', resolved: 'light', setPref: () => {} })
export const useTheme = () => useContext(ThemeContext)
