import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { ApiBlog } from "@/types";

import { ASSET_BASE } from "@/lib/assets";

function thumbnailSrc(thumbnail: string): string {
  if (!thumbnail) return "/og-default.jpg";
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${ASSET_BASE}/${thumbnail}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function BlogListingCard({
  blog,
  priority = false,
}: {
  blog: ApiBlog;
  priority?: boolean;
}) {
  const href = `/blog/${blog.slug}`;
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl overflow-hidden bg-white"
    >
      {/* Image with date badge */}
      <div className="relative h-[250px] lg:h-[340px] overflow-hidden flex-shrink-0">
        <Image
          src={thumbnailSrc(blog.thumbnail)}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
        <div className="absolute bottom-3 left-3 lg:bottom-6 lg:left-6 flex items-center gap-1 lg:gap-2 px-2 py-2 lg:px-3 lg:py-2 rounded-2xl bg-white/10 backdrop-blur-sm shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
          <CalendarDays
            className="w-4 h-4 text-white flex-shrink-0"
            strokeWidth={1.5}
          />
          <span className="text-white text-xs lg:text-base font-medium tracking-wide whitespace-nowrap">
            {formatDate(blog.editedAt)}
          </span>
        </div>
      </div>

      {/* Title + description + read more */}
      <div className="flex flex-col flex-1 px-3 pt-4 pb-5 lg:px-6 lg:pt-8 lg:pb-6 gap-3">
        <p className="text-base lg:text-[22px] font-medium text-[#2e2e2e] leading-snug lg:leading-[32px] line-clamp-2">
          {blog.title}
        </p>
        {blog.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-3">
            {blog.description}
          </p>
        )}
        <span className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-auto pt-1">
          Read More
          <ArrowRight
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </span>
      </div>
    </Link>
  );
}
