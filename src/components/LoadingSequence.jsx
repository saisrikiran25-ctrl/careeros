import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * LoadingSequence — rotating status messages with animated progress bar
 * @param {string[]} messages
 * @param {boolean} active
 */
export default function LoadingSequence({ messages = [], active = true }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    if (!active) return

    // Rotate messages
    intervalRef.current = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length)
    }, 1800)

    // Progress bar — crawls towards 90%, never reaches 100 until done
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 88) return prev + 0.1
        return prev + (88 - prev) * 0.04
      })
    }, 80)

    return () => {
      clearInterval(intervalRef.current)
      clearInterval(progressRef.current)
    }
  }, [active, messages.length])

  useEffect(() => {
    if (!active) {
      setProgress(100)
      setTimeout(() => setProgress(0), 600)
    }
  }, [active])

  if (!active && progress === 0) return null

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div
        className="w-full h-[2px] rounded-full overflow-hidden mb-4"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent)', width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Message */}
      <div className="flex items-center gap-3 py-6">
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-mono"
            style={{ color: 'var(--text-secondary)' }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
