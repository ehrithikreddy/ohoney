import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 2500,
        style: {
          background: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '50px',
          padding: '12px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
        success: {
          iconTheme: {
            primary: '#f5a623',
            secondary: '#ffffff',
          },
        },
      }}
    />
  </React.StrictMode>
)
