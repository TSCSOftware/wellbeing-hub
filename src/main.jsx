import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import HubProvider from './context/HubProvider.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import './index.css'


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => null)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <HubProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HubProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
