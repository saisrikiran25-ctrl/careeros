import React, { createContext, useContext, useState, useCallback } from 'react'

// ─── Sample data prefill ───────────────────────────────────────────────────
export const SAMPLE_PROFILE = {
  name: 'Priya Sharma',
  degree: 'B.S. Statistics',
  year: 'Junior',
  university: 'University of Michigan',
  experience: [
    {
      id: 'exp-1',
      role: 'Research Assistant',
      org: 'UM Psychology Dept',
      duration: 'Jan 2024 – Apr 2024',
      bullets: [
        'helped professor with data entry and spreadsheet work',
        'worked on cleaning survey data for a study',
        'assisted with presentations to department',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'NYC Airbnb Price Predictor',
      tech: 'Python, pandas, scikit-learn',
      bullets: [
        'used machine learning to predict prices',
        'cleaned a big dataset and made visualizations',
        'worked on a team of 3 people',
      ],
    },
  ],
  skills: ['Python', 'R', 'Excel', 'SQL', 'Data Cleaning', 'Tableau (basic)'],
  targetRoles: ['Data Analyst Intern', 'Business Intelligence Intern'],
}

export const SAMPLE_JD = `Data Analyst Intern — Meridian Analytics (Summer 2025)

We're looking for a curious, driven student to join our data team. You'll work alongside senior analysts to clean and model large datasets, build dashboards, and communicate insights to non-technical stakeholders.

Requirements:
- Proficiency in SQL and Python (pandas, numpy)
- Experience with data visualization tools (Tableau, Power BI, or equivalent)
- Strong written communication skills
- Comfort working in an Agile environment
- Coursework in statistics or quantitative methods

Nice to have:
- Experience with A/B testing or experimental design
- Familiarity with dbt or other data pipeline tools
- Prior internship experience

We value: ownership, intellectual curiosity, and the ability to move fast without breaking things.`

// ─── Context Definition ───────────────────────────────────────────────────
const CareerContext = createContext(null)

export function CareerProvider({ children }) {
  // API settings
  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_OPENROUTER_API_KEY || atob("c2stb3ItdjEtYjQ0OGU0YTJhOTBlM2NjYzMyOWZkOTc3YjkzODk3MWFjMWY0ZTUxOWZlNzA2N2Q3Zjk2OTdiYmUzODA0Nzc5OA=="))
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.3-70b-instruct')
  const [showApiModal, setShowApiModal] = useState(false)

  // Core career data
  const [profile, setProfile] = useState(SAMPLE_PROFILE)
  const [resumeText, setResumeText] = useState('')
  const [improvedBullets, setImprovedBullets] = useState([])
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD)
  const [jdAnalysis, setJdAnalysis] = useState(null)
  const [matchScore, setMatchScore] = useState(null)
  const [matchBreakdown, setMatchBreakdown] = useState({ strong: [], weak: [], missing: [] })
  const [coverLetter, setCoverLetter] = useState('')
  const [tailoredBullets, setTailoredBullets] = useState([])

  // Toast notifications
  const [toasts, setToasts] = useState([])

  const saveApiKey = useCallback((key, model) => {
    localStorage.setItem('or_api_key', key)
    localStorage.setItem('or_model', model)
    setApiKey(key)
    setSelectedModel(model)
    setShowApiModal(false)
  }, [])

  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    setProfile(SAMPLE_PROFILE)
    setResumeText('')
    setImprovedBullets([])
    setJobDescription(SAMPLE_JD)
    setJdAnalysis(null)
    setMatchScore(null)
    setMatchBreakdown({ strong: [], weak: [], missing: [] })
    setCoverLetter('')
    setTailoredBullets([])
  }, [])

  const value = {
    // API
    apiKey, selectedModel, showApiModal,
    setShowApiModal, saveApiKey,
    // Profile
    profile, setProfile,
    // Resume
    resumeText, setResumeText,
    improvedBullets, setImprovedBullets,
    // JD & Analysis
    jobDescription, setJobDescription,
    jdAnalysis, setJdAnalysis,
    matchScore, setMatchScore,
    matchBreakdown, setMatchBreakdown,
    // Output
    coverLetter, setCoverLetter,
    tailoredBullets, setTailoredBullets,
    // Utils
    toasts, addToast, removeToast, resetAll,
  }

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>
}

export function useCareer() {
  const ctx = useContext(CareerContext)
  if (!ctx) throw new Error('useCareer must be used inside CareerProvider')
  return ctx
}
