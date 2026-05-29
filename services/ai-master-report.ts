import OpenAI from 'openai';
import { DeepCrawlResult, MasterReport } from '@/lib/firebase-types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMasterReport(crawlData: DeepCrawlResult): Promise<MasterReport> {
  const systemPrompt = `
You are a senior Google AdSense policy expert with 10+ years of experience
helping publishers get approved. You give brutally honest, highly specific,
actionable reports. You never give generic advice — every recommendation
must reference the actual data provided.

Your job: analyse the website data below and generate a complete AdSense
approval readiness report in valid JSON format only.
`;

  const userPrompt = `
Analyse this website and return a detailed AdSense readiness report.

=== SITE DATA ===
URL: ${crawlData.url}
Domain age: ${crawlData.domainAge}
Total pages crawled: ${crawlData.pageCount}
Total posts: ${crawlData.postCount}
First post date: ${crawlData.firstPostDate || 'Unknown'}
Latest post date: ${crawlData.latestPostDate || 'Unknown'}
Posting frequency: ${crawlData.postsPerMonth} posts/month
Longest posting gap: ${crawlData.longestGapDays} days
Main niche: ${crawlData.mainNiche || 'To be determined by you'}
Sub niche: ${crawlData.subNiche || 'To be determined by you'}
Niche consistency: ${crawlData.nicheConsistencyScore || 'To be determined by you'}/100
Off-topic posts: ${crawlData.offTopicPosts?.length || 0} (${(crawlData.offTopicPosts || []).slice(0,3).join(', ')})

=== CONTENT QUALITY ===
Average word count: ${crawlData.avgWordCount} words
Thin content posts (<500 words): ${crawlData.thinContentCount} (${crawlData.thinContentPercent}%)
Readability score (Flesch-Kincaid): ${crawlData.avgReadabilityScore}
Posts with no images: ${crawlData.postsWithNoImages}
Posts with missing alt text: ${crawlData.postsWithMissingAlt}
Keyword stuffing detected: ${crawlData.keywordStuffingDetected}

=== MANDATORY PAGES ===
Privacy Policy: ${crawlData.hasPrivacyPolicy ? 'YES — ' + crawlData.privacyPolicyUrl : 'MISSING'}
About page: ${crawlData.hasAboutPage ? 'YES — ' + crawlData.aboutPageUrl : 'MISSING'}
Contact page: ${crawlData.hasContactPage ? 'YES — ' + crawlData.contactPageUrl : 'MISSING'}
Terms of Service: ${crawlData.hasTerms ? 'YES' : 'MISSING'}
Disclaimer: ${crawlData.hasDisclaimer ? 'YES' : 'MISSING'}

=== DOMAIN & TECHNICAL ===
HTTPS: ${crawlData.allHttps ? 'All pages secure' : 'MIXED CONTENT — ' + crawlData.httpPages + ' pages not secure'}
XML Sitemap: ${crawlData.hasSitemap ? 'YES' : 'NO'}
Robots.txt: ${crawlData.hasRobots ? 'YES' : 'NO'}
Meta descriptions: ${crawlData.metaDescriptionCoverage}% of pages
H1 tags: ${crawlData.h1Coverage}% of pages have exactly one H1
Internal links avg: ${crawlData.avgInternalLinks} per post
Schema markup: ${(crawlData.schemaTypes || []).join(', ') || 'None detected'}

=== ADSENSE SPECIFIC ===
AdSense code already present: ${crawlData.hasExistingAdsenseCode}
Policy violation keywords detected: ${(crawlData.policyViolationKeywords || []).join(', ') || 'None'}
Broken links found: ${crawlData.brokenLinkCount}
Footer has privacy link: ${crawlData.footerHasPrivacyLink}
Footer has contact link: ${crawlData.footerHasContactLink}

=== SAMPLE POST TITLES (for niche/quality context) ===
${(crawlData.samplePostTitles || []).slice(0, 15).map((t, i) => `${i+1}. ${t}`).join('\n')}

=== RETURN FORMAT ===
Return ONLY this exact JSON structure, no markdown, no preamble:

{
  "overallScore": <0-100 integer>,
  "readinessLevel": "not_ready" | "almost_ready" | "ready",

  "whenToApply": {
    "recommendation": "apply_now" | "wait_X_weeks" | "major_work_needed",
    "weeksToWait": <integer or null>,
    "reason": "<2-3 sentences specific to this site>"
  },

  "nicheAnalysis": {
    "mainNiche": "<detected main niche>",
    "subNiche": "<detected sub niche>",
    "nicheViability": "excellent" | "good" | "risky" | "blocked",
    "nicheComment": "<1-2 sentences — is this niche good for AdSense CPC?>",
    "consistencyIssues": "<what off-topic content was found, or null>"
  },

  "contentAnalysis": {
    "score": <0-100>,
    "verdict": "<one sentence overall content verdict>",
    "strengths": ["<specific strength 1>", "<specific strength 2>"],
    "problems": [
      {
        "issue": "<specific problem title>",
        "severity": "critical" | "high" | "medium" | "low",
        "detail": "<exactly what is wrong, reference real numbers>",
        "howToFix": "<exact steps to fix this — be specific>",
        "timeToFix": "<e.g. 2-3 days>"
      }
    ]
  },

  "policyCompliance": {
    "score": <0-100>,
    "verdict": "<one sentence>",
    "violations": [
      {
        "issue": "<policy issue title>",
        "severity": "critical" | "high" | "medium",
        "detail": "<what exactly violates policy>",
        "howToFix": "<exact fix steps>",
        "timeToFix": "<estimate>"
      }
    ],
    "missingPages": [
      {
        "page": "Privacy Policy" | "About" | "Contact" | "Terms" | "Disclaimer",
        "importance": "critical" | "high" | "medium",
        "howToCreate": "<what this page must contain for AdSense approval>"
      }
    ]
  },

  "technicalHealth": {
    "score": <0-100>,
    "verdict": "<one sentence>",
    "issues": [
      {
        "issue": "<technical issue>",
        "severity": "critical" | "high" | "medium" | "low",
        "detail": "<specific detail>",
        "howToFix": "<exact fix>",
        "timeToFix": "<estimate>"
      }
    ]
  },

  "trustSignals": {
    "score": <0-100>,
    "verdict": "<one sentence>",
    "issues": [
      {
        "issue": "<trust issue>",
        "severity": "critical" | "high" | "medium",
        "detail": "<detail>",
        "howToFix": "<fix>",
        "timeToFix": "<estimate>"
      }
    ]
  },

  "actionPlan": {
    "phase1_critical": {
      "label": "Fix immediately (before applying)",
      "tasks": [
        {
          "task": "<specific task title>",
          "detail": "<exactly what to do — no vague advice>",
          "estimatedTime": "<e.g. 1 hour>",
          "impact": "high" | "medium"
        }
      ]
    },
    "phase2_important": {
      "label": "Fix within 1-2 weeks",
      "tasks": [
        {
          "task": "<specific task title>",
          "detail": "<exactly what to do — no vague advice>",
          "estimatedTime": "<e.g. 1 hour>",
          "impact": "high" | "medium"
        }
      ]
    },
    "phase3_optional": {
      "label": "Nice to have before applying",
      "tasks": [
        {
          "task": "<specific task title>",
          "detail": "<exactly what to do — no vague advice>",
          "estimatedTime": "<e.g. 1 hour>",
          "impact": "high" | "medium"
        }
      ]
    }
  },

  "applicationReadinessChecklist": [
    { "item": "<checklist item>", "status": "done" | "not_done" | "partial", "priority": "critical" | "high" | "medium" }
  ],

  "estimatedApprovalChance": {
    "percentage": <0-100>,
    "mainRisk": "<the single biggest reason AdSense might reject this site>",
    "mainStrength": "<the single biggest thing working in the site's favour>"
  }
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from OpenAI');
    return JSON.parse(content) as MasterReport;
  } catch (error) {
    console.error('Error generating master report:', error);
    throw error;
  }
}
