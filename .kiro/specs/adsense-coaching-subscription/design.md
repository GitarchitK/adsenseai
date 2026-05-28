# Design Document — AdSense Coaching Subscription (v3.0)

## Overview

This redesign pivots AdSense Checker AI from a one-shot report tool to a day-by-day coaching subscription. The core loop is:

1. User enters URL → system crawls up to 150 pages and runs 7 AI modules
2. A new **Day Estimator** (GPT-4o) analyses the combined module output and returns a personalised day count (14–90) and price (days × ₹5)
3. User pays via Razorpay → a **Roadmap Generator** (GPT-4o) produces an N-day task list immediately
4. One task unlocks per day; a Vercel cron job sends a daily email at 8 AM IST and advances `currentDay`
5. Every 5 plan days a second cron job re-crawls the site and a **Roadmap Adapter** (GPT-4o) regenerates remaining days based on actual progress
6. On the final day the user sees a Completion Screen confirming AdSense readiness

The existing codebase (Next.js 14, Firebase Firestore + Auth, Razorpay, OpenAI GPT-4o, Vercel, Resend) already handles crawling, 7-module AI analysis, scan storage, and a basic dashboard. This design covers only the new coaching subscription layer.

---

## Architecture

### High-Level Flow

```mermaid
flowchart TD
    A[User visits /pricing] --> B[Enters URL]
    B --> C[POST /api/plans/estimate\ncrawl + Day Estimator]
    C --> D[Show: N days · ₹X total · confidence]
    D --> E{Authenticated?}
    E -- No --> F[Redirect /auth/signup?redirect=/pricing]
    E -- Yes --> G[POST /api/razorpay/plan-order\ncreate Razorpay order]
    G --> H[Razorpay checkout]
    H --> I[POST /api/razorpay/plan-verify\nverify HMAC-SHA256]
    I --> J[POST /api/plans/create\ngenerateRoadmap + write Firestore]
    J --> K[Redirect /dashboard/plan]
    K --> L[GET /api/plans/:planId\ndrip-enforced roadmap]

    subgraph Daily Cron 2:30 AM UTC
        M[/api/cron/daily-emails\nquery active plans\nsendDailyEmail\nincrement currentDay]
    end

    subgraph Re-crawl Cron 3:00 AM UTC
        N[/api/cron/recrawl-check\nquery plans where currentDay-lastCrawlDay≥5\ncrawl + adaptRoadmap]
    end
```

### Component Boundaries

| Layer | Responsibility |
|---|---|
| `services/ai-days.ts` | GPT-4o call → day count + confidence + summary |
| `services/ai-roadmap.ts` | GPT-4o call → N `RoadmapDay` objects |
| `services/ai-roadmap-adapt.ts` | GPT-4o call → regenerate remaining days after re-crawl |
| `services/email.ts` | Resend SDK → HTML daily email |
| `app/api/plans/*` | Plan lifecycle CRUD + drip enforcement |
| `app/api/razorpay/plan-order` & `plan-verify` | Payment creation + HMAC verification |
| `app/api/cron/*` | Scheduled jobs (protected by `CRON_SECRET`) |
| `app/dashboard/plan/page.tsx` | Coaching dashboard UI |
| `components/day-task-card.tsx` | Current day task display |
| `components/plan-progress.tsx` | Progress bar + day list |
| `components/day-lock.tsx` | Locked future day card |

---

## Components and Interfaces

### `services/ai-days.ts`

```typescript
export interface DayEstimate {
  days: number           // 14–90 inclusive
  confidence: 'fast' | 'moderate' | 'needs_work'
  summary: string        // ≤ 30 words
}

export async function estimateApprovalDays(
  aiReport: AIReport,
  finalScore: number
): Promise<DayEstimate>
```

