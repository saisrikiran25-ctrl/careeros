import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, ChevronDown, Zap, AlertCircle, ExternalLink } from 'lucide-react'
import { RECOMMENDED_MODELS } from '../services/openrouterApi'
import { useCareer } from '../context/CareerContext'

export default function ApiKeyModal() {
  const { showApiModal, setShowApiModal, apiKey, selectedModel, saveApiKey } = useCareer()
  const [key, setKey] = useState(apiKey || '')
  const [model, setModel] = useState(selectedModel || RECOMMENDED_MODELS[0].id)
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!key.trim()) {
      setError('Please enter your OpenRouter API key.')
      return
    }
    if (!key.startsWith('sk-or-')) {
      setError('This doesn\'t look like an OpenRouter key (should start with sk-or-...).')
      return
    }
    setError('')
    saveApiKey(key.trim(), model)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape' && apiKey) setShowApiModal(false)
  }

  return (
    <AnimatePresence>
      {showApiModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={() => apiKey && setShowApiModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-modal-title"
          >
            <div
              className="w-full max-w-md rounded-2xl border p-6"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-dim)', border: '1px solid rgba(78,255,197,0.3)' }}
                >
                  <Key size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 id="api-modal-title" className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    AI Settings
                  </h2>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Configure your OpenRouter connection
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="mb-4">
                <label htmlFor="api-key-input" className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
                  OpenRouter API Key
                </label>
                <div className="relative">
                  <input
                    id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={key}
                    onChange={e => { setKey(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="sk-or-v1-..."
                    className="input-base pr-20"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                {error && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={12} style={{ color: 'var(--signal-red)' }} />
                    <p className="text-xs font-mono" style={{ color: 'var(--signal-red)' }}>{error}</p>
                  </div>
                )}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono transition-opacity hover:opacity-80"
                  style={{ color: 'var(--signal-blue)' }}
                >
                  Get your free API key at openrouter.ai
                  <ExternalLink size={9} />
                </a>
              </div>

              {/* Model Selector */}
              <div className="mb-6">
                <label htmlFor="model-select" className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
                  AI Model
                </label>
                <div className="relative">
                  <select
                    id="model-select"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="input-base appearance-none pr-8 cursor-pointer"
                  >
                    {RECOMMENDED_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.label} — {m.badge}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>
                <p className="text-[10px] font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Pricing varies. Gemini Flash is fast & affordable. Claude Sonnet is highest quality.
                </p>
              </div>

              {/* Note */}
              <div
                className="rounded-lg p-3 mb-6 text-xs font-mono leading-relaxed"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                🔒 Your key is stored only in your browser's localStorage. It is never sent to any server other than OpenRouter.
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {apiKey && (
                  <button
                    onClick={() => setShowApiModal(false)}
                    className="flex-1 btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="flex-1 btn-accent text-sm flex items-center justify-center gap-2"
                >
                  <Zap size={14} />
                  {apiKey ? 'Update Settings' : 'Connect & Start'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
