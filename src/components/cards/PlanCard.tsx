"use client";

import { Check, Loader2, X } from "lucide-react";
import type { Plan } from "@/config/plans.config";

export function PlanCard({
  plan,
  isActivePlan,
  loadingType,
  onGetStarted,
  ctaLabel = "Get Started",
}: {
  plan: Plan;
  isActivePlan: boolean;
  loadingType: 0 | 1 | 2 | 3 | null;
  onGetStarted: (type: 0 | 1 | 2 | 3) => void;
  ctaLabel?: string;
}) {
  return (
    <div
      className={`group flex flex-col gap-6 rounded-3xl p-7 lg:p-8 bg-white transition-all duration-300 relative ${
        isActivePlan
          ? "ring-2 ring-[#6DA544] shadow-[0px_24px_48px_0px_rgba(109,165,68,0.12)]"
          : "border-2 border-gray-100 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)] hover:border-primary hover:shadow-[0px_19px_40px_0px_rgba(255,116,66,0.15)] hover:-translate-y-3"
      }`}
    >
      {isActivePlan ? (
        <span className="absolute top-7 right-7 lg:top-8 lg:right-8 text-[10px] font-bold text-[#6DA544] tracking-[0.75px] uppercase bg-[#6DA544]/10 border border-[#6DA544]/30 rounded-full px-3 py-1">
          Active Plan
        </span>
      ) : plan.isBestChoice ? (
        <span className="absolute top-7 right-7 lg:top-8 lg:right-8 text-[10px] font-bold text-primary tracking-[0.75px] uppercase bg-primary-50 border border-primary/30 rounded-full px-3 py-1">
          Best Choice
        </span>
      ) : null}

      <div className="flex flex-col gap-4">
        <p className="text-base font-semibold text-dark">{plan.name}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            AED {plan.price}
          </span>
          <span className="text-sm text-muted mb-1.5">/ {plan.duration}</span>
        </div>
        <p className="text-sm text-muted leading-relaxed tracking-[0.25px]">
          {plan.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => !isActivePlan && onGetStarted(plan.type)}
        disabled={isActivePlan || loadingType !== null}
        className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
          isActivePlan
            ? "bg-[#6DA544]/10 text-[#6DA544] border border-[#6DA544]/30"
            : "bg-primary text-white hover:bg-primary-600 disabled:opacity-70"
        }`}
      >
        {isActivePlan ? (
          "Current Plan"
        ) : loadingType === plan.type ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          ctaLabel
        )}
      </button>

      <div className="h-px bg-gray-100" />

      <ul className="flex flex-col gap-3">
        {plan.benefits.map((benefit) => (
          <li key={benefit.text} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                benefit.included ? "bg-primary-50 text-primary" : "bg-gray-100 text-muted"
              }`}
            >
              {benefit.included ? (
                <Check className="w-3 h-3" strokeWidth={2.5} />
              ) : (
                <X className="w-3 h-3" strokeWidth={2.5} />
              )}
            </span>
            <span
              className={`text-sm leading-relaxed tracking-[0.25px] ${
                benefit.included ? "text-dark/75" : "text-muted line-through"
              }`}
            >
              {benefit.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
