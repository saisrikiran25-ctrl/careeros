import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Target, ChevronRight, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import ScoreRing from '../components/ScoreRing'
import GapCard from '../components/GapCard'
import LoadingSequence from '../components/LoadingSequence'
import Tag from '../components/Tag'
import { useCareer } from '../context/CareerContext'
import { callOpenRouter, parseJsonResponse } from '../services/openrouterApi'
import { ANALYZE_SYSTEM_PROMPT, buildAnalyzePrompt } from '../services/prompts'

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

const LOADING_MESSAGES = [
  'Reading the job description...',
  'Extracting required skills...',
  'Matching against your profile...',
  'Identifying gaps...',
  'Computing your match score...',
  'Generating actionable insights...',
]

function SectionHeader({ icon, label, count, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
        style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <h3 className="font-syne font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
        {label}
      </h3>
      <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
        {count}
      </span>
    </div>
  )
}

export default function AnalyzePage() {
  const { profile, jobDescription, setJobDescription, improvedBullets, setJdAnalysis, setMatchScore, setMatchBreakdown, jdAnalysis, matchScore, matchBreakdown, apiKey, selectedModel, addToast } = useCareer()
  const navigate = useNavigate()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [jdError, setJdError] = useState('')
  const [showJdInfo, setShowJdInfo] = useState(false)
  const [hasResults, setHasResults] = useState(!!matchScore)

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) {
      setJdError('Please paste a full job description for accurate analysis.')
      return
    }
    if (!apiKey) {
      addToast('Please set your OpenRouter API key in Settings.', 'error')
      return
    }
    setJdError('')
    setIsAnalyzing(true)
    setHasResults(false)

    try {
      const prompt = buildAnalyzePrompt(profile, jobDescription, improvedBullets)
      const raw = await callOpenRouter(apiKey, selectedModel, ANALYZE_SYSTEM_PROMPT, prompt)
      const parsed = parseJsonResponse(raw)

      setJdAnalysis({
        companyName: parsed.companyName || 'Company',
        roleName: parsed.roleName || 'Role',
        jdAnalysis: parsed.jdAnalysis || { requiredSkills: [], responsibilities: [], softSkills: [] },
        scoreLabel: parsed.scoreLabel || '',
      })
      setMatchScore(parsed.matchScore || 0)
      setMatchBreakdown({
        strong: parsed.strong || [],
        weak: parsed.weak || [],
        missing: parsed.missing || [],
      })
      setHasResults(true)
    } catch (err) {
      addToast(`Analysis failed: ${err.message}`, 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const lowScore = matchScore !== null && matchScore < 30

  return (
    <PageMotion>
      <div className="max-w-[900px] mx-auto">
        <ProgressBar currentStep={3} />

        <div className="px-6 pb-16">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-syne font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Match Against a Job
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              Paste the internship or job description below. CareerOS reads it like a recruiter and scores your fit — then tells you exactly what's missing.
            </p>
          </div>

          {/* JD Input */}
          <div className="mb-6">
            <label htmlFor="jd-textarea" className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
              Job Description
            </label>
            <textarea
              id="jd-textarea"
              value={jobDescription}
              onChange={e => { setJobDescription(e.target.value); setJdError('') }}
              placeholder="Paste the full job description here — messy formatting is fine..."
              rows={10}
              className={`input-base resize-y ${jdError ? 'border-[--signal-red]' : ''}`}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', lineHeight: '1.7' }}
            />
            {jdError && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle size={12} style={{ color: 'var(--signal-red)' }} />
                <p className="text-xs font-mono" style={{ color: 'var(--signal-red)' }}>{jdError}</p>
              </div>
            )}
            <p className="text-[10px] font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 rounded-xl text-sm font-syne font-semibold flex items-center justify-center gap-2 mb-6 transition-all"
            style={{
              background: !isAnalyzing ? 'var(--accent)' : 'var(--bg-elevated)',
              color: !isAnalyzing ? 'var(--text-inverse)' : 'var(--text-muted)',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            }}
            whileHover={!isAnalyzing ? { scale: 1.01 } : {}}
            whileTap={!isAnalyzing ? { scale: 0.99 } : {}}
            id="analyze-fit-btn"
          >
            <Target size={16} />
            {isAnalyzing ? 'Analyzing...' : '🎯 Analyze My Fit'}
          </motion.button>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="mb-6 rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-syne font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Analyzing your fit...
              </p>
              <LoadingSequence messages={LOADING_MESSAGES} active={isAnalyzing} />
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {hasResults && !isAnalyzing && matchScore !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Score Card */}
                <div
                  className="rounded-2xl border p-8 flex flex-col md:flex-row items-center gap-8"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                  <div className="relative">
                    <ScoreRing score={matchScore} label={jdAnalysis?.scoreLabel} />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                      Match Score
                    </p>
                    <h3 className="font-syne font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                      {jdAnalysis?.roleName} at {jdAnalysis?.companyName}
                    </h3>
                    {lowScore && (
                      <p className="text-sm font-mono mt-2" style={{ color: 'var(--signal-amber)' }}>
                        You're early-stage for this role. Here's how to close the gap ↓
                      </p>
                    )}

                    {/* Score breakdown counts */}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                      <div className="text-center">
                        <p className="text-2xl font-syne font-bold" style={{ color: 'var(--accent)' }}>
                          {matchBreakdown.strong.length}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Strong</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-syne font-bold" style={{ color: 'var(--signal-amber)' }}>
                          {matchBreakdown.weak.length}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Partial</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-syne font-bold" style={{ color: 'var(--signal-red)' }}>
                          {matchBreakdown.missing.length}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Missing</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Strong Matches */}
                {matchBreakdown.strong.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-xl border p-5"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderLeft: '3px solid var(--accent)' }}
                  >
                    <SectionHeader icon="✅" label="Strong Match" count={matchBreakdown.strong.length} color="var(--accent)" />
                    <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
                      You match these requirements from the JD:
                    </p>
                    <div className="space-y-2">
                      {matchBreakdown.strong.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span style={{ color: 'var(--accent)' }}>•</span>
                          <div>
                            <span className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                              {item.requirement}
                            </span>
                            <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-muted)' }}>
                              ← {item.evidence}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ⚠️ Partial Matches */}
                {matchBreakdown.weak.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="rounded-xl border p-5"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderLeft: '3px solid var(--signal-amber)' }}
                  >
                    <SectionHeader icon="⚠️" label="Partial Match" count={matchBreakdown.weak.length} color="var(--signal-amber)" />
                    <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
                      You have adjacent experience but haven't framed it well:
                    </p>
                    <div className="space-y-3">
                      {matchBreakdown.weak.map((item, i) => (
                        <GapCard
                          key={i}
                          requirement={item.requirement}
                          evidence={item.evidence}
                          suggestedReframe={item.suggestedReframe}
                          severity="weak"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ❌ Missing */}
                {matchBreakdown.missing.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="rounded-xl border p-5"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderLeft: '3px solid var(--signal-red)' }}
                  >
                    <SectionHeader icon="❌" label="Missing / Gaps" count={matchBreakdown.missing.length} color="var(--signal-red)" />
                    <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Your resume doesn't address these JD requirements at all:
                    </p>
                    <div className="space-y-3">
                      {matchBreakdown.missing.map((item, i) => (
                        <GapCard
                          key={i}
                          requirement={item.requirement}
                          quickAdvice={item.quickAdvice}
                          severity="missing"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* JD Extracted Info (collapsible) */}
                {jdAnalysis?.jdAnalysis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border overflow-hidden"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  >
                    <button
                      onClick={() => setShowJdInfo(v => !v)}
                      className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
                      id="jd-info-toggle"
                    >
                      <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        JD Extracted Info
                      </span>
                      {showJdInfo ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                    </button>

                    <AnimatePresence>
                      {showJdInfo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                                Company & Role
                              </p>
                              <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                                {jdAnalysis.companyName} — {jdAnalysis.roleName}
                              </p>
                            </div>

                            {jdAnalysis.jdAnalysis.requiredSkills?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                                  Key Skills
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdAnalysis.jdAnalysis.requiredSkills.map((s, i) => (
                                    <Tag key={i} label={s} color="blue" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {jdAnalysis.jdAnalysis.softSkills?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                                  Soft Skills
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdAnalysis.jdAnalysis.softSkills.map((s, i) => (
                                    <Tag key={i} label={s} color="muted" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {jdAnalysis.jdAnalysis.responsibilities?.length > 0 && (
                              <div>
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                                  Responsibilities
                                </p>
                                <ul className="space-y-1">
                                  {jdAnalysis.jdAnalysis.responsibilities.map((r, i) => (
                                    <li key={i} className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                      • {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* CTA */}
                <button
                  onClick={() => navigate('/output')}
                  className="btn-accent w-full flex items-center justify-center gap-2 py-4"
                  id="generate-output-btn"
                >
                  Generate Tailored Resume & Cover Letter <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageMotion>
  )
}
