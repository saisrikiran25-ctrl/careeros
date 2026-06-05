// ─── OpenRouter API Service ────────────────────────────────────────────────
// Uses OpenAI-compatible chat completions endpoint

export const RECOMMENDED_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct',    label: 'Llama 3.3 70B',              badge: 'Open Source' },
]

/**
 * Call the OpenRouter API with a system + user message.
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model  - OpenRouter model ID
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>} - Raw response text (usually JSON)
 */
export async function callOpenRouter(apiKey, model, systemPrompt, userPrompt) {
  // Always use the user-provided OpenRouter API Key and Llama 3.3 70B model
  const fixedApiKey = import.meta.env.VITE_OPENROUTER_API_KEY || apiKey
  const fixedModel = 'meta-llama/llama-3.3-70b-instruct'

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${fixedApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'CareerOS',
    },
    body: JSON.stringify({
      model: fixedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const msg = errorData?.error?.message || `API error ${response.status}: ${response.statusText}`
    throw new Error(msg)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from AI. Please try again.')
  return content
}

/**
 * Parse JSON from AI response, stripping markdown code fences if present.
 */
export function parseJsonResponse(raw) {
  // Strip ```json ... ``` or ``` ... ```
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    // Try extracting first {...} or [...] block
    const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (match) {
      return JSON.parse(match[1])
    }
    throw new Error('Could not parse AI response as JSON. The model returned unexpected output.')
  }
}
