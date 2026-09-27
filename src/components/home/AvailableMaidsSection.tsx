"use client";
import { useEffect } from "react";
import { MaidsCarousel } from "./MaidsCarousel";
import type { Profile } from "@/components/cards/ProfileCard";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Props {
  profiles: Profile[];
}

const todayLabel = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function AvailableMaidsSection({ profiles }: Props) {
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
