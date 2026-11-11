import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { DataProvider } from './store/DataProvider.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DataProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
