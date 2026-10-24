"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useBackNavigation } from "./BackButton";
import { useMaidSession } from "./MaidSessionContext";

const noopSubscribe = () => () => {};

// Floating bottom bar on the maid profile: guests are nudged to register,
// logged-in visitors without a package to buy one. Hidden once the contact
// details are unlocked, since there's nothing left to buy for this profile.
export function ProfileActionBar({
  maidRefNumber,
  maidName,
}: {
  maidRefNumber: string;
  maidName: string;
}) {
  const router = useRouter();
  const { goBack } = useBackNavigation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { state } = useMaidSession();
  // Auth lives in localStorage — wait until we're on the client so the server
  // HTML and the first client render agree.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!mounted) return null;
  if (isAuthenticated) {
    if (state.status !== "ready") return null;
    const { phone, whatsapp, botim, email } = state.data;
    if (phone || whatsapp || botim || email) return null;
  }

  function handlePrimary() {
    // Same hand-off as the locked contact card: pricing/login pick this up
    // to bring the visitor back to this maid after paying.
    sessionStorage.setItem(
      "pmm-pending-hire",
      JSON.stringify({ id: maidRefNumber, name: maidName }),
    );
    router.push(isAuthenticated ? "/pricing" : "/register?returnTo=/pricing");
  }

  return (
    // Full-width flex wrapper does the centring (no translate tricks), so the
    // pill sits in the middle of the screen at every width. The wrapper lets
    // clicks through; only the pill itself is clickable.
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white rounded-full p-1.5 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.12)]">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#F5F5F5] px-4 sm:px-6 py-3 text-sm font-semibold text-dark hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          type="button"
          onClick={handlePrimary}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 sm:px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors cursor-pointer"
        >
          {isAuthenticated ? "Buy a Package" : "Register Now"}
        </button>
      </div>
    </div>
  );
}
