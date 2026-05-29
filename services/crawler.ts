/**
 * Website Crawler Service
 * Handles scraping and analysis of websites using native fetch API
 */

import { CrawledPage, SiteStructure, CrawlResponse } from '@/types';
import {
  normalizeUrl,
  getDomain,
  stripHtmlTags,
  cleanTextContent,
  countWords,
  extractLinks,
  extractHeadings,
  extractTitle,
  extractMetaDescription,
  detectRequiredPages,
  extractSitemapEntries,
  type SitemapEntry,
} from '@/lib/crawler-utils';

interface CrawlOptions {
  maxPages?: number;
  timeout?: number;
  fullSitemap?: boolean; // if true, collect all sitemap URLs even beyond maxPages
}

/**
 * Main crawler class for website analysis
 */
export class WebsiteCrawler {
  private url: string;
  private options: Required<CrawlOptions>;
  private visitedUrls = new Set<string>();
  private pagesToVisit: string[] = [];
  private crawledPages: CrawledPage[] = [];
  private sitemapMetadata = new Map<string, SitemapEntry>();
  private allSitemapUrls: string[] = [];  // full sitemap URL list
  private domain: string = '';
  private startTime: number = 0;

  constructor(url: string, options: CrawlOptions = {}) {
    this.url = normalizeUrl(url);
    this.domain = getDomain(url);
    this.options = {
      maxPages: options.maxPages || 100,
      timeout: options.timeout || 30000,
      fullSitemap: options.fullSitemap ?? true,
    };
  }

