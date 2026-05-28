/**
 * Email service using Resend
 * Sends transactional emails (welcome, scan complete, etc.)
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured — email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AdSense Checker AI <noreply@adsensechecker.in>',
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[Email] Resend API error:', error)
      return { success: false, error: `Resend API error: ${res.status}` }
    }

    const data = await res.json()
    console.log('[Email] Sent successfully:', data.id)
    return { success: true }
  } catch (err) {
    console.error('[Email] Send failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export const welcomeEmailTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to AdSense Checker AI</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#7c3aed; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">AdSense Checker AI</h2>
              <p style="margin:5px 0 0; font-size:14px;">Get Approved Faster 🚀</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Welcome, ${userName}! 👋</h2>
              <p>You're now one step closer to getting your website approved by Google AdSense.</p>
              <p>Our AI analyzes your site and tells you <strong>exactly what's stopping your approval</strong> — and how to fix it.</p>
              
              <!-- Features -->
              <h3 style="margin-top:25px; margin-bottom:10px;">What You Get:</h3>
              <ul style="padding-left:20px; line-height:1.8;">
                <li><strong>AdSense Readiness Score (0-100)</strong> — know exactly where you stand</li>
                <li><strong>Policy & Content Checks</strong> — catch violations before Google does</li>
                <li><strong>SEO & Trust Analysis</strong> — fix missing pages and weak signals</li>
                <li><strong>Actionable Fix List</strong> — specific fixes, not generic advice</li>
              </ul>
              
              <!-- CTA Button -->
              <div style="text-align:center; margin:30px 0;">
                <a href="https://www.adsensechecker.in/dashboard" style="background:#7c3aed; color:#ffffff; padding:14px 30px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Analyze Your Website Now</a>
              </div>
              
              <p>💡 <strong>Pro Tip:</strong> Most sites get rejected due to missing pages (Privacy Policy, About, Contact), low-quality content, or weak trust signals.</p>
              <p>We help you fix all of that — <strong>before you apply</strong>.</p>
            </td>
          </tr>
          
          <!-- Promotion Section -->
          <tr>
            <td style="background:#f1f5f9; padding:25px; text-align:center;">
              <h3 style="margin:0;">Want the Full Fix List?</h3>
              <p style="margin:10px 0; color:#555;">Get exact fixes & a 30-day action plan for just ₹19</p>
              <a href="https://www.adsensechecker.in/pricing" style="background:#16a34a; color:#ffffff; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin-top:10px;">Unlock Full Report</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:12px; color:#888;">
              <p style="margin:0;">© 2026 AdSense Checker AI</p>
              <p style="margin:5px 0;">Need help? Reply to this email or visit <a href="https://www.adsensechecker.in/contact" style="color:#7c3aed;">our support page</a></p>
              <p style="margin:10px 0 0;"><a href="https://www.adsensechecker.in/privacy" style="color:#888; text-decoration:none;">Privacy Policy</a> | <a href="https://www.adsensechecker.in/terms" style="color:#888; text-decoration:none;">Terms</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export const scanCompleteEmailTemplate = (userName: string, websiteUrl: string, finalScore: number, statusLabel: string, isPro: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Scan is Complete!</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8; padding:20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#16a34a; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">Scan Completed ✅</h2>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Hi ${userName},</h2>
              <p>Our AI has finished analyzing <strong>${websiteUrl}</strong> for Google AdSense approval.</p>
              
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin:25px 0; text-align:center;">
                <p style="margin:0; font-size:14px; color:#64748b; font-weight:bold; text-transform:uppercase;">AdSense Readiness Score</p>
                <div style="font-size:48px; font-weight:black; color:${finalScore >= 80 ? '#16a34a' : finalScore >= 50 ? '#d97706' : '#dc2626'}; margin:10px 0;">
                  ${finalScore}/100
                </div>
                <p style="margin:0; font-size:16px; font-weight:bold;">Status: ${statusLabel}</p>
              </div>

              ${isPro ? `
              <p>Great news! Since you have the Pro plan, your full AI report and step-by-step roadmap are ready for you in your dashboard.</p>
              
              <div style="text-align:center; margin:30px 0;">
                <a href="https://www.adsensechecker.in/dashboard/scans" style="background:#16a34a; color:#ffffff; padding:14px 30px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">View Full Report</a>
              </div>
              ` : `
              <p>Your website is currently losing potential AdSense revenue due to undetected issues. Generic advice won't fix it — you need a tailored plan.</p>
              
              <h3 style="margin-top:25px; margin-bottom:10px; color:#1e293b;">Unlock the AI Coaching Plan 🚀</h3>
              <p>Don't waste months getting rejected. Let our AI tell you <strong>exactly what to change on your specific website</strong> to guarantee approval.</p>
              
              <ul style="padding-left:20px; line-height:1.8;">
                <li><strong>Exact fixes</strong> for Policy Violations & Low-Value Content</li>
                <li><strong>Step-by-step roadmap</strong> customized to your niche</li>
                <li><strong>100% Money-Back Guarantee</strong> if you follow the steps and still get rejected</li>
              </ul>
              
              <div style="text-align:center; margin:35px 0;">
                <a href="https://www.adsensechecker.in/dashboard/results" style="background:#7c3aed; color:#ffffff; padding:16px 32px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px; display:inline-block; box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.39);">Unlock My Coaching Plan Now</a>
              </div>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:12px; color:#888; background:#f8fafc; border-top:1px solid #e2e8f0;">
              <p style="margin:0;">© 2026 AdSense Checker AI</p>
              <p style="margin:5px 0;"><a href="https://www.adsensechecker.in/contact" style="color:#7c3aed;">Support</a> | <a href="https://www.adsensechecker.in/privacy" style="color:#888;">Privacy</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
