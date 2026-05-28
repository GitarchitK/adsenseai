# Requirements Document

## Introduction

AdSense Checker AI v3.0 pivots from a one-shot report tool to a day-by-day AdSense coaching subscription. After a user enters their URL, the system crawls up to 150 pages, runs 7 AI analysis modules, and estimates how many days the site needs before it can be approved by Google AdSense. The user pays ₹5/day (e.g. ₹150 for a 30-day plan) via Razorpay, then receives a personalised N-day roadmap with one task unlocked per day. A daily email at 8 AM IST delivers that day's task. Every 5 plan days the system re-crawls the site and adapts the remaining roadmap based on progress. On the final day the user sees a completion screen confirming they are ready to apply for AdSense.

The existing codebase (Next.js 14, Firebase Firestore + Auth, Razorpay, OpenAI GPT-4o, Vercel) already handles crawling, 7-module AI analysis, scan storage, and a basic dashboard. This spec covers only the new coaching subscription layer.

---

## Glossary

- **Coaching_Plan**: A purchased N-day personalised roadmap stored in the `plans/{planId}` Firestore collection.
- **Day_Estimator**: The `estimateApprovalDays()` function in `services/ai-days.ts` that calls GPT-4o after all 7 AI modules complete and returns a day count (14–90), a confidence label, and a summary sentence.
- **Roadmap_Generator**: The `generateRoadmap()` function in `services/ai-roadmap.ts` that produces the full N-day task list after payment is confirmed.
- **Roadmap_Day**: A single day entry in the roadmap containing title, category, priority, estimatedMinutes, instructions (4–8 steps), whyItMatters, and successCriteria.
- **Drip_Enforcement**: Server-side logic that prevents a user from accessing future days' tasks before those days are unlocked.
- **Re_Crawl**: An automated re-crawl of the user's site triggered every 5 plan days, using the same 8-worker 150-page limit as normal scans.
- **Roadmap_Adapter**: The `adaptRoadmap()` function in `services/ai-roadmap-adapt.ts` that regenerates remaining days after each Re_Crawl, accounting for completed tasks and score changes.
- **Daily_Email**: An HTML email sent via Resend at 2:30 AM UTC (8 AM IST) containing the current day's task.
- **Plan_Order**: A Razorpay order created for the coaching plan purchase, with amount = totalDays × 500 paise.
- **Completion_Screen**: The UI shown when all days in a Coaching_Plan are marked done, confirming AdSense readiness.
- **Estimate_Flow**: The URL-first pricing page experience where a user enters their URL, triggers analysis, and sees a personalised day count and price before purchasing.
- **UserPlan**: The Firestore document interface for a Coaching_Plan (see Requirement 3).
- **RoadmapDay**: The TypeScript interface for a single Roadmap_Day entry (see Requirement 3).

---

## Requirements

---

### Requirement 1: AI Day Count Estimation

**User Story:** As a user who has just had my site crawled and analysed, I want the system to estimate how many days of coaching my site needs, so that I can see a personalised plan and price before deciding to purchase.

#### Acceptance Criteria

1. WHEN all 7 AI analysis modules complete for a scan, THE Day_Estimator SHALL call GPT-4o with the combined module outputs and return an estimated day count between 14 and 90 (inclusive).
2. WHEN the Day_Estimator returns a result, THE Day_Estimator SHALL include a confidence label of exactly one of: `fast`, `moderate`, or `needs_work`.
3. WHEN the Day_Estimator returns a result, THE Day_Estimator SHALL include a plain-English summary sentence of no more than 30 words explaining why that day count was chosen.
4. IF the GPT-4o call fails or returns an out-of-range value, THEN THE Day_Estimator SHALL return a fallback estimate derived deterministically from the final score: score ≥ 80 → 14 days, score ≥ 65 → 21 days, score ≥ 50 → 30 days, score < 50 → 45 days.
5. THE Day_Estimator SHALL complete its GPT-4o call within 30 seconds; IF the call exceeds 30 seconds, THEN THE Day_Estimator SHALL use the deterministic fallback.
6. WHEN `services/ai-report.ts` calls `generateAIReport()`, THE AI_Report_Assembler SHALL call `estimateApprovalDays()` after all 7 modules complete and attach the result to the returned `AIReport` object as `coaching_estimate`.

---

### Requirement 2: Estimate Flow on Pricing Page

**User Story:** As a visitor on the pricing page, I want to enter my URL and see a personalised coaching plan estimate (days and total price) before I pay, so that I understand exactly what I am buying.

