import { useRef } from 'react'
import { backupFilename, buildBackup, downloadJson, mergeById, parseBackup } from '../../lib/backup.js'
import { isBlankEntry } from '../../lib/entries.js'
import { useData } from '../../store/data.js'
import { DownloadIcon, UploadIcon } from '../Icons.jsx'
import { useToast } from '../toast.js'

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`

export default function BackupControls() {
  const { entries, setEntries, todos, setTodos, events, setEvents } = useData()
  const fileRef = useRef(null)
  const toast = useToast()

  function exportData() {
    const saved = entries.filter((e) => !isBlankEntry(e))
    downloadJson(buildBackup(saved, todos, events), backupFilename())
    toast({
      message: `Exported ${count(saved.length, 'entry', 'entries')}, ${count(todos.length, 'task', 'tasks')} and ${count(events.length, 'event', 'events')}`,
    })
  }

  async function importFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    try {
      const backup = parseBackup(await file.text())
      const prevEntries = entries
      const prevTodos = todos
      const prevEvents = events
      const ent = mergeById(entries, backup.entries)
      const tsk = mergeById(todos, backup.todos)
      const evt = mergeById(events, backup.events)
      const changed = ent.added + ent.updated + tsk.added + tsk.updated + evt.added + evt.updated

      if (changed === 0) {
        toast({ message: 'Nothing new to import. Everything is already up to date.' })
        return
      }
      setEntries(ent.merged)
      setTodos(tsk.merged)
      setEvents(evt.merged)

      const parts = []
      if (ent.added + ent.updated) parts.push(count(ent.added + ent.updated, 'entry', 'entries'))
      if (tsk.added + tsk.updated) parts.push(count(tsk.added + tsk.updated, 'task', 'tasks'))
      if (evt.added + evt.updated) parts.push(count(evt.added + evt.updated, 'event', 'events'))
      const skipped = backup.skipped ? ` (${backup.skipped} invalid skipped)` : ''
      toast({
        message: `Imported ${parts.join(', ')}${skipped}`,
        action: {
          label: 'Undo',
          onClick: () => {
            setEntries(prevEntries)
            setTodos(prevTodos)
            setEvents(prevEvents)
          },
        },
      })
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : 'Import failed.' })
    }
  }

  return (
    <div className="backup">
      <div className="sb-heading">Backup</div>
      <div className="backup-actions">
        <button className="sb-action" onClick={exportData} title="Download all entries, tasks and events as a JSON file">
          <DownloadIcon size={15} /> Export
        </button>
        <button className="sb-action" onClick={() => fileRef.current?.click()} title="Merge entries, tasks and events from a backup file">
          <UploadIcon size={15} /> Import
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
    </div>
  )
}
