import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import client from '@/services/openai'

// ── Tool prompt builders ────────────────────────────────────────────────────

type ToolResult =
  | { system: string; user: string; json: true }
  | { system: string; user: string; json: false }

function buildPrompt(tool: string, inputs: Record<string, string>): ToolResult | null {
  switch (tool) {
    // ── NICHE CHECKER ────────────────────────────────────────────────────────
    case 'niche-checker':
      return {
        system: 'You are an AdSense monetization expert with 10+ years of experience evaluating blog niches for Google AdSense approval and revenue potential.',
        user: `Analyze the following niche for AdSense profitability and approval risk.

Niche: ${inputs.niche || 'Not provided'}

Provide:
1. AdSense approval risk (Low / Medium / High) with reasoning
2. Average CPC range (USD)
3. Top 5 profitable sub-niches
4. Content policy red flags to avoid
5. Monetization alternatives if AdSense risk is high
6. Overall recommendation (Proceed / Proceed with caution / Avoid)

Be specific, data-driven, and practical.`,
        json: false,
      }

    // ── ELIGIBILITY CHECKLIST ────────────────────────────────────────────────
    case 'eligibility-checklist':
      return {
        system: 'You are a Google AdSense eligibility expert. Return only valid JSON.',
        user: `Evaluate this blog for AdSense eligibility and return a JSON checklist.

URL: ${inputs.url || 'Not provided'}
Domain age (months): ${inputs.domain_age_months || 'Unknown'}
Number of articles: ${inputs.article_count || 'Unknown'}
Average word count: ${inputs.avg_word_count || 'Unknown'}

Return JSON exactly like:
{
  "overall_status": "Likely Eligible | Borderline | Not Eligible",
  "score": 72,
  "checklist": [
    { "item": "Domain Age", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Content Volume", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Content Quality (word count)", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Custom Domain", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Privacy Policy", "status": "pass | fail | warning", "detail": "..." },
    { "item": "About Page", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Contact Page", "status": "pass | fail | warning", "detail": "..." },
    { "item": "Navigation & UX", "status": "pass | fail | warning", "detail": "..." }
  ],
  "top_issues": ["..."],
  "next_steps": ["..."]
}`,
        json: true,
      }

    // ── BLOG INTRO ────────────────────────────────────────────────────────────
    case 'blog-intro':
      return {
        system: 'You are a professional blog writer specializing in SEO-optimized, engaging content.',
        user: `Write a compelling 2-paragraph blog introduction.

Topic: ${inputs.topic || 'Not provided'}
Target keywords: ${inputs.keywords || 'None specified'}
Tone: ${inputs.tone || 'Informative'}

Requirements:
- Hook the reader in the first sentence
- Naturally include the target keywords
- End with a smooth transition to the body content
- Each paragraph should be 60-90 words
- Match the specified tone throughout`,
        json: false,
      }

    // ── BLOG OUTLINE ─────────────────────────────────────────────────────────
    case 'blog-outline':
      return {
        system: 'You are an expert content strategist and SEO writer.',
        user: `Create a detailed blog post outline using H2 and H3 headings.

Topic: ${inputs.topic || 'Not provided'}
Target word count: ${inputs.word_count || '1500'} words
Target audience: ${inputs.audience || 'General readers'}

Requirements:
- Include an Introduction section
- Include a Conclusion section
- Use H2 for main sections, H3 for subsections
- Each H2 section should have 2-4 H3 subsections where appropriate
- Ensure the outline covers the topic comprehensively for the target audience
- Format using markdown heading syntax (## and ###)`,
        json: false,
      }

    // ── FAQ GENERATOR ─────────────────────────────────────────────────────────
    case 'faq-generator':
      return {
        system: 'You are an SEO content expert. Generate FAQs with valid JSON-LD schema. Return only valid JSON.',
        user: `Generate ${inputs.count || '5'} frequently asked questions about the following topic with answers and JSON-LD schema markup.

Topic: ${inputs.topic || 'Not provided'}

Return JSON exactly like:
{
  "faqs": [
    { "question": "...", "answer": "..." }
  ],
  "jsonLd": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "...",
        "acceptedAnswer": { "@type": "Answer", "text": "..." }
      }
    ]
  }
}`,
        json: true,
      }

    // ── CTA GENERATOR ─────────────────────────────────────────────────────────
    case 'cta-generator':
      return {
        system: 'You are a conversion copywriting expert with deep knowledge of persuasion psychology.',
        user: `Generate 3 high-converting call-to-action (CTA) variations.

Goal: ${inputs.goal || 'Not provided'}
Context/Page: ${inputs.context || 'General blog post'}
Style: ${inputs.style || 'Professional'}

For each CTA provide:
1. Headline (max 8 words)
2. Subtext (max 20 words)
3. Button text (max 5 words)
4. Psychological trigger used (e.g., urgency, social proof, FOMO)

Format clearly with CTA 1, CTA 2, CTA 3 labels.`,
        json: false,
      }

    // ── SUMMARIZER ───────────────────────────────────────────────────────────
    case 'summarizer':
      return {
        system: 'You are an expert content summarizer. Preserve key information and main arguments.',
        user: `Summarize the following content.

Desired length: ${inputs.length || 'Medium (150-200 words)'}

Content:
${inputs.content || 'No content provided'}

Requirements:
- Preserve the main points and key takeaways
- Use clear, concise language
- Maintain the original meaning without distortion
- Output a coherent, well-structured summary`,
        json: false,
      }

    // ── CONTENT EXPANDER ─────────────────────────────────────────────────────
    case 'content-expander':
      return {
        system: 'You are a skilled content writer who expands content while preserving the original voice and intent.',
        user: `Expand the following content to approximately ${inputs.target_words || '500'} words.

Original content:
${inputs.content || 'No content provided'}

Requirements:
- Preserve the original tone and voice
- Add relevant examples, explanations, and details
- Do not introduce inaccurate information
- Keep the expanded content engaging and readable
- Maintain natural flow between original and added content`,
        json: false,
      }

    // ── PARAGRAPH REWRITER ───────────────────────────────────────────────────
    case 'paragraph-rewriter':
      return {
        system: 'You are an expert editor who rewrites content to match different styles while preserving meaning.',
        user: `Rewrite the following content in the specified style.

Style: ${inputs.style || 'Professional'}

Original content:
${inputs.content || 'No content provided'}

Requirements:
- Fully preserve the original meaning and information
- Match the specified style authentically
- Improve clarity and readability where possible
- Do not add or remove key facts`,
        json: false,
      }

    // ── HEADLINE ANALYZER ────────────────────────────────────────────────────
    case 'headline-analyzer':
      return {
        system: 'You are a headline optimization expert who analyzes headlines for engagement, SEO, and click-through potential.',
        user: `Analyze the following headline and provide a score and feedback.

Headline: ${inputs.headline || 'Not provided'}
Niche: ${inputs.niche || 'General'}

Provide:
1. Overall score (0-100)
2. Breakdown scores for: Clarity (0-20), Emotional appeal (0-20), SEO strength (0-20), Specificity (0-20), Power words (0-20)
3. Strengths (2-3 bullet points)
4. Weaknesses (2-3 bullet points)
5. Three improved headline alternatives
6. Character count and whether it's optimal for SEO (50-60 chars)`,
        json: false,
      }

    // ── SCHEMA GENERATOR ─────────────────────────────────────────────────────
    case 'schema-generator':
      return {
        system: 'You are a structured data expert. Generate valid JSON-LD schema markup. Return only valid JSON.',
        user: `Generate JSON-LD schema markup for the following.

Schema type: ${inputs.type || 'Article'}
Title/Name: ${inputs.title || 'Not provided'}
Description: ${inputs.description || 'Not provided'}
URL: ${inputs.url || 'https://example.com'}

Return JSON exactly like:
{
  "schema": {
    "@context": "https://schema.org",
    "@type": "${inputs.type || 'Article'}",
    "headline": "...",
    "description": "...",
    "url": "..."
  },
  "code": "<script type=\\"application/ld+json\\">...</script>"
}`,
        json: true,
      }

    // ── OG GENERATOR ─────────────────────────────────────────────────────────
    case 'og-generator':
      return {
        system: 'You are an Open Graph meta tag expert. Return only valid JSON.',
        user: `Generate complete Open Graph meta tags for the following page.

Title: ${inputs.title || 'Not provided'}
Description: ${inputs.description || 'Not provided'}
URL: ${inputs.url || 'https://example.com'}
Image URL: ${inputs.image_url || ''}

Return JSON exactly like:
{
  "tags": [
    { "property": "og:title", "content": "..." },
    { "property": "og:description", "content": "..." },
    { "property": "og:url", "content": "..." },
    { "property": "og:type", "content": "website" },
    { "property": "og:image", "content": "..." }
  ],
  "html": "<meta property=\\"og:title\\" content=\\"...\\" />\n..."
}`,
        json: true,
      }

    // ── TWITTER CARD ─────────────────────────────────────────────────────────
    case 'twitter-card':
      return {
        system: 'You are a Twitter/X card meta tag expert. Return only valid JSON.',
        user: `Generate Twitter Card meta tags for the following.

Title: ${inputs.title || 'Not provided'}
Description: ${inputs.description || 'Not provided'}
Card type: ${inputs.card_type || 'summary_large_image'}
Site handle: ${inputs.site_handle || '@yourblog'}

Return JSON exactly like:
{
  "tags": [
    { "name": "twitter:card", "content": "..." },
    { "name": "twitter:title", "content": "..." },
    { "name": "twitter:description", "content": "..." },
    { "name": "twitter:site", "content": "..." }
  ],
  "html": "<meta name=\\"twitter:card\\" content=\\"...\\" />\n..."
}`,
        json: true,
      }

    // ── READABILITY ──────────────────────────────────────────────────────────
    case 'readability':
      return {
        system: 'You are a readability analysis expert.',
        user: `Analyze the readability of the following content.

Content:
${inputs.content || 'No content provided'}

Calculate and provide:
1. Estimated Flesch Reading Ease score (0-100) — show your calculation logic briefly
2. Approximate US grade level equivalent
3. Average sentence length (words)
4. Average syllables per word (estimated)
5. Readability rating (Very Easy / Easy / Fairly Easy / Standard / Fairly Difficult / Difficult / Very Difficult)
6. Top 3 specific suggestions to improve readability
7. Percentage of complex words (3+ syllables)`,
        json: false,
      }

    // ── HREFLANG ─────────────────────────────────────────────────────────────
    case 'hreflang':
      return {
        system: 'You are an international SEO expert specializing in hreflang implementation. Return only valid JSON.',
        user: `Generate hreflang link tags for the following pages.

Pages (one URL per line):
${inputs.pages || 'https://example.com/page'}

Languages/regions (one per line, e.g., en-US, fr-FR, es):
${inputs.langs || 'en'}

Return JSON exactly like:
{
  "hreflang_tags": [
    { "hreflang": "en-US", "href": "https://example.com/page" }
  ],
  "html": "<link rel=\\"alternate\\" hreflang=\\"en-US\\" href=\\"...\\" />\n...",
  "notes": "..."
}`,
        json: true,
      }

    // ── ALT TEXT ─────────────────────────────────────────────────────────────
    case 'alt-text':
      return {
        system: 'You are an accessibility and SEO expert specializing in image alt text optimization.',
        user: `Generate 3 alt text options for an image.

Image context/description: ${inputs.image_context || 'Not provided'}
Article topic: ${inputs.article_topic || 'Not provided'}

Provide 3 alt text options:
1. SEO-optimized (includes relevant keywords naturally)
2. Descriptive/accessibility-focused (purely descriptive for screen readers)
3. Concise (short and punchy)

For each, explain the approach in one sentence. Keep alt text under 125 characters each.`,
        json: false,
      }

    // ── TOS GENERATOR ────────────────────────────────────────────────────────
    case 'tos-generator':
      return {
        system: 'You are a legal content writer specializing in website legal documents.',
        user: `Generate a comprehensive Terms of Service document for a blog/website.

Website name: ${inputs.website_name || '[Website Name]'}
Website URL: ${inputs.website_url || '[Website URL]'}
Business type: ${inputs.business_type || 'Blog/Content Website'}
Contact email: ${inputs.contact_email || '[contact@example.com]'}

Include sections for:
1. Acceptance of Terms
2. Use of the Website
3. Intellectual Property
4. User-Generated Content (if applicable)
5. Disclaimers and Limitation of Liability
6. Third-Party Links
7. Privacy Policy Reference
8. Modifications to Terms
9. Governing Law
10. Contact Information

Note: This is a template for informational purposes. Users should consult a lawyer for legal advice.`,
        json: false,
      }

    // ── DISCLAIMER GENERATOR ─────────────────────────────────────────────────
    case 'disclaimer-generator':
      return {
        system: 'You are a legal content writer specializing in website disclaimers.',
        user: `Generate a comprehensive Disclaimer document for a blog/website.

Website name: ${inputs.website_name || '[Website Name]'}
Niche/Topic: ${inputs.niche || 'General blogging'}
Has affiliate links: ${inputs.has_affiliate || 'Yes'}
Has sponsored content: ${inputs.has_sponsored || 'No'}

Include:
1. General disclaimer
2. Affiliate disclosure (FTC compliant)
3. Earnings/results disclaimer (if applicable)
4. Professional advice disclaimer (medical/legal/financial if relevant)
5. External links disclaimer
6. Accuracy disclaimer

Format as a proper legal document with clear sections.`,
        json: false,
      }

    // ── COOKIE POLICY ────────────────────────────────────────────────────────
    case 'cookie-policy':
      return {
        system: 'You are a privacy law expert specializing in GDPR and CCPA compliant cookie policies.',
        user: `Generate a GDPR/CCPA compliant Cookie Policy for a blog/website.

Website name: ${inputs.website_name || '[Website Name]'}
Uses Google Analytics: ${inputs.uses_analytics || 'Yes'}
Uses AdSense: ${inputs.uses_adsense || 'Yes'}
Uses social media pixels: ${inputs.uses_social_pixels || 'No'}
Contact email: ${inputs.contact_email || '[contact@example.com]'}

Include:
1. What cookies are and why we use them
2. Types of cookies used (Essential, Analytics, Advertising, Social Media)
3. Specific cookies listed (Google Analytics, AdSense, etc.)
4. How to control cookies
5. Third-party cookies
6. Cookie consent
7. Updates to this policy
8. Contact information`,
        json: false,
      }

    // ── JSON-LD VALIDATOR ────────────────────────────────────────────────────
    case 'json-ld-validator':
      return {
        system: 'You are a structured data validation expert with deep knowledge of Schema.org specifications.',
        user: `Validate the following JSON-LD structured data.

JSON-LD:
${inputs.jsonld || inputs.content || 'No JSON-LD provided'}

Check for:
1. Valid JSON syntax
2. Required @context and @type properties
3. Correct Schema.org type and property names
4. Required properties for the given @type
5. Recommended properties that are missing
6. Common mistakes (wrong property names, incorrect value types)
7. Google Rich Results eligibility

Provide:
- Overall status: VALID / WARNINGS / ERRORS
- List of errors (if any)
- List of warnings (if any)
- Suggestions for improvement
- Whether it qualifies for Google Rich Results`,
        json: false,
      }

    // ── ROBOTS GENERATOR ─────────────────────────────────────────────────────
    case 'robots-generator':
      return {
        system: 'You are an SEO technical expert specializing in robots.txt configuration.',
        user: `Generate an optimized robots.txt file for a blog/website.

Website URL: ${inputs.website_url || 'https://example.com'}
CMS: ${inputs.cms || 'WordPress'}
Has sitemap: ${inputs.has_sitemap || 'Yes'}
Paths to block: ${inputs.block_paths || 'Admin areas, private pages'}
Allow all crawlers: ${inputs.allow_all || 'Yes'}

Generate a robots.txt file that:
1. Allows Googlebot and major crawlers full access to content
2. Blocks admin/login pages and sensitive paths
3. Blocks resource-wasting crawlers
4. Includes the sitemap URL
5. Follows best practices for AdSense/SEO blogs

Show the complete robots.txt content in a code block, then explain each rule.`,
        json: false,
      }

    // ── SITEMAP GENERATOR ────────────────────────────────────────────────────
    case 'sitemap-generator':
      return {
        system: 'You are an SEO technical expert specializing in XML sitemaps.',
        user: `Provide a step-by-step guide to generate and submit an XML sitemap.

CMS: ${inputs.cms || 'WordPress'}
Website URL: ${inputs.website_url || 'https://example.com'}

Include:
1. How to generate the sitemap for the specific CMS (plugin/built-in method)
2. What to include/exclude in the sitemap
3. How to verify the sitemap is working
4. How to submit to Google Search Console
5. How to submit to Bing Webmaster Tools
6. How to add the sitemap to robots.txt
7. Best practices for sitemap maintenance
8. Common mistakes to avoid

Be specific to the CMS mentioned.`,
        json: false,
      }

    default:
      return null
  }
}

// ── JSON tools list ─────────────────────────────────────────────────────────
const JSON_TOOLS = new Set([
  'eligibility-checklist',
  'faq-generator',
  'schema-generator',
  'og-generator',
  'twitter-card',
  'hreflang',
])

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tool, inputs } = body as { tool: string; inputs: Record<string, string> }

    if (!tool) {
      return NextResponse.json({ success: false, error: 'tool is required' }, { status: 400 })
    }

    const prompt = buildPrompt(tool, inputs ?? {})
    if (!prompt) {
      return NextResponse.json({ success: false, error: `Unknown tool: ${tool}` }, { status: 400 })
    }

    const isJsonTool = JSON_TOOLS.has(tool)

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 2000,
      ...(isJsonTool ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
    })

    const raw = response.choices[0]?.message?.content ?? ''

    if (isJsonTool) {
      try {
        const parsed = JSON.parse(raw)
        return NextResponse.json({ success: true, output: parsed })
      } catch {
        return NextResponse.json({ success: false, error: 'AI returned invalid JSON' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, output: raw })
  } catch (error) {
    console.error('[/api/ai/tools] Error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