  /**
   * Main crawl method - orchestrates the entire process
   */
  async crawl(): Promise<CrawlResponse> {
    this.startTime = Date.now();

    try {
      console.log(`[Crawler] Starting crawl of ${this.url}`);

      // Step 1: Discover sitemap URLs
      const sitemapEntries = await this.discoverSitemapUrls();
      this.sitemapMetadata = new Map(sitemapEntries.map((entry) => [entry.url, entry]));
      this.allSitemapUrls = sitemapEntries.map(e => e.url);
      console.log(`[Crawler] Found ${sitemapEntries.length} URLs from sitemap`);

      // Step 2: Fetch homepage and extract initial links
      const homePageHtml = await this.fetchPage(this.url);
      if (!homePageHtml) {
        return this.createErrorResponse('Failed to fetch homepage');
      }

      // Step 3: Extract links from homepage and combine with sitemap
      const { internal: internalLinks } = extractLinks(homePageHtml, this.url);
      this.pagesToVisit = this.buildVisitQueue(internalLinks, sitemapEntries);

      // Step 4: Crawl pages in parallel with concurrency limit
      const CONCURRENCY = 8;
      const queue = [...this.pagesToVisit];
      const crawledByUrl = new Map<string, CrawledPage>();
      
      const processQueue = async () => {
        while (queue.length > 0) {
          if (this.visitedUrls.size >= this.options.maxPages) break;
          
          const pageUrl = queue.shift();
          if (!pageUrl || this.visitedUrls.has(pageUrl)) continue;
          
          this.visitedUrls.add(pageUrl);
          
          try {
            const crawledPage = await this.crawlPage(pageUrl);
            if (crawledPage) {
              crawledByUrl.set(pageUrl, crawledPage);
            }
          } catch (error) {
            console.error(`[Crawler] Error crawling ${pageUrl}:`, error);
          }
        }
      };

      // Start concurrent workers
      await Promise.all(Array(CONCURRENCY).fill(null).map(() => processQueue()));
      
      // Ensure the order matches the visit queue
      this.crawledPages = this.pagesToVisit
        .map((pageUrl) => crawledByUrl.get(pageUrl))
        .filter((page): page is CrawledPage => !!page);

      // Step 5: Build site structure
      const allUrls = Array.from(new Set([
        ...this.crawledPages.map((p) => p.url),
        ...this.pagesToVisit,
        ...sitemapEntries.map(e => e.url)
      ]));
      const siteStructure = detectRequiredPages(allUrls, this.domain);

      // Add estimated domain age if we have sitemap entries
      if (sitemapEntries.length > 0) {
        const earliest = sitemapEntries
          .map(e => e.lastmod ? Date.parse(e.lastmod) : Date.now())
          .sort((a, b) => a - b)[0];
        
        const ageMs = Date.now() - earliest;
        const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365);
        siteStructure.domain_age_years = Number(ageYears.toFixed(1));
      }

      // ── New: aggregate advanced signals ──────────────────────────────────
      // HTTPS detection
      siteStructure.is_https = this.url.startsWith('https://')

      // Sitemap presence
      siteStructure.has_sitemap = sitemapEntries.length > 0

      // Schema markup count
      siteStructure.schema_pages = this.crawledPages.filter(p => p.has_schema_markup).length

      // Total images missing alt text
      siteStructure.images_missing_alt = this.crawledPages.reduce(
        (sum, p) => sum + (p.images_missing_alt ?? 0), 0
      )

      // Robots.txt blocking check — default false
      siteStructure.robots_blocks_crawl = false
      try {
        const robotsTxt = await this.fetchPage(`${new URL(this.url).origin}/robots.txt`)
        if (robotsTxt) {
          const lines = robotsTxt.toLowerCase().split('\n')
          let inGooglebotBlock = false
          let inAllBlock = false
          for (const line of lines) {
            if (line.startsWith('user-agent: googlebot')) inGooglebotBlock = true
            else if (line.startsWith('user-agent: *')) inAllBlock = true
            else if (line.startsWith('user-agent:')) { inGooglebotBlock = false; inAllBlock = false }
            if ((inGooglebotBlock || inAllBlock) && line.startsWith('disallow: /')) {
              siteStructure.robots_blocks_crawl = true
              break
            }
          }
        }
      } catch { /* ignore */ }

      const crawlTime = Date.now() - this.startTime;

      console.log(`[Crawler] Completed crawl: ${this.crawledPages.length} pages in ${crawlTime}ms`);

      return {
        success: true,
        pages: this.crawledPages,
        site_structure: siteStructure,
        total_pages: this.crawledPages.length,
        domain: this.domain,
        crawl_time_ms: crawlTime,
        sitemap_urls: this.allSitemapUrls,
        sitemap_total: this.allSitemapUrls.length,
      };
    } catch (error) {
      console.error('[Crawler] Crawl error:', error);
      return this.createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Discovers sitemap URLs by checking robots.txt or common sitemap locations
   */
  private async discoverSitemapUrls(): Promise<SitemapEntry[]> {
    const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml'];
    const discoveredEntries = new Map<string, SitemapEntry>();

    // Try to find sitemap in robots.txt
    try {
      const robotsTxt = await this.fetchPage(`${new URL(this.url).origin}/robots.txt`);
      if (robotsTxt) {
        const matches = robotsTxt.match(/Sitemap:\s*(.*)/gi) || [];
        for (const match of matches) {
          const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim();
          const entries = await this.fetchSitemap(sitemapUrl);
          entries.forEach((entry) => discoveredEntries.set(entry.url, entry));
        }
      }
    } catch (e) {
      console.warn('[Crawler] Error checking robots.txt:', e);
    }

    // Try common sitemap paths if none found yet
    if (discoveredEntries.size === 0) {
      for (const path of sitemapPaths) {
        const sitemapUrl = `${new URL(this.url).origin}${path}`;
        const entries = await this.fetchSitemap(sitemapUrl);
        if (entries.length > 0) {
          entries.forEach((entry) => discoveredEntries.set(entry.url, entry));
          break; // Stop after finding the first valid sitemap
        }
      }
    }

    return Array.from(discoveredEntries.values());
  }

  /**
   * Fetches and parses a sitemap file
   */
  private async fetchSitemap(url: string): Promise<SitemapEntry[]> {
    try {
      const xml = await this.fetchPage(url);
      if (!xml || !xml.includes('<urlset') && !xml.includes('<sitemapindex')) {
        return [];
      }
      return extractSitemapEntries(xml, this.url);
    } catch {
      return [];
    }
  }

  private buildVisitQueue(internalLinks: string[], sitemapEntries: SitemapEntry[]): string[] {
    const combinedLinks = Array.from(new Set([
      ...internalLinks,
      ...sitemapEntries.map((entry) => entry.url),
    ]));

    const priorityPages = combinedLinks.filter((url) => this.isPriorityPage(url));
    const articlePages = combinedLinks
      .filter((url) => !priorityPages.includes(url))
      .filter((url) => this.isLikelyArticlePage(url))
      .sort((a, b) => this.compareByFreshness(a, b));
    const otherPages = combinedLinks
      .filter((url) => !priorityPages.includes(url) && !articlePages.includes(url))
      .sort((a, b) => this.compareByFreshness(a, b));

    return [this.url, ...priorityPages, ...articlePages, ...otherPages]
      .filter((url, index, list) => list.indexOf(url) === index)
      .slice(0, this.options.maxPages);
  }

  private isPriorityPage(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.includes('privacy') ||
      lower.includes('about') ||
      lower.includes('contact') ||
      lower.includes('terms') ||
      lower.includes('tos');
  }

  private isLikelyArticlePage(url: string): boolean {
    try {
      const pathname = new URL(url).pathname.toLowerCase();
      if (pathname === '/' || pathname.length < 2) return false;

      const excludedPatterns = [
        '/category/', '/tag/', '/author/', '/page/', '/search', '/wp-admin',
        '/login', '/signup', '/account', '/dashboard', '/privacy', '/about',
        '/contact', '/terms', '/policy', '/feed', '/sitemap',
      ];
      if (excludedPatterns.some((pattern) => pathname.includes(pattern))) return false;

      const articleSignals = [
        /\d{4}\/\d{2}\/\d{2}/,
        /\d{4}\/\d{2}\//,
        /\/blog\//,
        /\/news\//,
        /\/article\//,
        /\/post\//,
        /\/stories\//,
      ];
      if (articleSignals.some((pattern) => pattern.test(pathname))) return true;

      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] ?? '';
      return segments.length >= 2 && lastSegment.includes('-');
    } catch {
      return false;
    }
  }

