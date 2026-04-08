import { adminAuth, adminDb, isAdminInitialized } from "./firebase-admin"
import type { UserProfile, ScanRecord } from "./firebase-types"
import { FieldValue } from "firebase-admin/firestore"

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
        plan: "free", razorpayCustomerId: null, razorpaySubscriptionId: null,
        scansThisMonth: 0, scansMonthKey: now.slice(0, 7), totalScans: 0,
        createdAt: now, updatedAt: now,
      }
      await adminDb.collection("users").doc(decoded.uid).set(profile)
      return profile
    }
    return snap.data() as UserProfile
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

export async function saveScan(userId: string, data: Omit<ScanRecord, "id" | "createdAt">): Promise<string | null> {
  try {
    const ref = adminDb.collection("scans").doc()
    await ref.set({ ...data, id: ref.id, userId, createdAt: new Date().toISOString() })
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
  updates: Partial<Pick<UserProfile, "fullName" | "plan" | "razorpayCustomerId" | "razorpaySubscriptionId">>
): Promise<void> {
  try {
    await adminDb.collection("users").doc(userId).update({ ...updates, updatedAt: new Date().toISOString() })
  } catch (err) { console.error("[DB] updateUserProfile:", (err as Error).message) }
}

export async function adminGetUsers(limit = 50): Promise<UserProfile[]> {
  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(limit).get()
    return snap.docs.map(d => d.data() as UserProfile)
  } catch (err) { console.error("[DB] adminGetUsers:", (err as Error).message); return [] }
}

export async function adminSetPlan(userId: string, plan: "free" | "pro"): Promise<void> {
  try {
    await adminDb.collection("users").doc(userId).update({ plan, updatedAt: new Date().toISOString() })
  } catch (err) { console.error("[DB] adminSetPlan:", (err as Error).message) }
}