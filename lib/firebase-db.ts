/**
 * Client-side Firestore helpers.
 * Only used for operations that run in the browser (e.g. creating a profile on signup).
 * All server-side DB work goes through lib/auth-server.ts (Firebase Admin).
 */
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { UserProfile } from './firebase-types'

/**
 * Creates a user profile document if it doesn't already exist.
 * Called after signup / Google sign-in.
 */
export async function ensureUserProfile(
  uid: string,
  email: string,
  fullName: string | null
): Promise<void> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  const now = new Date().toISOString()
  const profile: UserProfile = {
    uid,
    email,
    fullName,
    plan: 'free',
    razorpayCustomerId: null,
    razorpaySubscriptionId: null,
    scansThisMonth: 0,
    scansMonthKey: now.slice(0, 7),
    totalScans: 0,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(ref, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}