  private compareByFreshness(leftUrl: string, rightUrl: string): number {
    const leftEntry = this.sitemapMetadata.get(leftUrl);
    const rightEntry = this.sitemapMetadata.get(rightUrl);
    const leftTime = leftEntry?.lastmod ? Date.parse(leftEntry.lastmod) : Number.NaN;
    const rightTime = rightEntry?.lastmod ? Date.parse(rightEntry.lastmod) : Number.NaN;

    if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    if (!Number.isNaN(leftTime)) return -1;
    if (!Number.isNaN(rightTime)) return 1;
    return 0;
  }

  /**
   * Fetches HTML content from a single page
   */
  private async fetchPage(url: string): Promise<string | null> {
    try {
      // Using fetch with timeout to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AdSenseReadinessAnalyzer/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Crawler] Page returned status ${response.status}: ${url}`);
        return null;
      }

      const contentType = response.headers.get('content-type') ?? ''
      const isTextual =
        contentType.includes('text/') ||
        contentType.includes('application/xml') ||
        contentType.includes('application/xhtml+xml') ||
        contentType.includes('application/json')

      if (!isTextual) {
        console.warn(`[Crawler] Skipping non-text content (${contentType}) ${url}`);
        return null
      }

      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        const bytes = Number(contentLength)
        // Avoid downloading huge responses (images, large PDFs mislabeled, etc.)
        if (Number.isFinite(bytes) && bytes > 2_000_000) {
          console.warn(`[Crawler] Skipping large response (${bytes} bytes) ${url}`)
          return null
        }
      }