#### Acceptance Criteria

1. THE Pricing_Page SHALL replace the existing three-tier card layout with a URL-first estimate flow containing a URL input field and an "Analyse My Site" button.
2. WHEN a user submits a URL on the Pricing_Page, THE Pricing_Page SHALL call `POST /api/plans/estimate` and display a loading state while the estimate is being computed.
3. WHEN `POST /api/plans/estimate` returns successfully, THE Pricing_Page SHALL display: the estimated day count, the total price (days × ₹5), the confidence label, and the summary sentence from the Day_Estimator.
4. WHEN the estimate is displayed, THE Pricing_Page SHALL show a "Start My Plan — ₹{total}" call-to-action button that initiates the Razorpay payment flow.
5. IF the user is not authenticated when clicking the CTA, THEN THE Pricing_Page SHALL redirect the user to `/auth/signup` with a `?redirect=/pricing` parameter.
6. IF `POST /api/plans/estimate` returns an error, THEN THE Pricing_Page SHALL display a user-readable error message and allow the user to re-enter their URL.
7. THE Pricing_Page SHALL retain the existing FAQ section, trust badges, and testimonials below the estimate flow.

---

### Requirement 3: Firestore Data Model

**User Story:** As a developer, I want well-typed Firestore interfaces for coaching plans and roadmap days, so that all services and API routes share a consistent data contract.

#### Acceptance Criteria

1. THE `lib/firebase-types.ts` file SHALL export a `UserPlan` interface with the following required fields: `planId` (string), `userId` (string), `scanId` (string), `url` (string), `totalDays` (number), `startDate` (ISO string), `currentDay` (number, 1-indexed), `status` (`active` | `completed` | `paused`), `pricePaid` (number, in paise), `razorpayOrderId` (string), `razorpayPaymentId` (string), `roadmap` (array of `RoadmapDay`), `completedDays` (array of numbers), `lastCrawlDay` (number), `crawlHistory` (array of objects with `day` and `scanId`).
2. THE `lib/firebase-types.ts` file SHALL export a `RoadmapDay` interface with the following required fields: `day` (number), `title` (string), `category` (string), `priority` (`high` | `medium` | `low`), `estimatedMinutes` (number), `instructions` (array of strings, length 4–8), `whyItMatters` (string), `successCriteria` (string).
3. THE `UserProfile` interface in `lib/firebase-types.ts` SHALL be extended with two optional fields: `activePlanId` (string | null) and `planStatus` (`active` | `completed` | `paused` | null).
4. WHEN a `UserPlan` document is written to Firestore, THE Firestore_Writer SHALL store it in the `plans/{planId}` collection path.
5. THE `UserPlan` interface SHALL enforce that `currentDay` is always ≥ 1 and ≤ `totalDays` at the type level using a branded or validated type, OR the enforcement SHALL be documented as a runtime invariant in a code comment.

---

### Requirement 4: API Routes — Plan Lifecycle

**User Story:** As a developer, I want a complete set of API routes for the coaching plan lifecycle, so that the frontend can estimate, purchase, retrieve, progress, and trigger re-crawls for plans.

#### Acceptance Criteria

1. THE `POST /api/plans/estimate` route SHALL accept a JSON body with `{ url: string }`, run the crawl and Day_Estimator, and return `{ days: number, confidence: string, summary: string, scanId: string }` with HTTP 200.
2. IF `POST /api/plans/estimate` receives a malformed URL, THEN THE route SHALL return HTTP 400 with `{ error: "Invalid URL" }`.
3. THE `POST /api/plans/create` route SHALL accept a JSON body with `{ scanId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }`, verify the Razorpay signature, call `generateRoadmap()`, create the `UserPlan` document in Firestore, update the user's `activePlanId` and `planStatus`, and return `{ planId: string }` with HTTP 201.
4. IF the Razorpay signature verification in `POST /api/plans/create` fails, THEN THE route SHALL return HTTP 400 with `{ error: "Payment verification failed" }` and SHALL NOT create any Firestore documents.
5. THE `GET /api/plans/[planId]` route SHALL return the full `UserPlan` document but SHALL enforce Drip_Enforcement: the `roadmap` array in the response SHALL only include days where `day ≤ currentDay`; future days SHALL be replaced with `{ day: N, locked: true }`.
6. IF a user requests `GET /api/plans/[planId]` for a plan that does not belong to their authenticated `userId`, THEN THE route SHALL return HTTP 403.
7. THE `PATCH /api/plans/[planId]/complete-day` route SHALL accept `{ day: number }`, mark that day as completed in `completedDays`, and return the updated `UserPlan` with HTTP 200.
8. IF `PATCH /api/plans/[planId]/complete-day` receives a `day` value greater than `currentDay`, THEN THE route SHALL return HTTP 400 with `{ error: "Day not yet unlocked" }`.
9. THE `POST /api/plans/[planId]/recrawl` route SHALL trigger a Re_Crawl of the plan's URL, store the new scan in Firestore, call `adaptRoadmap()`, update the `UserPlan` document with the adapted roadmap and updated `crawlHistory`, and return `{ adapted: true, newScanId: string }` with HTTP 200.

