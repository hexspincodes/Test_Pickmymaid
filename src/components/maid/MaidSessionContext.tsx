"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { getMaid } from "@/lib/api";

export interface MaidSessionData {
  isInWishlist: boolean;
  phone?: string;
  whatsapp?: string;
  botim?: string;
  email?: string;
}

type MaidSessionState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: MaidSessionData };

type MaidSessionAction =
  | { type: "start" }
  | { type: "error" }
  | { type: "success"; data: MaidSessionData };

function sessionReducer(
  _state: MaidSessionState,
  action: MaidSessionAction,
): MaidSessionState {
  switch (action.type) {
    case "start":
      return { status: "loading" };
    case "error":
      return { status: "error" };
    case "success":
      return { status: "ready", data: action.data };
  }
}

const MaidSessionContext = createContext<{
  state: MaidSessionState;
  retry: () => void;
} | null>(null);

/**
 * The maid detail page is server-rendered without the visitor's session
 * cookie, so the initial `ApiMaid` it receives can never carry
 * user-specific fields (wishlist state, unlocked contact details). This
 * provider makes the one authenticated client-side request needed to fill
 * those in, and shares the result with every descendant that needs it
 * (WishlistButton, ContactSection) instead of each fetching it separately.
 */
export function MaidSessionProvider({
  maidId,
  children,
}: {
  maidId: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(sessionReducer, { status: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });

    getMaid(maidId)
      .then((res) => {
        if (cancelled) return;
        const job = res.data.jobApplication;
        dispatch({
          type: "success",
          data: {
            isInWishlist: job.is_in_wishlist ?? false,
            phone: job.phone || job.uae_no,
            whatsapp: job.whatsapp || job.whatsapp_no,
            botim: job.botim || job.botim_number,
            email: job.email,
          },
        });
      })
      .catch(() => {
        if (cancelled) return;
        dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [maidId, retryKey]);

  return (
    <MaidSessionContext.Provider
      value={{ state, retry: () => setRetryKey((k) => k + 1) }}
    >
      {children}
    </MaidSessionContext.Provider>
  );
}

export function useMaidSession() {
  const ctx = useContext(MaidSessionContext);
  if (!ctx) {
    throw new Error("useMaidSession must be used within a MaidSessionProvider");
  }
  return ctx;
}
