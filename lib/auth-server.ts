import { adminAuth, adminDb, isAdminInitialized } from "./firebase-admin"
import type { UserProfile, ScanRecord } from "./firebase-types"
import { FieldValue } from "firebase-admin/firestore"
import { PLANS } from './plans'

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

export async function verifyToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null
  if (!isAdminInitialized()) {
    console.error("[auth-server] Firebase Admin not initialized — check FIREBASE_* env vars")
    return null
  }
  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return decoded
  } catch (err) {
    const msg = (err as Error).message ?? String(err)
    console.error("[auth-server] verifyIdToken failed:", msg)
    return null
  }
}

export async function getAuthenticatedProfile(authHeader: string | null): Promise<UserProfile | null> {
  try {
    const decoded = await verifyToken(authHeader)
    if (!decoded) return null
    const snap = await adminDb.collection("users").doc(decoded.uid).get()
    if (!snap.exists) {
      const now = new Date().toISOString()
      const profile: UserProfile = {
        uid: decoded.uid, email: decoded.email ?? "", fullName: decoded.name ?? null,
        plan: isAdmin(decoded.email) ? "pro" : "free", razorpayCustomerId: null, razorpaySubscriptionId: null,
        proExpiresAt: null,
        scansThisMonth: 0, scansMonthKey: now.slice(0, 7), totalScans: 0,
        thumbnailCreditsThisMonth: 0, thumbnailMonthKey: now.slice(0, 7),
        createdAt: now, updatedAt: now,
      }
      await adminDb.collection("users").doc(decoded.uid).set(profile)
      return profile
    }
    const data = snap.data() as UserProfile
    if (isAdmin(data.email)) {
      data.plan = "pro"
    }
    return data
  } catch (err) {
    console.error("[auth-server] getAuthenticatedProfile error:", (err as Error).message)
    return null
  }
}

export async function incrementScanCount(userId: string): Promise<void> {
  try {
    const monthKey = new Date().toISOString().slice(0, 7)
    const ref = adminDb.collection("users").doc(userId)
    const snap = await ref.get()
    const profile = snap.data() as UserProfile | undefined
    if (!profile) return
    await ref.update({
      scansThisMonth: profile.scansMonthKey !== monthKey ? 1 : FieldValue.increment(1),
      scansMonthKey: monthKey,
      totalScans: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    })
  } catch (err) { console.error("[auth-server] incrementScanCount:", (err as Error).message) }
}

export async function consumeThumbnailCredit(userId: string): Promise<boolean> {
  try {
    const monthKey = new Date().toISOString().slice(0, 7)
    const ref = adminDb.collection("users").doc(userId)
    const snap = await ref.get()
    const profile = snap.data() as UserProfile | undefined
    if (!profile) return false

    if (profile.plan !== 'pro') return false
    if (profile.thumbnailMonthKey !== monthKey) {
      await ref.update({
        thumbnailCreditsThisMonth: PLANS.pro.thumbnail_credits - 1,
        thumbnailMonthKey: monthKey,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const remaining = profile.thumbnailCreditsThisMonth
      if (remaining <= 0) return false
      await ref.update({
        thumbnailCreditsThisMonth: FieldValue.increment(-1),
        updatedAt: new Date().toISOString(),
      })
    }
    return true
  } catch (err) { console.error("[auth-server] consumeThumbnailCredit:", (err as Error).message); return false }
}

export async function getThumbnailCredits(profile: UserProfile): Promise<{ remaining: number; limit: number }> {
  const monthKey = new Date().toISOString().slice(0, 7)
  const limit = PLANS[profile.plan]?.thumbnail_credits ?? 0
  if (profile.plan !== 'pro') return { remaining: 0, limit }
  if (profile.thumbnailMonthKey !== monthKey) return { remaining: limit, limit }
  return { remaining: profile.thumbnailCreditsThisMonth, limit }
}

/** Recursively remove undefined values — Firestore rejects them */
function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T
  }
  return obj
}

export async function saveScan(userId: string, data: Omit<ScanRecord, "id" | "createdAt">): Promise<string | null> {
  try {
    const ref = adminDb.collection("scans").doc()
    const clean = stripUndefined({ ...data, id: ref.id, userId, createdAt: new Date().toISOString() })
    await ref.set(clean)
    return ref.id
  } catch (err) { console.error("[DB] saveScan:", (err as Error).message); return null }
}

