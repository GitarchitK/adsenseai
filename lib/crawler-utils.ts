import { URL } from 'url';

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
 * Cleans HTML text content by removing scripts, styles, and excessive whitespace
 */
export function cleanTextContent(text: string): string {
  return (
    text
      // Remove extra whitespace and newlines
      .replace(/\s+/g, ' ')
      // Remove common navigation/footer patterns
      .replace(/(?:home|about|contact|privacy|terms|cookies|login|signup|shop|blog|news|help|faq|sitemap)[\s\n]*/gi, '')
      // Clean up remaining text
      .trim()
      .slice(0, 10000) // Limit to 10k characters for efficiency
  );
}

/**
 * Extracts headings from HTML text (simple regex-based extraction)
 */
export function extractHeadings(htmlContent: string): { h1: string[]; h2: string[] } {
  const h1Matches = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
  const h2Matches = htmlContent.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];

  const extractText = (matches: string[]): string[] => {
    return matches
      .map((match) => {
        const textMatch = match.match(/>([^<]+)<\//);
        return textMatch ? cleanTextContent(textMatch[1]) : '';
      })
      .filter((text) => text.length > 0);
  };

  return {
    h1: extractText(h1Matches).slice(0, 5),
    h2: extractText(h2Matches).slice(0, 10),
  };
}

/**
 * Removes HTML tags and cleans up content
 */
export function stripHtmlTags(html: string): string {
  return (
    html
      // Remove script and style tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      // Remove nav/footer/aside content (often boilerplate)
      .replace(/<nav[^>]*>.*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>.*?<\/aside>/gi, '')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
  );
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
 * Extracts links from HTML content
 */
export function extractLinks(html: string, baseUrl: string): { internal: string[]; external: string[] } {
  const linkMatches = html.match(/href=["']([^"']+)["']/gi) || [];
  const baseDomain = getDomain(baseUrl);
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();

  linkMatches.forEach((match) => {
    const href = match.replace(/href=["']|["']/g, '');

    // Skip anchors and javascript
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
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
  const urlBlocks = xml.match(/<url\b[\s\S]*?<\/url>/gi) || [];
  const baseDomain = getDomain(baseUrl);
  const entries = new Map<string, SitemapEntry>();

  urlBlocks.forEach((block) => {
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/i);
    if (!locMatch?.[1]) return;

    const url = locMatch[1].trim();
    try {
      if (isSameDomain(url, baseDomain)) {
        const lastmodMatch = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i);
        const lastmod = lastmodMatch?.[1]?.trim();
        const existing = entries.get(url);

        if (!existing) {
          entries.set(url, { url, lastmod });
          return;
        }

        const existingTime = existing.lastmod ? Date.parse(existing.lastmod) : Number.NaN;
        const nextTime = lastmod ? Date.parse(lastmod) : Number.NaN;
        if (!existing.lastmod || (!Number.isNaN(nextTime) && (Number.isNaN(existingTime) || nextTime > existingTime))) {
          entries.set(url, { url, lastmod });
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
): { has_privacy: boolean; has_about: boolean; has_contact: boolean; has_terms: boolean } {
  const lowerUrls = urls.map((url) => url.toLowerCase());

  return {
    has_privacy: lowerUrls.some((url) => url.includes('privacy')),
    has_about: lowerUrls.some((url) => url.includes('about')),
    has_contact: lowerUrls.some((url) => url.includes('contact')),
    has_terms: lowerUrls.some((url) => url.includes('terms') || url.includes('tos')),
  };
}

/**
 * Extracts meta description from HTML
 */
export function extractMetaDescription(html: string): string | undefined {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

/**
 * Extracts page title from HTML
 */
export function extractTitle(html: string, url: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    return cleanTextContent(titleMatch[1]);
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
