import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { addDays, dayKey, dayLabel, streak } from '../../lib/dates.js'
import { MOODS, nearestMood } from '../../lib/moods.js'
import { BookIcon, FlameIcon, PlusIcon, SmileIcon } from '../Icons.jsx'

const average = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)

export default function JournalOverview({ entries, onNew }) {
  const data = useMemo(() => {
    const now = new Date()
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = addDays(now, i - 13)
      const key = dayKey(d)
      const moods = entries.filter((e) => e.mood && dayKey(e.createdAt) === key).map((e) => e.mood)
      return { key, date: d, mood: nearestMood(average(moods)) }
    })
    const weekAgo = addDays(now, -7).getTime()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const tagCounts = new Map()
    for (const e of entries) for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    const moodCounts = MOODS.map((m) => ({ ...m, count: entries.filter((e) => e.mood === m.value).length }))
    return {
      days,
      streak: streak(entries.map((e) => e.createdAt)),
      thisMonth: entries.filter((e) => e.createdAt >= monthStart).length,
      weekMood: nearestMood(average(entries.filter((e) => e.mood && e.createdAt >= weekAgo).map((e) => e.mood))),
      topTags: [...tagCounts].sort((a, b) => b[1] - a[1]).slice(0, 8),
      moodCounts,
      moodTotal: moodCounts.reduce((a, m) => a + m.count, 0),
    }
  }, [entries])

  const wroteToday = entries.some((e) => dayKey(e.createdAt) === dayKey(Date.now()))

  return (
    <div className="overview-pane">
      <div className="overview-inner">
        <p className="eyebrow">Overview</p>
        <h2 className="overview-title">{wroteToday ? 'Nice work today.' : 'Ready to write?'}</h2>
        <p className="overview-sub">
          {entries.length === 0
            ? 'Capture your thoughts, track your mood, and watch patterns emerge over time.'
            : wroteToday
              ? 'You already wrote today. Pick an entry to keep going, or start another.'
              : "You haven't written today yet. A few lines is enough."}
        </p>
        <button className="btn btn-primary" onClick={onNew}>
          <PlusIcon size={16} /> New entry
        </button>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-icon tone-green"><BookIcon size={16} /></span>
            <span className="stat-value">{entries.length}</span>
            <span className="stat-label">Total entries · {data.thisMonth} this month</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon tone-orange"><FlameIcon size={16} /></span>
            <span className="stat-value">{data.streak}</span>
            <span className="stat-label">Day streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon tone-blue"><SmileIcon size={16} /></span>
            <span className="stat-value">{data.weekMood ? `${data.weekMood.emoji} ${data.weekMood.label}` : '—'}</span>
            <span className="stat-label">Average mood, last 7 days</span>
          </div>
        </div>

        <section className="panel">
          <h3 className="panel-title">Mood · last 14 days</h3>
          <div className="mood-strip">
            {data.days.map((d) => (
              <div key={d.key} className="mood-strip-day" title={`${dayLabel(d.key)}: ${d.mood ? d.mood.label : 'no mood logged'}`}>
                <span className={`mood-dot${d.mood ? ' filled' : ''}`} style={{ '--mood': d.mood?.color }}>
                  {d.mood?.emoji}
                </span>
                <span className="mood-strip-label">{d.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
              </div>
            ))}
          </div>
          {data.moodTotal > 0 && (
            <div className="mood-dist" aria-label="Mood distribution">
              {data.moodCounts.filter((m) => m.count).map((m) => (
                <span
                  key={m.value}
                  className="mood-dist-seg"
                  style={{ flexGrow: m.count, background: m.color }}
                  title={`${m.label}: ${m.count}`}
                />
              ))}
            </div>
          )}
        </section>

        {data.topTags.length > 0 && (
          <section className="panel">
            <h3 className="panel-title">Top tags</h3>
            <div className="tag-cloud">
              {data.topTags.map(([t, n]) => (
                <Link key={t} to={`/journal?tag=${encodeURIComponent(t)}`} className="chip chip-link">
                  #{t} <span className="count">{n}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
