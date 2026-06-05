import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Copy, Download, RefreshCw, Edit3, RotateCcw, Sparkles, FileText, Check } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import LoadingSequence from '../components/LoadingSequence'
import AIStreamText from '../components/AIStreamText'
import { useCareer } from '../context/CareerContext'
import { callOpenRouter, parseJsonResponse } from '../services/openrouterApi'
import { TAILOR_SYSTEM_PROMPT, buildTailoredBulletsPrompt, COVER_LETTER_SYSTEM_PROMPT, buildCoverLetterPrompt } from '../services/prompts'

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

const PRESETS = ['Engineering', 'Data & Analytics', 'Design', 'Marketing', 'Product']
const CL_TONES = ['Formal', 'Conversational', 'Enthusiastic']

const TAILOR_LOADING = ['Mirroring JD language...', 'Aligning proof points...', 'Strengthening action verbs...', 'Polishing for the role...']
const CL_LOADING = ['Crafting your hook...', 'Weaving in your experience...', 'Aligning to the role...', 'Finalizing tone and structure...']

function CopyButton({ text, id }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }
  return (
    <button
      id={id}
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
      style={{
        background: copied ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        color: copied ? 'var(--accent)' : 'var(--text-muted)',
        border: `1px solid ${copied ? 'rgba(78,255,197,0.3)' : 'var(--border)'}`,
      }}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function TailoredBulletCard({ item, companyName, idx }) {
  const [localRewritten, setLocalRewritten] = useState(item.rewritten)
  const [isEditing, setIsEditing] = useState(false)
  const [streaming, setStreaming] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.06 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      {/* Original */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
        <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Original</p>
        <p className="text-xs font-mono diff-original">{item.original}</p>
      </div>

      {/* Tailored */}
      <div className="p-4" style={{ borderLeft: '3px solid var(--accent)' }}>
        <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
          ✨ Tailored for {companyName}
        </p>

        {isEditing ? (
          <textarea
            value={localRewritten}
            onChange={e => setLocalRewritten(e.target.value)}
            className="input-base text-xs"
            rows={3}
            autoFocus
          />
        ) : (
          <p className="text-sm font-mono leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {streaming ? (
              <AIStreamText text={localRewritten} speed={5} onComplete={() => setStreaming(false)} />
            ) : localRewritten}
          </p>
        )}

        {/* JD alignments */}
        {item.jdAlignments?.length > 0 && !streaming && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.jdAlignments.map((a, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(78,159,255,0.1)', color: 'var(--signal-blue)', border: '1px solid rgba(78,159,255,0.2)' }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <CopyButton text={localRewritten} id={`copy-bullet-${idx}`} />
          <button
            onClick={() => setIsEditing(e => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Edit3 size={12} />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function GapPatch({ gap }) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: 'rgba(255,184,78,0.04)', borderColor: 'var(--border)', borderLeft: '3px solid var(--signal-amber)' }}
    >
      <p className="text-xs font-mono font-medium mb-3" style={{ color: 'var(--signal-amber)' }}>
        ⚠️ Gap: {gap.requirement}
      </p>
      <p className="text-xs font-mono leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {gap.quickAdvice}
      </p>
    </div>
  )
}

export default function OutputPage() {
  const { profile, jdAnalysis, matchScore, matchBreakdown, improvedBullets, tailoredBullets, setTailoredBullets, coverLetter, setCoverLetter, apiKey, selectedModel, addToast, resetAll } = useCareer()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('bullets') // 'bullets' | 'cover'
  const [selectedPreset, setSelectedPreset] = useState('Data & Analytics')
  const [selectedTone, setSelectedTone] = useState('Conversational')
  const [isTailoring, setIsTailoring] = useState(false)
  const [isGeneratingCL, setIsGeneratingCL] = useState(false)
  const [editingCL, setEditingCL] = useState(false)
  const [localCL, setLocalCL] = useState(coverLetter)

  // Collect all bullets
  const getAllBullets = () => {
    if (improvedBullets.length > 0) return improvedBullets.map(b => b.rewritten)
    const expBullets = profile.experience?.flatMap(e => e.bullets.filter(b => b.trim())) || []
    const projBullets = profile.projects?.flatMap(p => p.bullets.filter(b => b.trim())) || []
    return [...expBullets, ...projBullets]
  }

  // ─── Tailor Bullets ────────────────────────────────────────────────────────
  const handleTailor = async () => {
    if (!apiKey) { addToast('Please set your OpenRouter API key.', 'error'); return }
    if (!jdAnalysis) { addToast('Please analyze a job description first.', 'error'); navigate('/analyze'); return }

    const bullets = getAllBullets()
    if (bullets.length === 0) { addToast('No bullets found. Complete your profile or resume first.', 'error'); return }

    setIsTailoring(true)
    setTailoredBullets([])

    try {
      const prompt = buildTailoredBulletsPrompt(jdAnalysis, bullets, selectedPreset)
      const raw = await callOpenRouter(apiKey, selectedModel, TAILOR_SYSTEM_PROMPT, prompt)
      const parsed = parseJsonResponse(raw)
      setTailoredBullets(parsed.tailored || [])
    } catch (err) {
      addToast(`Tailoring failed: ${err.message}`, 'error')
    } finally {
      setIsTailoring(false)
    }
  }

  // ─── Generate Cover Letter ─────────────────────────────────────────────────
  const handleGenerateCL = async () => {
    if (!apiKey) { addToast('Please set your OpenRouter API key.', 'error'); return }
    if (!jdAnalysis) { addToast('Please analyze a job description first.', 'error'); navigate('/analyze'); return }

    setIsGeneratingCL(true)
    setCoverLetter('')
    setLocalCL('')

    try {
      const prompt = buildCoverLetterPrompt(profile, jdAnalysis, matchBreakdown, selectedTone)
      const raw = await callOpenRouter(apiKey, selectedModel, COVER_LETTER_SYSTEM_PROMPT, prompt)
      setCoverLetter(raw)
      setLocalCL(raw)
    } catch (err) {
      addToast(`Cover letter generation failed: ${err.message}`, 'error')
    } finally {
      setIsGeneratingCL(false)
    }
  }

  const downloadTxt = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const bulletSummaryText = tailoredBullets.map((b, i) => `${i + 1}. ${b.rewritten}`).join('\n\n')
  const wordCount = localCL.trim().split(/\s+/).filter(Boolean).length

  return (
    <PageMotion>
      <div className="max-w-[900px] mx-auto">
        <ProgressBar currentStep={4} />

        <div className="px-6 pb-16">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="font-syne font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
                Your Tailored Application
              </h2>
              {matchScore !== null && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-syne font-semibold"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(78,255,197,0.3)' }}
                >
                  Match Score: {matchScore}
                </span>
              )}
            </div>
            {jdAnalysis && (
              <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                Edited for {jdAnalysis.companyName} — {jdAnalysis.roleName}
              </p>
            )}
          </div>

          {!jdAnalysis && (
            <div className="rounded-xl p-6 border mb-6 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
              <p className="text-sm font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
                You haven't analyzed a job yet. Go back to complete that step first.
              </p>
              <button onClick={() => navigate('/analyze')} className="btn-accent">
                ← Analyze a Job
              </button>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {[
              { id: 'bullets', label: 'Resume Bullets', icon: FileText },
              { id: 'cover', label: 'Cover Letter', icon: Edit3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`output-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: activeTab === id ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: activeTab === id ? '1px solid var(--border-active)' : '1px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── RESUME BULLETS TAB ── */}
            {activeTab === 'bullets' && (
              <motion.div
                key="bullets"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Preset selector */}
                <div className="mb-5">
                  <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-secondary)' }}>Role Type</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(preset => (
                      <button
                        key={preset}
                        id={`preset-${preset.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setSelectedPreset(preset)}
                        className="px-4 py-2 rounded-full text-xs font-mono transition-all"
                        style={{
                          background: selectedPreset === preset ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                          color: selectedPreset === preset ? 'var(--accent)' : 'var(--text-muted)',
                          border: selectedPreset === preset ? '1px solid rgba(78,255,197,0.4)' : '1px solid var(--border)',
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tailor button */}
                <motion.button
                  onClick={handleTailor}
                  disabled={isTailoring}
                  className="w-full py-4 rounded-xl text-sm font-syne font-semibold flex items-center justify-center gap-2 mb-6 transition-all"
                  style={{
                    background: !isTailoring ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: !isTailoring ? 'var(--text-inverse)' : 'var(--text-muted)',
                    cursor: isTailoring ? 'not-allowed' : 'pointer',
                  }}
                  whileHover={!isTailoring ? { scale: 1.01 } : {}}
                  id="tailor-bullets-btn"
                >
                  <Sparkles size={16} />
                  {isTailoring ? 'Tailoring...' : `✨ Tailor Bullets for ${jdAnalysis?.companyName || 'This Role'}`}
                </motion.button>

                {/* Loading */}
                {isTailoring && (
                  <div className="mb-6 rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <LoadingSequence messages={TAILOR_LOADING} active={isTailoring} />
                  </div>
                )}

                {/* Tailored bullets */}
                {tailoredBullets.length > 0 && !isTailoring && (
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-syne font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Tailored Bullets
                      </h3>
                      <div className="flex gap-2">
                        <CopyButton text={bulletSummaryText} id="copy-all-bullets" />
                        <button
                          onClick={() => downloadTxt(bulletSummaryText, 'tailored-bullets.txt')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                          id="download-bullets-btn"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>

                    {tailoredBullets.map((item, idx) => (
                      <TailoredBulletCard
                        key={idx}
                        item={item}
                        companyName={jdAnalysis?.companyName || 'this company'}
                        idx={idx}
                      />
                    ))}
                  </div>
                )}

                {/* Gap Patches */}
                {matchBreakdown.missing?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-syne font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Gap Guidance
                    </h3>
                    <div className="space-y-3">
                      {matchBreakdown.missing.map((gap, i) => (
                        <GapPatch key={i} gap={gap} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── COVER LETTER TAB ── */}
            {activeTab === 'cover' && (
              <motion.div
                key="cover"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tone selector */}
                <div className="mb-5">
                  <p className="text-xs font-mono mb-3" style={{ color: 'var(--text-secondary)' }}>Cover Letter Tone</p>
                  <div className="flex flex-wrap gap-2">
                    {CL_TONES.map(tone => (
                      <button
                        key={tone}
                        id={`cl-tone-${tone.toLowerCase()}`}
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

                {/* Generate button */}
                {!localCL && !isGeneratingCL && (
                  <motion.button
                    onClick={handleGenerateCL}
                    className="w-full py-4 rounded-xl text-sm font-syne font-semibold flex items-center justify-center gap-2 mb-6 btn-accent"
                    whileHover={{ scale: 1.01 }}
                    id="generate-cl-btn"
                  >
                    <Sparkles size={16} />
                    Generate Cover Letter
                  </motion.button>
                )}

                {/* Loading */}
                {isGeneratingCL && (
                  <div className="mb-6 rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <p className="text-sm font-syne font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Writing your cover letter...
                    </p>
                    <LoadingSequence messages={CL_LOADING} active={isGeneratingCL} />
                  </div>
                )}

                {/* Cover letter display */}
                {localCL && !isGeneratingCL && (
                  <div className="space-y-4 mb-6">
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                      {editingCL ? (
                        <textarea
                          id="cover-letter-textarea"
                          value={localCL}
                          onChange={e => setLocalCL(e.target.value)}
                          className="w-full p-5 text-sm font-mono leading-relaxed outline-none resize-none"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', minHeight: '400px', border: 'none' }}
                        />
                      ) : (
                        <div
                          className="p-5 text-sm font-mono leading-relaxed whitespace-pre-wrap"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', minHeight: '200px' }}
                        >
                          {localCL}
                        </div>
                      )}

                      {/* Toolbar */}
                      <div
                        className="flex items-center justify-between px-5 py-3 border-t"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
                      >
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {wordCount} words
                        </span>
                        <div className="flex gap-2">
                          <CopyButton text={localCL} id="copy-cl-btn" />
                          <button
                            onClick={() => setEditingCL(e => !e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                            id="edit-cl-btn"
                          >
                            <Edit3 size={12} />
                            {editingCL ? 'Done' : 'Edit'}
                          </button>
                          <button
                            onClick={() => downloadTxt(localCL, 'cover-letter.txt')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                            id="download-cl-btn"
                          >
                            <Download size={12} /> Download
                          </button>
                          <button
                            onClick={handleGenerateCL}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                            id="regen-cl-btn"
                          >
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Section */}
          <div
            className="rounded-2xl border p-6 mt-8"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="font-syne font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              📤 Export Your Application
            </h3>
            <div className="flex flex-wrap gap-3">
              {tailoredBullets.length > 0 && (
                <button
                  onClick={() => downloadTxt(bulletSummaryText, 'career-os-bullets.txt')}
                  className="btn-ghost flex items-center gap-2 text-xs"
                  id="export-bullets-btn"
                >
                  <Download size={13} /> Bullet Summary (.txt)
                </button>
              )}
              {localCL && (
                <CopyButton text={localCL} id="export-cl-copy" />
              )}
              <button
                onClick={() => { resetAll(); navigate('/') }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                id="start-over-export-btn"
              >
                <RotateCcw size={13} /> Start Over for New Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageMotion>
  )
}
