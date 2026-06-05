import React, { useEffect, useState, useRef } from 'react'

/**
 * AIStreamText — character-by-character text reveal with blinking cursor
 * @param {string} text - Full text to stream
 * @param {number} speed - ms per character (default 8)
 * @param {function} onComplete - called when streaming completes
 */
export default function AIStreamText({ text = '', speed = 8, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!text) return
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        const next = text.slice(0, indexRef.current + 1)
        setDisplayed(next)
        indexRef.current++
      } else {
        clearInterval(timerRef.current)
        setDone(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(timerRef.current)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[1em] ml-[1px] align-middle"
          style={{
            background: 'var(--accent)',
            animation: 'blink 1s step-end infinite',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
    </span>
  )
}