export async function getUserScans(userId: string, limit = 20, offset = 0): Promise<ScanRecord[]> {
  try {
    const snap = await adminDb.collection("scans")
      .where("userId", "==", userId).orderBy("createdAt", "desc")
      .limit(limit).offset(offset).get()
    return snap.docs.map(d => d.data() as ScanRecord)
  } catch (err) { console.error("[DB] getUserScans:", (err as Error).message); return [] }
}

export async function getScanById(scanId: string, userId: string): Promise<ScanRecord | null> {
  try {
    const snap = await adminDb.collection("scans").doc(scanId).get()
    if (!snap.exists) return null
    const data = snap.data() as ScanRecord
    return data.userId !== userId ? null : data
  } catch (err) { console.error("[DB] getScanById:", (err as Error).message); return null }
}

export async function unlockScanAiReport(scanId: string, userId: string, aiReport: Record<string, unknown>): Promise<void> {
  try {
    await adminDb.collection("scans").doc(scanId).update({ aiReport, isAiUnlocked: true })
  } catch (err) { console.error("[DB] unlockScanAiReport:", (err as Error).message) }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "fullName" | "plan" | "razorpayCustomerId" | "razorpaySubscriptionId" | "proExpiresAt">>
): Promise<void> {
  try {
    await adminDb.collection("users").doc(userId).update({ ...updates, updatedAt: new Date().toISOString() })
  } catch (err) { console.error("[DB] updateUserProfile:", (err as Error).message) }
}

function serializeTimestamp(val: any): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'string') return val
  if (typeof val.toDate === 'function') return val.toDate().toISOString()
  if (val._seconds) return new Date(val._seconds * 1000).toISOString()
  if (val.seconds) return new Date(val.seconds * 1000).toISOString()
  return new Date().toISOString()
}

export async function adminGetUsers(limit = 50): Promise<UserProfile[]> {
  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(limit).get()
    return snap.docs.map(d => {
      const data = d.data()
      if (data.createdAt) data.createdAt = serializeTimestamp(data.createdAt)
      if (data.updatedAt) data.updatedAt = serializeTimestamp(data.updatedAt)
      return data as UserProfile
    })
  } catch (err) { console.error("[DB] adminGetUsers:", (err as Error).message); return [] }
}

export async function adminSetPlan(userId: string, plan: "free" | "pro"): Promise<void> {
  try {
    await adminDb.collection("users").doc(userId).update({ plan, updatedAt: new Date().toISOString() })
  } catch (err) { console.error("[DB] adminSetPlan:", (err as Error).message) }
}

export async function adminDeleteUser(userId: string): Promise<void> {
  try {
    // Delete from Firestore
    await adminDb.collection("users").doc(userId).delete()
    // Delete all scans
    const scans = await adminDb.collection("scans").where("userId", "==", userId).get()
    const batch = adminDb.batch()
    scans.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    // Delete from Firebase Auth
    await adminAuth.deleteUser(userId)
  } catch (err) { console.error("[DB] adminDeleteUser:", (err as Error).message) }
}

export async function adminGetPayments(limit = 50): Promise<Record<string, unknown>[]> {
  try {
    const snap = await adminDb.collection("payments").orderBy("createdAt", "desc").limit(limit).get()
    const realPayments = snap.docs.map(d => {
      const data = d.data()
      if (data.createdAt) data.createdAt = serializeTimestamp(data.createdAt)
      return { id: d.id, ...data }
    })

    // Fallback: derive payments from users with old pro plan
    const users = await adminGetUsers(100)
    const derivedPayments = users
      .filter(u => u.plan === 'pro' || u.razorpaySubscriptionId)
      .map(u => ({
        id: u.uid,
        userId: u.uid,
        email: u.email,
        name: u.fullName,
        plan: u.plan,
        amount: 19900,  // 199 rupees in paise
        currency: 'INR',
        status: 'paid',
        razorpaySubscriptionId: u.razorpaySubscriptionId,
        createdAt: u.updatedAt ?? u.createdAt,
      }))

    // Combine and sort descending by date
    const allPayments = [...realPayments, ...derivedPayments].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt as string).getTime()
      const dateB = new Date(b.createdAt as string).getTime()
      return dateB - dateA
    })

    return allPayments.slice(0, limit)
  } catch (err) { console.error("[DB] adminGetPayments:", (err as Error).message); return [] }
}