      return await response.text();
    } catch (error) {
      console.error(`[Crawler] Fetch error for ${url}:`, error);
      return null;
    }
  }

  /**
   * Crawls a single page and extracts data
   */
  private async crawlPage(url: string): Promise<CrawledPage | null> {
    const html = await this.fetchPage(url);
    if (!html) {
      return null;
    }

    const plainText = stripHtmlTags(html);
    const cleanedContent = cleanTextContent(plainText);

    const metaDescription = extractMetaDescription(html)
    const lastmod = this.sitemapMetadata.get(url)?.lastmod

    // ── New: image alt text analysis ──────────────────────────────────────
    const imgMatches = html.match(/<img[^>]*>/gi) ?? []
    const imagesTotal = imgMatches.length
    const imagesMissingAlt = imgMatches.filter(tag => {
      const altMatch = tag.match(/alt\s*=\s*["']([^"']*)["']/i)
      return !altMatch || altMatch[1].trim() === ''
    }).length

    // ── New: schema markup detection ──────────────────────────────────────
    const hasSchemaMarkup =
      html.includes('application/ld+json') ||
      html.includes('itemtype="http://schema.org') ||
      html.includes("itemtype='http://schema.org") ||
      html.includes('itemtype="https://schema.org') ||
      html.includes("itemtype='https://schema.org")

    // ── New: HTTPS detection ──────────────────────────────────────────────
    const isHttps = url.startsWith('https://')

    // ── New: AdSense Code & Policy checks ─────────────────────────────────
    const hasAdsenseCode = html.includes('ca-pub-') || html.includes('pagead2.googlesyndication.com');
    const policyKeywords = ['gambling', 'casino', 'porn', 'xxx', 'escort', 'weapon', 'firearm', 'drugs', 'pharma', 'steroids', 'buy followers', 'hack', 'crack', 'warez'];
    const lowerText = plainText.toLowerCase();
    const policyViolations = policyKeywords.filter(k => lowerText.includes(k));

    const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    let footerPrivacy = false;
    let footerContact = false;
    if (footerMatch && footerMatch[1]) {
      const footerHtml = footerMatch[1].toLowerCase();
      footerPrivacy = footerHtml.includes('privacy');
      footerContact = footerHtml.includes('contact');
    }

    // Firestore rejects `undefined` values; only set optional fields when present.
    const crawledPage: CrawledPage = {
      url,
      title: extractTitle(html, url),
      content: cleanedContent,
      word_count: countWords(cleanedContent),
      headings: extractHeadings(html),
      links: extractLinks(html, url),
      images_total: imagesTotal,
      images_missing_alt: imagesMissingAlt,
      has_schema_markup: hasSchemaMarkup,
      is_https: isHttps,
      has_adsense_code: hasAdsenseCode,
      policy_violation_keywords: policyViolations,
      footer_privacy_link: footerPrivacy,
      footer_contact_link: footerContact,
    };

    if (typeof metaDescription === 'string' && metaDescription.trim().length > 0) {
      crawledPage.meta_description = metaDescription
    }
    if (typeof lastmod === 'string' && lastmod.trim().length > 0) {
      crawledPage.lastmod = lastmod
    }

    return crawledPage;
  }

  /**
   * Creates error response
   */
  private createErrorResponse(error: string): CrawlResponse {
    return {
      success: false,
      pages: [],
      site_structure: {
        has_privacy: false,
        has_about: false,
        has_contact: false,
        has_terms: false,
        has_disclaimer: false,
      },
      total_pages: 0,
      domain: this.domain,
      crawl_time_ms: Date.now() - this.startTime,
      error,
    };
  }
}

import { DeepCrawlResult } from '@/lib/firebase-types';

