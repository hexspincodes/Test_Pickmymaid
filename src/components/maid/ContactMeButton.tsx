"use client";

import { useRouter } from "next/navigation";
import { useAuthStore, useSubscription } from "@/store/auth";
import { SplitButton } from "@/components/ui/SplitButton";
import { trackCategoryUsage } from "@/lib/api";
import type { MultiValue } from "@/lib/multiValue";

export function ContactMeButton({
  maidRefNumber,
  maidName,
  maidService,
  maidId,
}: {
  maidRefNumber: string;
  maidName: string;
  maidService: MultiValue;
  maidId: string;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSubscribed } = useSubscription();

  function handleClick() {
    trackCategoryUsage(maidService, maidId, user?.id);
    if (!isAuthenticated) {
      sessionStorage.setItem(
        "pmm-pending-hire",
        JSON.stringify({ id: maidRefNumber, name: maidName })
      );
      router.push("/register?returnTo=/pricing");
      return;
    }
    if (!isSubscribed) {
      sessionStorage.setItem(
        "pmm-pending-hire",
        JSON.stringify({ id: maidRefNumber, name: maidName })
      );
      router.push("/pricing");
      return;
    }
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "instant" });
  }

  return <SplitButton label="Contact Me" onClick={handleClick} />;
}
