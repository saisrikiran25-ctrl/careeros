import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Target, FileText, ChevronDown } from 'lucide-react'

// ─── Word-by-word stagger ─────────────────────────────────────────────────
function AnimatedHeadline({ text }) {
  const words = text.split(' ')
  return (
    <span className="inline">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group flex-1 min-w-[220px] rounded-xl p-6 border transition-all duration-300 cursor-default"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
      whileHover={{
        borderColor: 'var(--accent)',
        boxShadow: '0 0 20px var(--accent-glow)',
        y: -3,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-dim)', border: '1px solid rgba(78,255,197,0.3)' }}
      >
        <Icon size={18} style={{ color: 'var(--accent)' }} />
      </div>
      <h3 className="font-syne font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-xs font-mono leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {desc}
      </p>
    </motion.div>
  )
}

// ─── Step Connector (animated dashed arrow, horizontally centred with circles) ───
function StepConnector({ delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div
      ref={ref}
      className="hidden md:flex items-center justify-center flex-1"
    >
      <svg width="100%" height="24" viewBox="0 0 120 24" preserveAspectRatio="none" className="overflow-visible w-full">
        {/* Dashed track */}
        <motion.line
          x1="0" y1="12" x2="120" y2="12"
          stroke="var(--border)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay }}
        />
        {/* Glowing travelling pulse */}
        <motion.line
          x1="0" y1="12" x2="120" y2="12"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="20 100"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 130 }}
          animate={inView ? { strokeDashoffset: -130 } : {}}
          transition={{ duration: 1.4, delay: delay + 0.2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Arrowhead */}
        <motion.polygon
          points="113,6 122,12 113,18"
          fill="var(--accent)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: delay + 0.4 }}
        />
      </svg>
    </div>
  )
}

// ─── Step Item ────────────────────────────────────────────────────────────
function FlowStep({ number, label, sub, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center min-w-[120px]"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-syne font-bold mb-3 border-2"
        style={{
          background: 'var(--accent-dim)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
          boxShadow: '0 0 20px var(--accent-glow)',
        }}
      >
        {number}
      </div>
      <p className="font-syne font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </motion.div>
  )
}

// ─── Page Transition Wrapper ───────────────────────────────────────────────
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

