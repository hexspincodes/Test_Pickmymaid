"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, CheckCircle2, ArrowRight, Plus, Minus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore, useSubscription } from "@/store/auth";
import { createPayment, ApiError, NetworkError } from "@/lib/api";
import { PLANS } from "@/config/plans.config";
import { PlanCard } from "../cards/PlanCard";

/* ─── FAQ data ───────────────────────────────────────────────── */

const PRICING_FAQS = [
  {
    question: "How much does it cost to hire a maid in Dubai?",
    answer:
      "Through PickMyMaid, you pay a one-time subscription from AED 350 to access maid profiles directly. Maid salaries typically start from AED 1,300 per month, making it significantly more affordable than traditional agencies that charge AED 5,000–16,000 in placement fees.",
  },
  {
    question:
      "Can I hire a Filipino, Indian, or Sri Lankan maid through PickMyMaid?",
    answer:
      "Yes. Our database includes maids and nannies from multiple nationalities — Filipino, Indian, Sri Lankan, Indonesian, Nepali, Pakistani, and more. You can filter profiles by nationality to find exactly who you're looking for.",
  },
  {
    question: "What is the difference between a live-in and live-out maid?",
    answer:
      "A live-in maid resides at your home and is available for full-time duties. A live-out maid commutes daily and works set hours. Both types are available on PickMyMaid — you can filter by preference when browsing profiles.",
  },
  {
    question: "Does PickMyMaid work in Abu Dhabi, Sharjah, and other emirates?",
    answer:
      "Absolutely. PickMyMaid serves families across all UAE emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Umm Al Quwain, and Fujairah. Many maid profiles indicate their preferred emirate or willingness to relocate.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept Visa, Mastercard, American Express, Apple Pay, and Bank Transfer. All payments are secure and processed as a one-time charge — there are no automatic renewals or recurring charges.",
  },
];

/* ─── Quiz data ──────────────────────────────────────────────── */

const QUIZ_STEPS = [
  {
    id: "service",
    heading: "What kind of help are you looking for?",
    options: [
      {
        label: "Housekeeping & cleaning",
        description: "Daily chores, laundry, tidying",
        value: "Maid",
      },
      {
        label: "Childcare & nanny",
        description: "Baby care, kids, school pickups",
        value: "Nanny",
      },
      {
        label: "Cooking & meal prep",
        description: "Daily meals, dietary needs",
        value: "Cook",
      },
      {
        label: "All of the above",
        description: "Full household management",
        value: "",
      },
    ],
  },
  {
    id: "availability",
    heading: "How do you need them available?",
    options: [
      {
        label: "Live-in",
        description: "Stays at home, full-time",
        value: "Live In",
      },
      {
        label: "Live-out, full-time",
        description: "Comes daily, goes home evenings",
        value: "Live Out",
      },
      {
        label: "Part-time / hourly",
        description: "A few hours, specific days",
        value: "Live In And Live Out",
      },
      {
        label: "I'm flexible",
        description: "Open to any arrangement",
        value: "",
      },
    ],
  },
  {
    id: "salary",
    heading: "What monthly salary range are you comfortable with?",
    options: [
      {
        label: "AED 1,300 – 1,800",
        description: "Entry to mid-level experience",
        value: "1300-1800",
      },
      {
        label: "AED 1,800 – 2,500",
        description: "Experienced, multi-skilled",
        value: "1800-2500",
      },
      {
        label: "AED 2,500+",
        description: "Senior, specialist, or bilingual",
        value: "2500-3500",
      },
      {
        label: "Not sure yet",
        description: "Decide after browsing",
        value: "",
      },
    ],
  },
];

/* ─── Sub-components ─────────────────────────────────────────── */

