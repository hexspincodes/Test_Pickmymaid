"use client";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Lock, Star } from "lucide-react";
import Image from "next/image";
import { SplitButton } from "@/components/ui/SplitButton";
import type { Profile } from "./ProfileCard";
import { workArrangementLabels } from "@/components/ui/WorkArrangement";

type HireState = "not-logged-in" | "not-subscribed";

interface HireModalProps {
  profile: Pick<Profile, "id" | "name" | "initials" | "avatarBg" | "workArrangement" | "image">;
  state: HireState;
  onClose: () => void;
}

function savePendingHire(id: number, name: string) {
  sessionStorage.setItem("pmm-pending-hire", JSON.stringify({ id: String(id), name }));
}

export function HireModal({ profile, state, onClose }: HireModalProps) {
  const router = useRouter();
  const firstName = profile.name.split(" ")[0];

  function goToRegister() {
    savePendingHire(profile.id, profile.name);
    onClose();
    router.push("/register?returnTo=/pricing");
  }

  function goToPackages() {
    savePendingHire(profile.id, profile.name);
    onClose();
    router.push("/pricing");
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-[0px_32px_64px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-rose-200">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={firstName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white text-xs font-bold ${profile.avatarBg}`}>
                  {profile.initials}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark leading-tight">{firstName}</p>
              <p className="text-xs text-muted tracking-[0.25px]">
                {workArrangementLabels(profile.workArrangement).join(" · ")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-dark" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-6 flex flex-col gap-5">
          {state === "not-logged-in" ? (
            <>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-dark leading-snug">
                    Sign in to hire {firstName}
                  </p>
                  <p className="text-sm text-muted mt-1 leading-[22px] tracking-[0.25px]">
                    Create an account or log in to browse contact details and hire domestic help.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-2 bg-[#F5F5F5] rounded-2xl px-4 py-4">
                {[
                  "Create a free account or log in",
                  "Choose a subscription plan",
                  "Access contact details and hire directly",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-dark/70 tracking-[0.25px] leading-5">{step}</span>
                  </div>
                ))}
              </div>

              <SplitButton label="Create Account" onClick={goToRegister} className="w-full" />
            </>
          ) : (
            <>
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-dark leading-snug">
                    Subscribe to access contact details
                  </p>
                  <p className="text-sm text-muted mt-1 leading-[22px] tracking-[0.25px]">
                    To view {firstName}&apos;s phone number and WhatsApp, you need an active
                    subscription plan.
                  </p>
                </div>
              </div>

              {/* What you get */}
              <div className="flex flex-col gap-2 bg-[#F5F5F5] rounded-2xl px-4 py-4">
                {[
                  "Direct phone & WhatsApp access to all candidates",
                  "New 30+ verified profiles every day",
                  "Unlimited maid trials & replacements until you find the best one",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span className="text-xs text-dark/70 tracking-[0.25px] leading-5">{item}</span>
                  </div>
                ))}
              </div>

              <SplitButton label="View Plans" onClick={goToPackages} className="w-full" />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