---

### Requirement 5: Payment Flow

**User Story:** As a user who has seen my personalised estimate, I want to pay for my coaching plan via Razorpay and have my plan activated immediately after payment, so that I can start Day 1 without delay.

#### Acceptance Criteria

1. THE `POST /api/razorpay/plan-order` route SHALL accept `{ days: number }`, create a Razorpay order with `amount = days × 500` (paise), `currency = "INR"`, and return `{ orderId: string, amount: number, currency: string, keyId: string }` with HTTP 200.
2. IF `POST /api/razorpay/plan-order` receives a `days` value outside the range 14–90, THEN THE route SHALL return HTTP 400 with `{ error: "Invalid plan duration" }`.
3. THE `POST /api/razorpay/plan-verify` route SHALL verify the Razorpay payment signature using HMAC-SHA256 with the Razorpay secret key before activating any plan.
4. WHEN payment is verified by `POST /api/razorpay/plan-verify`, THE route SHALL call `POST /api/plans/create` internally (or perform equivalent logic) and return `{ planId: string, redirectUrl: "/dashboard/plan" }` with HTTP 200.
5. IF the Razorpay payment signature is invalid in `POST /api/razorpay/plan-verify`, THEN THE route SHALL return HTTP 400 with `{ error: "Invalid payment signature" }` and SHALL NOT activate any plan.
6. THE existing `POST /api/razorpay/unlock/route.ts` (₹19 unlock model) SHALL be deprecated and removed as part of this feature; its functionality SHALL NOT be replicated in the new payment routes.

---

### Requirement 6: AI Roadmap Generation

**User Story:** As a user who has just paid for a coaching plan, I want the system to generate a personalised N-day roadmap immediately after payment, so that I can start Day 1 right away.

#### Acceptance Criteria

1. WHEN `generateRoadmap()` is called with a `scanId` and `totalDays`, THE Roadmap_Generator SHALL call GPT-4o with the full AI report data and return an array of exactly `totalDays` `RoadmapDay` objects.
2. WHEN generating a roadmap, THE Roadmap_Generator SHALL ensure each `RoadmapDay` has between 4 and 8 instruction steps (inclusive).
3. WHEN generating a roadmap, THE Roadmap_Generator SHALL distribute tasks across categories such that no single category accounts for more than 40% of all days.
4. IF the GPT-4o call for roadmap generation fails, THEN THE Roadmap_Generator SHALL return a deterministic fallback roadmap built from the existing `approval_workflow` data in the AI report, padded to `totalDays` with generic improvement tasks.
5. THE Roadmap_Generator SHALL complete roadmap generation within 60 seconds; IF the call exceeds 60 seconds, THEN THE Roadmap_Generator SHALL use the deterministic fallback.
6. THE `generateRoadmap()` function SHALL be implemented in `services/ai-roadmap.ts` and SHALL be callable from the `POST /api/plans/create` route.

---

### Requirement 7: Roadmap Adaptation After Re-Crawl

**User Story:** As an active coaching plan user, I want the system to re-crawl my site every 5 days and adapt my remaining roadmap based on my actual progress, so that I am not doing tasks that are already done.

#### Acceptance Criteria

1. WHEN `adaptRoadmap()` is called with the original `UserPlan`, the new scan results, and the list of `completedDays`, THE Roadmap_Adapter SHALL regenerate only the remaining (uncompleted) days of the roadmap.
2. WHEN adapting the roadmap, THE Roadmap_Adapter SHALL preserve all completed days unchanged and SHALL NOT renumber them.
3. WHEN adapting the roadmap, THE Roadmap_Adapter SHALL remove tasks from the remaining days that correspond to issues already resolved in the new scan.
4. IF the new scan shows a score improvement of 10 or more points compared to the previous scan, THEN THE Roadmap_Adapter SHALL reduce the remaining day count by up to 20% (rounded down), subject to a minimum of 3 remaining days.
5. IF the new scan shows a score decrease of 5 or more points compared to the previous scan, THEN THE Roadmap_Adapter SHALL add up to 5 additional days to the remaining roadmap.
6. THE `adaptRoadmap()` function SHALL be implemented in `services/ai-roadmap-adapt.ts` and SHALL be callable from the `POST /api/plans/[planId]/recrawl` route.
7. WHEN `adaptRoadmap()` completes, THE Roadmap_Adapter SHALL update `lastCrawlDay` to the current `currentDay` value in the `UserPlan` document.

