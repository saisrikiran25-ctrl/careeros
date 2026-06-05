import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'
import Tag from './Tag'

/**
 * DiffView — shows original vs improved resume bullet
 */
export default function DiffView({ original, rewritten, improvements = [], metricSuggestion, onAcceptMetric, onSkipMetric }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Original */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Original
          </span>
        </div>
        <p className="text-sm font-mono leading-relaxed diff-original">
          {original}
        </p>
      </div>

      {/* Improved */}
      <div className="p-4" style={{ background: 'var(--bg-surface)', borderLeft: '3px solid var(--accent)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            ✨ Improved
          </span>
        </div>
        <p className="text-sm font-mono leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {rewritten}
        </p>

        {/* Improvement badges */}
        {improvements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {improvements.map((imp, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(78,255,197,0.2)' }}
              >
                <CheckCircle size={9} />
                {imp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metric Suggestion */}
      <AnimatePresence>
        {metricSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t p-4 flex items-start gap-3"
            style={{ borderColor: 'var(--border)', background: 'rgba(255,184,78,0.05)', borderLeft: '3px solid var(--signal-amber)' }}
          >
            <Lightbulb size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--signal-amber)' }} />
            <div className="flex-1">
              <p className="text-xs font-mono" style={{ color: 'var(--signal-amber)' }}>
                Can you quantify this?
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                {metricSuggestion}
              </p>
              {(onAcceptMetric || onSkipMetric) && (
                <div className="flex gap-2 mt-2">
                  {onAcceptMetric && (
                    <button
                      onClick={onAcceptMetric}
                      className="text-[10px] font-mono px-3 py-1 rounded-full transition-colors"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(78,255,197,0.3)' }}
                    >
                      Accept Suggestion
                    </button>
                  )}
                  {onSkipMetric && (
                    <button
                      onClick={onSkipMetric}
                      className="text-[10px] font-mono px-3 py-1 rounded-full transition-colors"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      Skip
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
