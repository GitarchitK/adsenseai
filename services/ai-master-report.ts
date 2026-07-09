import OpenAI from "openai";

const openai = new OpenAI();

import { DeepCrawlResult, AiReportV2 } from "@/lib/firebase-types";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an expert AdSense Approval Consultant with deep, up-to-date knowledge of 
Google AdSense's Program Policies, Webmaster Quality Guidelines, and common real-world 
rejection reasons (thin content, insufficient navigation, missing policy pages, low-value 
content, under-construction pages, copied/duplicate content, disallowed content 
categories, poor site structure, and non-original articles).

Your reports must be highly detailed, extremely specific, and 100% understandable for 
non-technical individuals (e.g. beginner bloggers, local business owners). 
When referencing technical terms (like sitemaps, robots.txt, schema markup, Core Web Vitals, 
or HTTPS), always explain them using simple real-world analogies:
- Schema markup: "a digital barcode or label that tells search engine robots exactly what your post is about"
- Robots.txt: "a welcome sign at your website's front door telling Google bots which rooms they can visit and which are private"
- Sitemap: "a digital map or directory of all your website pages to help search engines find everything quickly"
- Thin content: "content that doesn't have enough substance or helpful details for a reader (like a recipe card with just ingredients and no instructions)"
- Broken links: "a door that leads to a brick wall (a 404 page), which makes visitors and Google search bots get lost"

In all "fix" descriptions and your "action_plan", write step-by-step, plain-English instructions. 
Do not use vague phrases like "optimize your site" or "improve readability". Instead, write exact steps: 
"Go to your WordPress Admin dashboard -> click Pages -> Add New -> create a page titled 'About Us' and write a 300-word introduction about your background and qualifications."

You will be given structured data extracted by an automated crawler from a single 
website. This data is your ONLY source of truth. Do not assume, invent, or estimate 
any fact not present in the data provided. If a required signal is missing from the 
data (e.g. no privacy policy found), treat it as ABSENT, not "unknown" — and flag it 
as a gap, since AdSense reviewers will also see it as absent.

Analyze this data against real AdSense approval criteria and produce a professional, 
honest, actionable report. Do NOT be generically encouraging — be accurate, even if 
the verdict is unfavorable. This report will be shown directly to the website owner, 
so it must be specific to THEIR site, not generic advice.

Evaluate across these dimensions:
1. Content Quality & Originality — Is there enough substantive, non-thin, apparently 
   original content? Reference specific articles/pages from the data as evidence.
2. Content Volume — Is article count and total word count sufficient for a credible 
   review (industry rule of thumb: 20-30+ solid posts, though Google has no official 
   minimum — explain this nuance rather than stating a fake hard number as fact).
3. Site Structure & Navigation — Is the site easy to navigate, properly organized, 
   free of broken links?
4. Required Policy Pages — Are About, Contact, Privacy Policy, and Terms present? 
   This is one of the most common rejection reasons — treat missing pages as 
   high-severity issues.
5. Compliance Risk — Based on the niche and article content, are there any topics 
   that fall into AdSense-restricted or sensitive categories?
6. Technical Readiness — ads.txt status, mobile-friendliness, page count adequacy.
7. Traffic/Domain Age (only comment on this if data is provided — otherwise state 
   explicitly that this factor could not be assessed).

OUTPUT FORMAT:
Return ONLY a valid JSON object matching the AiReportV2 interface:

{
  "overall_approval_chance": "Low" | "Medium" | "High",
  "confidence_note": "1-2 lines explaining what this estimate is based on and its limits",
  "summary": "3-4 sentence plain-English verdict for the site owner",
  "strengths": ["specific, evidence-based points citing actual pages/articles found"],
  "critical_issues": [
    {
      "issue": "e.g. Missing Privacy Policy page",
      "why_it_matters": "explain in AdSense-reviewer terms",
      "severity": "High" | "Medium" | "Low",
      "fix": "specific, actionable instruction"
    }
  ],
  "content_analysis": {
    "articles_reviewed": number,
    "avg_word_count": number,
    "quality_assessment": "specific observations, not generic praise",
    "thin_or_weak_pages": ["list specific URLs if flagged by crawler data"]
  },
  "action_plan": [
    "Ordered, prioritized checklist the user should complete before applying, most critical first"
  ],
  "estimated_timeline": "realistic estimate of how long the fixes might take, framed as an estimate not a guarantee",
  "disclaimer": "This analysis is based solely on the crawled data provided and does not guarantee AdSense approval, as Google's final decision also depends on factors outside this website's control (e.g. account history, traffic quality, manual review)."
}

Rules:
- Never claim to know Google's internal review algorithm or guarantee outcomes.
- Never output a numeric "% chance" — Google gives no such number and doing so is 
  misleading pseudo-precision. Use Low/Medium/High only.
- If input data is incomplete, say so in confidence_note rather than filling gaps with assumptions.
- Keep tone professional and consultative, like a paid SEO/AdSense consultant's report — 
  not a chatbot pep talk.
