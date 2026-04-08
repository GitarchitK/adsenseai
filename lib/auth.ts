'use client'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase'
import { ensureUserProfile } from './firebase-db'

const googleProvider = new GoogleAuthProvider()

/** Sets a simple session cookie so middleware can detect auth state */
function setSessionCookie() {
  // 7-day expiry, SameSite=Lax — not httpOnly because we set it client-side
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `firebase-session=1; path=/; expires=${expires}; SameSite=Lax`
}

function clearSessionCookie() {
  document.cookie = 'firebase-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setSessionCookie()
    return { data: cred, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await ensureUserProfile(cred.user.uid, email, name)
    setSessionCookie()
    return { data: cred, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function signInWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    await ensureUserProfile(
      cred.user.uid,
      cred.user.email ?? '',
      cred.user.displayName ?? null
    )
    setSessionCookie()
    return { data: cred, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    clearSessionCookie()
    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