**Logic:**
- Calls GPT-4o with a compact JSON summary of all 7 module scores + top issues
- Validates response: `days` ∈ [14, 90], `confidence` ∈ allowed set
- On failure or timeout (30 s): deterministic fallback
  - score ≥ 80 → 14 days, `fast`
  - score ≥ 65 → 21 days, `moderate`
  - score ≥ 50 → 30 days, `moderate`
  - score < 50 → 45 days, `needs_work`

### `services/ai-roadmap.ts`

```typescript
export async function generateRoadmap(
  scanId: string,
  totalDays: number,
  aiReport: AIReport
): Promise<RoadmapDay[]>
```

**Logic:**
- Calls GPT-4o with the full AI report and `totalDays`
- Validates: array length === `totalDays`, each item has 4–8 instruction steps
- Category distribution: no single category > 40% of days
- On failure or timeout (60 s): deterministic fallback built from `approval_workflow` data

### `services/ai-roadmap-adapt.ts`

```typescript
export async function adaptRoadmap(
  plan: UserPlan,
  newScanResult: AIReport,
  newScanId: string
): Promise<{ roadmap: RoadmapDay[]; newTotalDays: number }>
```

**Logic:**
- Preserves completed days unchanged
- Removes tasks already resolved in new scan
- Score improved ≥ 10 pts: reduce remaining days by up to 20% (min 3 remaining)
- Score decreased ≥ 5 pts: add up to 5 days
- Updates `lastCrawlDay` to `currentDay`

### `services/email.ts`

```typescript
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendDailyEmail(
  userId: string,
  planId: string,
  day: number,
  roadmapDay: RoadmapDay,
  userEmail: string
): Promise<EmailResult>
```

**Logic:**
- Uses Resend SDK, reads `RESEND_API_KEY` from env (throws at startup if missing)
- From: `coaching@adsensechecker.in` / "AdSense Checker AI"
- Responsive HTML template with brand colour `#7c3aed`
- Includes "Mark as Done" deep-link: `/dashboard/plan?day={day}&complete=1`

### API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/plans/estimate` | POST | Required | Crawl + Day Estimator → `{ days, confidence, summary, scanId }` |
| `/api/plans/create` | POST | Required | Verify payment + generateRoadmap + write Firestore |
| `/api/plans/[planId]` | GET | Required | Return plan with drip enforcement |
| `/api/plans/[planId]/complete-day` | PATCH | Required | Mark day complete |
| `/api/plans/[planId]/recrawl` | POST | Required | Trigger re-crawl + adaptRoadmap |
| `/api/razorpay/plan-order` | POST | Required | Create Razorpay order (days × 500 paise) |
| `/api/razorpay/plan-verify` | POST | Required | HMAC-SHA256 verify + activate plan |
| `/api/cron/daily-emails` | GET | CRON_SECRET | Send emails + advance currentDay |
| `/api/cron/recrawl-check` | GET | CRON_SECRET | Trigger re-crawls for eligible plans |

### UI Components

**`components/day-task-card.tsx`**
- Props: `day: RoadmapDay`, `dayNumber: number`, `onComplete: () => void`, `isCompleting: boolean`
- Displays: title, category badge, estimated minutes, instruction steps, whyItMatters, successCriteria
- "Mark Today as Done" button with optimistic UI update

**`components/plan-progress.tsx`**
- Props: `totalDays: number`, `completedDays: number[]`, `currentDay: number`
- Progress bar (completedDays.length / totalDays)
- Scrollable list of completed days with checkmarks
- Next re-crawl countdown

**`components/day-lock.tsx`**
- Props: `day: number`, `title: string`
- Greyed-out card with lock icon; title visible, instructions hidden

---

## Data Models

### `lib/firebase-types.ts` additions

```typescript
export interface RoadmapDay {
  day: number
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes: number
  instructions: string[]   // length 4–8
  whyItMatters: string
  successCriteria: string
}

export interface UserPlan {
  planId: string
  userId: string
  scanId: string
  url: string
  totalDays: number
  startDate: string          // ISO date
  currentDay: number         // 1-indexed; invariant: 1 ≤ currentDay ≤ totalDays
  status: 'active' | 'completed' | 'paused'
  pricePaid: number          // in paise
  razorpayOrderId: string
  razorpayPaymentId: string
  roadmap: RoadmapDay[]
  completedDays: number[]
  lastCrawlDay: number
  crawlHistory: Array<{ day: number; scanId: string }>
}

// UserProfile additions (optional fields)
// activePlanId?: string | null
// planStatus?: 'active' | 'completed' | 'paused' | null
```

