import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertCircle, Lightbulb, ChevronRight } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import TagInput from '../components/TagInput'
import { useCareer } from '../context/CareerContext'

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

const TABS = ['Basics', 'Experience', 'Projects', 'Skills & Goals']

function Label({ children, required }) {
  return (
    <label className="block text-xs font-mono mb-1.5" style={{ color: 'var(--text-secondary)' }}>
      {children}
      {required && <span style={{ color: 'var(--accent)' }}> *</span>}
    </label>
  )
}

function InputField({ id, label, value, onChange, placeholder, required, error }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-base ${error ? 'border-[--signal-red]' : ''}`}
      />
      {error && (
        <p className="text-xs font-mono mt-1 flex items-center gap-1" style={{ color: 'var(--signal-red)' }}>
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile } = useCareer()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [errors, setErrors] = useState({})
  const [showNudge, setShowNudge] = useState(false)

  // ─── Basics ───────────────────────────────────────────────────────────────
  const updateBasic = (field, val) => setProfile(p => ({ ...p, [field]: val }))

  // ─── Experience ───────────────────────────────────────────────────────────
  const addExperience = () => {
    const newEntry = { id: `exp-${Date.now()}`, role: '', org: '', duration: '', bullets: [''] }
    setProfile(p => ({ ...p, experience: [...(p.experience || []), newEntry] }))
  }

  const updateExp = (id, field, val) => {
    setProfile(p => ({
      ...p,
      experience: p.experience.map(e => e.id === id ? { ...e, [field]: val } : e),
    }))
  }

  const updateExpBullet = (expId, idx, val) => {
    setProfile(p => ({
      ...p,
      experience: p.experience.map(e => {
        if (e.id !== expId) return e
        const bullets = [...e.bullets]
        bullets[idx] = val
        return { ...e, bullets }
      }),
    }))
    if (val.length > 20) setShowNudge(true)
  }

  const addExpBullet = (expId) => {
    setProfile(p => ({
      ...p,
      experience: p.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }))
  }

  const removeExpBullet = (expId, idx) => {
    setProfile(p => ({
      ...p,
      experience: p.experience.map(e => {
        if (e.id !== expId) return e
        const bullets = e.bullets.filter((_, i) => i !== idx)
        return { ...e, bullets: bullets.length ? bullets : [''] }
      }),
    }))
  }

  const removeExperience = (id) => {
    setProfile(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }))
  }

  // ─── Projects ─────────────────────────────────────────────────────────────
  const addProject = () => {
    const newProj = { id: `proj-${Date.now()}`, name: '', tech: '', bullets: [''] }
    setProfile(p => ({ ...p, projects: [...(p.projects || []), newProj] }))
  }

  const updateProj = (id, field, val) => {
    setProfile(p => ({
      ...p,
      projects: p.projects.map(pr => pr.id === id ? { ...pr, [field]: val } : pr),
    }))
  }

  const updateProjBullet = (projId, idx, val) => {
    setProfile(p => ({
      ...p,
      projects: p.projects.map(pr => {
        if (pr.id !== projId) return pr
        const bullets = [...pr.bullets]
        bullets[idx] = val
        return { ...pr, bullets }
      }),
    }))
  }

  const addProjBullet = (projId) => {
    setProfile(p => ({
      ...p,
      projects: p.projects.map(pr =>
        pr.id === projId ? { ...pr, bullets: [...pr.bullets, ''] } : pr
      ),
    }))
  }

  const removeProjBullet = (projId, idx) => {
    setProfile(p => ({
      ...p,
      projects: p.projects.map(pr => {
        if (pr.id !== projId) return pr
        const bullets = pr.bullets.filter((_, i) => i !== idx)
        return { ...pr, bullets: bullets.length ? bullets : [''] }
      }),
    }))
  }

  const removeProject = (id) => {
    setProfile(p => ({ ...p, projects: p.projects.filter(pr => pr.id !== id) }))
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!profile.name?.trim()) errs.name = 'Name is required'
    if (!profile.degree?.trim()) errs.degree = 'Degree is required'
    const hasContent = (profile.experience?.some(e => e.role.trim()) || profile.projects?.some(p => p.name.trim()))
    if (!hasContent) errs.content = 'Add at least one experience or project'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => {
    if (validate()) navigate('/resume')
  }

  // ─── Tab error indicators ──────────────────────────────────────────────────
  const tabHasError = {
    0: !!(errors.name || errors.degree),
    1: !!(errors.content && !profile.experience?.some(e => e.role.trim())),
    2: !!(errors.content && !profile.projects?.some(p => p.name.trim())),
    3: false,
  }

  return (
    <PageMotion>
      <div className="max-w-[900px] mx-auto">
        <ProgressBar currentStep={1} />

        <div className="px-6 pb-16">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-syne font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Tell us about yourself
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              This gives CareerOS the context it needs to write like you — not like a template.
            </p>
          </div>

          {/* Global content error */}
          {errors.content && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)' }}>
              <AlertCircle size={14} style={{ color: 'var(--signal-red)' }} />
              <p className="text-xs font-mono" style={{ color: 'var(--signal-red)' }}>{errors.content}</p>
            </div>
          )}

          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                id={`profile-tab-${i}`}
                onClick={() => setActiveTab(i)}
                className="relative flex-1 py-2.5 px-3 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: activeTab === i ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === i ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: activeTab === i ? '1px solid var(--border-active)' : '1px solid transparent',
                }}
              >
                {tab}
                {tabHasError[i] && (
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--signal-red)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── Tab 0: Basics ── */}
              {activeTab === 0 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField
                      id="profile-name"
                      label="Full Name"
                      value={profile.name || ''}
                      onChange={v => updateBasic('name', v)}
                      placeholder="Priya Sharma"
                      required
                      error={errors.name}
                    />
                    <div>
                      <Label required>Year</Label>
                      <select
                        id="profile-year"
                        value={profile.year || ''}
                        onChange={e => updateBasic('year', e.target.value)}
                        className="input-base"
                      >
                        {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <InputField
                    id="profile-degree"
                    label="Degree"
                    value={profile.degree || ''}
                    onChange={v => updateBasic('degree', v)}
                    placeholder="B.S. Statistics"
                    required
                    error={errors.degree}
                  />
                  <InputField
                    id="profile-university"
                    label="University"
                    value={profile.university || ''}
                    onChange={v => updateBasic('university', v)}
                    placeholder="University of Michigan"
                  />
                </div>
              )}

              {/* ── Tab 1: Experience ── */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <AnimatePresence>
                    {(profile.experience || []).map((exp, expIdx) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl p-5 border"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            Experience {expIdx + 1}
                          </span>
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Remove experience"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>Role / Title</Label>
                            <input
                              id={`exp-role-${exp.id}`}
                              type="text"
                              value={exp.role}
                              onChange={e => updateExp(exp.id, 'role', e.target.value)}
                              placeholder="Research Assistant"
                              className="input-base"
                            />
                          </div>
                          <div>
                            <Label>Organization</Label>
                            <input
                              id={`exp-org-${exp.id}`}
                              type="text"
                              value={exp.org}
                              onChange={e => updateExp(exp.id, 'org', e.target.value)}
                              placeholder="UM Psychology Dept"
                              className="input-base"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label>Duration</Label>
                          <input
                            id={`exp-duration-${exp.id}`}
                            type="text"
                            value={exp.duration}
                            onChange={e => updateExp(exp.id, 'duration', e.target.value)}
                            placeholder="Jan 2024 – Apr 2024"
                            className="input-base"
                          />
                        </div>

                        <div>
                          <Label>Bullet Points</Label>
                          <div className="space-y-2">
                            {exp.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex gap-2 items-start">
                                <span className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={e => updateExpBullet(exp.id, bIdx, e.target.value)}
                                  placeholder="Describe what you did..."
                                  className="input-base flex-1"
                                />
                                <button
                                  onClick={() => removeExpBullet(exp.id, bIdx)}
                                  className="mt-2.5 p-1.5 rounded transition-colors hover:bg-red-500/10"
                                  style={{ color: 'var(--text-muted)' }}
                                  aria-label="Remove bullet"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addExpBullet(exp.id)}
                              className="text-xs font-mono flex items-center gap-1 mt-1 transition-colors hover:opacity-80"
                              style={{ color: 'var(--accent)' }}
                            >
                              <Plus size={12} /> Add bullet
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={addExperience}
                    className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-mono flex items-center justify-center gap-2 transition-all hover:border-[--accent] hover:text-[--accent]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    id="add-experience-btn"
                  >
                    <Plus size={14} /> Add Experience
                  </button>

                  {/* Nudge banner */}
                  <AnimatePresence>
                    {showNudge && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: 'rgba(78,255,197,0.06)', border: '1px solid rgba(78,255,197,0.2)' }}
                      >
                        <Lightbulb size={15} style={{ color: 'var(--accent)' }} className="mt-0.5" />
                        <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent)' }}>Tip:</span>{' '}
                          Don't worry about making bullets perfect yet — CareerOS will improve them in the next step.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Tab 2: Projects ── */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <AnimatePresence>
                    {(profile.projects || []).map((proj, projIdx) => (
                      <motion.div
                        key={proj.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-xl p-5 border"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            Project {projIdx + 1}
                          </span>
                          <button
                            onClick={() => removeProject(proj.id)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Remove project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label>Project Name</Label>
                            <input
                              id={`proj-name-${proj.id}`}
                              type="text"
                              value={proj.name}
                              onChange={e => updateProj(proj.id, 'name', e.target.value)}
                              placeholder="NYC Airbnb Price Predictor"
                              className="input-base"
                            />
                          </div>
                          <div>
                            <Label>Technologies Used</Label>
                            <input
                              id={`proj-tech-${proj.id}`}
                              type="text"
                              value={proj.tech}
                              onChange={e => updateProj(proj.id, 'tech', e.target.value)}
                              placeholder="Python, pandas, scikit-learn"
                              className="input-base"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Bullet Points</Label>
                          <div className="space-y-2">
                            {proj.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex gap-2 items-start">
                                <span className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                                <input
                                  type="text"
                                  value={bullet}
                                  onChange={e => updateProjBullet(proj.id, bIdx, e.target.value)}
                                  placeholder="Describe what you built or achieved..."
                                  className="input-base flex-1"
                                />
                                <button
                                  onClick={() => removeProjBullet(proj.id, bIdx)}
                                  className="mt-2.5 p-1.5 rounded transition-colors hover:bg-red-500/10"
                                  style={{ color: 'var(--text-muted)' }}
                                  aria-label="Remove bullet"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addProjBullet(proj.id)}
                              className="text-xs font-mono flex items-center gap-1 mt-1 transition-colors hover:opacity-80"
                              style={{ color: 'var(--accent)' }}
                            >
                              <Plus size={12} /> Add bullet
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={addProject}
                    className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-mono flex items-center justify-center gap-2 transition-all hover:border-[--accent] hover:text-[--accent]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    id="add-project-btn"
                  >
                    <Plus size={14} /> Add Project
                  </button>
                </div>
              )}

              {/* ── Tab 3: Skills & Goals ── */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Skills
                    </label>
                    <TagInput
                      values={profile.skills || []}
                      onChange={v => setProfile(p => ({ ...p, skills: v }))}
                      placeholder="Type a skill and press Enter..."
                      suggestionType="skills"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Target Roles
                    </label>
                    <TagInput
                      values={profile.targetRoles || []}
                      onChange={v => setProfile(p => ({ ...p, targetRoles: v }))}
                      placeholder="Type a role and press Enter..."
                      suggestionType="roles"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {activeTab > 0 && (
              <button
                onClick={() => setActiveTab(t => t - 1)}
                className="btn-ghost flex-1 sm:flex-none sm:w-32"
              >
                ← Back
              </button>
            )}

            {activeTab < TABS.length - 1 ? (
              <button
                onClick={() => setActiveTab(t => t + 1)}
                className="btn-accent flex-1 flex items-center justify-center gap-2"
                id="next-tab-btn"
              >
                Next: {TABS[activeTab + 1]} <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="btn-accent flex-1 flex items-center justify-center gap-2"
                id="save-profile-btn"
              >
                Save Profile & Continue <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </PageMotion>
  )
}
