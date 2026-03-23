import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n'
import App from './App'
import './globals.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root was not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
