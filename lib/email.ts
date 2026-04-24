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
