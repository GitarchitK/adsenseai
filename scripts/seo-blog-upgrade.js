const fs = require('fs');
const path = require('path');

const INTERNAL_LINK_ANCHORS = [
  "check your site's AdSense readiness",
  "AdSense approval checker",
  "test your website for AdSense",
  "free AdSense site audit",
  "see if your blog qualifies for AdSense",
  "AdSense readiness score",
  "check your AdSense eligibility",
];

const blogDir = path.join(__dirname, '..', 'app', 'blog');
const dirs = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

let updatedCount = 0;

for (const dir of dirs) {
  const filePath = path.join(blogDir, dir, 'page.tsx');
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Update title in metadata
  content = content.replace(/export const metadata: Metadata = \{([\s\S]*?)\}/, (match, metaBody) => {
    let newMeta = metaBody.replace(/title:\s*('[^']*'|"[^"]*")/g, (m, stringLiteral) => {
      // strip the first and last quote character
      let quoteChar = stringLiteral[0];
      let innerText = stringLiteral.slice(1, -1);

      if (innerText.includes('2026 Complete Guide')) return m;
      return `title: ${quoteChar}${innerText} (2026 Complete Guide)${quoteChar}`;
    });
    return `export const metadata: Metadata = {${newMeta}}`;
  });

  // 2. Inject internal link at the bottom of the article, before </article>
  const randomAnchor = INTERNAL_LINK_ANCHORS[Math.floor(Math.random() * INTERNAL_LINK_ANCHORS.length)];
  const internalLinkHtml = `
          <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-2 text-foreground">Ready to get approved?</h3>
            <p className="text-muted-foreground">Use our AI-powered tool to <Link href="/" className="text-primary hover:underline font-bold">${randomAnchor}</Link> and get a step-by-step roadmap to monetization.</p>
          </div>
  `;

  // Make sure we haven't already injected it
  if (!content.includes('Ready to get approved?')) {
    content = content.replace('</article>', `${internalLinkHtml}\n      </article>`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    updatedCount++;
    console.log(`Updated: ${dir}`);
  }
}

console.log(`\nSuccessfully updated ${updatedCount} blog posts!`);
