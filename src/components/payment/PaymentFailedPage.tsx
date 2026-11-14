import Link from "next/link";
import { XCircle, MessageCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { SplitButton } from "@/components/ui/SplitButton";

const REASONS = [
  "Insufficient funds or card limit exceeded",
  "Incorrect card details entered",
  "Card blocked for online transactions",
  "Bank declined the transaction",
  "Payment session timed out",
];

export function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 lg:py-20 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <XCircle className="w-10 h-10 text-red-500" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-dark mb-2">Payment Unsuccessful</h1>
            <p className="text-sm text-muted leading-relaxed">
              We couldn&apos;t confirm your payment. If your card was charged, your plan will be
              activated automatically within a few minutes and your receipt will be emailed to you.
            </p>
          </div>

          <div className="bg-[#F5F5F5] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-muted" />
              <span className="text-xs font-semibold text-muted tracking-[0.5px] uppercase">
                Possible reasons
              </span>
            </div>
            <ul className="space-y-2.5">
              {REASONS.map((reason) => (
                <li key={reason} className="flex items-start gap-2.5 text-sm text-dark/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <SplitButton label="Try Again" href="/pricing" className="w-full" />
            <Link
              href="/contact"
              className="text-center text-sm font-medium text-muted hover:text-dark transition-colors py-2"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dark mb-1">Still having trouble?</p>
              <p className="text-sm text-muted leading-relaxed">
                Our team is ready to help. Contact us and we&apos;ll assist you in completing your subscription.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-3 hover:underline"
              >
                Get in touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
