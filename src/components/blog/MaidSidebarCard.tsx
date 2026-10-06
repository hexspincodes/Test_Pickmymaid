import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FeaturedJob } from "@/types";

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

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

function photoSrc(profile: string | null | undefined): string | undefined {
  if (!profile) return undefined;
  return profile.startsWith("http") ? profile : `${ASSET_BASE}/${profile}`;
}

export function MaidSidebarCard({
  maid,
  index,
}: {
  maid: FeaturedJob;
  index: number;
}) {
  const photo = photoSrc(maid.profile);
  const nationality = maid.nationality ?? maid.country ?? "";
  const slug = slugify(`${maid.name} ${maid.option} ${nationality}`);
  const id = maid.ref_number ?? maid._id;
  const expYears = (maid.employmentHistory ?? []).reduce(
    (acc, e) => acc + (e.experiance ?? 0),
    0,
  );

  return (
    <Link
      href={`/maid/${id}/${slug}`}
      className="flex items-center gap-3 p-3 w-full rounded-2xl hover:bg-[#F5F5F5] transition-colors group"
    >
      {/* Avatar */}
      <div
        className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center ${!photo ? AVATAR_COLORS[index % AVATAR_COLORS.length] : "bg-gray-100"}`}
      >
        {photo ? (
          <Image
            src={photo}
            alt={maid.name}
            fill
            sizes="56px"
            className="object-cover object-top"
          />
        ) : (
          <span className="text-white text-sm font-bold">
            {getInitials(maid.name)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark truncate leading-snug">
          {maid.name}
        </p>
        <p className="text-xs text-muted truncate mt-0.5">
          {nationality}
          {nationality && maid.option ? " · " : ""}
          {maid.option}
        </p>
        {expYears > 0 && (
          <p className="text-xs text-muted mt-0.5">
            {expYears} yr{expYears !== 1 ? "s" : ""} experience
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="w-7 h-7 rounded-lg bg-[#F5F5F5] group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
        <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