// ─── Landing Page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const featuresRef = useRef(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <PageMotion>
      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow blob */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(78,255,197,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-[900px] w-full mx-auto text-center">
          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-xs font-mono uppercase tracking-[0.25em] mb-6"
            style={{ color: 'var(--accent)' }}
          >
            AI Career Assistant for Students
          </motion.p>

          {/* H1 */}
          <h1 className="font-syne font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.08] mb-6 tracking-tight">
            <AnimatedHeadline text="Turn your resume into" />
            <br />
            <span className="text-gradient-accent">
              <AnimatedHeadline text="an unfair advantage." />
            </span>
          </h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="text-base md:text-lg font-mono leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            Paste a job description. CareerOS rewrites your resume, scores your fit, and writes a cover letter — in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate('/profile')}
              className="btn-accent flex items-center gap-2 text-base px-8 py-4"
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(78,255,197,0.3)' }}
              whileTap={{ scale: 0.98 }}
              id="get-started-btn"
            >
              Get Started
              <ArrowRight size={18} />
            </motion.button>
            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-2 text-sm font-mono underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
              id="how-it-works-btn"
            >
              See how it works
              <ChevronDown size={14} />
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
          >
            {['Resume Rewriting', 'Job Match Scoring', 'Cover Letter AI', 'Gap Analysis'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              What CareerOS does
            </p>
            <h2 className="font-syne font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
              Built for students who want callbacks.
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <FeatureCard
              icon={Zap}
              title="AI Resume Rewriter"
              desc="Kills weak bullets. Injects impact. Rewrites every line to lead with strong verbs and measurable outcomes."
              delay={0}
            />
            <FeatureCard
              icon={Target}
              title="Job Match Score"
              desc="Know exactly where you stand vs. the JD. Surface gaps before the recruiter does."
              delay={0.1}
            />
            <FeatureCard
              icon={FileText}
              title="Cover Letter Drafts"
              desc="Tailored. Fast. Sounds like you. Generated in seconds, editable in the app, ready to send."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── 4-Step Flow ── */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              How it works
            </p>
            <h2 className="font-syne font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
              Four steps to a better application.
            </h2>
          </div>

          {/* Two-row layout: circles + connectors on top, labels below */}
          <div className="hidden md:block">
            {/* Row 1: circles + connectors, perfectly inline */}
            <div className="flex items-center">
              {[{ number: '01', delay: 0 }, { number: '02', delay: 0.2 }, { number: '03', delay: 0.4 }, { number: '04', delay: 0.6 }].map((s, i) => (
                <React.Fragment key={s.number}>
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-syne font-bold border-2"
                    style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: s.delay }}
                  >
                    {s.number}
                  </motion.div>
                  {i < 3 && <StepConnector delay={s.delay + 0.15} />}
                </React.Fragment>
              ))}
            </div>

            {/* Row 2: labels underneath each circle */}
            <div className="flex mt-4">
              {[
                { label: 'Build Profile',  sub: 'Name, degree, experience, projects',  delay: 0 },
                { label: 'Upload Resume',  sub: 'AI rewrites every bullet for impact', delay: 0.2 },
                { label: 'Analyze JD',     sub: 'Match score + gap analysis',           delay: 0.4 },
                { label: 'Get Output',     sub: 'Tailored bullets + cover letter',      delay: 0.6 },
              ].map(({ label, sub, delay }, i) => (
                <React.Fragment key={label}>
                  <motion.div
                    className="flex-shrink-0 w-12 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay }}
                  >
                    <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', transform: 'translateX(-50%)', marginLeft: '24px' }}>{label}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', transform: 'translateX(-50%)', marginLeft: '24px' }}>{sub}</p>
                  </motion.div>
                  {i < 3 && <div className="flex-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile: stacked steps */}
          <div className="flex flex-col gap-4 md:hidden">
            {[
              { number: '01', label: 'Build Profile',  sub: 'Name, degree, experience, projects'  },
              { number: '02', label: 'Upload Resume',  sub: 'AI rewrites every bullet for impact' },
              { number: '03', label: 'Analyze JD',     sub: 'Match score + gap analysis'           },
              { number: '04', label: 'Get Output',     sub: 'Tailored bullets + cover letter'      },
            ].map(s => (
              <div key={s.number} className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-syne font-bold border-2"
                  style={{ background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  {s.number}
                </div>
                <div>
                  <p className="font-syne font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <motion.button
              onClick={() => navigate('/profile')}
              className="btn-accent flex items-center gap-2"
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(78,255,197,0.25)' }}
              whileTap={{ scale: 0.98 }}
              id="start-now-btn"
            >
              Start Now — It's Free
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Sample Output Preview ── */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-syne font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
              See the difference
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              CareerOS transforms weak bullets into compelling proof points.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-xl p-5 border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                ❌ Before
              </p>
              {[
                'helped professor with data entry and spreadsheet work',
                'worked on cleaning survey data for a study',
                'assisted with presentations to department',
              ].map((b, i) => (
                <p key={i} className="text-xs font-mono py-2 border-b leading-relaxed diff-original" style={{ borderColor: 'var(--border)' }}>
                  • {b}
                </p>
              ))}
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl p-5 border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
                ✨ After CareerOS
              </p>
              {[
                'Processed and validated 2,400+ survey records in Excel, reducing data error rate by [~15%]',
                'Cleaned and restructured dataset of 800+ psychology study responses for regression analysis',
                'Synthesized research findings into 3 department presentations, translating complex data for non-technical faculty',
              ].map((b, i) => (
                <p key={i} className="text-xs font-mono py-2 border-b leading-relaxed" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  • {b}
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-8" style={{ borderColor: 'var(--border)' }}>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: 'var(--accent)' }} />
            <span className="font-syne font-semibold text-sm" style={{ color: 'var(--accent)' }}>CareerOS</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Built with OpenRouter AI · CareerOS 2026
          </p>
        </div>
      </footer>
    </PageMotion>
  )
}
