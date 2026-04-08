/**
 * AdSense Policy Shield - Content Script
 * Scans the current page for AdSense policy violations
 */

function checkPolicy() {
  const issues = [];
  const warnings = [];

  // 1. Check for missing mandatory pages in the current domain
  const text = document.body.innerText.toLowerCase();
  if (!text.includes('privacy policy') && !text.includes('privacy-policy')) {
    warnings.push('Privacy Policy link not found on this page.');
  }
  if (!text.includes('about us') && !text.includes('about-us')) {
    warnings.push('About Us link not found on this page.');
  }

  // 2. Check for word count (Thin Content)
  const wordCount = document.body.innerText.split(/\s+/).length;
  if (wordCount < 400) {
    issues.push(`Thin content detected: Only ${wordCount} words. AdSense prefers 500+ words per article.`);
  }

  // 3. Check for illegal keywords (simplified)
  const forbiddenKeywords = ['adult', 'gambling', 'alcohol', 'drugs', 'weapons', 'hacking'];
  forbiddenKeywords.forEach(word => {
    if (text.includes(word)) {
      issues.push(`Restricted keyword found: "${word}". This may cause policy violations.`);
    }
  });

  // 4. Check for AdSense code
  const scripts = document.querySelectorAll('script');
  let adsenseFound = false;
  scripts.forEach(s => {
    if (s.src.includes('adsbygoogle')) adsenseFound = true;
  });

  if (!adsenseFound) {
    warnings.push('AdSense code not detected on this page.');
  }

  // Store results for the popup
  chrome.storage.local.set({ 
    lastScan: {
      url: window.location.href,
      issues,
      warnings,
      score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10)),
      timestamp: Date.now()
    }
  });
}

// Run the scan
checkPolicy();