---

### Requirement 8: Daily Email Delivery

**User Story:** As an active coaching plan user, I want to receive an email at 8 AM IST every day with my current day's task, so that I am reminded to complete my daily coaching task.

#### Acceptance Criteria

1. THE `services/email.ts` module SHALL implement `sendDailyEmail(userId, planId, day, roadmapDay)` using the Resend API (free tier: 3,000 emails/month).
2. WHEN `sendDailyEmail()` is called, THE Email_Service SHALL send an HTML email containing: the day number, the task title, the category, the estimated minutes, the full instruction steps, the whyItMatters text, and the successCriteria.
3. THE HTML email template SHALL include a "Mark as Done" deep-link button that navigates the user to `/dashboard/plan?day={day}&complete=1`.
4. THE `/api/cron/daily-emails` Vercel cron job SHALL run at 2:30 AM UTC (8:00 AM IST) every day.
5. WHEN the `/api/cron/daily-emails` cron job runs, THE Cron_Job SHALL query all `UserPlan` documents with `status = "active"`, call `sendDailyEmail()` for each, and increment `currentDay` by 1 for each plan where the previous day has elapsed.
6. IF `sendDailyEmail()` fails for a specific user, THEN THE Cron_Job SHALL log the error and continue processing remaining users without aborting the entire batch.
7. WHEN `currentDay` reaches `totalDays` and the cron job runs, THE Cron_Job SHALL set the plan `status` to `"completed"` instead of incrementing `currentDay` further.
8. THE `/api/cron/daily-emails` route SHALL be protected by a `CRON_SECRET` environment variable; IF the request does not include the correct secret in the `Authorization` header, THEN THE route SHALL return HTTP 401.

---

### Requirement 9: Automated Re-Crawl Cron Job

**User Story:** As an active coaching plan user, I want my site to be automatically re-crawled every 5 plan days, so that my roadmap stays up to date without me having to trigger it manually.

#### Acceptance Criteria

1. THE `/api/cron/recrawl-check` Vercel cron job SHALL run at 3:00 AM UTC every day.
2. WHEN the `/api/cron/recrawl-check` cron job runs, THE Cron_Job SHALL query all `UserPlan` documents with `status = "active"` where `(currentDay - lastCrawlDay) >= 5`.
3. FOR EACH plan matching the re-crawl condition, THE Cron_Job SHALL call the `POST /api/plans/[planId]/recrawl` logic using the same 8-worker 150-page crawl limit as normal scans.
4. THE `/api/cron/recrawl-check` route SHALL be protected by the same `CRON_SECRET` mechanism as the daily-emails cron job.
5. IF a re-crawl fails for a specific plan, THEN THE Cron_Job SHALL log the error and continue processing remaining plans without aborting the batch.
6. THE `vercel.json` file SHALL declare exactly 2 cron jobs: `daily-emails` at `"30 2 * * *"` and `recrawl-check` at `"0 3 * * *"`, fitting within Vercel's free-tier cron limit.

---

### Requirement 10: Coaching Plan Dashboard

**User Story:** As an active coaching plan user, I want a dedicated dashboard page that shows my progress, today's task, completed days, and upcoming days, so that I can track my journey to AdSense approval.

#### Acceptance Criteria

