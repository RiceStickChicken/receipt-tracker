import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReceiptsProvider } from './context/ReceiptsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReceiptsProvider>
      <App />
    </ReceiptsProvider>
  </StrictMode>,
)
