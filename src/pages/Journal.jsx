import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FlameIcon, PlusIcon, SearchIcon, XIcon } from '../components/Icons.jsx'
import EntryEditor from '../components/journal/EntryEditor.jsx'
import EntryListItem from '../components/journal/EntryListItem.jsx'
import JournalOverview from '../components/journal/JournalOverview.jsx'
import { useToast } from '../components/toast.js'
import { dayKey, dayLabel, streak } from '../lib/dates.js'
import { isBlankEntry, normalizeEntry } from '../lib/entries.js'
import { MOODS } from '../lib/moods.js'
import { useData } from '../store/data.js'

export default function Journal() {
  const { entries: rawEntries, setEntries, createEntry } = useData()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag')
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState(null)
  const toast = useToast()

  const entries = useMemo(
    () => rawEntries.map(normalizeEntry).sort((a, b) => b.createdAt - a.createdAt),
    [rawEntries],
  )
  const selected = id ? entries.find((e) => e.id === id) : null
  const saved = useMemo(() => entries.filter((e) => !isBlankEntry(e)), [entries])
  const allTags = useMemo(() => [...new Set(saved.flatMap((e) => e.tags))].sort(), [saved])

  // Discard untouched new entries once you move away from them.
  useEffect(() => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id === id || !isBlankEntry(e))
      return next.length === prev.length ? prev : next
    })
  }, [id, setEntries])

  // Unknown id (e.g. deleted entry) -> back to the list.
  useEffect(() => {
    if (id && !selected) navigate(`/journal${location.search}`, { replace: true })
  }, [id, selected, navigate, location.search])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter(
      (e) =>
        (e.id === id || !isBlankEntry(e)) &&
        (!moodFilter || e.mood === moodFilter) &&
        (!tag || e.tags.includes(tag)) &&
        (!q || e.title.toLowerCase().includes(q) || e.text.toLowerCase().includes(q) || e.tags.some((t) => t.includes(q))),
    )
  }, [entries, id, query, moodFilter, tag])

  const groups = useMemo(() => {
    const map = new Map()
    for (const e of visible) {
      const key = dayKey(e.createdAt)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return [...map]
  }, [visible])

  const currentStreak = useMemo(() => streak(saved.map((e) => e.createdAt)), [saved])
  const isFiltering = Boolean(query.trim() || moodFilter || tag)

  const open = (entryId) => navigate(`/journal/${entryId}${location.search}`)
  const newEntry = () => navigate(`/journal/${createEntry(tag ? { tags: [tag] } : {})}${location.search}`)

  function update(patch) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)))
  }

  function remove(entry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    navigate(`/journal${location.search}`)
    if (!isBlankEntry(entry)) {
      toast({ message: 'Entry deleted', action: { label: 'Undo', onClick: () => setEntries((prev) => [entry, ...prev]) } })
    }
  }

  function clearTag() {
    params.delete('tag')
    setParams(params)
  }

  function clearFilters() {
    setQuery('')
    setMoodFilter(null)
    clearTag()
  }

  return (
    <div className={`split${id ? ' show-detail' : ''}`}>
      <aside className="list-pane" aria-label="Journal entries">
        <header className="pane-header">
          <div>
            <h1 className="pane-title">{tag ? `#${tag}` : 'Journal'}</h1>
            <p className="pane-sub">
              {saved.length} {saved.length === 1 ? 'entry' : 'entries'}
              {currentStreak > 0 && (
                <span className="streak-pill" title="Day streak">
                  <FlameIcon size={12} /> {currentStreak}
                </span>
              )}
            </p>
          </div>
          <button className="btn btn-primary btn-sm desktop-only" onClick={newEntry}>
            <PlusIcon size={15} /> New
          </button>
        </header>

        <div className="pane-tools">
          <label className="search">
            <SearchIcon size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entries" aria-label="Search entries" />
            {query && (
              <button className="icon-btn small" aria-label="Clear search" onClick={() => setQuery('')}>
                <XIcon size={14} />
              </button>
            )}
          </label>
          <div className="mood-filter" role="group" aria-label="Filter by mood">
            {MOODS.map((m) => (
              <button
                key={m.value}
                className={`mood-filter-btn${moodFilter === m.value ? ' active' : ''}`}
                style={{ '--mood': m.color }}
                aria-pressed={moodFilter === m.value}
                title={`Only ${m.label}`}
                onClick={() => setMoodFilter(moodFilter === m.value ? null : m.value)}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          {isFiltering && (
            <div className="filter-summary">
              <span>{visible.length} {visible.length === 1 ? 'result' : 'results'}</span>
              {tag && (
                <span className="chip active">
                  #{tag}
                  <button aria-label="Clear tag filter" onClick={clearTag}><XIcon size={12} /></button>
                </span>
              )}
              <button className="link-btn" onClick={clearFilters}>Clear all</button>
            </div>
          )}
        </div>

        <div className="list-scroll">
          {saved.length === 0 && visible.length === 0 ? (
            <div className="empty">
              <div className="empty-art">📓</div>
              <p className="empty-title">No entries yet</p>
              <p>Start your first entry. A few lines is plenty.</p>
              <button className="btn btn-primary" onClick={newEntry}><PlusIcon size={15} /> New entry</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No matching entries</p>
              <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            groups.map(([key, items]) => (
              <section key={key} className="list-group">
                <h2 className="list-group-label">{dayLabel(key)}</h2>
                {items.map((entry) => (
                  <EntryListItem key={entry.id} entry={entry} selected={entry.id === id} onSelect={() => open(entry.id)} />
                ))}
              </section>
            ))
          )}
        </div>
      </aside>

      <section className="detail-pane">
        {selected ? (
          <EntryEditor
            key={selected.id}
            entry={selected}
            allTags={allTags}
            onChange={update}
            onDelete={() => remove(selected)}
            onBack={() => navigate(`/journal${location.search}`)}
          />
        ) : (
          <JournalOverview entries={saved} onNew={newEntry} />
        )}
      </section>
    </div>
  )
}