1. THE `app/dashboard/plan/page.tsx` page SHALL be accessible only to authenticated users with an `activePlanId`; IF an unauthenticated user accesses this page, THEN THE page SHALL redirect to `/auth/login`.
2. THE Plan_Dashboard SHALL display a progress bar showing `completedDays.length / totalDays` as a percentage.
3. THE Plan_Dashboard SHALL display an interactive task card for the current day (`currentDay`) showing: title, category, estimated minutes, all instruction steps, whyItMatters, and successCriteria.
4. THE Plan_Dashboard SHALL display a "Mark Today as Done" button; WHEN clicked, THE button SHALL call `PATCH /api/plans/[planId]/complete-day` and update the UI optimistically.
5. THE Plan_Dashboard SHALL display a scrollable list of completed days with a checkmark indicator for each.
6. THE Plan_Dashboard SHALL display locked future days as greyed-out cards with a lock icon; future day titles SHALL be visible but instructions SHALL NOT be shown.
7. THE Plan_Dashboard SHALL display a countdown showing how many days remain until the next Re_Crawl (i.e. `5 - (currentDay - lastCrawlDay)` days).
8. WHEN `status = "completed"`, THE Plan_Dashboard SHALL replace the task card with a Completion_Screen showing a congratulations message and a direct link to `https://adsense.google.com/start`.
9. THE `app/dashboard/page.tsx` SHALL check if `profile.activePlanId` is set; WHEN it is set, THE Dashboard SHALL redirect the user to `/dashboard/plan` instead of showing the scan form.

---

### Requirement 11: Navbar "My Plan" Link

**User Story:** As an active coaching plan user, I want a "My Plan" link in the navbar, so that I can quickly navigate to my coaching dashboard from any page.

#### Acceptance Criteria

1. WHEN a logged-in user has `profile.planStatus = "active"`, THE Navbar SHALL display a "My Plan" link pointing to `/dashboard/plan` in the desktop navigation links section.
2. WHEN a logged-in user has `profile.planStatus = "active"`, THE Navbar SHALL display a "My Plan" icon button in the mobile navigation section.
3. WHEN `profile.planStatus` is null, `"completed"`, or `"paused"`, THE Navbar SHALL NOT display the "My Plan" link.
4. THE Navbar SHALL fetch `planStatus` from the user profile via the existing `useProfile` hook without making additional API calls.

---

### Requirement 12: Sitemap Updates

**User Story:** As a developer, I want the sitemap to include the new coaching-related pages, so that search engines can discover and index them.

#### Acceptance Criteria

1. THE `app/sitemap.ts` file SHALL include an entry for `/dashboard/plan` with `changeFrequency: "weekly"` and `priority: 0.7`.
2. THE `app/sitemap.ts` file SHALL include an entry for `/pricing` that reflects the updated Estimate_Flow page, retaining its existing `priority: 0.9`.

---

### Requirement 13: Resend Email Service Integration

**User Story:** As a developer, I want the system to use Resend for transactional emails instead of any previous email provider, so that we stay within the free tier of 3,000 emails/month.

#### Acceptance Criteria

1. THE `services/email.ts` module SHALL use the Resend SDK (`resend` npm package) to send all coaching emails.
2. THE Email_Service SHALL read the Resend API key from the `RESEND_API_KEY` environment variable; IF the variable is not set, THEN THE Email_Service SHALL throw a configuration error at startup.
3. THE HTML email template used by `sendDailyEmail()` SHALL be responsive (mobile-friendly) and SHALL include the AdSense Checker AI branding (logo, brand colour `#7c3aed`).
4. THE Email_Service SHALL send emails from the address `coaching@adsensechecker.in` with the display name "AdSense Checker AI".
5. WHEN `sendDailyEmail()` is called, THE Email_Service SHALL return a result object containing `{ success: boolean, messageId?: string, error?: string }`.

---

### Requirement 14: Parser and Serialiser Round-Trip Integrity

**User Story:** As a developer, I want all data serialised to and deserialised from Firestore and the OpenAI API to be structurally valid and round-trippable, so that no data corruption occurs across the coaching plan lifecycle.

#### Acceptance Criteria

1. THE `UserPlan` Firestore serialiser SHALL produce a plain JSON object that, when deserialised back into a `UserPlan` TypeScript object, produces a value equal to the original (round-trip property).
2. THE `RoadmapDay` serialiser SHALL produce a plain JSON object that, when deserialised back into a `RoadmapDay` TypeScript object, produces a value equal to the original (round-trip property).
3. WHEN the Roadmap_Generator receives a GPT-4o response, THE Roadmap_Generator SHALL validate that the response parses into an array of `RoadmapDay` objects conforming to the interface; IF validation fails, THEN THE Roadmap_Generator SHALL use the deterministic fallback (see Requirement 6, criterion 4).
4. WHEN the Day_Estimator receives a GPT-4o response, THE Day_Estimator SHALL validate that `days` is a number in [14, 90] and `confidence` is one of `fast | moderate | needs_work`; IF validation fails, THEN THE Day_Estimator SHALL use the deterministic fallback (see Requirement 1, criterion 4).
