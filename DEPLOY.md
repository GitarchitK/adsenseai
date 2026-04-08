# Deployment Guide

## Option A — Vercel (Recommended, easiest)

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js, zero config needed

**Environment variables to add in Vercel:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY          ← paste the full key including -----BEGIN/END-----
OPENAI_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL            ← set to your Vercel URL e.g. https://yourapp.vercel.app
ADMIN_EMAILS
```

After deploying:
- Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
- Add your Vercel domain to Firebase Console → Authentication → Authorized domains

---

## Option B — Firebase App Hosting

Firebase App Hosting supports Next.js SSR natively.

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Setup secrets (run once)
```bash
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_PROJECT_ID
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_APP_ID
firebase apphosting:secrets:set FIREBASE_PROJECT_ID
firebase apphosting:secrets:set FIREBASE_CLIENT_EMAIL
firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY
firebase apphosting:secrets:set OPENAI_API_KEY
firebase apphosting:secrets:set RAZORPAY_KEY_ID
firebase apphosting:secrets:set RAZORPAY_KEY_SECRET
firebase apphosting:secrets:set RAZORPAY_WEBHOOK_SECRET
firebase apphosting:secrets:set NEXT_PUBLIC_APP_URL
firebase apphosting:secrets:set ADMIN_EMAILS
```

### Deploy
```bash
firebase apphosting:backends:create --project archit-dbabc
firebase deploy --only hosting
```

Or connect to GitHub for automatic deploys:
```bash
firebase apphosting:backends:create --project archit-dbabc --github-repo YOUR_GITHUB_REPO
```

---

## After deploying (both options)

1. **Update Firebase Authorized Domains:**
   Firebase Console → archit-dbabc → Authentication → Settings → Authorized domains → Add your domain

2. **Update Razorpay webhook URL:**
   Razorpay Dashboard → Settings → Webhooks → Add: `https://yourdomain.com/api/razorpay/webhook`

3. **Delete the debug route:**
   ```bash
   rm app/api/debug/route.ts
   ```

4. **Set NEXT_PUBLIC_APP_URL** to your production URL in environment variables
