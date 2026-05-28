# Tasks — AdSense Coaching Subscription (v3.0)

## Task List

- [x] 1. Data Model & Type Definitions
  - [x] 1.1 Add `RoadmapDay` interface to `lib/firebase-types.ts` with all required fields (`day`, `title`, `category`, `priority`, `estimatedMinutes`, `instructions`, `whyItMatters`, `successCriteria`)
  - [x] 1.2 Add `UserPlan` interface to `lib/firebase-types.ts` with all required fields and runtime invariant comment for `currentDay`
  - [x] 1.3 Extend `UserProfile` interface in `lib/firebase-types.ts` with optional `activePlanId` and `planStatus` fields
  - [x] 1.4 Add `coaching_day: 500` price and `COACHING_PLAN` constants to `lib/plans.ts`
  - [x] 1.5 Add `coaching_estimate` field to `AIReport` interface in `services/ai-report.ts`

- [x] 2. AI Day Count Estimator (`services/ai-days.ts`)
  - [x] 2.1 Create `services/ai-days.ts` with `DayEstimate` interface and `estimateApprovalDays(aiReport, finalScore)` function
  - [x] 2.2 Implement GPT-4o call with compact JSON summary of all 7 module scores and top issues
  - [x] 2.3 Implement response validation: `days` ∈ [14, 90], `confidence` ∈ `{fast, moderate, needs_work}`, `summary` ≤ 30 words
  - [x] 2.4 Implement deterministic fallback: score ≥ 80 → 14 days `fast`, score ≥ 65 → 21 days `moderate`, score ≥ 50 → 30 days `moderate`, score < 50 → 45 days `needs_work`
  - [x] 2.5 Apply 30-second timeout; on timeout use deterministic fallback
  - [x] 2.6 Integrate `estimateApprovalDays()` call into `generateAIReport()` in `services/ai-report.ts` after all 7 modules complete; attach result as `coaching_estimate`

- [x] 3. AI Roadmap Generator (`services/ai-roadmap.ts`)
  - [x] 3.1 Create `services/ai-roadmap.ts` with `generateRoadmap(scanId, totalDays, aiReport)` function
  - [x] 3.2 Implement GPT-4o call with full AI report data and `totalDays`; request exactly `totalDays` `RoadmapDay` objects
  - [x] 3.3 Implement response validation: array length === `totalDays`, each item has `instructions.length` ∈ [4, 8], category distribution ≤ 40% per category
  - [x] 3.4 Implement deterministic fallback roadmap built from `approval_workflow` data, padded to `totalDays` with generic improvement tasks
  - [x] 3.5 Apply 60-second timeout; on timeout use deterministic fallback

- [ ] 4. AI Roadmap Adapter (`services/ai-roadmap-adapt.ts`)
  - [x] 4.1 Create `services/ai-roadmap-adapt.ts` with `adaptRoadmap(plan, newScanResult, newScanId)` function
  - [x] 4.2 Implement logic to preserve all completed days unchanged (same day number, same content)
  - [x] 4.3 Implement logic to remove tasks from remaining days that correspond to issues resolved in the new scan
  - [x] 4.4 Implement score improvement logic: improvement ≥ 10 pts → reduce remaining days by up to 20% (rounded down, minimum 3 remaining days)
  - [x] 4.5 Implement score decrease logic: decrease ≥ 5 pts → add up to 5 additional days to remaining roadmap
  - [x] 4.6 Update `lastCrawlDay` to `currentDay` value in the returned plan data

- [x] 5. Email Service (`services/email.ts`)
  - [x] 5.1 Create `services/email.ts` using Resend SDK; read `RESEND_API_KEY` from env and throw `ConfigurationError` at module load if missing
  - [x] 5.2 Implement `sendDailyEmail(userId, planId, day, roadmapDay, userEmail)` returning `{ success, messageId?, error? }`
  - [x] 5.3 Build responsive HTML email template with brand colour `#7c3aed`, AdSense Checker AI logo/branding, and all required fields (day number, title, category, estimatedMinutes, instructions, whyItMatters, successCriteria)
  - [x] 5.4 Add "Mark as Done" deep-link button in email pointing to `/dashboard/plan?day={day}&complete=1`
  - [x] 5.5 Set from address to `coaching@adsensechecker.in` with display name "AdSense Checker AI"