function PaymentMethods() {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-3 mt-6 bg-white rounded-2xl px-5 py-4 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
      <span className="text-xs font-medium text-muted tracking-[0.5px] whitespace-nowrap">
        Available Payment Options
      </span>
      <div className="w-px h-4 bg-gray-200 hidden sm:block" />
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-lg text-xs font-semibold text-dark tracking-[0.5px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Apple Pay
        </span>
        <span className="px-3 py-1.5 bg-[#F5F5F5] rounded-lg text-xs font-black text-[#1A1F71] tracking-[1px]">
          VISA
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-lg">
          <span className="flex items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block -ml-1.5 opacity-90" />
          </span>
          <span className="text-xs font-semibold text-dark tracking-[0.5px]">
            Mastercard
          </span>
        </span>
        <span className="flex items-center bg-[#016FD0] rounded-lg overflow-hidden">
          <Image
            src="/images/others/amex-logo.webp"
            alt="American Express"
            width={56}
            height={28}
            className="h-7 w-auto block"
          />
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-lg text-xs font-semibold text-dark tracking-[0.5px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Bank Transfer
        </span>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-[#fafafa] rounded-xl p-4 lg:p-6">
      <div className="flex gap-3 lg:gap-6 items-start">
        <ArrowRight
          className={`w-4 h-4 lg:w-6 lg:h-6 shrink-0 mt-0.5 transition-colors ${isOpen ? "text-primary" : "text-dark"}`}
          strokeWidth={1.5}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-base font-medium leading-snug transition-colors ${isOpen ? "text-primary" : "text-dark"}`}
          >
            {question}
          </p>
          {isOpen && (
            <p className="mt-3 text-sm lg:text-base text-dark/80 leading-relaxed">
              {answer}
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          aria-label={isOpen ? "Collapse" : "Expand"}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-dark mt-0.5"
        >
          {isOpen ? (
            <Minus className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
          ) : (
            <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── PackagesPage ───────────────────────────────────────────── */

export function PackagesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { isSubscribed, tier } = useSubscription();
  const [loadingType, setLoadingType] = useState<0 | 1 | 2 | 3 | null>(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showRegisteredBanner, setShowRegisteredBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setShowRegisteredBanner(true);
      router.replace(`${pathname}#plans`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    } catch (err) {
      setLoadingType(null);
      if (err instanceof ApiError && err.status === 401) {
        logout();
        toast("Your session has expired. Please log in to continue.");
        router.push(`/login?returnTo=${encodeURIComponent(`${pathname}#plans`)}`);
        return;
      }
      console.error("createPayment failed", err);
      toast.error(
        err instanceof ApiError || err instanceof NetworkError
          ? err.message
          : "Could not initiate payment. Please try again."
      );
    }
  }

  const allAnswered = QUIZ_STEPS.every((s) => quizAnswers[s.id] !== undefined);

  function buildSearchUrl() {
    const params = new URLSearchParams();
    if (quizAnswers.service) params.set("service", quizAnswers.service);
    if (quizAnswers.availability)
      params.set("option", quizAnswers.availability);
    if (quizAnswers.salary) params.set("salary", quizAnswers.salary);
    return `/search${params.size ? `?${params}` : ""}`;
  }

  return (
    <div className="min-h-full">
      {/* ── 1. Hero ─────────────────────────────────────────── */}
      <section className="bg-white pt-28 lg:pt-24">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-16">
          {/* Text block */}
          <div className="flex flex-col items-center text-center pb-12 lg:pb-16">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full tracking-[0.5px] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              No agency fees · Direct hiring
            </div>
            <h1 className="text-[36px] lg:text-[60px] font-bold text-dark leading-tight lg:leading-17 tracking-[-1.5px] max-w-3xl">
              Hire a Nanny or Maid in UAE-With{" "}
              <span className="text-primary">Flexible Packages</span>
            </h1>
            <p className="mt-5 text-base lg:text-xl text-dark/60 leading-relaxed max-w-xl">
              Access 5k+ verified profiles directly. No agency middlemen, no
              hidden fees.
            </p>
            <a
              href="#plans"
              className="mt-8 inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-7 py-3.5 rounded-2xl hover:bg-primary-600 transition-colors"
            >
              See Plans
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-gray-100 lg:border-t-0">
            {[
              { value: "10k+", label: "Families served" },
              { value: "5k+", label: "Verified maids" },
              { value: "Zero", label: "Agency fees" },
              { value: "Khaleej Times", label: "Featured on" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center text-center py-8 px-4
                  ${i % 2 === 0 ? "border-r border-gray-100" : ""}
                  ${i < 2 ? "border-b border-gray-100 lg:border-b-0" : ""}
                  ${i < 3 ? "lg:border-r lg:border-gray-100" : "lg:border-r-0"}`}
              >
                <span className="text-2xl lg:text-3xl font-bold text-primary">
                  {stat.value}
                </span>
                <span className="text-xs lg:text-sm text-muted mt-1 tracking-[0.25px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Pricing cards ────────────────────────────────── */}
      <section id="plans" className="bg-white py-14 lg:py-20">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
          {/* Section header */}
          <div className="max-w-[1600px] mx-auto mb-10 lg:mb-14">
            {showRegisteredBanner && (
              <div className="flex items-start gap-3 bg-primary-50 border border-primary/20 rounded-2xl px-5 py-4 mb-8">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-sm font-semibold text-dark">
                    Successfully created your account
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Browse our packages to access our maids details.
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Left: heading + description */}
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl lg:text-5xl font-bold text-dark tracking-[-1px]">
                  Our <span className="text-primary">Packages</span>
                </h2>
                <p className="text-sm lg:text-base text-muted max-w-md leading-relaxed">
                  Choose how long you need access. All plans include direct
                  contact with verified candidates.
                </p>
              </div>
              {/* Right: trust signals */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-2xl self-start lg:self-end">
                  One-time payment. No renewals.
                </div>
                <div className="flex flex-col gap-1.5">
                  {["No automatic renewals", "No hidden charges"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs text-muted"
                      >
                        <Check
                          className="w-3.5 h-3.5 text-[#6DA544] shrink-0"
                          strokeWidth={2.5}
                        />
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-100 pt-6 flex justify-center">
              <PaymentMethods />
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-3xl p-4 lg:p-6 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6 lg:items-start">
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
          </div>
        </div>
      </section>

      {/* ── 3. FAQ ──────────────────────────────────────────── */}
      <section className="bg-white py-14 lg:py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-11">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-2xl lg:text-4xl font-bold text-dark tracking-[-0.5px] mb-2">
              Common questions about our plans
            </h2>
            <p className="text-sm lg:text-base text-muted mb-8">
              Everything you need to know before choosing a plan.
            </p>
            <div className="flex flex-col gap-3">
              {PRICING_FAQS.map((faq, i) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={faqOpen === i}
                  onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Matching quiz ────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-14 lg:py-20">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-4xl font-bold text-dark tracking-[-0.5px]">
                Not sure where to start?
              </h2>
              <p className="mt-2 text-sm lg:text-base text-muted leading-relaxed">
                Answer 3 quick questions and we&apos;ll match you to the most
                relevant maid or nanny type in our database.
              </p>
              {/* Progress bar */}
              <div className="flex items-center gap-2 mt-5">
                {QUIZ_STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      quizAnswers[s.id] !== undefined
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-8">
              {QUIZ_STEPS.map((step, stepIndex) => {
                const answered = quizAnswers[step.id] !== undefined;
                return (
                  <div key={step.id}>
                    {/* Step header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                          answered
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-muted"
                        }`}
                      >
                        {answered ? (
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          stepIndex + 1
                        )}
                      </div>
                      <p className="text-base font-semibold text-dark">
                        {step.heading}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-11">
                      {step.options.map((opt) => {
                        const selected = quizAnswers[step.id] === opt.value;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [step.id]: opt.value,
                              }))
                            }
                            className={`text-left px-4 py-3.5 rounded-xl border transition-all ${
                              selected
                                ? "border-primary bg-primary-50 ring-1 ring-primary/20"
                                : "border-gray-200 bg-white hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                                  selected
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                                }`}
                              >
                                {selected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <div>
                                <span
                                  className={`text-sm font-semibold block ${selected ? "text-primary" : "text-dark"}`}
                                >
                                  {opt.label}
                                </span>
                                <span className="text-xs text-muted mt-0.5 block">
                                  {opt.description}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-10 ml-11">
              <button
                type="button"
                onClick={() => allAnswered && router.push(buildSearchUrl())}
                disabled={!allAnswered}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  allAnswered
                    ? "bg-primary text-white hover:bg-primary-600 cursor-pointer"
                    : "bg-gray-200 text-muted cursor-not-allowed"
                }`}
              >
                Find My Match
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
              {!allAnswered && (
                <p className="mt-2 text-xs text-muted">
                  {Object.keys(quizAnswers).length} of 3 questions answered
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ──────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-14 lg:py-20">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="bg-white rounded-3xl px-8 py-14 lg:px-16 lg:py-20 text-center max-w-[1600px] mx-auto shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
            <div className="w-12 h-1.5 bg-primary rounded-full mx-auto mb-8" />
            <h2 className="text-3xl lg:text-5xl font-bold text-dark leading-tight tracking-[-1px]">
              Ready to Find Your Perfect{" "}
              <span className="text-primary">Nanny in UAE?</span>
            </h2>
            <p className="mt-5 text-base lg:text-lg text-muted max-w-md mx-auto leading-relaxed">
              Register once. Browse 5k+ maid profiles. Hire directly — no
              agency, no hassle.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                Register &amp; get started
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-2xl border border-gray-200 text-dark font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Chat with our HR team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
