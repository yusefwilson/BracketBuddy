import { createRoot } from 'react-dom/client'
import './index.css'
import App from './components/App.tsx'

//import { StrictMode } from 'react'

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
  <App />
  //</StrictMode>,
)
