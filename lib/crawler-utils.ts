import { URL } from 'url';
import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
}

/**
 * Validates and normalizes a website URL
 */
export function normalizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.href;
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }
}

/**
 * Extracts domain from URL
 */
export function getDomain(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch {
    return urlString;
  }
}

/**
 * Checks if URL belongs to the same domain
 */
export function isSameDomain(url: string, baseDomain: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname === baseDomain || urlObj.hostname?.endsWith(`.${baseDomain}`);
  } catch {
    return false;
  }
}

/**
 * Uses Mozilla Readability to extract pure article content from HTML,
 * falling back to Cheerio stripping if Readability fails.
 */
export function cleanTextContent(html: string): string {
  try {
    const dom = new JSDOM(html, { url: 'http://localhost' });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (article && article.textContent) {
      return article.textContent
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000); // Limit to 10k chars for API cost efficiency
    }
  } catch (e) {
    // Silently fallback
  }

  // Fallback: Use Cheerio to remove boilerplate
  const $ = cheerio.load(html);
  $('script, style, nav, footer, aside, header, form, iframe, noscript').remove();
  
  return $.text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);
}

/**
 * Legacy compatibility wrapper for cleanTextContent
 */
export function stripHtmlTags(html: string): string {
  return cleanTextContent(html);
}

/**
 * Extracts h1 and h2 headings using Cheerio
 */
export function extractHeadings(htmlContent: string): { h1: string[]; h2: string[] } {
  const $ = cheerio.load(htmlContent);
  const h1: string[] = [];
  const h2: string[] = [];
  
  $('h1').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text) h1.push(text);
  });
  
  $('h2').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text) h2.push(text);
  });

  return {
    h1: h1.slice(0, 5),
    h2: h2.slice(0, 10),
  };
}

/**
 * Counts words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Extracts links from HTML content using Cheerio
 */
export function extractLinks(html: string, baseUrl: string): { internal: string[]; external: string[] } {
  const $ = cheerio.load(html);
  const baseDomain = getDomain(baseUrl);
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;

      if (isSameDomain(absoluteUrl, baseDomain)) {
        internalLinks.add(absoluteUrl);
      } else if (href.startsWith('http')) {
        externalLinks.add(absoluteUrl);
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  return {
    internal: Array.from(internalLinks).slice(0, 50),
    external: Array.from(externalLinks).slice(0, 20),
  };
}

/**
 * Extracts URLs and metadata from sitemap XML content
 */
export function extractSitemapEntries(xml: string, baseUrl: string): SitemapEntry[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const baseDomain = getDomain(baseUrl);
  const entries = new Map<string, SitemapEntry>();

  $('url').each((_, el) => {
    const loc = $(el).find('loc').text().trim();
    const lastmod = $(el).find('lastmod').text().trim();
    if (!loc) return;

    try {
      if (isSameDomain(loc, baseDomain)) {
        const existing = entries.get(loc);

        if (!existing) {
          entries.set(loc, { url: loc, lastmod: lastmod || undefined });
          return;
        }

        const existingTime = existing.lastmod ? Date.parse(existing.lastmod) : Number.NaN;
        const nextTime = lastmod ? Date.parse(lastmod) : Number.NaN;
        
        if (!existing.lastmod || (!Number.isNaN(nextTime) && (Number.isNaN(existingTime) || nextTime > existingTime))) {
          entries.set(loc, { url: loc, lastmod: lastmod || undefined });
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  return Array.from(entries.values());
}

export function extractSitemapUrls(xml: string, baseUrl: string): string[] {
  return extractSitemapEntries(xml, baseUrl).map((entry) => entry.url);
}

/**
 * Detects required pages in crawled URLs
 */
export function detectRequiredPages(
  urls: string[],
  domain: string
): { has_privacy: boolean; has_about: boolean; has_contact: boolean; has_terms: boolean; has_disclaimer: boolean } {
  const lowerUrls = urls.map((url) => url.toLowerCase());

  return {
    has_privacy: lowerUrls.some((url) => url.includes('privacy')),
    has_about: lowerUrls.some((url) => url.includes('about')),
    has_contact: lowerUrls.some((url) => url.includes('contact')),
    has_terms: lowerUrls.some((url) => url.includes('terms') || url.includes('tos') || url.includes('condition')),
    has_disclaimer: lowerUrls.some((url) => url.includes('disclaimer')),
  };
}

/**
 * Extracts meta description from HTML using Cheerio
 */
export function extractMetaDescription(html: string): string | undefined {
  const $ = cheerio.load(html);
  return $('meta[name="description"]').attr('content')?.trim();
}

/**
 * Extracts page title from HTML using Cheerio
 */
export function extractTitle(html: string, url: string): string {
  const $ = cheerio.load(html);
  let title = $('title').first().text().trim();
  
  if (title) {
    return title.replace(/\s+/g, ' ').trim();
  }

  // Fallback to URL path
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').filter((p) => p).pop();
    return path ? decodeURIComponent(path) : urlObj.hostname || 'Untitled';
  } catch {
    return 'Untitled';
  }
}

/**
 * Checks if the HTML contains a viewport meta tag (proxy for mobile responsiveness)
 */
export function hasViewportMeta(html: string): boolean {
  const $ = cheerio.load(html);
  return $('meta[name="viewport"]').length > 0;
}

/**
 * Checks if AdSense script is installed anywhere in the HTML
 */
export function isAdsenseInstalled(html: string): boolean {
  const $ = cheerio.load(html);
  let found = false;
  $('script').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
      found = true;
    }
  });
  return found;
}
