import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StudentsProvider } from './context/StudentsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <StudentsProvider>
        <App />
      </StudentsProvider>
    </AuthProvider>
  </StrictMode>,
)
