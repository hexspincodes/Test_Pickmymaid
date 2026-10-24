"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface NavReturn {
  href: string;
  scrollY: number;
  label: string;
}

const noopSubscribe = () => () => {};

// Returns to the list the visitor came from (restoring its scroll position),
// falling back to browser history when they landed here directly.
export function useBackNavigation() {
  const router = useRouter();
  // Read on the client only (null on the server) so hydration stays consistent.
  const raw = useSyncExternalStore(
    noopSubscribe,
    () => sessionStorage.getItem("pmm-nav-return"),
    () => null,
  );
  const navReturn = useMemo<NavReturn | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null; // malformed entry — ignore
    }
  }, [raw]);

  function goBack() {
    if (!navReturn) {
      router.back();
      return;
    }
    sessionStorage.setItem(`pmm-scroll|${navReturn.href}`, String(navReturn.scrollY));
    router.push(navReturn.href, { scroll: false });
  }

  return { goBack, label: navReturn?.label };
}

export function BackButton() {
  const { goBack, label } = useBackNavigation();

  return (
    <button
      onClick={goBack}
      className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white shadow-sm rounded-2xl px-4 py-2.5 text-sm font-medium text-dark hover:bg-white transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      {label ?? "Back to Results"}
    </button>
  );
}
