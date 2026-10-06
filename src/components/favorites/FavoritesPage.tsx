"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Heart, RotateCcw, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { ProfileCard, type Profile } from "@/components/cards/ProfileCard";
import { SplitButton } from "@/components/ui/SplitButton";
import { useAuthStore } from "@/store/auth";
import { getWishlist, ApiError } from "@/lib/api";
import type { ApiMaid } from "@/types";

/* ─── Constants ───────────────────────────────────────────── */

import { ASSET_BASE } from "@/lib/assets";

const AVATAR_COLORS = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-teal-300",
  "bg-purple-300",
  "bg-blue-300",
  "bg-emerald-300",
  "bg-pink-300",
  "bg-indigo-300",
];

const IMAGE_GRADIENTS = [
  "from-slate-300 via-slate-400 to-slate-600",
  "from-stone-300 via-stone-400 to-stone-600",
  "from-zinc-300 via-zinc-400 to-zinc-600",
];

/* ─── Helpers ─────────────────────────────────────────────── */

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

function mapMaidToProfile(maid: ApiMaid, index: number): Profile {
  const photo = maid.profile
    ? maid.profile.startsWith("http")
      ? maid.profile
      : `${ASSET_BASE}/${maid.profile}`
    : undefined;

  const expYears = (maid.employmentHistory ?? []).reduce(
    (acc, e) => acc + (e.experiance ?? 0),
    0,
  );

  return {
    id: parseInt(maid.ref_number) || index,
    name: maid.name,
    isNew: false,
    country: maid.nationality ?? "",
    experience: `${expYears} year${expYears !== 1 ? "s" : ""}`,
    desiredSalary:
      maid.salary.from === 0 && maid.salary.to === 0
        ? "Negotiable"
        : `AED ${maid.salary.from} - ${maid.salary.to}`,
    desiredJob: maid.option,
    service: maid.service,
    availability: maid.availability ? "Immediate" : "Not Available",
    secondaryAction: "hire",
    avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    initials: getInitials(maid.name),
    imageBg: IMAGE_GRADIENTS[index % IMAGE_GRADIENTS.length],
    image: photo,
    maidId: maid._id,
    isInWishlist: true,
    postedOn: maid.date,
  };
}

/* ─── ProfileCardSkeleton ─────────────────────────────────── */

function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-5 animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
      </div>
      <div className="flex flex-col gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-[4fr_3fr] gap-2">
        <div className="h-12 bg-gray-200 rounded-2xl" />
        <div className="h-12 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

/* ─── EmptyState ──────────────────────────────────────────── */

function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
      </div>
      <p className="text-lg font-semibold text-dark mb-2">{title}</p>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
        {message}
      </p>
      {action}
    </div>
  );
}

/* ─── FavoritesPage ───────────────────────────────────────── */

type FetchStatus = "idle" | "loading" | "success" | "error";

export function FavoritesPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const isLoggedIn = isAuthenticated && !!user?.id;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  // Initialise to 'loading' if already logged in so skeletons show immediately —
  // no sync setState needed inside the effect.
  const [status, setStatus] = useState<FetchStatus>(() =>
    isLoggedIn ? "loading" : "idle",
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    
    getWishlist(user.id)
      .then((res: { data: { favorites: ApiMaid[] } }) => {
        if (cancelled) return;
        const maids: ApiMaid[] = res.data?.favorites ?? [];
        setProfiles(maids.map((m, i) => mapMaidToProfile(m, i)));
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        const is401 = err instanceof ApiError && err.status === 401;
        if (is401) {
          logout();
          toast("Your session has expired. Please log in again.");
        } else {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, retryKey, logout]);

  function handleRetry() {
    // Set loading from the event handler — correct React pattern
    setStatus("loading");
    setRetryKey((k) => k + 1);
  }

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (status === "error") {
      return (
        <EmptyState
          icon={RotateCcw}
          title="Something went wrong"
          message="We couldn't load your saved profiles. Please try again."
          action={
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Try again
            </button>
          }
        />
      );
    }

    if (!isLoggedIn) {
      return (
        <EmptyState
          icon={Heart}
          title="Log in to see your saved profiles"
          message="Create an account or log in to start saving maids and nannies you like."
          action={<SplitButton label="Log In" href="/login" />}
        />
      );
    }

    if (profiles.length === 0) {
      return (
        <EmptyState
          icon={Heart}
          title="No saved profiles yet"
          message="Browse maids and nannies and save the ones that catch your eye — they'll appear here."
          action={<SplitButton label="Browse Profiles" href="/search" />}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-26 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-dark">
            Saved Profiles
          </h1>
          {status === "success" && profiles.length > 0 && (
            <p className="text-sm text-muted mt-1">
              {profiles.length} saved profile{profiles.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
