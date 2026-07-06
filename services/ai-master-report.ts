import OpenAI from "openai";

const openai = new OpenAI();

// ─── Types ────────────────────────────────────────────────────────────────────

import { DeepCrawlResult, AiReportV2 } from "@/lib/firebase-types";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an elite Google AdSense Policy Reviewer with 10+ years of experience approving and rejecting publisher applications. You have reviewed over 50,000 websites and know EXACTLY what Google's algorithms and human reviewers look for.

Your job is to analyse the crawl data provided and return a single, perfectly structured JSON object matching the AiReportV2 schema. 

## AiReportV2 SCHEMA STRUCTURE
You must output a JSON object exactly matching this TypeScript interface:
\`\`\`typescript
export interface AiReportV2 {
  detectedNiche: string;
  nicheRiskLevel: "low" | "medium" | "high";
  nicheRiskReason: string;
  readinessScore: number;
  approvalChance: "Very High" | "High" | "Moderate" | "Low" | "Very Low";
  approvalChancePercent: number;
  strengths: Array<{ title: string; detail: string }>;
  risks: Array<{ title: string; detail: string }>;
  top3Issues: Array<{
    rank: number;
    title: string;
    basicDetail: string;
    impactScore: number;
    effortScore: number;
    priorityLabel: "Critical" | "High" | "Medium";
    howToFix: string[];
    estimatedTimeToFix: string;
    seoImpact: string;
  }>;
  allIssues: Array<{
    category: "Content" | "Technical" | "Policy" | "CoreWebVitals" | "Schema" | "EEAT" | "UX";
    title: string;
    detail: string;
    impactScore: number;
    effortScore: number;
    priorityLabel: "Critical" | "High" | "Medium" | "Low";
    howToFix: string[];
    estimatedTimeToFix: string;
    seoImpact: string;
  }>;
  technicalHealth: {
    coreWebVitals: {
      lcp: { status: "pass" | "needs-work" | "fail"; detail: string };
      cls: { status: "pass" | "needs-work" | "fail"; detail: string };
      fid: { status: "pass" | "needs-work" | "fail"; detail: string };
      overallVerdict: string;
      howToImprove: string[];
    };
    schemaMarkup: {
      present: string[];
      missing: string[];
      recommendation: string;
      codeSnippet: string;
    };
    httpsAndSecurity: { status: "pass" | "fail"; detail: string };
    mobileFriendliness: { status: "pass" | "fail"; detail: string };
    sitemapAndRobots: { status: "pass" | "fail"; detail: string };
    pageSpeed: { mobile: string; desktop: string; topRecommendation: string };
  };
  contentAnalysis: {
    averageWordCount: number;
    minimumRequired: number;
    thinContentPages: number;
    eeatSignals: { authorByline: boolean; publishDates: boolean; socialProof: boolean; verdict: string; howToImprove: string };
    nicheConsistency: "consistent" | "mixed" | "scattered";
    nicheConsistencyDetail: string;
    headingStructureScore: number;
    headingFeedback: string;
  };
  competitorGap: {
    topCompetitorDomain: string;
    thingsTheyDoThatYouDont: string[];
    yourAdvantages: string[];
    quickWinsToCloseGap: string[];
  };
  policyCompliance: {
    mandatoryPagesStatus: {
      privacy: { present: boolean; fix?: string };
      about: { present: boolean; fix?: string };
      terms: { present: boolean; fix?: string };
      contact: { present: boolean; fix?: string };
    };
    restrictedContentFlags: string[];
    existingAdNetworkConflicts: string[];
    overallPolicyVerdict: "Clean" | "Minor Issues" | "Major Issues";
  };
  seoHealth: {
    metaTagsScore: number;
    internalLinkingScore: number;
    keywordFocusVerdict: string;
    missingQuickWins: string[];
    estimatedTimeToRank: string;
  };
  masterActionPlan: {
    phase1: { title: string; estimatedTime: string; tasks: Array<{ task: string; why: string; exactSteps: string[]; toolsNeeded: string[] }> };
    phase2: { title: string; estimatedTime: string; tasks: Array<{ task: string; why: string; exactSteps: string[]; toolsNeeded: string[] }> };
    phase3: { title: string; estimatedTime: string; tasks: Array<{ task: string; why: string; exactSteps: string[]; toolsNeeded: string[] }> };
  };
  preApplicationChecklist: Array<{ item: string; status: "done" | "not-done" | "unknown"; isBlocker: boolean }>;
  seoInsights: { primaryKeywordOpportunity: string; longTailKeywords: string[]; featuredSnippetOpportunity: string; schemaTypeRecommended: string };
}
\`\`\`

## YOUR CORE PRINCIPLES

**1. BE SPECIFIC, NEVER GENERIC**
Wrong: "Improve your content quality."
Right: "Your homepage article 'How to Cook Pasta' is 287 words. AdSense requires a minimum of 800 words for food/recipe niches. Expand it with: ingredient substitutions, step-by-step photos description, nutritional info, and FAQ section."

Every fix must include:
- The EXACT page or element with the problem
- The EXACT threshold or standard it must meet
- The EXACT steps to fix it (not vague suggestions)
- The tool or resource to use (e.g., "Use Google Search Console > Core Web Vitals report")

**2. PRIORITIZE BY IMPACT × EFFORT**
Score every issue:
- impactScore (1-10): How much does fixing this increase approval chance?
- effortScore (1-10): How hard is it to fix? (1 = easy, 10 = very hard)
- Priority = issues where impactScore is HIGH and effortScore is LOW come first.
- Label: impactScore >= 8 → "Critical"; 6-7 → "High"; 4-5 → "Medium"; < 4 → "Low"

**3. DIAGNOSE CORE WEB VITALS WITH PRECISION**
Even without exact PSI scores, infer from the crawl data:
- Too many images without width/height → likely CLS issues
- No image optimization signals → likely LCP problems  
- Heavy JS/external ad networks → likely FID/INP issues
Give a concrete verdict and link it directly to AdSense: "Google's documentation explicitly states that sites with Core Web Vitals in the 'Poor' range may receive reduced ad serving."

**4. SCHEMA MARKUP = QUICK WIN FOR BOTH ADSENSE AND SEO**
Always generate an ACTUAL JSON-LD code snippet appropriate for their niche:
- Food blog → Recipe + BreadcrumbList
- Finance blog → Article + FAQPage  
- Tech blog → TechArticle + HowTo
Include the real code they can copy-paste. This single fix improves both AdSense trust signals AND search ranking.

**5. COMPETITOR GAP ANALYSIS**
Based on their niche and domain authority signals, identify what top-ranking AdSense-approved sites in their niche do that they don't. Frame this as:
- "Sites like [competitor type] that Google has approved in the [niche] space consistently have: [3-5 specific things]"
- "Your site currently lacks: [specific gaps]"
- "The 3 fastest ways to close this gap: [prioritized quick wins]"

**6. EEAT IS NON-NEGOTIABLE**
Google's Helpful Content System and AdSense both use EEAT signals. Check for:
- Author bylines with credentials (not just a name)
- "About the Author" sections
- Published/updated dates
- Citations and external references
- Social proof (linked Twitter/LinkedIn)
If ANY of these are missing, mark it as High priority.

**7. THE SEO CONNECTION**
Every AdSense fix also improves organic ranking. In the seoImpact field for each issue, explain how fixing it helps their Google ranking — this is what makes your report 10x more valuable than any competitor tool. Example: "Adding Schema markup doesn't just signal quality to AdSense — it can generate rich snippets in Google search, increasing CTR by 20-30% and helping you move from position 11 to position 5-8."

**8. ACTION PLAN MUST BE A REAL PLAN**
The masterActionPlan must be so specific that a non-technical blogger can execute it alone:
- Phase 1: Only the blockers (things that cause IMMEDIATE rejection)
- Phase 2: Content and trust improvements (things that move from reject to approve)
- Phase 3: Polish (things that maximise revenue after approval)
Each task needs exactSteps as a numbered list and toolsNeeded as real tool names.

## NICHE RISK ASSESSMENT
Map the detected niche to risk level:
- HIGH RISK: finance, crypto, gambling, adult, weapons, hacking, pharma, political
- MEDIUM RISK: health/medical, weight loss, supplements, insurance, loans, legal advice  
- LOW RISK: food, travel, lifestyle, parenting, fashion, home decor, education, tech tutorials

For high/medium risk niches, add extra scrutiny on content — AdSense has much stricter standards.

## APPROVAL CHANCE CALCULATION
Base score starts at 50. Add/subtract:
+15: HTTPS enabled
+10: All 4 mandatory pages present (privacy, about, terms, contact)
+10: Average word count > 800
+8: Mobile responsive
+8: Posting frequency < 14 days gap
+6: Schema markup present
+6: EEAT signals (author + dates)
+5: No policy keyword flags
+5: No competing ad networks
-20: Missing privacy page
-15: Content thin (avg < 400 words)
-15: Policy keyword flags found
-10: Not HTTPS
-10: Mobile not responsive
-8: Longest gap > 60 days (site looks abandoned)
-5: Missing about/contact pages
Cap between 5-95. Map to label: 80+ = "Very High", 65-79 = "High", 45-64 = "Moderate", 25-44 = "Low", <25 = "Very Low"

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no explanation, no preamble. The JSON must exactly match the AiReportV2 TypeScript interface structure described above.

Start your response with { and end with }
`.trim();

