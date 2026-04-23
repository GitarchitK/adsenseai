# Adsense Checkher AI

Next.js (App Router) app that crawls a website, computes AdSense readiness scores, and (optionally) generates an AI readiness report. Authentication + storage are handled via Firebase (Firestore). Payments/unlock are handled via Razorpay.

## Architecture

- **UI**: `app/**/page.tsx`
- **API routes**: `app/api/**/route.ts`
- **Crawler + AI services**: `services/`
- **Firebase + auth + plans + payments helpers**: `lib/`
- **Database**: Firestore (`users`, `scans`, `payments`, `payment_events`)

## Local setup

1) Install deps

```bash
npm install
```

2) Create `.env.local`

- Copy `.env.local.example` → `.env.local`
- Fill required values:
  - **Firebase client (public)**: `NEXT_PUBLIC_FIREBASE_*`
  - **Firebase Admin (secret)**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - **AI (optional)**: `OPENAI_API_KEY` (required for AI report generation)
  - **Razorpay (required for payments/unlock)**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - **Rate limiting (optional)**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

3) Run dev server

```bash
npm run dev
```

## Core workflows

### Scan a website

- UI calls `POST /api/crawl` with `Authorization: Bearer <Firebase ID token>`
- Server:
  - rate limits (if Upstash configured)
  - checks monthly scan limits by plan (free vs pro)
  - crawls the website (`services/crawler.ts`)
  - computes scores (`lib/scores.ts`)
  - generates AI report if `OPENAI_API_KEY` exists (`services/ai-report.ts`)
  - saves scan to Firestore (`scans`)

### Unlock full AI report (₹19)

- UI creates an order via `POST /api/razorpay/unlock` action `create_order`
- On payment success, UI calls `POST /api/razorpay/unlock` action `verify`
- Server verifies:
  - signature + Razorpay order/payment details (amount/currency/notes/status)
  - idempotency (prevents double-processing)
  - updates the scan as unlocked + stores the full AI report

### Pro plan

- Pro users have higher scan limits and can auto-unlock full reports.
- Razorpay webhooks can update `users/{uid}.plan` (see `app/api/razorpay/webhook/route.ts`).

## Deployment notes

- This repo contains Firebase hosting configuration in `firebase.json` (frameworks backend).
- Do **not** ship debug endpoints publicly. `/api/debug` is automatically disabled outside development.

## Troubleshooting

- **401 on API routes**: verify Firebase Admin env vars; server requires a valid Bearer token.
- **AI report missing**: set `OPENAI_API_KEY`.
- **Unlock verification fails**: confirm Razorpay keys and that the order notes match the user + scan.

