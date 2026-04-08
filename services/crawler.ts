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
  private domain: string = '';
  private startTime: number = 0;

  constructor(url: string, options: CrawlOptions = {}) {
    this.url = normalizeUrl(url);
    this.domain = getDomain(url);
    this.options = {
      maxPages: options.maxPages || 15,
      timeout: options.timeout || 30000,
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
      const CONCURRENCY = 5;
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
      this.crawledPages = this.pagesToVisit
        .map((pageUrl) => crawledByUrl.get(pageUrl))
        .filter((page): page is CrawledPage => !!page);

      // Step 5: Build site structure
      const allUrls = this.crawledPages.map((p) => p.url);
      const siteStructure = detectRequiredPages(allUrls, this.domain);

      const crawlTime = Date.now() - this.startTime;

      console.log(`[Crawler] Completed crawl: ${this.crawledPages.length} pages in ${crawlTime}ms`);

      return {
        success: true,
        pages: this.crawledPages,
        site_structure: siteStructure,
        total_pages: this.crawledPages.length,
        domain: this.domain,
        crawl_time_ms: crawlTime,
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
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Crawler] Page returned status ${response.status}: ${url}`);
        return null;
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

    const crawledPage: CrawledPage = {
      url,
      title: extractTitle(html, url),
      meta_description: extractMetaDescription(html),
      content: cleanedContent,
      word_count: countWords(cleanedContent),
      lastmod: this.sitemapMetadata.get(url)?.lastmod,
      headings: extractHeadings(html),
      links: extractLinks(html, url),
    };

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
      },
      total_pages: 0,
      domain: this.domain,
      crawl_time_ms: Date.now() - this.startTime,
      error,
    };
  }
}
