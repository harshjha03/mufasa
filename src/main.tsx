import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister())
  })
}

createRoot(document.getElementById('root')!).render(<App />)
