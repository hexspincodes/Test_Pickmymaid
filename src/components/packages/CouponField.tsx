"use client";

import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { validateCoupon, ApiError, NetworkError, type AppliedCoupon } from "@/lib/api";

export function CouponField({
  applied,
  onChange,
  className = "",
}: {
  applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void;
  className?: string;
}) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await validateCoupon(trimmed);
      onChange(res.data);
      setCode("");
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof NetworkError
          ? err.message
          : "Could not check this code. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  if (applied) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="inline-flex items-center gap-3 bg-primary-50 border border-primary/20 rounded-2xl pl-4 pr-2 py-2">
          <Tag className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
          <span className="text-sm text-dark">
            <span className="font-semibold">{applied.code}</span> applied —{" "}
            <span className="font-semibold text-primary">
              {applied.discount_percent}% off
            </span>{" "}
            every package
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove coupon"
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted hover:bg-white hover:text-dark transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleApply}
      className={`flex flex-col items-center gap-2 ${className}`}
    >
      <div className="flex w-full max-w-sm items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1.5 focus-within:border-primary transition-colors">
        <Tag className="w-4 h-4 text-muted shrink-0 ml-2.5" strokeWidth={2} />
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Have a coupon code?"
          aria-label="Coupon code"
          maxLength={30}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent text-sm text-dark placeholder:text-muted outline-none py-2"
        />
        <button
          type="submit"
          disabled={!code.trim() || checking}
          className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Apply
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