- [-] 6. Payment API Routes
  - [ ] 6.1 Create `app/api/razorpay/plan-order/route.ts`: accept `{ days: number }`, validate days ∈ [14, 90] (return HTTP 400 if invalid), create Razorpay order with `amount = days × 500` paise, return `{ orderId, amount, currency, keyId }`
  - [ ] 6.2 Create `app/api/razorpay/plan-verify/route.ts`: verify HMAC-SHA256 signature using Razorpay secret key; on invalid signature return HTTP 400 and do not activate plan; on success call plan creation logic and return `{ planId, redirectUrl: "/dashboard/plan" }`

- [ ] 7. Plan Lifecycle API Routes
  - [ ] 7.1 Create `app/api/plans/estimate/route.ts`: accept `{ url: string }`, validate URL (HTTP 400 on invalid), run crawl + `estimateApprovalDays()`, return `{ days, confidence, summary, scanId }` with HTTP 200
  - [ ] 7.2 Create `app/api/plans/create/route.ts`: accept `{ scanId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`, verify signature, call `generateRoadmap()`, write `UserPlan` to `plans/{planId}` in Firestore, update user's `activePlanId` and `planStatus`, return `{ planId }` with HTTP 201; return HTTP 400 if signature invalid (no Firestore writes)
  - [ ] 7.3 Create `app/api/plans/[planId]/route.ts` (GET): return full `UserPlan` with drip enforcement — days where `day > currentDay` replaced with `{ day: N, locked: true }`; return HTTP 403 if plan does not belong to authenticated user
  - [ ] 7.4 Create `app/api/plans/[planId]/complete-day/route.ts` (PATCH): accept `{ day: number }`, validate `day ≤ currentDay` (HTTP 400 if not), add day to `completedDays`, return updated `UserPlan` with HTTP 200
  - [ ] 7.5 Create `app/api/plans/[planId]/recrawl/route.ts` (POST): trigger re-crawl of plan URL (8-worker, 150-page limit), store new scan, call `adaptRoadmap()`, update `UserPlan` with adapted roadmap and `crawlHistory`, return `{ adapted: true, newScanId }` with HTTP 200

- [ ] 8. Cron Jobs
  - [ ] 8.1 Create `app/api/cron/daily-emails/route.ts`: protect with `CRON_SECRET` (HTTP 401 if missing/wrong); query all `UserPlan` documents with `status = "active"`; for each: call `sendDailyEmail()`, increment `currentDay` by 1 (or set `status = "completed"` if `currentDay === totalDays`); log per-user errors and continue batch
  - [ ] 8.2 Create `app/api/cron/recrawl-check/route.ts`: protect with `CRON_SECRET`; query active plans where `(currentDay - lastCrawlDay) >= 5`; for each: call recrawl logic; log per-plan errors and continue batch
  - [ ] 8.3 Update `vercel.json` to add cron jobs: `daily-emails` at `"30 2 * * *"` and `recrawl-check` at `"0 3 * * *"`; add `maxDuration` entries for new API routes

- [ ] 9. Coaching Plan Dashboard UI
  - [ ] 9.1 Create `components/day-task-card.tsx`: display title, category badge, estimated minutes, all instruction steps, whyItMatters, successCriteria; include "Mark Today as Done" button with optimistic UI update calling `PATCH /api/plans/[planId]/complete-day`
  - [ ] 9.2 Create `components/plan-progress.tsx`: display progress bar (`completedDays.length / totalDays`), scrollable list of completed days with checkmarks, countdown to next re-crawl (`5 - (currentDay - lastCrawlDay)`)
  - [ ] 9.3 Create `components/day-lock.tsx`: greyed-out card with lock icon; show day title but hide instructions
  - [ ] 9.4 Create `app/dashboard/plan/page.tsx`: authenticated-only (redirect to `/auth/login` if not); fetch plan via `GET /api/plans/[planId]`; render `PlanProgress`, current day `DayTaskCard`, completed days list, locked future days via `DayLock`; show `Completion_Screen` with AdSense link when `status = "completed"`
  - [ ] 9.5 Update `app/dashboard/page.tsx`: check `profile.activePlanId` on load; if set, redirect to `/dashboard/plan`

