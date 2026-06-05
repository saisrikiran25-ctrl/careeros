import React from 'react'
import { motion } from 'framer-motion'

export default function GapCard({ requirement, evidence, suggestedReframe, quickAdvice, severity = 'missing' }) {
  const isMissing = severity === 'missing'

  const borderColor = isMissing ? 'var(--signal-red)' : 'var(--signal-amber)'
  const bgColor = isMissing ? 'rgba(255,107,107,0.05)' : 'rgba(255,184,78,0.05)'
  const iconColor = isMissing ? 'var(--signal-red)' : 'var(--signal-amber)'
  const badgeText = isMissing ? '❌ Missing' : '⚠️ Partial Match'
  const badgeBg = isMissing ? 'rgba(255,107,107,0.15)' : 'rgba(255,184,78,0.15)'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg overflow-hidden border"
      style={{ borderColor: 'var(--border)', borderLeft: `3px solid ${borderColor}`, background: bgColor }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: badgeBg, color: iconColor }}
              >
                {badgeText}
              </span>
            </div>
            <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
              {requirement}
            </p>
            {evidence && (
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                ← {evidence}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
