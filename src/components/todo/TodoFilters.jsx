import { PRIORITIES, SORTS } from '../../lib/todos.js'
import { AlertIcon, ChevronDownIcon, ClockIcon, FlagIcon, InboxIcon, SearchIcon, SunIcon, XIcon } from '../Icons.jsx'

const TILES = [
  { value: 'overdue', label: 'Overdue', Icon: AlertIcon },
  { value: 'today', label: 'Due today', Icon: SunIcon },
  { value: 'upcoming', label: 'Next 7 days', Icon: ClockIcon },
  { value: 'none', label: 'No date', Icon: InboxIcon },
]

export function OverviewTiles({ counts, when, onChange }) {
  return (
    <div className="overview" role="group" aria-label="Filter by due date">
      {TILES.map(({ value, label, Icon }) => (
        <button
          key={value}
          className={`tile tile-${value}${when === value ? ' active' : ''}${counts[value] ? '' : ' zero'}`}
          aria-pressed={when === value}
          onClick={() => onChange(when === value ? null : value)}
        >
          <span className="tile-icon"><Icon size={16} /></span>
          <span className="tile-count">{counts[value]}</span>
          <span className="tile-label">{label}</span>
        </button>
      ))}
    </div>
  )
}

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
  { value: 'all', label: 'All' },
]

export function Toolbar({ view, patchView, statusCounts, query, setQuery, searchRef, allTags, isFiltered, onReset }) {
  return (
    <div className="todo-filters">
      <div className="todo-toolbar">
        <div className="tabs" role="tablist" aria-label="Status">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              role="tab"
              aria-selected={view.status === s.value}
              className={view.status === s.value ? 'active' : ''}
              onClick={() => patchView({ status: s.value })}
            >
              {s.label} <span className="count">{statusCounts[s.value]}</span>
            </button>
          ))}
        </div>
        <label className="sort">
          <span className="sort-label">Sort</span>
          <select value={view.sort} onChange={(e) => patchView({ sort: e.target.value })}>
            {Object.entries(SORTS).map(([value, s]) => (
              <option key={value} value={value}>{s.label}</option>
            ))}
          </select>
          <ChevronDownIcon size={14} />
        </label>
      </div>

      <div className="filter-row">
        <label className="search">
          <SearchIcon size={16} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
          />
          {query ? (
            <button className="icon-btn small" aria-label="Clear search" onClick={() => setQuery('')}>
              <XIcon size={14} />
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </label>
        <div className="chip-group" role="group" aria-label="Filter by priority">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              className={`filter-chip prio-${p.value}${view.priority === p.value ? ' active' : ''}`}
              aria-pressed={view.priority === p.value}
              onClick={() => patchView({ priority: view.priority === p.value ? null : p.value })}
            >
              {p.value === 'high' && <FlagIcon size={12} />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {(allTags.length > 0 || isFiltered) && (
        <div className="filter-row tags-row">
          {allTags.map((t) => (
            <button
              key={t}
              className={`filter-chip${view.tag === t ? ' active' : ''}`}
              aria-pressed={view.tag === t}
              onClick={() => patchView({ tag: view.tag === t ? null : t })}
            >
              #{t}
            </button>
          ))}
          {isFiltered && (
            <button className="link-btn reset" onClick={onReset}>
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
