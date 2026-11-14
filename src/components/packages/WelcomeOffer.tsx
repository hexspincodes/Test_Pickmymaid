"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateCoupon, ApiError, NetworkError, type AppliedCoupon } from "@/lib/api";
import { WELCOME_OFFER } from "@/config/plans.config";
import { useSubscription } from "@/store/auth";

const subscribeNever = () => () => {};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure contexts have no async clipboard.
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  }
}

export function WelcomeOffer({
  applied,
  onApply,
  className = "",
}: {
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon) => void;
  className?: string;
}) {
  const { isSubscribed } = useSubscription();
  // The subscription comes from localStorage, so decide after mount to keep
  // the server and first client render identical.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  if (!mounted || isSubscribed || applied) return null;

  async function handleCopy() {
    if (await copyText(WELCOME_OFFER.code)) {
      setCopied(true);
      toast.success(`Code ${WELCOME_OFFER.code} copied.`);
    } else {
      toast.error("Could not copy the code. Please type it in.");
    }
  }

  async function handleRedeem() {
    if (redeeming) return;
    setRedeeming(true);
    try {
      const res = await validateCoupon(WELCOME_OFFER.code);
      onApply(res.data);
      toast.success(`${res.data.discount_percent}% off applied to every package.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast("Please log in to redeem your welcome offer.");
      } else {
        toast.error(
          err instanceof ApiError || err instanceof NetworkError
            ? err.message
            : "Could not redeem the offer. Please try again."
        );
      }
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="w-full max-w-xl flex flex-col sm:flex-row sm:items-center gap-4 bg-primary-50 border border-dashed border-primary/40 rounded-2xl p-4 sm:pl-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-dark">
              Welcome offer: {WELCOME_OFFER.discountPercent}% off your first package
            </p>
            <p className="text-xs text-muted mt-0.5 tracking-[0.25px]">
              Valid on your first payment only.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy code ${WELCOME_OFFER.code}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-primary/30 rounded-xl px-3 py-2 text-sm font-bold text-primary tracking-[1px] hover:border-primary transition-colors"
          >
            {WELCOME_OFFER.code}
            {copied ? (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Copy className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeeming}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {redeeming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
}
