import OpenAI from 'openai'

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for video script generation')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface VideoScriptResult {
  script: string // Full voice-over script
  hook: string // Opening hook (first 3 seconds)
  keyPoints: string[] // 2-3 key points
  cta: string // Call to action
  estimatedDuration: number // Seconds
}

/**
 * Generate a 30-second marketing video script from blog post content
 */
export async function generateVideoScript(
  title: string,
  excerpt: string,
  keywords: string[]
): Promise<VideoScriptResult> {
  console.log(`📝 Generating video script for: ${title}`)

  const prompt = `You are a marketing video scriptwriter. Create a compelling 30-second voice-over script for a marketing video.

BLOG POST:
Title: ${title}
Summary: ${excerpt}
Keywords: ${keywords.join(', ')}

REQUIREMENTS:
- 30 seconds duration (~75-90 words total)
- Hook: Attention-grabbing opening (5-7 words)
- Body: 2-3 key benefits/points (conversational, engaging)
- CTA: Strong call-to-action ending
- Tone: Warm, professional, helpful
- Target: Families preserving memories

OUTPUT FORMAT (JSON):
{
  "hook": "Opening sentence to grab attention",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "cta": "Call to action",
  "fullScript": "Complete voice-over script (hook + points + cta)"
}

Make it conversational and emotionally engaging. Focus on benefits, not features.`

  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No script generated')
  }

  const result = JSON.parse(content)

  // Estimate duration (average speaking rate: 150 words/minute = 2.5 words/second)
  const wordCount = result.fullScript.split(' ').length
  const estimatedDuration = Math.ceil(wordCount / 2.5)

  console.log(`✅ Script generated: ${wordCount} words, ~${estimatedDuration}s`)

  return {
    script: result.fullScript,
    hook: result.hook,
    keyPoints: result.keyPoints,
    cta: result.cta,
    estimatedDuration,
  }
}
