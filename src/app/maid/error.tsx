"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

// Shown when a maid profile couldn't be loaded (API down, timeout, flaky
// mobile data) — the profile may well exist, so offer a retry rather than
// treating it as missing.
export default function MaidError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center py-26 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-10 text-center">
        <h1 className="text-2xl font-bold text-dark tracking-[-0.5px]">
          We couldn&apos;t load this profile
        </h1>
        <p className="mt-2 text-sm text-muted leading-6">
          This is usually a connection hiccup. Please check your signal and try again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/search"
            className="inline-flex px-7 py-3 rounded-full bg-dark text-white text-sm font-semibold hover:bg-primary transition-colors"
          >
            Browse maids
          </Link>
        </div>
      </div>
    </div>
  );
}
