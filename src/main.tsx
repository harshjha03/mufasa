import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Kill switch — wipe any service worker + cached responses from prior deploys
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister())
  })
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
}

createRoot(document.getElementById('root')!).render(<App />)
