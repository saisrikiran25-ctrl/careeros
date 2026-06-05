import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const SUGGESTIONS = {
  skills: ['Python', 'SQL', 'Excel', 'Tableau', 'R', 'Figma', 'React', 'JavaScript', 'Java', 'C++',
           'pandas', 'scikit-learn', 'PowerBI', 'SPSS', 'Git', 'Machine Learning', 'Statistics',
           'Marketing', 'SEO', 'Copywriting', 'Finance', 'Financial Modeling', 'Data Cleaning'],
  roles: ['Data Analyst Intern', 'Software Engineer Intern', 'Product Manager Intern',
          'Business Analyst Intern', 'UX Designer Intern', 'Marketing Intern',
          'Research Analyst Intern', 'Finance Intern', 'Operations Intern', 'ML Engineer Intern'],
}

export default function TagInput({ values = [], onChange, placeholder, suggestionType = 'skills' }) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const suggestions = SUGGESTIONS[suggestionType] || []
  const filtered = input.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s))
    : suggestions.filter(s => !values.includes(s)).slice(0, 6)

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (tag) => {
    onChange(values.filter(v => v !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) addTag(input)
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="relative">
      <div
        className="min-h-[52px] rounded-lg p-2 flex flex-wrap gap-1.5 cursor-text"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {values.map(tag => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(78,255,197,0.25)' }}
            >
              {tag}
              <button
                onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X size={9} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm font-mono outline-none py-1 px-1"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-1 rounded-lg border py-1 max-h-40 overflow-y-auto"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            {filtered.slice(0, 8).map(s => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                className="w-full text-left px-4 py-2 text-xs font-mono transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
        Type and press Enter or comma to add · Click suggestions to select
      </p>
    </div>
  )
}
