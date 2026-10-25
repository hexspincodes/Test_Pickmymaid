'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'pmm-auth' }
  )
)

// Google/Apple sign-in leaves the site and comes back with only an httpOnly
// cookie, so the store can't know about it. This note, set just before the
// redirect, tells the Navbar to verify the session even though the store
// says logged out. It expires so an abandoned sign-in doesn't linger.
const OAUTH_PENDING_KEY = 'pmm-oauth-pending'
const OAUTH_PENDING_TTL_MS = 10 * 60 * 1000

export function markOAuthPending() {
  try {
    localStorage.setItem(OAUTH_PENDING_KEY, String(Date.now()))
  } catch {
    // Storage blocked — the Navbar then only verifies known sessions.
  }
}

// Whether the session cookie may be valid: a remembered login or a recent
// Google/Apple sign-in. Skipping the check otherwise avoids a 401 (logged in
// the console) on every page for visitors who never logged in.
export function mayHaveSession(): boolean {
  if (useAuthStore.getState().isAuthenticated) return true
  try {
    const startedAt = Number(localStorage.getItem(OAUTH_PENDING_KEY))
    return !!startedAt && Date.now() - startedAt < OAUTH_PENDING_TTL_MS
  } catch {
    return false
  }
}

export function clearOAuthPending() {
  try {
    localStorage.removeItem(OAUTH_PENDING_KEY)
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

export function useSubscription() {
  const user = useAuthStore((s) => s.user)
  return {
    isSubscribed: user?.isSubscribed ?? false,
    tier: user?.subscriptionTier ?? null,
  }
}
