"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { validateCoupon, ApiError, type AppliedCoupon } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

// Buying needs a login, and logging in or registering leaves the packages
// page. Remembering the applied code for the tab means the customer comes
// back to the same discount instead of silently paying full price.
const STORAGE_KEY = "pmm-applied-coupon";

function readStoredCode(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredCode(code: string | null) {
  try {
    if (code) sessionStorage.setItem(STORAGE_KEY, code);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the coupon still applies until the page is left.
  }
}

export function useAppliedCoupon() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [coupon, setCouponState] = useState<AppliedCoupon | null>(null);

  const setCoupon = useCallback((next: AppliedCoupon | null) => {
    setCouponState(next);
    writeStoredCode(next?.code ?? null);
  }, []);

  // Restore the remembered code and check it again, now with the login if
  // there is one: the new-customer and once-per-customer rules can only be
  // checked for a known account, so a code that passed while logged out
  // may not apply to this customer.
  useEffect(() => {
    const code = readStoredCode();
    if (!code) return;
    let cancelled = false;
    validateCoupon(code)
      .then((res) => {
        if (!cancelled) setCouponState(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) {
          writeStoredCode(null);
          setCouponState(null);
          toast.error(err.message);
        }
        // Network failure: keep the code stored so the next visit retries.
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return [coupon, setCoupon] as const;
}
