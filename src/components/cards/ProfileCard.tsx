"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Wallet,
  GraduationCap,
  Timer,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { HeartStraight } from "../icons/HeartStraight";
import { SplitButton } from "../ui/SplitButton";
import { OutlineButton } from "../ui/OutlineButton";
import { useAuthStore, useSubscription } from "@/store/auth";
import { toggleWishlist, trackCategoryUsage } from "@/lib/api";
import { HireModal } from "./HireModal";

export interface Profile {
  id: number;
  name: string;
  isNew: boolean;
  country: string;
  experience: string;
  desiredSalary: string;
  desiredJob: string;
  service: string;
  availability: string;
  secondaryAction: "watch" | "hire";
  avatarBg: string;
  initials: string;
  imageBg: string;
  /** Path in /public or absolute URL (requires remotePatterns in next.config.ts) */
  image?: string;
  /** MongoDB _id — required for wishlist toggle */
  maidId?: string;
  /** Whether this profile is already in the user's wishlist */
  isInWishlist?: boolean;
  /** YouTube video link — when present shows "Watch Video" instead of "Hire Me" */
  youtubeLink?: string;
  /** ISO date string from API `date` field */
  postedOn?: string;
}

interface ProfileCardProps {
  profile: Profile;
  /** Set for above-the-fold cards (e.g. first grid row) to speed up LCP */
  priority?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const nationalityMap = (nationality: string) =>
  nationality === "Srilanka" ? "Sri Lanka" : nationality;

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatPostedOn(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const flagMap = (country: string) => {
  const base = "/images/national-flags/";
  return country === "Srilanka"
    ? `${base}sri lanka.webp`
    : `${base}${country.toLowerCase()}.webp`;
};

function toYouTubeEmbed(rawUrl: string): string {
  // API sometimes stores links copied from YouTube's "Embed" snippet, which
  // HTML-escapes the query string (e.g. `&amp;rel=0`). Left as-is, that
  // breaks query parsing and the player fails to load.
  const url = rawUrl.replace(/&amp;/g, "&");
  const params = "autoplay=1&rel=0&modestbranding=1";

  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?${params}`;

  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?${params}`;

  const shorts = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}?${params}`;

  if (url.includes("/embed/")) {
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  }
  return url;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-dark/50">{icon}</span>
        <span className="text-xs font-medium text-dark tracking-[0.5px]">
          {label}
        </span>
      </div>
      <span className="text-xs font-medium text-dark/60 text-right truncate tracking-[0.5px]">
        {value}
      </span>
    </div>
  );
}

/* ─── ProfileCard ────────────────────────────────────────────────────────── */

export function ProfileCard({ profile, priority = false }: ProfileCardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { isSubscribed } = useSubscription();

  const [saved, setSaved] = useState(profile.isInWishlist ?? false);
  const [isPending, setIsPending] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [hireModal, setHireModal] = useState<
    "not-logged-in" | "not-subscribed" | null
  >(null);

  const hasVideo = !!profile.youtubeLink?.trim();
  const embedUrl = hasVideo ? toYouTubeEmbed(profile.youtubeLink!) : "";
  const profileSlug = slugify(
    `${profile.name} ${profile.desiredJob} ${profile.country}`,
  );
  const profileHref = `/maid/${profile.id}/${profileSlug}`;

  function trackProfile() {
    trackCategoryUsage(profile.service, profile.maidId ?? "", user?.id);
  }
  function saveNavContext() {
    const href = window.location.pathname + window.location.search;
    const scrollY = window.scrollY;
    const label = href === "/" ? "Back to Home" : "Back to Search Results";
    sessionStorage.setItem(
      "pmm-nav-return",
      JSON.stringify({ href, scrollY, label }),
    );
    sessionStorage.setItem(`pmm-scroll|${href}`, String(scrollY));
  }

  function handleHire() {
    if (!isAuthenticated) {
      setHireModal("not-logged-in");
      return;
    }
    if (!isSubscribed) {
      setHireModal("not-subscribed");
      return;
    }
    toast(
      "View their profile to get contact details and reach out via phone or WhatsApp.",
    );
    saveNavContext();
    router.push(profileHref);
  }

  async function handleFavorite() {
    if (!isAuthenticated || !user?.id) {
      toast("Please log in to save to favourites.");
      router.push("/login");
      return;
    }
    if (!profile.maidId || isPending) return;

    const nextSaved = !saved;
    setSaved(nextSaved);
    setIsPending(true);
    try {
      await toggleWishlist({ maidId: profile.maidId, user_id: user.id });
      toast(nextSaved ? "Saved to favourites." : "Removed from favourites.");
    } catch {
      setSaved(!nextSaved);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }
  return (
    <>
      {/* ── Card ───────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl p-6 flex flex-col gap-5 cursor-pointer transition-shadow duration-200"
        onClick={() => {
          trackProfile();
          saveNavContext();
          router.push(profileHref);
        }}
      >
        {/* ── Image container ── */}
        <div className="relative rounded-xl overflow-hidden aspect-square shrink-0">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={`${profile.name} profile photo`}
              fill
              sizes="(max-width: 768px) calc(100vw - 2rem), (max-width: 1280px) 50vw, 25vw"
              className="object-cover object-top"
              priority={priority}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-b ${profile.imageBg}`}
            />
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {/* Overlay content */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between">
            {/* Top row: badge + heart */}
            <div className="flex items-start justify-between">
              {profile.availability === "Not Available" ? (
                <div className="flex items-center gap-1 bg-dark/80 backdrop-blur-sm shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] text-white/80 text-xs font-medium px-3 py-2 rounded-full leading-none tracking-[0.5px]">
                  <Check className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                  Hired
                </div>
              ) : (
                <div className="bg-[#6DA544] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] text-white text-sm font-regular px-3 py-2 rounded-full leading-none tracking-[0.5px]">
                  New Profile
                </div>
              )}

          
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                disabled={isPending}
                className="bg-white/20 backdrop-blur-sm shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] p-2.5 rounded-full hover:bg-white/30 transition-colors cursor-pointer disabled:opacity-50"
                aria-label={
                  saved ? "Remove from favourites" : "Add to favourites"
                }
              >
                <HeartStraight className="w-5 h-5 text-white" filled={saved} />
              </button>
            </div>

            {/* Bottom row: posted date + flag tag */}
            <div className="flex items-end justify-between">
              {profile.postedOn ? (
                <p className="text-[11px] font-medium text-white/80 tracking-[0.5px]">
                  Posted On : {formatPostedOn(profile.postedOn)}
                </p>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2 bg-white/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm px-3 py-2 rounded-full">
                <Image
                  src={flagMap(profile.country)}
                  width={20}
                  height={20}
                  alt={nationalityMap(profile.country)}
                />
                <span className="text-xs font-medium text-white tracking-[0.5px]">
                  {nationalityMap(profile.country)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Name + play button ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[20px] font-semibold text-[#212121] line-clamp-1 leading-[30px] tracking-[0.25px]">
              {profile.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-primary font-medium tracking-[0.5px]">
                Verified
              </span>
            </div>
          </div>

          {hasVideo && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVideoOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-primary/90 border-2 border-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 hover:bg-primary transition-colors cursor-pointer"
              aria-label="Watch video"
            >
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Info rows ── */}
        <div className="flex flex-col gap-2">
          <InfoRow
            icon={<Briefcase className="w-5 h-5" />}
            label="Experience"
            value={profile.experience}
          />
          <InfoRow
            icon={<Wallet className="w-5 h-5" />}
            label="Desired Salary"
            value={profile.desiredSalary}
          />
          <InfoRow
            icon={<GraduationCap className="w-5 h-5" />}
            label="Desired Job"
            value={profile.desiredJob}
          />
        </div>

        {/* ── CTA buttons ── */}
        <div
          className="grid grid-cols-[4fr_3fr] gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <SplitButton
            label="View Profile"
            href={profileHref}
            onClick={() => {
              trackProfile();
              saveNavContext();
            }}
          />
          <OutlineButton curve="right" className="w-full" onClick={handleHire}>
            <span className="whitespace-nowrap w-full">Hire Me</span>
          </OutlineButton>
        </div>
      </div>

      {/* ── Hire Modal ──────────────────────────────────────────── */}
      {hireModal && (
        <HireModal
          profile={profile}
          state={hireModal}
          onClose={() => setHireModal(null)}
        />
      )}

      {/* ── Video Modal ─────────────────────────────────────────── */}
      {videoOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setVideoOpen(false)}
          >
            <div
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute -top-14 right-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`${profile.name} introduction video`}
                />
              </div>

              <div className="flex justify-center mt-6">
                <SplitButton
                  label="View Profile"
                  href={profileHref}
                  onClick={saveNavContext}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}