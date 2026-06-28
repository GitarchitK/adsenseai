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
    subject: `Your AdSense Report for ${siteUrl} — Score: ${report.readinessScore}/100`,
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
  const scoreColor = report.readinessScore >= 70 ? '#1D9E75' : report.readinessScore >= 50 ? '#BA7517' : '#E24B4A';

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:sans-serif">
<div style="max-width:680px;margin:24px auto;background:white;border-radius:12px;overflow:hidden">

  <!-- Header -->
  <div style="background:#7F77DD;padding:32px">
    <p style="color:rgba(255,255,255,0.8);margin:0 0 4px;font-size:13px">AdSense Readiness Report</p>
    <h1 style="color:white;margin:0 0 4px;font-size:22px">${url}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px">Hi ${name}, here is your full report</p>
  </div>

  <!-- Score banner -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:24px">
    <div style="text-align:center">
      <div style="font-size:48px;font-weight:700;color:${scoreColor}">${report.readinessScore}</div>
      <div style="font-size:13px;color:#888">out of 100</div>
    </div>
    <div>
      <div style="font-size:16px;font-weight:600;color:#111">Approval Chance: ${report.approvalChance} (${report.approvalChancePercent}%)</div>
      <div style="font-size:14px;color:#555;margin-top:4px">Niche: ${report.detectedNiche}</div>
    </div>
  </div>

  <!-- Phase 1: Critical fixes -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:16px;color:#E24B4A">🔴 ${report.masterActionPlan.phase1.title}</h2>
    ${report.masterActionPlan.phase1.tasks.map(task => `
      <div style="margin-bottom:16px;padding:14px;background:#fff5f5;border-radius:8px;border-left:3px solid #E24B4A">
        <div style="font-weight:600;color:#111;margin-bottom:4px">${task.task}</div>
        <div style="font-size:14px;color:#555;margin-bottom:4px">${task.why}</div>
      </div>
    `).join('')}
  </div>

  <!-- Phase 2 -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:16px;color:#BA7517">🟠 ${report.masterActionPlan.phase2.title}</h2>
    ${report.masterActionPlan.phase2.tasks.map(task => `
      <div style="margin-bottom:16px;padding:14px;background:#fffbf0;border-radius:8px;border-left:3px solid #BA7517">
        <div style="font-weight:600;color:#111;margin-bottom:4px">${task.task}</div>
        <div style="font-size:14px;color:#555">${task.why}</div>
      </div>
    `).join('')}
  </div>

  <!-- Checklist -->
  <div style="padding:24px 32px;border-bottom:1px solid #eee">
    <h2 style="margin:0 0 16px;font-size:16px;color:#111">✅ Pre-Application Checklist</h2>
    ${report.preApplicationChecklist.map(item => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0">
        <span style="font-size:16px">${item.status === 'done' ? '✅' : item.status === 'unknown' ? '🟡' : '❌'}</span>
        <span style="font-size:14px;color:${item.status === 'done' ? '#1D9E75' : '#555'}">${item.item}</span>
      </div>
    `).join('')}
  </div>

  <!-- Dashboard link -->
  <div style="padding:24px 32px;text-align:center">
    <p style="color:#555;margin:0 0 16px">View your full interactive report on the dashboard</p>
    <a href="https://www.adsensechecker.in/dashboard/scans/${scanId}"
       style="background:#7F77DD;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">
      Open Full Report →
    </a>
  </div>

  <div style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:#999">AdSense Checker AI · Navroll Studio · adsensechecker.in</p>
  </div>
</div>
</body>
</html>`;
}
