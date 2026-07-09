import { AiReportV2 } from '@/lib/firebase-types';

export async function sendFullReportEmail(
  toEmail: string,
  toName: string,
  report: AiReportV2,
  siteUrl: string,
  scanId: string
) {
  const payload = {
    sender: { email: process.env.BREVO_FROM_EMAIL || 'hello@adsensechecker.in', name: 'AdSense Checker AI' },
    to: [{ email: toEmail, name: toName }],
    subject: `Your AdSense Consultant Audit for ${siteUrl} — Verdict: ${report.overall_approval_chance}`,
    htmlContent: buildFullReportEmailHTML(report, siteUrl, scanId, toName)
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Email] Brevo API error:`, err);
    } else {
      console.log(`[Email] Full report sent to ${toEmail}`);
    }
  } catch (error) {
    console.error(`[Email] Failed to send full report to ${toEmail}:`, error);
  }
}

function buildFullReportEmailHTML(report: AiReportV2, url: string, scanId: string, name: string): string {
  const chanceColors = {
    'High': { text: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    'Medium': { text: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    'Low': { text: '#ef4444', bg: '#fef2f2', border: '#fca5a5' }
  }[report.overall_approval_chance] || { text: '#ef4444', bg: '#fef2f2', border: '#fca5a5' };

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:sans-serif">
<div style="max-width:680px;margin:24px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">

  <!-- Header -->
  <div style="background:#7F77DD;padding:32px">
    <p style="color:rgba(255,255,255,0.8);margin:0 0 4px;font-size:13px;text-transform:uppercase;font-weight:bold;letter-spacing:1px">Consultant Audit Report</p>
    <h1 style="color:white;margin:0 0 4px;font-size:24px">${url}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px">Hi ${name}, here is your AdSense readiness report</p>
  </div>

  <!-- Overall Chance Banner -->
  <div style="padding:24px 32px;background:${chanceColors.bg};border-bottom:1px solid ${chanceColors.border};display:flex;align-items:center;justify-content:between">
    <div>
      <div style="font-size:12px;text-transform:uppercase;color:#555;font-weight:bold;margin-bottom:2px">Overall Approval Chance</div>
      <div style="font-size:24px;font-weight:900;color:${chanceColors.text}">${report.overall_approval_chance}</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:12px;color:#555;font-weight:bold">Estimated Timeline</div>
      <div style="font-size:16px;font-weight:700;color:#7F77DD">${report.estimated_timeline}</div>
    </div>
  </div>

  <!-- Summary -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 12px;font-size:16px;color:#111">📊 Consultant Verdict Summary</h2>
    <p style="font-size:14px;line-height:1.6;color:#333;margin:0">${report.summary}</p>
  </div>

  <!-- Critical Gaps -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:16px;color:#ef4444">⚠️ Critical Compliance Gaps</h2>
    ${report.critical_issues && report.critical_issues.length > 0 ? report.critical_issues.map(issue => `
      <div style="margin-bottom:16px;padding:16px;background:#fef2f2;border-radius:8px;border-left:4px solid #ef4444">
        <div style="font-weight:700;color:#111;margin-bottom:4px;font-size:14px">${issue.issue}</div>
        <div style="font-size:13px;color:#555;margin-bottom:10px"><strong>Why:</strong> ${issue.why_it_matters}</div>
        <div style="font-size:13px;color:#333;background:rgba(255,255,255,0.7);padding:8px;border-radius:4px"><strong>Recommended Fix:</strong> ${issue.fix}</div>
      </div>
    `).join('') : '<p style="font-size:14px;color:#555">No critical issues found!</p>'}
  </div>

  <!-- Priority Action Plan -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:16px;color:#111">📋 Priority Action Plan Checklist</h2>
    ${report.action_plan.map((task, idx) => `
      <div style="display:flex;align-items:start;gap:12px;padding:10px 0;border-bottom:1px solid #f9f9f9">
        <span style="font-size:14px;font-weight:bold;color:#7F77DD;width:20px">${idx + 1}.</span>
        <span style="font-size:14px;color:#333;line-height:1.4">${task}</span>
      </div>
    `).join('')}
  </div>

  <!-- Strengths -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee;background:#fafafa">
    <h2 style="margin:0 0 16px;font-size:16px;color:#10b981">✨ Key Strengths</h2>
    <ul style="padding:0 0 0 20px;margin:0;font-size:14px;color:#333;line-height:1.6">
      ${report.strengths.map(str => `
        <li style="margin-bottom:8px">${str}</li>
      `).join('')}
    </ul>
  </div>

  <!-- Footer link -->
  <div style="padding:32px;text-align:center;background:#f9f9f9">
    <a href="https://www.adsensechecker.in/dashboard/scans/${scanId}" style="display:inline-block;padding:12px 28px;background:#7F77DD;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">View Full Report Online</a>
    <p style="font-size:11px;color:#888;margin:20px 0 0;line-height:1.6;font-style:italic">
      <strong>Disclaimer:</strong> ${report.disclaimer}
    </p>
  </div>

</div>
</body>
</html>
  `;
}
