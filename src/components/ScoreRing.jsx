import React, { useEffect, useState } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

function getScoreColor(score) {
  if (score >= 85) return 'var(--accent)'
  if (score >= 70) return 'var(--signal-blue)'
  if (score >= 50) return 'var(--signal-amber)'
  return 'var(--signal-red)'
}

function getScoreLabel(score) {
  if (score >= 85) return 'Strong Candidate'
  if (score >= 70) return 'Good Candidate'
  if (score >= 50) return 'Developing Candidate'
  return 'Early Stage'
}

export default function ScoreRing({ score = 0, label }) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!score) return
    let current = 0
    const end = score
    const step = (end / 1200) * 16
    const timer = setInterval(() => {
      current = Math.min(current + step, end)
      setDisplayScore(Math.round(current))
      if (current >= end) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const color = getScoreColor(score)
  const scoreLabel = label || getScoreLabel(score)
  const data = [{ value: displayScore, fill: color }]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 180, height: 180 }}>
        <RadialBarChart
          width={180}
          height={180}
          cx={90}
          cy={90}
          innerRadius={62}
          outerRadius={84}
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'var(--bg-elevated)' }}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={8}
          />
        </RadialBarChart>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-syne font-bold text-3xl leading-none" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
            / 100
          </span>
        </div>

        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          }}
        />
      </div>

      <p className="text-sm font-syne font-semibold" style={{ color }}>
        {scoreLabel}
      </p>
    </div>
  )
}
