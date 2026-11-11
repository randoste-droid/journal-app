import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDownIcon } from '../components/Icons.jsx'
import { useToast } from '../components/toast.js'
import TodoComposer from '../components/todo/TodoComposer.jsx'
import { OverviewTiles, Toolbar } from '../components/todo/TodoFilters.jsx'
import TodoItem from '../components/todo/TodoItem.jsx'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { dayKey, longDate } from '../lib/dates.js'
import { BUCKETS, SORTS, bucketOf, normalizeTodo } from '../lib/todos.js'
import { useData } from '../store/data.js'

const DEFAULT_VIEW = { status: 'active', when: null, priority: null, tag: null, sort: 'smart', showDone: true }

export default function Todo() {
  const { todos: rawTodos, setTodos } = useData()
  const [savedView, setView] = useLocalStorage('todo-view', DEFAULT_VIEW)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const addRef = useRef(null)
  const searchRef = useRef(null)
  const toast = useToast()
  const location = useLocation()
  const focusNew = location.state?.focusNew

  // "New task" from the sidebar / mobile bar focuses the add field.
  useEffect(() => {
    if (focusNew) addRef.current?.focus()
  }, [focusNew])

  const view = { ...DEFAULT_VIEW, ...savedView }
  const patchView = (patch) => setView((prev) => ({ ...DEFAULT_VIEW, ...prev, ...patch }))

  // "/" focuses search, "n" focuses the new-task field.
  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'n') { e.preventDefault(); addRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const todos = useMemo(() => rawTodos.map(normalizeTodo), [rawTodos])
  const active = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)
  const allTags = useMemo(() => [...new Set(todos.flatMap((t) => t.tags))].sort(), [todos])

  const bucketCounts = Object.fromEntries(BUCKETS.map((b) => [b.value, 0]))
  for (const t of active) bucketCounts[bucketOf(t)]++

  const q = query.trim().toLowerCase()
  const matches = (t) =>
    (!view.when || bucketOf(t) === view.when) &&
    (!view.priority || t.priority === view.priority) &&
    (!view.tag || t.tags.includes(view.tag)) &&
    (!q || t.text.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)))
  const isFiltered = Boolean(q || view.when || view.priority || view.tag)

  const visibleActive = active.filter(matches).sort(SORTS[view.sort].fn)
  const visibleDone = done.filter(matches).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
  const showActive = view.status !== 'done'
  const showDoneSection = view.status !== 'active'
  const doneOpen = view.status === 'done' || view.showDone

  const progress = todos.length ? Math.round((done.length / todos.length) * 100) : 0
  const today = dayKey(Date.now())
  const doneToday = done.filter((t) => t.completedAt && dayKey(t.completedAt) === today).length

  // ---- Mutations ----
  const update = (id, patch) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  function add({ text, tags, priority, due }) {
    const todo = normalizeTodo({ id: crypto.randomUUID(), text, tags, priority, due, done: false, createdAt: Date.now() })
    setTodos((prev) => [...prev, todo])
    if (view.status === 'done') patchView({ status: 'active' })
    if (!matches(todo)) {
      toast({ message: 'Task added (hidden by current filters)', action: { label: 'Show', onClick: resetFilters } })
    }
  }

  function toggleDone(todo) {
    const nowDone = !todo.done
    update(todo.id, { done: nowDone, completedAt: nowDone ? Date.now() : null })
    if (expandedId === todo.id) setExpandedId(null)
    if (nowDone) {
      toast({
        message: 'Task completed',
        action: { label: 'Undo', onClick: () => update(todo.id, { done: false, completedAt: null }) },
      })
    }
  }

  function remove(todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    toast({ message: 'Task deleted', action: { label: 'Undo', onClick: () => setTodos((prev) => [...prev, todo]) } })
  }

  function clearDone() {
    const removed = rawTodos.filter((t) => t.done)
    setTodos((prev) => prev.filter((t) => !t.done))
    toast({
      message: `Cleared ${removed.length} completed`,
      action: { label: 'Undo', onClick: () => setTodos((prev) => [...prev, ...removed]) },
    })
  }

  function resetFilters() {
    setQuery('')
    patchView({ when: null, priority: null, tag: null })
  }

  const renderList = (items, className = '') => (
    <ul className={`todo-list ${className}`}>
      {items.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          allTags={allTags}
          expanded={expandedId === todo.id}
          onExpand={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
          onToggleDone={() => toggleDone(todo)}
          onUpdate={(patch) => update(todo.id, patch)}
          onDelete={() => remove(todo)}
        />
      ))}
    </ul>
  )

  const groups =
    view.sort === 'smart'
      ? BUCKETS.map((b) => ({ ...b, items: visibleActive.filter((t) => bucketOf(t) === b.value) })).filter((g) => g.items.length)
      : [{ value: 'all', label: null, items: visibleActive }]

  const noMatches = (
    <div className="empty compact">
      <p className="empty-title">No tasks match these filters</p>
      <button className="btn btn-secondary" onClick={resetFilters}>Reset filters</button>
    </div>
  )

  return (
    <div className="page">
      <div className="page-inner">
      <header className="page-head">
        <div>
          <p className="eyebrow">{longDate()}</p>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">
            {todos.length === 0
              ? 'Plan your day, one task at a time.'
              : active.length === 0
                ? 'All clear. Nothing left to do 🎉'
                : `${active.length} open${bucketCounts.overdue ? ` · ${bucketCounts.overdue} overdue` : ''}${doneToday ? ` · ${doneToday} done today` : ''}`}
          </p>
        </div>
        {todos.length > 0 && (
          <div className="ring" style={{ '--p': progress }} role="img" aria-label={`${progress}% of tasks complete`}>
            <span>{progress}%</span>
          </div>
        )}
      </header>

      <TodoComposer onAdd={add} inputRef={addRef} />

      {todos.length === 0 ? (
        <div className="empty">
          <div className="empty-art">✅</div>
          <p className="empty-title">Nothing on your list</p>
          <p>Add a task above. Use #tags, a priority, or a due date to stay organized.</p>
          <p className="footnote">Shortcuts: <kbd>n</kbd> new task · <kbd>/</kbd> search</p>
        </div>
      ) : (
        <>
          <OverviewTiles counts={bucketCounts} when={view.when} onChange={(when) => patchView({ when })} />
          <Toolbar
            view={view}
            patchView={patchView}
            statusCounts={{ active: active.length, done: done.length, all: todos.length }}
            query={query}
            setQuery={setQuery}
            searchRef={searchRef}
            allTags={allTags}
            isFiltered={isFiltered}
            onReset={resetFilters}
          />

          {showActive &&
            (visibleActive.length === 0 ? (
              isFiltered ? (
                noMatches
              ) : view.status === 'active' ? (
                <div className="empty compact">
                  <div className="empty-art">🎉</div>
                  <p className="empty-title">All caught up</p>
                  <p>Every task is done. Enjoy the moment.</p>
                </div>
              ) : null
            ) : (
              <div className="todo-groups">
                {groups.map((g) => (
                  <section key={g.value} className={`todo-group bucket-${g.value}`}>
                    {g.label && (
                      <h2 className="group-label">
                        {g.label} <span className="count">{g.items.length}</span>
                      </h2>
                    )}
                    <div className="card">{renderList(g.items)}</div>
                  </section>
                ))}
              </div>
            ))}

          {showDoneSection && (visibleDone.length > 0 || view.status === 'done') && (
            <section className="done-section">
              <div className="done-header">
                {view.status === 'all' ? (
                  <button className="done-toggle" aria-expanded={doneOpen} onClick={() => patchView({ showDone: !view.showDone })}>
                    <ChevronDownIcon size={16} className={doneOpen ? '' : 'rotated'} />
                    Completed <span className="count">{visibleDone.length}</span>
                  </button>
                ) : (
                  <h2 className="group-label">
                    Completed <span className="count">{visibleDone.length}</span>
                  </h2>
                )}
                {done.length > 0 && (
                  <button className="link-btn" onClick={clearDone}>Clear completed</button>
                )}
              </div>
              {doneOpen &&
                (visibleDone.length > 0 ? (
                  renderList(visibleDone, 'done-list')
                ) : isFiltered ? (
                  noMatches
                ) : (
                  <div className="empty compact">
                    <p className="empty-title">Nothing completed yet</p>
                    <p>Checked-off tasks will collect here.</p>
                  </div>
                ))}
            </section>
          )}

          {view.status === 'all' && visibleActive.length === 0 && visibleDone.length === 0 && isFiltered && noMatches}

          <p className="footnote">
            Click a task for details · <kbd>n</kbd> new task · <kbd>/</kbd> search
          </p>
        </>
      )}
      </div>
    </div>
  )
}
