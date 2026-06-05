import React from 'react'
import { motion } from 'framer-motion'
import { Settings, RotateCcw, Zap } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCareer } from '../context/CareerContext'

const FLOW_STEPS = [
  { path: '/profile', label: 'Profile',  step: 1 },
  { path: '/resume',  label: 'Resume',   step: 2 },
  { path: '/analyze', label: 'Analyze',  step: 3 },
  { path: '/output',  label: 'Output',   step: 4 },
]

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, resetAll, setShowApiModal } = useCareer()
  const isLanding = location.pathname === '/'
  const inFlow = FLOW_STEPS.some(s => location.pathname === s.path)

  const handleStartOver = () => {
    if (window.confirm('Start over? This will clear all your data.')) {
      resetAll()
      navigate('/')
    }
  }

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'rgba(17,19,24,0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
        height: '56px',
      }}
    >
      <div className="w-full px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(78,255,197,0.3)' }}
          >
            <Zap size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            className="font-syne font-bold text-lg leading-none tracking-tight transition-colors group-hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            CareerOS
          </span>
        </Link>

        {/* Center: step breadcrumb in flow */}
        {inFlow && (
          <div className="hidden md:flex items-center gap-1">
            {FLOW_STEPS.map((step, idx) => {
              const isActive = location.pathname === step.path
              const isPast = FLOW_STEPS.findIndex(s => s.path === location.pathname) > idx
              return (
                <React.Fragment key={step.path}>
                  <Link
                    to={step.path}
                    className="px-3 py-1 rounded-md text-xs font-mono transition-all"
                    style={{
                      color: isActive ? 'var(--accent)' : isPast ? 'var(--text-secondary)' : 'var(--text-muted)',
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                    }}
                  >
                    {step.label}
                  </Link>
                  {idx < FLOW_STEPS.length - 1 && (
                    <span style={{ color: 'var(--text-muted)' }} className="text-xs">›</span>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {profile?.name && !isLanding && (
            <button
              onClick={handleStartOver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:border-[--signal-red]/50"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'transparent' }}
              title="Start Over"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
