import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  { num: 1, label: 'Profile' },
  { num: 2, label: 'Resume' },
  { num: 3, label: 'Analyze' },
  { num: 4, label: 'Output' },
]

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-[900px] mx-auto px-6 py-4">
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isComplete = currentStep > step.num
          const isActive = currentStep === step.num
          const isLast = idx === STEPS.length - 1

          return (
            <React.Fragment key={step.num}>
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-medium border-2 transition-all duration-300
                    ${isComplete
                      ? 'bg-[--accent] border-[--accent] text-[--text-inverse]'
                      : isActive
                        ? 'bg-[--accent-dim] border-[--accent] text-[--accent] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'bg-[--bg-elevated] border-[--border] text-[--text-muted]'
                    }
                  `}
                >
                  {isComplete ? <Check size={14} strokeWidth={3} /> : step.num}
                </motion.div>
                <span
                  className={`text-[10px] font-mono tracking-wider uppercase transition-colors duration-300 ${
                    isActive ? 'text-[--accent]' : isComplete ? 'text-[--text-secondary]' : 'text-[--text-muted]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-2 relative overflow-hidden rounded-full bg-[--border]" style={{ marginBottom: '18px' }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[--accent]"
                    initial={{ width: '0%' }}
                    animate={{ width: isComplete ? '100%' : '0%' }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step label */}
      <p className="text-[--text-muted] text-xs font-mono mt-2 text-center">
        Step {currentStep} of {STEPS.length} — {STEPS.find(s => s.num === currentStep)?.label}
        {currentStep === 4 && ' ✓ Complete'}
      </p>
    </div>
  )
}