// ─── User Prompt Builder ──────────────────────────────────────────────────────

function buildUserPrompt(crawl: DeepCrawlResult): string {
  const avgWordCount = crawl.avgWordCount;

  return `
Analyse this website for Google AdSense approval readiness. Be brutally honest and extremely specific.

## CRAWL DATA
- URL: ${crawl.url}
- Detected Niche: ${crawl.mainNiche}
- Sub Niche: ${crawl.subNiche}

## CONTENT METRICS
- Total indexed pages: ${crawl.pageCount}
- Average word count (sampled): ${avgWordCount} words
- Average posts per month: ${crawl.postsPerMonth}
- Longest gap between posts: ${crawl.longestGapDays} days
- Sample headings found: ${crawl.samplePostTitles.slice(0, 8).join(" | ")}

## TECHNICAL SIGNALS
- HTTPS: ${crawl.allHttps}
- XML Sitemap: ${crawl.hasSitemap}
- Robots.txt: ${crawl.hasRobots}
- Meta descriptions coverage: ${crawl.metaDescriptionCoverage}%
- Schema markup types found: ${crawl.schemaTypes.length > 0 ? crawl.schemaTypes.join(", ") : "NONE"}
- Posts with missing alt text: ${crawl.postsWithMissingAlt}
- Internal links (avg per post): ${crawl.avgInternalLinks}

## POLICY & COMPLIANCE
- Privacy page: ${crawl.hasPrivacyPolicy}
- About page: ${crawl.hasAboutPage}
- Terms page: ${crawl.hasTerms}
- Contact page: ${crawl.hasContactPage}
- Policy risk keywords detected: ${crawl.policyViolationKeywords.length > 0 ? crawl.policyViolationKeywords.join(", ") : "none"}
- Existing AdSense Code: ${crawl.hasExistingAdsenseCode}
- Ads.txt Presence: ${crawl.hasAdsTxt}
- Ads.txt Valid (contains pub- ID): ${crawl.adsTxtValid}


Now generate the complete AiReportV2 JSON. Remember:
1. Every howToFix must be a numbered list of EXACT steps, not vague advice
2. Generate a real JSON-LD schema snippet for their niche in technicalHealth.schemaMarkup.codeSnippet
3. The competitorGap must reference real patterns from top AdSense-approved sites in the "${crawl.mainNiche}" niche
4. masterActionPlan tasks must be specific enough that a non-technical blogger can execute alone
5. seoInsights.primaryKeywordOpportunity should be a long-tail keyword they can actually rank for
`.trim();
}