- Start your response with { and end with }
`.trim();

// ─── User Prompt Builder ──────────────────────────────────────────────────────

function buildUserPrompt(crawl: DeepCrawlResult): string {
  const avgWordCount = crawl.avgWordCount || 0;
  const postCount = crawl.postCount || 0;

  const mandatoryPages: string[] = [];
  if (crawl.hasAboutPage) mandatoryPages.push(`About Us: true (${crawl.aboutPageUrl || 'found'})`);
  else mandatoryPages.push("About Us: false");
  
  if (crawl.hasContactPage) mandatoryPages.push(`Contact Us: true (${crawl.contactPageUrl || 'found'})`);
  else mandatoryPages.push("Contact Us: false");
  
  if (crawl.hasPrivacyPolicy) mandatoryPages.push(`Privacy Policy: true (${crawl.privacyPolicyUrl || 'found'})`);
  else mandatoryPages.push("Privacy Policy: false");
  
  if (crawl.hasTerms) mandatoryPages.push("Terms & Conditions: true");
  else mandatoryPages.push("Terms & Conditions: false");
  
  if (crawl.hasDisclaimer) mandatoryPages.push("Disclaimer: true");
  else mandatoryPages.push("Disclaimer: false");

  return `
=== INPUT DATA ===
Website URL: ${crawl.url}
Detected Niche/Category: ${crawl.mainNiche} / ${crawl.subNiche}
Total Pages Crawled: ${crawl.pageCount}
Site Structure / Navigation Map: XML Sitemap: ${crawl.hasSitemap ? 'Present' : 'Absent'}, Robots.txt: ${crawl.hasRobots ? 'Present' : 'Absent'}
Presence of Key Pages (true/false + URL if found):
${mandatoryPages.map(p => `  - ${p}`).join("\n")}
Sample Extracted Articles (titles): ${crawl.samplePostTitles.slice(0, 10).join(" | ") || "None found"}
Article Metadata: Avg internal links: ${crawl.avgInternalLinks || 0}, Schema markup types: ${crawl.schemaTypes.join(", ") || "None"}
Total Word Count Across Site: ${avgWordCount * postCount}
Number of Published Articles/Posts: ${postCount}
Language(s) Detected: English / Primary Website Language
Mobile Responsiveness Signal (if available): responsive (assumed from basic check)
Ads.txt Presence: ${crawl.hasAdsTxt ? 'Present' : 'Absent'}
Broken Links / 404s Found: ${crawl.brokenLinkCount || 0}
Duplicate/Thin Content Flags (if your crawler detects near-duplicate pages): ${crawl.thinContentCount || 0} thin content pages (${crawl.thinContentPercent || 0}%)

Please analyze this website.
`.trim();
}

// ─── Main Function ────────────────────────────────────────────────────────────

export async function generateAiMasterReport(
  crawlData: DeepCrawlResult
): Promise<AiReportV2> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildUserPrompt(crawlData),
      },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("OpenAI returned empty response");

  try {
    const report = JSON.parse(raw) as AiReportV2;
    return report;
  } catch (e) {
    console.error("Failed to parse AI report JSON:", raw.slice(0, 500));
    throw new Error("AI report JSON parse failed");
  }
}

// ─── SEO Blog Prompt ──────────────────────────────────────────────────────────

export async function generateSeoBlogHook(
  crawlData: DeepCrawlResult,
  report: AiReportV2
): Promise<{
  faqSchema: string; // JSON-LD FAQ schema for YOUR blog post
  metaTitle: string; // optimised <title> tag for your results page
  metaDescription: string; // optimised meta description
  h1Suggestion: string;
  internalLinkAnchorText: string; // how to link to this from your blog
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 1500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an SEO expert specialising in ranking content about Google AdSense. 
Your job is to generate SEO metadata and FAQ schema that will help the AdSense Checker AI website 
rank in positions 1-5 for AdSense-related queries. 
Return only valid JSON with keys: faqSchema, metaTitle, metaDescription, h1Suggestion, internalLinkAnchorText.
The faqSchema must be a complete JSON-LD string (not an object — a string that can be injected into a <script> tag).
Base everything on the niche and issues found in the report so the content is hyper-specific and useful.`,
      },
      {
        role: "user",
        content: `
Website url: ${crawlData.url}
Website niche: ${crawlData.mainNiche}
Approval chance: ${report.overall_approval_chance}
Top issues found: ${report.critical_issues.map((i) => i.issue).join(", ")}
Primary keyword opportunity: adsense approval for ${crawlData.mainNiche} blogs
Long-tail keywords: adsense approval checklist, how to get adsense approved, low value content adsense
Featured snippet opportunity: how to get adsense approval on a ${crawlData.mainNiche} blog

Generate the SEO metadata and FAQ schema to help AdSense Checker AI rank for these queries.
The FAQ should answer the questions people searching for adsense approval would ask.
Include 4-5 FAQ items. Make the metaTitle under 60 characters, metaDescription under 155 characters.
`.trim(),
      },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("OpenAI returned empty SEO response");
  return JSON.parse(raw);
}