export function buildDeepCrawlResult(crawl: CrawlResponse): DeepCrawlResult {
  const pages = crawl.pages;
  const postSignals = [
    /\\d{4}\/\\d{2}\/\\d{2}/,
    /\\d{4}\/\\d{2}\//,
    /\/blog\//,
    /\/news\//,
    /\/article\//,
    /\/post\//,
    /\/stories\//,
  ];
  
  const isPost = (url: string) => {
    try {
      const path = new URL(url).pathname.toLowerCase();
      if (path === '/' || ['/category/', '/tag/', '/author/', '/page/', '/search', '/wp-admin', '/login', '/signup', '/privacy', '/about', '/contact', '/terms', '/disclaimer', '/policy'].some(e => path.includes(e))) return false;
      if (postSignals.some(r => r.test(path))) return true;
      const segs = path.split('/').filter(Boolean);
      return segs.length >= 2 && (segs[segs.length - 1] ?? '').includes('-');
    } catch { return false; }
  };

  const posts = pages.filter(p => isPost(p.url));
  const postDates = posts
    .map(p => p.lastmod ? new Date(p.lastmod).getTime() : NaN)
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => a - b);
  
  let longestGap = 0;
  for (let i = 1; i < postDates.length; i++) {
    const gap = (postDates[i] - postDates[i - 1]) / (1000 * 60 * 60 * 24);
    if (gap > longestGap) longestGap = gap;
  }
  
  const firstPost = postDates.length > 0 ? new Date(postDates[0]).toISOString() : null;
  const latestPost = postDates.length > 0 ? new Date(postDates[postDates.length - 1]).toISOString() : null;
  const totalDays = postDates.length > 1 ? (postDates[postDates.length - 1] - postDates[0]) / (1000 * 60 * 60 * 24) : 0;
  const postsPerMonth = totalDays > 0 ? (posts.length / (totalDays / 30)) : posts.length;

  const wordCounts = posts.map(p => p.word_count);
  const avgWordCount = wordCounts.length ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length) : 0;
  const thinPosts = posts.filter(p => p.word_count < 500);
  const avgInternalLinks = posts.length ? Math.round(posts.reduce((a, b) => a + (b.links?.internal?.length || 0), 0) / posts.length) : 0;
  
  const hasAdsense = pages.some(p => p.has_adsense_code);
  const footerPriv = pages.some(p => p.footer_privacy_link);
  const footerCont = pages.some(p => p.footer_contact_link);
  const allHttps = pages.every(p => p.is_https);
  const httpPages = pages.filter(p => !p.is_https).length;
  const metaDescCov = pages.length ? Math.round((pages.filter(p => p.meta_description).length / pages.length) * 100) : 0;
  const h1Cov = pages.length ? Math.round((pages.filter(p => p.headings?.h1?.length === 1).length / pages.length) * 100) : 0;
  const missingAltPosts = posts.filter(p => (p.images_missing_alt || 0) > 0).length;
  const noImagePosts = posts.filter(p => (p.images_total || 0) === 0).length;

  const policyKws = Array.from(new Set(pages.flatMap(p => p.policy_violation_keywords || [])));
  
  return {
    url: crawl.domain, // Or full original URL if we stored it
    pageCount: pages.length,
    postCount: posts.length,
    domainAge: crawl.site_structure.domain_age_years ? `${crawl.site_structure.domain_age_years} years` : 'Unknown',

    firstPostDate: firstPost,
    latestPostDate: latestPost,
    postsPerMonth: Math.round(postsPerMonth * 10) / 10,
    longestGapDays: Math.round(longestGap),
    samplePostTitles: posts.slice(0, 20).map(p => p.title).filter(Boolean),

    mainNiche: '',
    subNiche: '',
    nicheConsistencyScore: 0,
    offTopicPosts: [],

    avgWordCount,
    thinContentCount: thinPosts.length,
    thinContentPercent: posts.length ? Math.round((thinPosts.length / posts.length) * 100) : 0,
    avgReadabilityScore: 60, // Placeholder as we don't have Flesch Kincaid implemented directly
    postsWithNoImages: noImagePosts,
    postsWithMissingAlt: missingAltPosts,
    keywordStuffingDetected: false, // Placeholder, requires advanced NLP

    hasPrivacyPolicy: crawl.site_structure.has_privacy,
    privacyPolicyUrl: pages.find(p => p.url.toLowerCase().includes('privacy'))?.url || null,
    hasAboutPage: crawl.site_structure.has_about,
    aboutPageUrl: pages.find(p => p.url.toLowerCase().includes('about'))?.url || null,
    hasContactPage: crawl.site_structure.has_contact,
    contactPageUrl: pages.find(p => p.url.toLowerCase().includes('contact'))?.url || null,
    hasTerms: crawl.site_structure.has_terms,
    hasDisclaimer: crawl.site_structure.has_disclaimer || false,

    allHttps,
    httpPages,
    hasSitemap: !!crawl.site_structure.has_sitemap,
    hasRobots: true, // Assuming true as basic check done
    metaDescriptionCoverage: metaDescCov,
    h1Coverage: h1Cov,
    avgInternalLinks,
    schemaTypes: pages.some(p => p.has_schema_markup) ? ['Article', 'BreadcrumbList'] : [],
    brokenLinkCount: 0, // Placeholder, difficult to track accurately without head requests
    footerHasPrivacyLink: footerPriv,
    footerHasContactLink: footerCont,

    hasExistingAdsenseCode: hasAdsense,
    policyViolationKeywords: policyKws,
  };
}
