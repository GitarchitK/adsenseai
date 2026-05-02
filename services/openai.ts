import OpenAI from 'openai'

// Singleton client — reused across all AI modules
// Strip surrounding quotes in case the env var was set with quotes in Vercel
const rawKey = process.env.OPENAI_API_KEY ?? ''
const apiKey = rawKey.replace(/^["']|["']$/g, '').trim()

const client = new OpenAI({ apiKey })

/**
 * Shared helper: sends a prompt and forces JSON output.
 * Uses gpt-4o for deep analysis modules, gpt-4o-mini for lighter tasks.
 */
export async function callOpenAI<T>(
  systemPrompt: string,
  userContent: string,
  fallback: T,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
  maxTokens = 2000
): Promise<T> {
  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,  // Lower temperature = more consistent, factual output
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: maxTokens,
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) throw new Error('Empty response from OpenAI')
    return JSON.parse(raw) as T
  } catch (error) {
    console.error('[OpenAI] API error:', error)
    return fallback
  }
}

/**
 * For the strategic advice (action plan, roadmap) — uses gpt-4o for better reasoning
 */
export async function callOpenAIAdvanced<T>(
  systemPrompt: string,
  userContent: string,
  fallback: T
): Promise<T> {
  return callOpenAI<T>(systemPrompt, userContent, fallback, 'gpt-4o')
}

export default client
