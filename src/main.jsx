import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Central from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Central />
  </StrictMode>,
)
