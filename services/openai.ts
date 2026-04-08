import OpenAI from 'openai'

// Singleton client — reused across all AI modules
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Shared helper: sends a prompt and forces JSON output.
 * Returns parsed JSON or throws with a descriptive message.
 */
export async function callOpenAI<T>(
  systemPrompt: string,
  userContent: string,
  fallback: T
): Promise<T> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) throw new Error('Empty response from OpenAI')
    return JSON.parse(raw) as T
  } catch (error) {
    console.error('[OpenAI] API error:', error)
    return fallback
  }
}

export default client
