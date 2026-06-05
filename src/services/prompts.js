// ─── AI Prompt Templates ───────────────────────────────────────────────────

export const RESUME_SYSTEM_PROMPT = `You are an expert career coach and resume editor specializing in student internship and entry-level applications. Your rewrites are sharp, honest, and grounded in the student's actual experience — you never fabricate or exaggerate. You respond ONLY with valid JSON — no markdown, no explanation.`

export function buildRewritePrompt(profile, bullets, tone = 'Short & Sharp') {
  const toneMap = {
    'Short & Sharp': 'concise and punchy — 1 line max per bullet',
    'Detailed': 'detailed with context and full impact description — 1-2 lines',
    'Technical Focus': 'technical and precise — emphasize tools, methods, technologies used',
  }
  const toneInstruction = toneMap[tone] || toneMap['Short & Sharp']

  return `Rewrite the following resume bullets to be more impactful and professional.

Follow these rules strictly:
1. Start each bullet with a STRONG action verb (Led, Built, Designed, Reduced, Analyzed, etc.)
2. Add context and outcome where inferable from the original text
3. Suggest a measurable metric in [brackets] if one is missing, clearly marked as a suggestion
4. Flag and eliminate vague phrases ("helped with", "worked on", "responsible for", "assisted with")
5. Tone style: ${toneInstruction}

Student background: ${profile.degree}, ${profile.year} at ${profile.university}, targeting ${profile.targetRoles?.join(', ') || 'general roles'}

Bullets to improve:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Respond ONLY with this JSON structure (no markdown, no extra text):
{
  "improved": [
    {
      "original": "exact original bullet text",
      "rewritten": "improved bullet text",
      "improvements": ["Strong action verb", "Added outcome", "Eliminated vague phrase"],
      "metricSuggestion": "suggested metric text or null"
    }
  ]
}`
}

// ─── JD Analysis & Match Scoring ──────────────────────────────────────────

export const ANALYZE_SYSTEM_PROMPT = `You are an expert ATS system and career coach. You parse job descriptions with precision and match them against candidate profiles honestly and rigorously. You do not hallucinate skills the candidate doesn't have. You respond ONLY with valid JSON — no markdown, no explanation.`

export function buildAnalyzePrompt(profile, jobDescription, improvedBullets = []) {
  const allExperienceBullets = profile.experience?.flatMap(e => e.bullets) || []
  const allProjectBullets = profile.projects?.flatMap(p => p.bullets) || []
  const improved = improvedBullets.map(b => b.rewritten).filter(Boolean)

  return `Analyze this job description and compare it to the candidate's profile.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
Name: ${profile.name}
Degree: ${profile.degree}, ${profile.year} at ${profile.university}
Skills: ${profile.skills?.join(', ') || 'None listed'}
Experience bullets: ${allExperienceBullets.join(' | ')}
Project bullets: ${allProjectBullets.join(' | ')}
${improved.length ? `AI-improved bullets: ${improved.join(' | ')}` : ''}

Return ONLY this JSON (no markdown, no extra text):
{
  "companyName": "company name from JD",
  "roleName": "exact role title from JD",
  "jdAnalysis": {
    "requiredSkills": ["skill1", "skill2"],
    "responsibilities": ["responsibility1", "responsibility2"],
    "softSkills": ["skill1", "skill2"]
  },
  "matchScore": 72,
  "scoreLabel": "Strong Candidate",
  "strong": [
    { "requirement": "requirement text", "evidence": "where in the candidate's profile this shows up" }
  ],
  "weak": [
    { "requirement": "requirement text", "evidence": "adjacent experience found", "suggestedReframe": "how to reframe it" }
  ],
  "missing": [
    { "requirement": "requirement text", "quickAdvice": "how to address this gap honestly" }
  ]
}

scoreLabel must be one of: "Strong Candidate" | "Good Candidate" | "Developing Candidate" | "Early Stage"
Be rigorous: only mark "strong" if there is explicit evidence. Mark "weak" if the connection requires interpretation. Mark "missing" if there is zero signal.`
}

// ─── Tailored Bullets ─────────────────────────────────────────────────────

export const TAILOR_SYSTEM_PROMPT = `You are a senior career coach who specializes in tailoring resumes for specific job applications. You write bullet points that mirror the language of a job description without fabricating experience. You draw direct lines between what the candidate has done and what the employer is asking for. You respond ONLY with valid JSON — no markdown, no explanation.`

export function buildTailoredBulletsPrompt(jdAnalysis, bullets, preset = 'Data & Analytics') {
  return `Rewrite these resume bullets to align with the following job description.
Mirror the JD's language naturally — don't keyword-stuff.

JOB: ${jdAnalysis.roleName} at ${jdAnalysis.companyName}
JD KEYWORDS: ${jdAnalysis.jdAnalysis?.requiredSkills?.join(', ') || ''}
JD RESPONSIBILITIES: ${jdAnalysis.jdAnalysis?.responsibilities?.join(', ') || ''}
ROLE TYPE: ${preset}

BULLETS TO TAILOR:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return ONLY this JSON (no markdown, no extra text):
{
  "tailored": [
    {
      "original": "original bullet text",
      "rewritten": "rewritten bullet tailored to JD",
      "jdAlignments": ["mirrors 'data cleaning' from JD", "uses stakeholder language from JD"]
    }
  ]
}`
}

// ─── Cover Letter ─────────────────────────────────────────────────────────

export const COVER_LETTER_SYSTEM_PROMPT = `You write concise, authentic cover letters for students applying to internships. You never use hollow phrases like "I am a passionate and dedicated individual." You write like a sharp person — specific, confident, and human. Structure: 4 paragraphs (intro/hook → why this company → 2-3 specific proof points → close/CTA). Max 280 words. Respond with ONLY the cover letter text — no subject line, no JSON wrapper.`

export function buildCoverLetterPrompt(profile, jdAnalysis, matchBreakdown, tone = 'Conversational') {
  const strongEvidence = matchBreakdown.strong?.map(s => `- ${s.requirement}: ${s.evidence}`).join('\n') || ''
  const responsibilities = jdAnalysis.jdAnalysis?.responsibilities?.join(', ') || ''
  const softSkills = jdAnalysis.jdAnalysis?.softSkills?.join(', ') || ''

  const toneMap = {
    'Formal': 'professional and formal — measured, precise, corporate tone',
    'Conversational': 'conversational and warm — smart but approachable, like a talented human wrote this',
    'Enthusiastic': 'energetic and enthusiastic — genuine excitement that still sounds intelligent',
  }

  return `Write a tailored cover letter for this student applying to this role.

STUDENT:
Name: ${profile.name}
Degree: ${profile.degree}, ${profile.year} at ${profile.university}
Target role: ${jdAnalysis.roleName} at ${jdAnalysis.companyName}

THEIR STRONGEST EXPERIENCES (from match analysis):
${strongEvidence || 'No strong matches identified yet'}

JD RESPONSIBILITIES TO MIRROR:
${responsibilities}

JD SOFT SKILLS TO REFLECT:
${softSkills}

TONE: ${toneMap[tone] || toneMap['Conversational']}

Rules:
- Open with a specific hook (not "I am writing to apply...")
- Paragraph 2: why this specific company (use the company name naturally)
- Paragraph 3-4: 2-3 concrete proof points from their experience
- Close with confident CTA
- Salutation: "Dear Hiring Manager,"
- No placeholders. No "[Your Name]". No subject line. Sign off with the student's actual name.
- MAX 280 words. Count carefully.

Write the complete cover letter now:`
}