**Firestore path:** `plans/{planId}`

**Runtime invariant (documented in code):**
`currentDay` must always satisfy `1 ≤ currentDay ≤ totalDays`. The cron job enforces this by setting `status = "completed"` instead of incrementing past `totalDays`.

### `lib/plans.ts` additions

```typescript
export const PRICES = {
  // existing...
  coaching_day: 500,   // ₹5/day in paise
} as const

export const COACHING_PLAN = {
  min_days: 14,
  max_days: 90,
  price_per_day_paise: 500,
} as const
```

### `vercel.json` cron additions

```json
{
  "crons": [
    { "path": "/api/cron/daily-emails",  "schedule": "30 2 * * *" },
    { "path": "/api/cron/recrawl-check", "schedule": "0 3 * * *"  }
  ]
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Day Estimate Range Invariant

*For any* valid `AIReport` input, `estimateApprovalDays()` SHALL return a `days` value in the closed interval [14, 90] — whether the GPT-4o call succeeds or falls back to the deterministic formula.

**Validates: Requirements 1.1, 1.4, 1.5**

---

### Property 2: Day Estimate Confidence Validity

*For any* valid `AIReport` input, `estimateApprovalDays()` SHALL return a `confidence` value that is exactly one of `"fast"`, `"moderate"`, or `"needs_work"`.

**Validates: Requirements 1.2, 14.4**

---

### Property 3: Roadmap Length Invariant

*For any* `totalDays` value in [14, 90] and any valid `AIReport`, `generateRoadmap()` SHALL return an array of exactly `totalDays` `RoadmapDay` objects — whether the GPT-4o call succeeds or falls back.

**Validates: Requirements 6.1, 6.4, 6.5**

---

### Property 4: Roadmap Instruction Count Invariant

*For any* `RoadmapDay` produced by `generateRoadmap()` or `adaptRoadmap()`, the `instructions` array SHALL have length between 4 and 8 inclusive.

**Validates: Requirements 6.2, 3.2**

---

### Property 5: Drip Enforcement — Future Days Hidden

*For any* `UserPlan` with `currentDay = N`, a `GET /api/plans/[planId]` response SHALL contain full `RoadmapDay` data only for days where `day ≤ N`; all days where `day > N` SHALL be replaced with `{ day, locked: true }`.

**Validates: Requirements 4.5**

---

### Property 6: UserPlan Serialisation Round-Trip

*For any* valid `UserPlan` object, serialising it to a plain JSON object and deserialising it back SHALL produce a value structurally equal to the original.

**Validates: Requirements 14.1**

---

### Property 7: RoadmapDay Serialisation Round-Trip

*For any* valid `RoadmapDay` object, serialising it to a plain JSON object and deserialising it back SHALL produce a value structurally equal to the original.

**Validates: Requirements 14.2**

---

### Property 8: Adaptation Preserves Completed Days

*For any* `UserPlan` with a non-empty `completedDays` list, calling `adaptRoadmap()` SHALL leave all completed days in the roadmap unchanged (same `day` number, same content) and SHALL NOT renumber them.

**Validates: Requirements 7.2**

---

### Property 9: Payment Amount Correctness

*For any* `days` value in [14, 90], the Razorpay order amount created by `POST /api/razorpay/plan-order` SHALL equal exactly `days × 500` paise.

**Validates: Requirements 5.1**

---

## Error Handling

### GPT-4o Failures

All three AI services (`ai-days`, `ai-roadmap`, `ai-roadmap-adapt`) follow the same pattern:
- Wrap GPT-4o call in `try/catch`
- Apply a 30 s timeout for `estimateApprovalDays`, 60 s for roadmap generation
- On any failure (network error, invalid JSON, out-of-range values): use deterministic fallback
- Log the error with `console.error` including the service name and error message
- Never surface raw OpenAI errors to the client

### Payment Failures

- Razorpay signature mismatch → HTTP 400, no Firestore writes, log to `payment_events` collection
- `POST /api/plans/create` called without prior payment verification → HTTP 400
- Razorpay order creation failure → HTTP 500 with generic message

### Cron Job Failures

- Per-user/per-plan errors are caught individually; the batch continues
- Failed email sends are logged with `userId` and `planId` for manual retry
- Failed re-crawls are logged with `planId`; `lastCrawlDay` is NOT updated so the next cron run will retry

### API Input Validation

- Malformed URL in `POST /api/plans/estimate` → HTTP 400 `{ error: "Invalid URL" }`
- `days` outside [14, 90] in `POST /api/razorpay/plan-order` → HTTP 400 `{ error: "Invalid plan duration" }`
- `day > currentDay` in `PATCH /api/plans/[planId]/complete-day` → HTTP 400 `{ error: "Day not yet unlocked" }`
- Accessing another user's plan → HTTP 403

### Environment Variable Guards

- `RESEND_API_KEY` missing → `services/email.ts` throws `ConfigurationError` at module load time
- `CRON_SECRET` missing → cron routes return HTTP 500 with a clear message in server logs
- `RAZORPAY_KEY_SECRET` missing → payment routes return HTTP 500

---

## Testing Strategy

### Unit Tests (example-based)

Focus on specific scenarios and edge cases:

- `estimateApprovalDays` fallback: score 80 → 14 days, score 64 → 21 days, score 49 → 45 days
- `generateRoadmap` fallback: returns exactly `totalDays` items when GPT-4o fails
- Drip enforcement: plan with `currentDay = 3` returns locked objects for days 4+
- `adaptRoadmap`: score improvement ≥ 10 reduces remaining days; score drop ≥ 5 adds days
- Payment amount: 30 days → 15000 paise, 14 days → 7000 paise, 90 days → 45000 paise
- Email template: contains day number, title, "Mark as Done" link

### Property-Based Tests

Using a property-based testing library (e.g. `fast-check` for TypeScript). Each test runs a minimum of 100 iterations.

**Tag format:** `Feature: adsense-coaching-subscription, Property {N}: {property_text}`

- **Property 1** — Generate random `AIReport`-shaped objects; assert `days ∈ [14, 90]`
- **Property 2** — Generate random `AIReport`-shaped objects; assert `confidence ∈ { fast, moderate, needs_work }`
- **Property 3** — Generate random `totalDays ∈ [14, 90]`; assert roadmap array length === `totalDays`
- **Property 4** — Generate random `RoadmapDay` arrays; assert each `instructions.length ∈ [4, 8]`
- **Property 5** — Generate random `UserPlan` with varying `currentDay`; assert drip enforcement
- **Property 6** — Generate random `UserPlan` objects; assert JSON round-trip equality
- **Property 7** — Generate random `RoadmapDay` objects; assert JSON round-trip equality
- **Property 8** — Generate random `UserPlan` with completed days; assert adaptation preserves them
- **Property 9** — Generate random `days ∈ [14, 90]`; assert order amount === `days × 500`

### Integration Tests

- Full plan lifecycle: estimate → order → verify → create → get (with drip) → complete-day
- Cron job: mock Firestore query returning 3 active plans; assert 3 emails sent, `currentDay` incremented
- Re-crawl cron: mock plans where `currentDay - lastCrawlDay >= 5`; assert `adaptRoadmap` called

### Smoke Tests

- `RESEND_API_KEY` present → `services/email.ts` loads without error
- `CRON_SECRET` present → cron routes return 401 on missing header, not 500
- Vercel cron config: `vercel.json` declares exactly 2 cron entries
