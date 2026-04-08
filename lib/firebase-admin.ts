import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth }      from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Use a named app to avoid conflicts with multiple initializations during hot reload
const APP_NAME = 'adsenseai-admin'

function initAdmin() {
  // Return existing app if already initialized with this name
  const existing = getApps().find(a => a.name === APP_NAME)
  if (existing) return { app: existing, ok: true }

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  // Handle both escaped (\n) and literal newlines in the private key
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\n/g, '\n')
    ?.replace(/^"|"$/g, '')  // strip surrounding quotes if present

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin] Missing env vars — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
    const app = initializeApp({ projectId: projectId ?? 'missing' }, APP_NAME)
    return { app, ok: false }
  }

  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('[Firebase Admin] FIREBASE_PRIVATE_KEY does not look like a valid PEM key')
    const app = initializeApp({ projectId }, APP_NAME)
    return { app, ok: false }
  }

  try {
    const app = initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }) },
      APP_NAME
    )
    console.log(`[Firebase Admin] ✓ Initialized — project: ${projectId}, email: ${clientEmail.split('@')[0]}@...`)
    return { app, ok: true }
  } catch (err) {
    console.error('[Firebase Admin] Init failed:', (err as Error).message)
    const app = initializeApp({ projectId }, APP_NAME + '-err')
    return { app, ok: false }
  }
}

const { app: adminApp, ok: _ok } = initAdmin()

export { adminApp }
export const adminAuth = getAuth(adminApp)
export const adminDb   = getFirestore(adminApp)

export function isAdminInitialized(): boolean {
  return _ok
}
