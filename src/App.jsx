import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MobileBar from './components/layout/MobileBar.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Calendar from './pages/Calendar.jsx'
import Journal from './pages/Journal.jsx'
import Todo from './pages/Todo.jsx'

export default function App() {
  const location = useLocation()
  const section = location.pathname.split('/')[1] || 'journal'
  // The drawer is tied to the location it was opened on, so navigating closes it.
  const [drawerKey, setDrawerKey] = useState(null)
  const drawerOpen = drawerKey === location.key
  const setDrawerOpen = (open) => setDrawerKey(open ? location.key : null)

  return (
    <div className="shell">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="main">
        <MobileBar section={section} onMenu={() => setDrawerOpen(true)} />
        <div className="main-content fade-in" key={section}>
          <Routes>
            <Route path="/" element={<Navigate to="/journal" replace />} />
            <Route path="/journal/:id?" element={<Journal />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="*" element={<Navigate to="/journal" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