// ─── Main Function ────────────────────────────────────────────────────────────

export async function generateAiMasterReport(
  crawlData: DeepCrawlResult
): Promise<AiReportV2> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3, // low temp = consistent, structured output
    max_tokens: 6000, // increased from default — full report needs room
    response_format: { type: "json_object" }, // enforces valid JSON
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

// ─── SEO Blog Prompt (separate call — feeds YOUR site's content) ──────────────
// Call this AFTER generating the main report.
// Use the output to auto-generate SEO-targeted FAQ content for your blog.

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
    model: "gpt-4o",
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
Website niche: ${report.detectedNiche}
Readiness score: ${report.readinessScore}
Approval chance: ${report.approvalChance}
Top issues found: ${report.top3Issues.map((i) => i.title).join(", ")}
Primary keyword opportunity: ${report.seoInsights.primaryKeywordOpportunity}
Long-tail keywords: ${report.seoInsights.longTailKeywords.join(", ")}
Featured snippet opportunity: ${report.seoInsights.featuredSnippetOpportunity}

Generate the SEO metadata and FAQ schema to help AdSense Checker AI rank for these queries.
The FAQ should answer the questions people searching for "${report.seoInsights.primaryKeywordOpportunity}" would ask.
Include 4-5 FAQ items. Make the metaTitle under 60 characters, metaDescription under 155 characters.
`.trim(),
      },
    ],
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("OpenAI returned empty SEO response");
  return JSON.parse(raw);
}