- [ ] 10. Pricing Page Redesign
  - [ ] 10.1 Replace the three-tier card layout in `app/pricing/page.tsx` with a URL-first estimate flow: URL input field + "Analyse My Site" button
  - [ ] 10.2 Implement loading state while `POST /api/plans/estimate` is in progress
  - [ ] 10.3 Display estimate results: day count, total price (days × ₹5), confidence label, summary sentence
  - [ ] 10.4 Add "Start My Plan — ₹{total}" CTA button that initiates Razorpay payment flow via `POST /api/razorpay/plan-order`; redirect unauthenticated users to `/auth/signup?redirect=/pricing`
  - [ ] 10.5 Display user-readable error message if `POST /api/plans/estimate` returns an error; allow URL re-entry
  - [ ] 10.6 Retain existing FAQ section, trust badges, and testimonials below the estimate flow

- [ ] 11. Navbar Update
  - [ ] 11.1 Update `components/navbar.tsx` to read `planStatus` from `useProfile` hook
  - [ ] 11.2 Show "My Plan" desktop link pointing to `/dashboard/plan` when `planStatus === "active"`
  - [ ] 11.3 Show "My Plan" mobile icon button when `planStatus === "active"`
  - [ ] 11.4 Hide "My Plan" link when `planStatus` is null, `"completed"`, or `"paused"`

- [ ] 12. Sitemap & Config Updates
  - [ ] 12.1 Add `/dashboard/plan` entry to `app/sitemap.ts` with `changeFrequency: "weekly"` and `priority: 0.7`
  - [ ] 12.2 Verify `/pricing` entry in `app/sitemap.ts` retains `priority: 0.9`
  - [ ] 12.3 Add `RESEND_API_KEY` and `CRON_SECRET` to `.env.local.example`

- [ ] 13. Deprecation
  - [ ] 13.1 Remove `app/api/razorpay/unlock/route.ts` (₹19 per-scan unlock model is deprecated by this feature)
  - [ ] 13.2 Remove or update any UI references to the ₹19 unlock flow in `components/upgrade-modal.tsx` and scan result pages

- [ ] 14. Property-Based Tests
  - [ ] 14.1 Write property test for Property 1: `estimateApprovalDays()` always returns `days ∈ [14, 90]` for any input — Feature: adsense-coaching-subscription, Property 1: Day Estimate Range Invariant
  - [ ] 14.2 Write property test for Property 2: `estimateApprovalDays()` always returns `confidence ∈ {fast, moderate, needs_work}` — Feature: adsense-coaching-subscription, Property 2: Day Estimate Confidence Validity
  - [ ] 14.3 Write property test for Property 3: `generateRoadmap()` returns exactly `totalDays` items for any `totalDays ∈ [14, 90]` — Feature: adsense-coaching-subscription, Property 3: Roadmap Length Invariant
  - [ ] 14.4 Write property test for Property 4: every `RoadmapDay` has `instructions.length ∈ [4, 8]` — Feature: adsense-coaching-subscription, Property 4: Roadmap Instruction Count Invariant
  - [ ] 14.5 Write property test for Property 5: drip enforcement — for any `UserPlan`, `GET /api/plans/[planId]` returns locked objects for all days > `currentDay` — Feature: adsense-coaching-subscription, Property 5: Drip Enforcement
  - [ ] 14.6 Write property test for Property 6: `UserPlan` JSON round-trip — Feature: adsense-coaching-subscription, Property 6: UserPlan Serialisation Round-Trip
  - [ ] 14.7 Write property test for Property 7: `RoadmapDay` JSON round-trip — Feature: adsense-coaching-subscription, Property 7: RoadmapDay Serialisation Round-Trip
  - [ ] 14.8 Write property test for Property 8: `adaptRoadmap()` preserves all completed days unchanged — Feature: adsense-coaching-subscription, Property 8: Adaptation Preserves Completed Days
  - [ ] 14.9 Write property test for Property 9: Razorpay order amount === `days × 500` for any `days ∈ [14, 90]` — Feature: adsense-coaching-subscription, Property 9: Payment Amount Correctness
