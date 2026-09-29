"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronsRight } from "lucide-react";
import { useAuthStore, useSubscription } from "@/store/auth";
import { createPayment } from "@/lib/api";
import { PLANS } from "@/config/plans.config";
import { PlanCard } from "../cards/PlanCard";

export function SubscriptionPlansSection() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSubscribed, tier } = useSubscription();
  const [loadingType, setLoadingType] = useState<0 | 1 | 2 | 3 | null>(null);

  async function handleGetStarted(type: 0 | 1 | 2 | 3) {
    if (!isAuthenticated) {
      toast("Please register or log in to get started.");
      router.push("/register");
      return;
    }
    if (loadingType !== null) return;
    setLoadingType(type);
    try {
      const res = await createPayment(type);
      window.location.assign(res.data.payment_url);
    } catch {
      toast.error("Could not initiate payment. Please try again.");
      setLoadingType(null);
    }
  }

  return (
    <section
      id="packages"
      className="py-12 lg:py-20 relative overflow-hidden scroll-mt-20 lg:scroll-mt-24"
   
      aria-label="Subscription Plans"
    >
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
        {/* Header */}
        <div className="flex flex-col items-start text-left gap-5 mb-12 lg:mb-16">
          
           <div className="flex justify-center md:justify-normal items-center gap-1 text-muted text-xs font-medium mb-4 lg:mb-6">
            <ChevronsRight className="w-8 h-8  md:w-11 md:h-11 font-thin" />
            <span className='text-lg  font-medium'>Our Packages</span>
          </div>

          <div className="flex items-center justify-start">
            <h2 className="text-3xl lg:text-5xl font-regular text-dark leading-tight">
              Simple and transparent
              <br />
              <span className="text-primary text-3xl lg:text-5xl">
                Packages
              </span>
            </h2>
          </div>

          <p className="text-sm lg:text-base text-muted leading-relaxed max-w-lg text-left">
            Choose how long you need access. All plans include direct contact
            with verified candidates — a one-time payment, no recurring
            charges.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 lg:items-center">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActivePlan={isSubscribed && tier === plan.id}
              loadingType={loadingType}
              onGetStarted={handleGetStarted}
              ctaLabel="Buy Package"
            />
          ))}
        </div>

        <div className="flex justify-center mt-10 lg:mt-12">
          <Link
            href="/pricing"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View full package details &amp; FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
