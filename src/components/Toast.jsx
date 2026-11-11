import { useCallback, useEffect, useRef, useState } from 'react'
import { XIcon } from './Icons.jsx'
import { ToastContext } from './toast.js'


export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const dismiss = useCallback(() => {
    clearTimeout(timer.current)
    setToast(null)
  }, [])

  const show = useCallback((next) => {
    clearTimeout(timer.current)
    setToast({ ...next, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), next.action ? 6000 : 2500)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            <span>{toast.message}</span>
            {toast.action && (
              <button
                className="toast-action"
                onClick={() => {
                  toast.action.onClick()
                  dismiss()
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button className="icon-btn toast-close" aria-label="Dismiss" onClick={dismiss}>
              <XIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
