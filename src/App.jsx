import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CareerProvider } from './context/CareerContext'
import Nav from './components/Nav'
import ApiKeyModal from './components/ApiKeyModal'
import ToastContainer from './components/ToastContainer'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import ResumePage from './pages/ResumePage'
import AnalyzePage from './pages/AnalyzePage'
import OutputPage from './pages/OutputPage'

function AppContent() {
  const location = useLocation()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Nav />
      <ApiKeyModal />
      <ToastContainer />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"        element={<LandingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resume"  element={<ResumePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/output"  element={<OutputPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <CareerProvider>
      <AppContent />
    </CareerProvider>
  )
}
