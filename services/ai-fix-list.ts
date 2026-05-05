/**
 * buildFixList — generates a detailed, step-by-step fix list for the user.
 * Every fix includes plain-English steps so paying users know exactly what to do.
 */

import type { CrawlResponse } from '@/types'
import type { ContentQualityResult } from './ai-content'
import type { PolicyComplianceResult } from './ai-policy'
import type { TrustUXResult } from './ai-trust'
import type { SEOAuthorityResult } from './ai-seo-authority'
import type { TechnicalHealthResult } from './ai-technical'
import type { FixSuggestion } from './ai-report'

export function buildFixList(
  crawl: CrawlResponse,
  content: ContentQualityResult,
  policy: PolicyComplianceResult,
  trust: TrustUXResult,
  seo: SEOAuthorityResult,
  tech: TechnicalHealthResult,
): FixSuggestion[] {
  const fixes: FixSuggestion[] = []
  const domain = crawl.domain
  const pages = crawl.pages
  const s = crawl.site_structure

  const thinPages = pages.filter(p => p.word_count > 0 && p.word_count < 300)
  const borderlinePages = pages.filter(p => p.word_count >= 300 && p.word_count < 500)
  const noH1Pages = pages.filter(p => p.headings.h1.length === 0)
  const noMetaPages = pages.filter(p => !p.meta_description)
  const avgWords = pages.length ? Math.round(pages.reduce((sum, p) => sum + p.word_count, 0) / pages.length) : 0

  // ── POLICY (highest priority — instant rejection triggers) ─────────────────

  if (policy.adult_content) {
    fixes.push({
      category: 'Policy', impact: 'high',
      title: 'Remove Adult Content — Instant Rejection',
      description: `Adult or explicit content was detected on ${domain}. Google will automatically reject your AdSense application without review.`,
      steps: [
        'Go through every page on your site and look for any adult, explicit, or suggestive content — images, videos, or text.',
        'Delete or replace anything that could be considered adult-oriented, even if it seems mild.',
        'Check your comments section — user-generated adult content also counts against you.',
        'After removing all adult content, wait 24-48 hours for Google to re-crawl your site before applying.',
      ],
      technical_detail: `adult_content=true, policy_risk_score=${policy.policy_risk_score}/100`,
    })
  }

  if (policy.dangerous_content) {
    fixes.push({
      category: 'Policy', impact: 'high',
      title: 'Remove Dangerous or Harmful Content',
      description: `Content promoting violence, illegal activity, or harmful products was detected on ${domain}. This is an automatic AdSense rejection trigger.`,
      steps: [
        'Search your site for any content about weapons, drugs, hacking, or illegal activities.',
        'Remove or completely rewrite any articles that could be seen as promoting harm.',
        'If you cover sensitive topics (e.g., security research), reframe them as purely educational and add clear disclaimers.',
        'Check your sidebar, footer, and any widgets for third-party content that might be flagged.',
        'After cleaning up, run a fresh scan to confirm the issue is resolved.',
      ],
      technical_detail: `dangerous_content=true`,
    })
  }

  if (policy.copyright_risk) {
    fixes.push({
      category: 'Policy', impact: 'high',
      title: 'Fix Copied or Scraped Content',
      description: `Some content on ${domain} appears to be copied from other sources. Google requires 100% original content — copied content is an automatic rejection.`,
      steps: [
        'Take a sentence from each of your articles and search it in Google (in quotes). If it appears on another site, that article needs to be rewritten.',
        'Rewrite each copied article completely in your own words — don\'t just change a few words, write it fresh from scratch.',
        'Add your own perspective, personal experience, or unique examples that only you could write.',
        'If you\'re quoting someone, use proper quotation marks and cite the source — short quotes are fine, full copies are not.',
        'Use a free plagiarism checker like Duplichecker.com to verify your content is original before applying.',
      ],
      technical_detail: `copyright_risk=true, policy_risk_score=${policy.policy_risk_score}/100`,
    })
  }

  policy.violations.forEach(v => {
    fixes.push({
      category: 'Policy', impact: 'high',
      title: 'Fix Policy Violation',
      description: `${v} — This was found on ${domain} and will cause AdSense to reject your application.`,
      steps: [
        'Read the violation description carefully and identify which page(s) it applies to.',
        'Go to that page and remove or edit the content that caused the violation.',
        'If you\'re unsure what to change, search "Google AdSense policy [violation type]" for specific guidance.',
        'After fixing, run a fresh scan to confirm the violation is gone before applying.',
      ],
      technical_detail: `violation="${v}"`,
    })
  })

  // ── REQUIRED PAGES ─────────────────────────────────────────────────────────

  if (!s.has_privacy) {
    fixes.push({
      category: 'Trust', impact: 'high',
      title: 'Add a Privacy Policy Page — Required by AdSense',
      description: `${domain} is missing a Privacy Policy page. Google AdSense will reject your application without one — this is non-negotiable.`,
      steps: [
        'Go to your website\'s admin panel (WordPress Dashboard, Blogger, Wix, etc.).',
        'Create a new page and title it "Privacy Policy".',
        'Use our Privacy Policy Generator in the AI Tools section to generate a complete, AdSense-compliant policy for your site in seconds.',
        'Paste the generated policy onto your new page and publish it.',
        'Add a link to the Privacy Policy in your website\'s footer — it must be visible on every page.',
        'The URL should be something like: yourdomain.com/privacy-policy',
      ],
      technical_detail: `has_privacy=false`,
    })
  }

  if (!s.has_about) {
    fixes.push({
      category: 'Trust', impact: 'high',
      title: 'Add an About Page',
      description: `${domain} is missing an About page. Google\'s reviewers want to know who runs the site — anonymous sites are much more likely to be rejected.`,
      steps: [
        'Create a new page titled "About" or "About Us" on your website.',
        'Write 150-300 words about yourself: your name, your background, and why you created this site.',
        'Mention your expertise or experience related to your site\'s topic — even if you\'re a beginner, explain why you\'re passionate about it.',
        'Add a photo of yourself if you\'re comfortable — it builds trust significantly with both readers and Google.',
        'Link the About page in your main navigation menu (top of site) and in your footer.',
      ],
      technical_detail: `has_about=false`,
    })
  }

  if (!s.has_contact) {
    fixes.push({
      category: 'Trust', impact: 'high',
      title: 'Add a Contact Page',
      description: `${domain} is missing a Contact page. AdSense requires a way for users to reach you — without it, your application will be rejected.`,
      steps: [
        'Create a new page titled "Contact" or "Contact Us".',
        'Add at least one way to reach you — an email address is the minimum requirement.',
        'Optionally add a contact form (most website builders have this built in — search "contact form [your platform]").',
        'Link the Contact page in your main navigation menu and footer.',
        'Make sure the email address you list is one you actually check regularly.',
      ],
      technical_detail: `has_contact=false`,
    })
  }

  if (!s.has_terms) {
    fixes.push({
      category: 'Trust', impact: 'medium',
      title: 'Add a Terms of Service Page',
      description: `${domain} is missing a Terms of Service page. While not strictly required, it significantly improves your approval chances by showing Google your site is professionally managed.`,
      steps: [
        'Create a new page titled "Terms of Service" or "Terms and Conditions".',
        'Go to a free Terms of Service generator: TermsFeed.com or GetTerms.io.',
        'Fill in your site name, URL, and contact email — the generator creates the full document for free.',
        'Copy the generated terms onto your page and publish it.',
        'Link it in your footer alongside your Privacy Policy.',
      ],
      technical_detail: `has_terms=false`,
    })
  }

  if (!s.has_disclaimer) {
    fixes.push({
      category: 'Trust', impact: 'medium',
      title: 'Add a Disclaimer Page',
      description: `${domain} is missing a Disclaimer page. This is especially important if your site covers finance, health, legal, or affiliate topics.`,
      steps: [
        'Create a new page titled "Disclaimer".',
        'Add this sentence: "The content on this website is for informational purposes only and does not constitute professional advice."',
        'If you have affiliate links, add: "This site contains affiliate links. I may earn a small commission if you purchase through these links at no extra cost to you."',
        'If you cover health, finance, or legal topics, add: "Always consult a qualified professional before making decisions based on this content."',
        'Link the Disclaimer in your footer.',
      ],
      technical_detail: `has_disclaimer=false`,
    })
  }

  // ── THIN CONTENT ───────────────────────────────────────────────────────────

  if (thinPages.length > 0) {
    const examples = thinPages.slice(0, 3).map(p => `${p.url} (${p.word_count} words)`).join(', ')
    fixes.push({
      category: 'Content', impact: 'high',
      title: `Expand ${thinPages.length} Thin Article${thinPages.length > 1 ? 's' : ''} (Under 300 Words)`,
      description: `${thinPages.length} pages on ${domain} have fewer than 300 words. Google calls these "thin content" and it\'s one of the most common reasons AdSense applications are rejected.`,
      steps: [
        `Open each thin page one by one. Start with these: ${thinPages.slice(0, 3).map(p => p.url).join(', ')}.`,
        'For each article, ask yourself: "What else would a reader want to know about this topic?" Write down 5 questions.',
        'Add a proper introduction (2-3 sentences explaining what the article covers and who it\'s for).',
        'Break the content into 3-5 sections, each with its own H2 subheading.',
        'Add a "Frequently Asked Questions" section at the bottom — answer 3 common questions about the topic.',
        'Add a conclusion paragraph summarising the key takeaways.',
        'Target at least 600 words per article — 800+ is ideal. Your current average is ' + avgWords + ' words.',
        'After expanding, re-read the article to make sure it flows naturally and adds real value.',
      ],
      technical_detail: `thin_pages=${thinPages.length}, examples=[${examples}]`,
    })
  }

  if (borderlinePages.length > 0 && thinPages.length === 0) {
    fixes.push({
      category: 'Content', impact: 'medium',
      title: `Strengthen ${borderlinePages.length} Short Article${borderlinePages.length > 1 ? 's' : ''} (300–500 Words)`,
      description: `${borderlinePages.length} pages on ${domain} are between 300–500 words — borderline for AdSense. Your current average is ${avgWords} words/page. Aim for 600+.`,
      steps: [
        'Open each short article and identify what\'s missing — what questions does it leave unanswered?',
        'Add a "Frequently Asked Questions" section at the bottom — answer 3-5 common questions about the topic.',
        'Include a real example or case study to illustrate your main point.',
        'Add a step-by-step section if the topic allows it (e.g., "How to do X in 5 steps").',
        'Aim to reach 600+ words per article — every sentence should add value, not just fill space.',
      ],
      technical_detail: `borderline_pages=${borderlinePages.length}, avg_word_count=${avgWords}`,
    })
  }

  // ── CONTENT QUALITY ────────────────────────────────────────────────────────

  if (content.originality_score < 50) {
    fixes.push({
      category: 'Content', impact: 'high',
      title: 'Rewrite Generic Content — Low Originality Score',
      description: `Content originality scored ${content.originality_score}/100 on ${domain}. Your articles feel too similar to what\'s already on the internet. Google\'s AI detects this and penalises it.`,
      steps: [
        'Pick your 5 most important articles and read them critically — do they say anything that isn\'t already on the first page of Google?',
        'For each article, add one section with your personal experience or opinion on the topic.',
        'Replace generic statements like "X is important" with specific examples: "X helped me do Y when Z happened."',
        'Add original data or observations — even a small personal experiment or survey counts.',
        'Remove any sections that just restate what everyone else says — if you can find it on Wikipedia, it\'s not original enough.',
        'After rewriting, your article should have at least 3 things a reader can\'t find anywhere else.',
        'Use the Content Rewriter in our AI Tools section to help improve your weakest articles.',
      ],
      technical_detail: `originality_score=${content.originality_score}/100 (target: 70+)`,
    })
  } else if (content.originality_score < 70) {
    fixes.push({
      category: 'Content', impact: 'medium',
      title: 'Improve Content Originality',
      description: `Content originality scored ${content.originality_score}/100 on ${domain}. Some articles feel generic — add more of your own voice and insights.`,
      steps: [
        'Go through your top 10 articles and add a "My Take" or "My Experience" section to each.',
        'Replace any bullet lists that just repeat common knowledge with your own insights and examples.',
        'Add specific numbers, dates, or personal results where possible.',
        'Link to your own experiences or other articles on your site to show depth.',
      ],
      technical_detail: `originality_score=${content.originality_score}/100 (target: 70+)`,
    })
  }

  if (content.readability_score < 50) {
    fixes.push({
      category: 'Content', impact: 'high',
      title: 'Simplify Your Writing — Hard to Read',
      description: `Readability scored ${content.readability_score}/100 on ${domain}. Your articles are difficult to read, which hurts both user experience and AdSense approval.`,
      steps: [
        'Open your longest article and read it out loud — wherever you stumble, that sentence needs to be simplified.',
        'Break any sentence longer than 20 words into two shorter sentences.',
        'Replace complex words with simpler ones: "utilise" → "use", "commence" → "start", "approximately" → "about".',
        'Make sure every paragraph is 2-4 sentences maximum — long paragraphs feel overwhelming on screen.',
        'Add a subheading (H2 or H3) every 200-300 words to break up the content.',
        'Use bullet points or numbered lists for any information that has 3+ items.',
        'Paste your article into Hemingway Editor (hemingwayapp.com) — aim for Grade 8 or lower.',
      ],
      technical_detail: `readability_score=${content.readability_score}/100 (target: 65+)`,
    })
  } else if (content.readability_score < 65) {
    fixes.push({
      category: 'Content', impact: 'medium',
      title: 'Improve Article Readability',
      description: `Readability scored ${content.readability_score}/100 on ${domain}. Some articles could be easier to read.`,
      steps: [
        'Add more subheadings — every 200-300 words should have a new H2 or H3 heading.',
        'Break up any paragraphs longer than 4 sentences.',
        'Use bullet points for lists of 3 or more items.',
        'Check your sentence length — aim for an average of 15-18 words per sentence.',
      ],
      technical_detail: `readability_score=${content.readability_score}/100 (target: 65+)`,
    })
  }

  if (content.spam_score > 60) {
    fixes.push({
      category: 'Content', impact: 'high',
      title: 'Stop Keyword Stuffing — High Spam Score',
      description: `Spam score is ${content.spam_score}/100 on ${domain}. You\'re repeating the same keywords too many times. Google\'s AI detects this and it hurts your approval chances.`,
      steps: [
        'Open your most keyword-heavy articles and use Ctrl+F to count how many times your main keyword appears.',
        'If a keyword appears more than once every 200 words, you\'re stuffing — reduce it.',
        'Replace repeated keywords with natural synonyms and related phrases.',
        'Read the article out loud — if it sounds robotic or repetitive, rewrite those sections.',
        'A good rule: your main keyword should appear in the title, first paragraph, one subheading, and 2-3 times in the body — that\'s it.',
        'Focus on answering the reader\'s question naturally, not on hitting a keyword count.',
      ],
      technical_detail: `spam_score=${content.spam_score}/100 (target: below 30)`,
    })
  } else if (content.spam_score > 40) {
    fixes.push({
      category: 'Content', impact: 'medium',
      title: 'Reduce Keyword Repetition',
      description: `Spam score is ${content.spam_score}/100 on ${domain}. Some keyword repetition detected.`,
      steps: [
        'Find your 3 most-used keywords using a word frequency tool (wordcounter.net).',
        'For each overused keyword, replace half the occurrences with synonyms or related phrases.',
        'Make sure your writing sounds natural when read aloud.',
      ],
      technical_detail: `spam_score=${content.spam_score}/100 (target: below 30)`,
    })
  }

  // ── TECHNICAL SEO ──────────────────────────────────────────────────────────

  if (noH1Pages.length > 0) {
    const examples = noH1Pages.slice(0, 3).map(p => p.url).join(', ')
    fixes.push({
      category: 'SEO', impact: noH1Pages.length > 5 ? 'high' : 'medium',
      title: `Add H1 Headings to ${noH1Pages.length} Page${noH1Pages.length > 1 ? 's' : ''}`,
      description: `${noH1Pages.length} pages on ${domain} are missing a main heading (H1 tag). Every page needs one clear title at the top — it tells Google what the page is about.`,
      steps: [
        `Open each page that\'s missing an H1. Start with: ${noH1Pages.slice(0, 3).map(p => p.url).join(', ')}.`,
        'In WordPress: make sure your article title is set in the title field at the top — it automatically becomes the H1.',
        'In a page builder (Elementor, Divi, etc.): add a "Heading" block at the very top of the page and set it to "H1".',
        'In Blogger: the post title is automatically the H1 — make sure every post has a title.',
        'The H1 should clearly describe what the page is about in 5-10 words.',
        'Each page should have exactly ONE H1 — don\'t use multiple H1 tags on the same page.',
      ],
      technical_detail: `pages_missing_h1=${noH1Pages.length}, examples=[${examples}]`,
    })
  }

  if (noMetaPages.length > 0) {
    const examples = noMetaPages.slice(0, 3).map(p => p.url).join(', ')
    fixes.push({
      category: 'SEO', impact: noMetaPages.length > 5 ? 'high' : 'medium',
      title: `Add Meta Descriptions to ${noMetaPages.length} Page${noMetaPages.length > 1 ? 's' : ''}`,
      description: `${noMetaPages.length} pages on ${domain} are missing meta descriptions — the short summaries shown in Google search results. These help Google understand your content.`,
      steps: [
        'In WordPress: install the Yoast SEO or Rank Math plugin (both are free).',
        'Open each article in the editor and scroll to the SEO plugin section at the bottom of the page.',
        'Click "Edit snippet" and write a 1-2 sentence description of what the article is about.',
        'Keep it under 160 characters — you\'ll see a character counter in the plugin.',
        'Include your main keyword naturally in the description.',
        'Make it compelling — this is what people see in Google before deciding to click your link.',
        `Start with these pages: ${noMetaPages.slice(0, 3).map(p => p.url).join(', ')}.`,
      ],
      technical_detail: `pages_missing_meta=${noMetaPages.length}, examples=[${examples}]`,
    })
  }

  if (tech.technical_issues.length > 0) {
    tech.technical_issues.slice(0, 3).forEach(issue => {
      fixes.push({
        category: 'SEO', impact: 'medium',
        title: 'Fix Technical Issue',
        description: `${issue} — Found on ${domain}. Technical issues like this can hurt your SEO and AdSense approval chances.`,
        steps: [
          'Read the issue description carefully to understand what\'s wrong.',
          'Search Google for "how to fix [issue name] in [your platform]" — e.g., "how to fix duplicate H1 in WordPress".',
          'Make the change on the affected pages.',
          'Run a fresh scan to confirm the issue is resolved.',
        ],
        technical_detail: `technical_issue="${issue}"`,
      })
    })
  }

  // ── SEO AUTHORITY ──────────────────────────────────────────────────────────

  if (seo.topical_authority_score < 50) {
    fixes.push({
      category: 'SEO', impact: 'high',
      title: 'Build Topical Authority — Site Too Broad',
      description: `Topical authority scored ${seo.topical_authority_score}/100 on ${domain}. Your site covers too many unrelated topics, or doesn\'t go deep enough on any one topic. Google rewards focused, expert sites.`,
      steps: [
        'Choose ONE main topic for your site and commit to it — a site about "personal finance" is stronger than one about "finance, travel, and cooking".',
        'Write a list of 20 questions your target reader might have about your topic.',
        'Turn each question into a full article (600+ words each).',
        `Focus on these missing topics first: ${seo.missing_topics.slice(0, 4).join(', ')}.`,
        'Link related articles to each other — when you mention a topic you\'ve covered, add a link to that article.',
        'Aim for 25-30 articles on your main topic before applying to AdSense.',
        'Remove or redirect any articles that are completely off-topic from your main niche.',
      ],
      technical_detail: `topical_authority=${seo.topical_authority_score}/100, semantic_coverage=${seo.semantic_coverage_score}/100`,
    })
  } else if (seo.topical_authority_score < 70) {
    fixes.push({
      category: 'SEO', impact: 'medium',
      title: 'Strengthen Topical Coverage',
      description: `Topical authority scored ${seo.topical_authority_score}/100 on ${domain}. Publish more articles covering different aspects of your niche.`,
      steps: [
        `Write articles on these missing topics: ${seo.missing_topics.slice(0, 4).join(', ')}.`,
        'Make sure each new article is at least 700 words and covers the topic thoroughly.',
        'Link new articles back to your existing content where relevant.',
        'Aim to publish 2-3 new articles per week until you have 25+ articles.',
      ],
      technical_detail: `topical_authority=${seo.topical_authority_score}/100`,
    })
  }

  if (seo.internal_linking_advice && seo.internal_linking_advice.length > 10) {
    fixes.push({
      category: 'SEO', impact: 'low',
      title: 'Improve Internal Linking Between Articles',
      description: `${seo.internal_linking_advice} Internal links help Google understand your site structure and keep readers on your site longer.`,
      steps: [
        'Open your 5 most popular articles.',
        'In each article, find 2-3 places where you mention a topic you\'ve written about elsewhere on your site.',
        'Add a hyperlink on those mentions pointing to the related article.',
        'Use descriptive anchor text — instead of "click here", write "read our guide on [topic]".',
        'Aim for 3-5 internal links per article.',
        'Also add a "Related Articles" section at the bottom of each post.',
      ],
      technical_detail: `internal_linking_score=needs_improvement`,
    })
  }

  // ── TRUST & UX ─────────────────────────────────────────────────────────────

  if (trust.trust_score < 50) {
    fixes.push({
      category: 'Trust', impact: 'high',
      title: 'Strengthen Site Trust Signals',
      description: `Trust scored ${trust.trust_score}/100 on ${domain}. Google\'s reviewers look for signs that a real, credible person or business runs the site.`,
      steps: [
        'Add your real name to your About page — anonymous sites score much lower on trust.',
        'Add an author bio to each article: 2-3 sentences about who you are and why you\'re qualified to write about this topic.',
        'Add a profile photo to your About page and author bio — even a simple headshot helps.',
        'Make sure your Privacy Policy, About, and Contact pages are linked in your footer.',
        'If you have social media profiles related to your site\'s topic, link them from your About page.',
        'Consider adding a "Last Updated" date to your articles to show they\'re actively maintained.',
      ],
      technical_detail: `trust_score=${trust.trust_score}/100`,
    })
  }

  trust.ux_issues.forEach(issue => {
    fixes.push({
      category: 'UX', impact: 'medium',
      title: 'Fix User Experience Issue',
      description: `${issue} — User experience issues affect how easy your site is to use, which Google considers during AdSense review.`,
      steps: [
        'Read the issue description and identify which pages are affected.',
        'Search for "[issue] fix [your platform]" on Google for platform-specific instructions.',
        'Test the fix on both desktop and mobile before marking it complete.',
        'Ask a friend or family member to navigate your site and see if they notice the same issue.',
      ],
      technical_detail: `ux_issue="${issue}"`,
    })
  })

  // ── DOMAIN AGE ─────────────────────────────────────────────────────────────

  if (s.domain_age_years !== undefined && s.domain_age_years < 0.5) {
    fixes.push({
      category: 'Trust', impact: 'medium',
      title: `New Domain — Build History First (${s.domain_age_years} years old)`,
      description: `${domain} is only ${s.domain_age_years} years old. Google AdSense often prefers sites that are at least 3-6 months old with consistent, quality content.`,
      steps: [
        'Keep publishing 2-3 quality articles per week — consistency matters more than volume.',
        'Don\'t apply to AdSense until your domain is at least 3 months old (6 months is safer).',
        'Use this time to build up 25+ quality articles and fix all other issues in this list.',
        'Set up Google Search Console (search.google.com/search-console) and submit your sitemap — this helps Google discover and index your content faster.',
        'Share your articles on social media to build initial traffic — AdSense reviewers look for signs of real readership.',
        'Check back in 2-3 months and run a fresh scan to see your updated score.',
      ],
      technical_detail: `domain_age_years=${s.domain_age_years}`,
    })
  }

  // ── Sort: policy violations first, then by impact ─────────────────────────
  const order = { high: 0, medium: 1, low: 2 }
  return fixes.sort((a, b) => {
    if (a.category === 'Policy' && b.category !== 'Policy') return -1
    if (b.category === 'Policy' && a.category !== 'Policy') return 1
    return order[a.impact] - order[b.impact]
  })
}
