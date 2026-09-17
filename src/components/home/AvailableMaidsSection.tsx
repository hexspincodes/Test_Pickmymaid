"use client";
import { useMemo, useEffect } from "react";
import { MaidsCarousel } from "./MaidsCarousel";
import type { Profile } from "@/components/cards/ProfileCard";
import type { FeaturedJob } from "@/types";
import { ArrowUpRight, Check, Calendar } from "lucide-react";
import Link from "next/link";

const ASSET_BASE = "https://assets.pickmymaid.com";

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
  "from-neutral-300 via-neutral-400 to-neutral-600",
  "from-gray-300 via-gray-400 to-gray-600",
  "from-slate-400 via-slate-500 to-slate-700",
  "from-stone-400 via-stone-500 to-stone-700",
  "from-zinc-400 via-zinc-500 to-zinc-700",
];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

const getSalary = (from: number, to: number): string => {
    if (from === 0 && to === 0) return "Negotiable";
    return `AED ${from} - ${to}`;
  };

function mapJobToProfile(job: FeaturedJob, index: number): Profile {
  const photo = job.profile
    ? job.profile.startsWith("http")
      ? job.profile
      : `${ASSET_BASE}/${job.profile}`
    : undefined;
  return {
    id: job.ref_number as number,
    name: job.name,
    isNew: true,
    country: job.country ?? job.nationality ?? "",
    experience: `${(job.employmentHistory || []).reduce((acc, exp) => acc + exp.experiance, 0).toFixed(0).toString()} years`,
    desiredSalary: getSalary(job.salary.from, job.salary.to),
    desiredJob: job.option,
    service: job.service ?? job.option,
    availability: job.available_from,
    youtubeLink: job.youtube_link?.trim() || undefined,
    secondaryAction: "hire",
    avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    initials: getInitials(job.name),
    imageBg: IMAGE_GRADIENTS[index % IMAGE_GRADIENTS.length],
    image: photo,
    maidId: String(job._id),
    isInWishlist: job.is_in_wishlist,
    postedOn: job.date,
  };
}

interface Props {
  featuredJobs: FeaturedJob[];
}

const todayLabel = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function AvailableMaidsSection({ featuredJobs }: Props) {
  useEffect(() => {
    const currentHref = window.location.pathname + window.location.search;
    const raw = sessionStorage.getItem("pmm-nav-return");
    const navReturn = raw ? (JSON.parse(raw) as { href: string }) : null;
    const key = `pmm-scroll|${currentHref}`;
    if (navReturn?.href === currentHref) {
      sessionStorage.removeItem("pmm-nav-return");
      const saved = sessionStorage.getItem(key);
      if (saved) {
        sessionStorage.removeItem(key);
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" }),
          ),
        );
      }
    } else {
      sessionStorage.removeItem(key);
    }
  }, []);

  const profiles = useMemo<Profile[]>(() => {
    return featuredJobs
      .filter((job) => !!job.youtube_link?.trim())
      .sort(
        (a, b) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
      )
      .map(mapJobToProfile);
  }, [featuredJobs]);

return (
  <section
    className="bg-[#F7F7F7] py-14 lg:py-20"
    aria-label="Available Maids & Nannies"
  >
    <div className="mx-auto max-w-[1900px] px-5 sm:px-6 lg:px-10 xl:px-20">

      {/* Header */}
      <div className="mb-12 lg:mb-16">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          {/* Left */}
          <div>

            <h2
              className="
                text-[26px]
                md:text-[44px]
                 lg:text-[35px]
                xl:text-[50px]
                font-semibold
                leading-[1.08]
                tracking-[-0.03em]
                text-[#1D1D1F]
              "
            >
              Available Maids & Nannies in UAE
            </h2>

            <p className="mt-4 text-sm lg:text-lg text-[#6B6B6B]">
              Updated on {todayLabel}
            </p>

          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-normal lg:gap-4">

            <Link
              href="/search"
              className="flex h-12 items-center gap-2 rounded-2xl border border-[#2D2D2D] bg-white px-6 text-[16px] font-semibold text-[#1D1D1D] transition hover:bg-gray-50"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>

          </div>

        </div>

      </div>

      {/* Carousel */}

      <MaidsCarousel profiles={profiles} />

    </div>
  </section>
);
}
