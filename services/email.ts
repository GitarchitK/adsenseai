/**
 * Email Service — AdSense Coaching Subscription
 * Uses the Resend SDK to send daily coaching emails.
 * Free tier: 3,000 emails/month.
 */

import { Resend } from 'resend'
import type { RoadmapDay } from '@/lib/firebase-types'

// ── Configuration guard ───────────────────────────────────────────────────────

const apiKey = process.env.RESEND_API_KEY

// Initialize without throwing at top-level to prevent build errors
const resend = apiKey ? new Resend(apiKey) : null

const FROM_ADDRESS = 'AdSense Checker AI <coaching@adsensechecker.in>'
const BRAND_COLOR = '#7c3aed'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.adsensechecker.in'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ── HTML template ─────────────────────────────────────────────────────────────

function buildEmailHtml(
  day: number,
  planId: string,
  roadmapDay: RoadmapDay
): string {
  const markDoneUrl = `${APP_URL}/dashboard/plan?day=${day}&complete=1&planId=${planId}`

  const priorityColor =
    roadmapDay.priority === 'high'
      ? '#dc2626'
      : roadmapDay.priority === 'medium'
      ? '#d97706'
      : '#16a34a'

  const instructionItems = roadmapDay.instructions
    .map(
      (step, i) => `
      <tr>
        <td style="padding: 8px 0; vertical-align: top;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width: 28px; vertical-align: top; padding-top: 2px;">
                <div style="
                  width: 22px; height: 22px; border-radius: 50%;
                  background-color: ${BRAND_COLOR}; color: #ffffff;
                  font-size: 11px; font-weight: 700; text-align: center;
                  line-height: 22px; font-family: Arial, sans-serif;
                ">${i + 1}</div>
              </td>
              <td style="padding-left: 10px; font-family: Arial, sans-serif; font-size: 14px; color: #374151; line-height: 1.6;">
                ${step}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Day ${day}: ${roadmapDay.title} — AdSense Checker AI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Card -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${BRAND_COLOR} 0%, #6366f1 50%, #3b82f6 100%);"></td>
          </tr>

          <!-- Logo + brand -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; color: #111827; font-family: Arial, sans-serif;">
                      AdSense <span style="color: ${BRAND_COLOR};">Checker AI</span>
                    </span>
                    <br />
                    <span style="font-size: 12px; color: #6b7280; font-family: Arial, sans-serif;">
                      Your daily coaching task is ready
                    </span>
                  </td>
                  <td align="right">
                    <div style="
                      display: inline-block; padding: 4px 12px;
                      background-color: #ede9fe; border-radius: 20px;
                      font-size: 12px; font-weight: 700; color: ${BRAND_COLOR};
                      font-family: Arial, sans-serif;
                    ">Day ${day}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Task header -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="
                      display: inline-block; padding: 3px 10px;
                      background-color: #f3f4f6; border-radius: 6px;
                      font-size: 11px; font-weight: 700; color: #6b7280;
                      text-transform: uppercase; letter-spacing: 0.05em;
                      font-family: Arial, sans-serif; margin-bottom: 8px;
                    ">${roadmapDay.category}</div>
                    &nbsp;
                    <div style="
                      display: inline-block; padding: 3px 10px;
                      background-color: ${priorityColor}1a; border-radius: 6px;
                      font-size: 11px; font-weight: 700; color: ${priorityColor};
                      text-transform: uppercase; letter-spacing: 0.05em;
                      font-family: Arial, sans-serif; margin-bottom: 8px;
                    ">${roadmapDay.priority} priority</div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <span style="font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif;">
                      ⏱ ~${roadmapDay.estimatedMinutes} min
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800; color: #111827; font-family: Arial, sans-serif; line-height: 1.3;">
                ${roadmapDay.title}
              </h1>
            </td>
          </tr>

          <!-- Why it matters -->
          <tr>
            <td style="padding: 16px 32px 0;">
              <div style="
                background-color: #ede9fe; border-left: 4px solid ${BRAND_COLOR};
                border-radius: 0 8px 8px 0; padding: 12px 16px;
              ">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: ${BRAND_COLOR}; font-family: Arial, sans-serif; margin-bottom: 4px;">
                  Why this matters
                </p>
                <p style="margin: 0; font-size: 14px; color: #4c1d95; font-family: Arial, sans-serif; line-height: 1.5;">
                  ${roadmapDay.whyItMatters}
                </p>
              </div>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #111827; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">
                Today's Steps
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${instructionItems}
              </table>
            </td>
          </tr>

          <!-- Success criteria -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <div style="
                background-color: #f0fdf4; border: 1px solid #bbf7d0;
                border-radius: 8px; padding: 12px 16px;
              ">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #15803d; font-family: Arial, sans-serif; margin-bottom: 4px;">
                  ✓ You're done when:
                </p>
                <p style="margin: 0; font-size: 14px; color: #166534; font-family: Arial, sans-serif; line-height: 1.5;">
                  ${roadmapDay.successCriteria}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding: 28px 32px;" align="center">
              <a href="${markDoneUrl}" style="
                display: inline-block; padding: 14px 36px;
                background-color: ${BRAND_COLOR}; color: #ffffff;
                font-size: 15px; font-weight: 700; text-decoration: none;
                border-radius: 10px; font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(124,58,237,0.35);
              ">
                ✓ Mark Day ${day} as Done
              </a>
              <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif;">
                Or visit your <a href="${APP_URL}/dashboard/plan" style="color: ${BRAND_COLOR}; text-decoration: none;">coaching dashboard</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: Arial, sans-serif; text-align: center; line-height: 1.6;">
                You're receiving this because you have an active AdSense coaching plan.<br />
                <a href="${APP_URL}/dashboard/plan" style="color: ${BRAND_COLOR}; text-decoration: none;">View your plan</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/dashboard/settings" style="color: ${BRAND_COLOR}; text-decoration: none;">Manage notifications</a>
                <br /><br />
                © ${new Date().getFullYear()} AdSense Checker AI · A product of Navroll Studio
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function sendDailyEmail(
  userId: string,
  planId: string,
  day: number,
  roadmapDay: RoadmapDay,
  userEmail: string
): Promise<EmailResult> {
  if (!resend) {
    console.error('[email] Cannot send email: RESEND_API_KEY is not set.')
    return { success: false, error: 'RESEND_API_KEY is not set.' }
  }

  try {
    const html = buildEmailHtml(day, planId, roadmapDay)

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: userEmail,
      subject: `Day ${day}: ${roadmapDay.title} — Your AdSense Coaching Task`,
      html,
    })

    if (error) {
      console.error(`[email] Failed to send day ${day} email to user ${userId}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`[email] ✓ Sent day ${day} email to user ${userId} — messageId: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (err) {
    const msg = (err as Error).message
    console.error(`[email] Exception sending day ${day} email to user ${userId}:`, msg)
    return { success: false, error: msg }
  }
}
