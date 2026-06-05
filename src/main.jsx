import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Dynamic basename to handle case-insensitive URL paths on GitHub Pages
const getBasename = () => {
  const path = window.location.pathname
  const match = path.match(/^\/(careeros)/i)
  return match ? match[0] : '/'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
