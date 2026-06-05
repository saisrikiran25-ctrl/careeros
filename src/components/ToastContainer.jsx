import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useCareer } from '../context/CareerContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useCareer()

  const icons = {
    error: <AlertCircle size={14} style={{ color: 'var(--signal-red)' }} />,
    success: <CheckCircle size={14} style={{ color: 'var(--accent)' }} />,
    info: <Info size={14} style={{ color: 'var(--signal-blue)' }} />,
  }

  const colors = {
    error: 'var(--signal-red)',
    success: 'var(--accent)',
    info: 'var(--signal-blue)',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 p-4 rounded-xl border shadow-2xl"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              borderLeft: `3px solid ${colors[toast.type] || colors.error}`,
            }}
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type] || icons.error}</div>
            <p className="flex-1 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
