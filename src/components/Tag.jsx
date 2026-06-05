import React from 'react'
import { X } from 'lucide-react'

/**
 * Tag / Pill badge component
 * @param {string} label
 * @param {'accent'|'blue'|'amber'|'red'|'muted'} color
 * @param {boolean} dismissible
 * @param {function} onDismiss
 */
export default function Tag({ label, color = 'accent', dismissible = false, onDismiss }) {
  const colorMap = {
    accent: {
      bg: 'bg-[--accent-dim]',
      text: 'text-[--accent]',
      border: 'border-[--accent]/30',
    },
    blue: {
      bg: 'bg-[#4E9FFF]/10',
      text: 'text-[--signal-blue]',
      border: 'border-[--signal-blue]/30',
    },
    amber: {
      bg: 'bg-[#FFB84E]/10',
      text: 'text-[--signal-amber]',
      border: 'border-[--signal-amber]/30',
    },
    red: {
      bg: 'bg-[#FF6B6B]/10',
      text: 'text-[--signal-red]',
      border: 'border-[--signal-red]/30',
    },
    muted: {
      bg: 'bg-[--bg-elevated]',
      text: 'text-[--text-muted]',
      border: 'border-[--border]',
    },
  }

  const c = colorMap[color] || colorMap.accent

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1
        text-xs font-mono border transition-all
        ${c.bg} ${c.text} ${c.border}
      `}
    >
      {label}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-0.5 rounded-full hover:bg-white/10 p-0.5 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
