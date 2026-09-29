"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { getPaymentDetails } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SplitButton } from "@/components/ui/SplitButton";
import { PLANS } from "@/config/plans.config";

const TIER_MAP = ["basic", "standard", "premium", "starter"] as const;

const PLAN_INFO: Record<string, { name: string; duration: string; price: string }> =
  Object.fromEntries(
    PLANS.map((plan) => [plan.id, { name: plan.name, duration: plan.duration, price: `AED ${plan.price}` }])
  );

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const typeIndex = parseInt(searchParams.get("type") ?? "-1", 10);
  const expiryParam = searchParams.get("expiry") ?? "";
  const paidParam = searchParams.get("paid") ?? "";

  const tierKey = typeIndex >= 0 && typeIndex <= 3 ? TIER_MAP[typeIndex] : null;
  const planInfo = tierKey ? PLAN_INFO[tierKey] : null;

  useEffect(() => {
    getPaymentDetails()
      .then((res) => {
        // Read the store fresh here instead of a `user` selector captured at
        // mount — Zustand's persisted `user` may still be null on first
        // render (localStorage rehydration hasn't landed yet), and this
        // effect never re-runs to pick up the later value.
        const currentUser = useAuthStore.getState().user;
        if (res.data?.user?.status === 1 && currentUser) {
          const tier = TIER_MAP[res.data.user.type];
          setAuth({ ...currentUser, isSubscribed: true, subscriptionTier: tier });
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 lg:py-20 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Main success card */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: "#F0FBF0" }}>
              <CheckCircle className="w-10 h-10" style={{ color: "#6DA544" }} strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark mb-2">Payment Successful!</h1>
            <p className="text-sm text-muted leading-relaxed">
              Your subscription is now active.{planInfo ? ` Welcome to ${planInfo.name}!` : " Welcome to Pickmymaid!"}
            </p>
          </div>

          {/* Plan details */}
          {planInfo && (
            <div className="bg-[#F5F5F5] rounded-2xl p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted tracking-[0.5px]">Plan</span>
                <span className="text-sm font-semibold text-dark">{planInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted tracking-[0.5px]">Duration</span>
                <span className="text-sm font-semibold text-dark">{planInfo.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted tracking-[0.5px]">Amount Paid</span>
                <span className="text-sm font-semibold text-primary">{planInfo.price}</span>
              </div>
              {paidParam && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted tracking-[0.5px]">Payment Date</span>
                  <span className="text-sm font-medium text-dark">{formatDate(paidParam)}</span>
                </div>
              )}
              {expiryParam && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                  <span className="text-xs font-medium text-muted tracking-[0.5px]">Valid Until</span>
                  <span className="text-sm font-semibold text-dark">{formatDate(expiryParam)}</span>
                </div>
              )}
            </div>
          )}

          {/* Invoice notice */}
          <div className="flex items-start gap-3 bg-primary-50 rounded-2xl p-4 mb-6">
            <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-dark leading-relaxed">
              A payment invoice has been sent to your registered email address. Please check your inbox (and spam folder).
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <SplitButton label="Start Browsing Maids" href="/search" className="w-full" />
            <Link
              href="/"
              className="text-center text-sm font-medium text-muted hover:text-dark transition-colors py-2"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-3xl p-6 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-semibold text-dark mb-5">What&apos;s next?</h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Browse maids & nannies",
                desc: "View full profiles with contact details unlocked",
              },
              {
                step: "2",
                title: "Shortlist your favourites",
                desc: "Save profiles to your personal favourites list",
              },
              {
                step: "3",
                title: "Contact directly",
                desc: "Reach out via phone, WhatsApp, or email",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/search"
            className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Browse available profiles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
