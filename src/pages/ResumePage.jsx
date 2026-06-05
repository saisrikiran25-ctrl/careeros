import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Sparkles, ChevronRight, AlertCircle, Edit3, User } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import DiffView from '../components/DiffView'
import LoadingSequence from '../components/LoadingSequence'
import { useCareer } from '../context/CareerContext'
import { callOpenRouter, parseJsonResponse } from '../services/openrouterApi'
import { RESUME_SYSTEM_PROMPT, buildRewritePrompt } from '../services/prompts'

const PageMotion = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

const TONES = ['Short & Sharp', 'Detailed', 'Technical Focus']
const LOADING_MESSAGES = [
  'Identifying weak action verbs...',
  'Restructuring for impact...',
  'Adding measurable framing...',
  'Eliminating vague phrases...',
  'Polishing final output...',
]

export default function ResumePage() {
  const { profile, resumeText, setResumeText, improvedBullets, setImprovedBullets, apiKey, selectedModel, addToast } = useCareer()
  const navigate = useNavigate()

  const [mode, setMode] = useState('profile') // 'upload' | 'profile'
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const [selectedTone, setSelectedTone] = useState('Short & Sharp')
  const [dismissedMetrics, setDismissedMetrics] = useState(new Set())

  // ─── Collect all bullets from profile ────────────────────────────────────
  const getAllBullets = () => {
    const expBullets = profile.experience?.flatMap(e =>
      e.bullets.filter(b => b.trim()).map(b => ({ text: b, source: `${e.role} @ ${e.org}`, type: 'experience' }))
    ) || []
    const projBullets = profile.projects?.flatMap(p =>
      p.bullets.filter(b => b.trim()).map(b => ({ text: b, source: p.name, type: 'project' }))
    ) || []
    return [...expBullets, ...projBullets]
  }

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setParseError('File too large. Max 5MB.')
      return
    }

    setUploadedFileName(file.name)
    setParseError('')

    if (file.name.endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setResumeText(result.value)
      } catch (err) {
        setParseError('Couldn\'t read this .docx file. Please paste your resume text below.')
        setResumeText('')
      }
    } else if (file.name.endsWith('.txt')) {
      const text = await file.text()
      setResumeText(text)
    } else {
      setParseError('PDF parsing not supported directly. Please paste your resume text in the box below, or use a .docx file.')
    }
  }, [setResumeText])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileInput = useCallback((e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ─── AI Rewrite ───────────────────────────────────────────────────────────
  const handleRewrite = async () => {
    if (!apiKey) { addToast('Please set your OpenRouter API key in Settings.', 'error'); return }

    const bullets = mode === 'profile'
      ? getAllBullets().map(b => b.text)
      : resumeText.split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*'))
          .map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)

    if (bullets.length === 0) {
      addToast('No bullets found. Add experience bullets in your profile or upload a resume.', 'error')
      return
    }

    setIsRewriting(true)
    setImprovedBullets([])

    try {
      const prompt = buildRewritePrompt(profile, bullets, selectedTone)
      const raw = await callOpenRouter(apiKey, selectedModel, RESUME_SYSTEM_PROMPT, prompt)
      const parsed = parseJsonResponse(raw)
      setImprovedBullets(parsed.improved || [])
    } catch (err) {
      addToast(`AI Error: ${err.message}`, 'error')
    } finally {
      setIsRewriting(false)
    }
  }

  const allBullets = getAllBullets()
  const hasContent = allBullets.length > 0 || resumeText.trim().length > 0

  return (
    <PageMotion>
      <div className="max-w-[900px] mx-auto">
        <ProgressBar currentStep={2} />

        <div className="px-6 pb-16">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-syne font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Your Resume
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              Upload your existing resume or use the profile you just built. We'll rewrite every bullet to be clearer, stronger, and more impactful.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {[
              { id: 'upload', label: 'Upload Resume', icon: Upload },
              { id: 'profile', label: 'Use My Profile', icon: User },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`resume-mode-${id}`}
                onClick={() => setMode(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: mode === id ? 'var(--bg-elevated)' : 'transparent',
                  color: mode === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: mode === id ? '1px solid var(--border-active)' : '1px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="mb-6 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className="relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
                  background: isDragging ? 'var(--accent-glow)' : 'var(--bg-surface)',
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".docx,.txt,.pdf"
                  className="hidden"
                  onChange={onFileInput}
                />
                <Upload
                  size={28}
                  className="mx-auto mb-3"
                  style={{ color: isDragging ? 'var(--accent)' : 'var(--text-muted)' }}
                />
                <p className="text-sm font-mono mb-1" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {uploadedFileName || 'Drag & drop your resume here'}
                </p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  .docx, .txt supported · Max 5MB · PDF: paste text below
                </p>
              </div>

              {parseError && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)' }}>
                  <AlertCircle size={13} style={{ color: 'var(--signal-red)' }} className="mt-0.5" />
                  <p className="text-xs font-mono" style={{ color: 'var(--signal-red)' }}>{parseError}</p>
                </div>
              )}

              {/* Editable parsed text */}
              <div>
                <label htmlFor="resume-text-area" className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Resume Text (editable)
                </label>
                <textarea
                  id="resume-text-area"
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here, or upload a .docx file above..."
                  rows={10}
                  className="input-base resize-y"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', lineHeight: '1.7' }}
                />
              </div>
            </div>
          )}

          {/* Profile Mode — read-only preview */}
          {mode === 'profile' && (
            <div className="mb-6 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Profile Summary — {allBullets.length} bullets
                </span>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-xs font-mono flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: 'var(--signal-blue)' }}
                >
                  <Edit3 size={11} /> Edit Profile
                </button>
              </div>

              {allBullets.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                    No bullets found. Add experience or projects in your profile.
                  </p>
                  <button onClick={() => navigate('/profile')} className="btn-ghost mt-4 text-xs">
                    ← Go to Profile
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Experience */}
                  {profile.experience?.filter(e => e.role.trim()).map(exp => (
                    <div key={exp.id}>
                      <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {exp.role} @ {exp.org}
                        <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{exp.duration}</span>
                      </p>
                      {exp.bullets.filter(b => b.trim()).map((b, i) => (
                        <p key={i} className="text-xs font-mono py-1.5 border-b ml-3" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                          • {b}
                        </p>
                      ))}
                    </div>
                  ))}
                  {/* Projects */}
                  {profile.projects?.filter(p => p.name.trim()).map(proj => (
                    <div key={proj.id}>
                      <p className="text-xs font-mono font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {proj.name}
                        <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{proj.tech}</span>
                      </p>
                      {proj.bullets.filter(b => b.trim()).map((b, i) => (
                        <p key={i} className="text-xs font-mono py-1.5 border-b ml-3" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                          • {b}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tone Selector */}
          <div className="mb-6">
            <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-secondary)' }}>Rewrite Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map(tone => (
                <button
                  key={tone}
                  id={`tone-${tone.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedTone(tone)}
                  className="px-4 py-2 rounded-full text-xs font-mono transition-all"
                  style={{
                    background: selectedTone === tone ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: selectedTone === tone ? 'var(--accent)' : 'var(--text-muted)',
                    border: selectedTone === tone ? '1px solid rgba(78,255,197,0.4)' : '1px solid var(--border)',
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Rewrite Button */}
          <motion.button
            onClick={handleRewrite}
            disabled={isRewriting || !hasContent}
            className="w-full py-4 rounded-xl text-sm font-syne font-semibold flex items-center justify-center gap-2 transition-all mb-6"
            style={{
              background: (!isRewriting && hasContent) ? 'var(--accent)' : 'var(--bg-elevated)',
              color: (!isRewriting && hasContent) ? 'var(--text-inverse)' : 'var(--text-muted)',
              cursor: (isRewriting || !hasContent) ? 'not-allowed' : 'pointer',
            }}
            whileHover={!isRewriting && hasContent ? { scale: 1.01 } : {}}
            whileTap={!isRewriting && hasContent ? { scale: 0.99 } : {}}
            id="rewrite-bullets-btn"
          >
            <Sparkles size={16} />
            {isRewriting ? 'Rewriting...' : '✨ Rewrite All Bullets'}
          </motion.button>

          {/* Loading State */}
          {isRewriting && (
            <div className="mb-6 rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-syne font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                CareerOS is analyzing your resume...
              </p>
              <LoadingSequence messages={LOADING_MESSAGES} active={isRewriting} />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {improvedBullets.length > 0 && !isRewriting && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 mb-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-syne font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Rewritten Bullets
                  </h3>
                  <span className="text-xs font-mono px-3 py-1 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {improvedBullets.length} bullets improved
                  </span>
                </div>

                {improvedBullets.map((item, idx) => (
                  <DiffView
                    key={idx}
                    original={item.original}
                    rewritten={item.rewritten}
                    improvements={item.improvements || []}
                    metricSuggestion={!dismissedMetrics.has(idx) ? item.metricSuggestion : null}
                    onAcceptMetric={() => {
                      const updated = [...improvedBullets]
                      updated[idx] = { ...updated[idx], rewritten: updated[idx].rewritten + ' ' + (item.metricSuggestion || '') }
                      setImprovedBullets(updated)
                      setDismissedMetrics(s => new Set([...s, idx]))
                    }}
                    onSkipMetric={() => setDismissedMetrics(s => new Set([...s, idx]))}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            onClick={() => navigate('/analyze')}
            className="btn-accent w-full flex items-center justify-center gap-2 py-4"
            id="continue-to-analyze-btn"
          >
            Analyze Against a Job <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </PageMotion>
  )
}
