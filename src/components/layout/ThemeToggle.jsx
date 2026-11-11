import { useTheme } from '../../theme/theme.js'
import { MonitorIcon, MoonIcon, SunIcon } from '../Icons.jsx'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
]

export default function ThemeToggle() {
  const { pref, setPref } = useTheme()
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={pref === value}
          className={pref === value ? 'active' : ''}
          onClick={() => setPref(value)}
          title={`${label} theme`}
        >
          <Icon size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
