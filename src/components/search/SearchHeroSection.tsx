"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { SplitButton } from "@/components/ui/SplitButton";

const QUICK_FILTERS = [
  "Filipino",
  "Indian",
  "Nepali",
  "Sri Lankan",
  "Indonesian",
  "Own Visa",
  "Muslim",
  "Part Time",
  "Malayalam",
];

export function SearchHeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Keep input in sync when the URL q param changes (e.g. pill click navigates)
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // The pill row scrolls sideways with its scrollbar hidden; on xl screens
  // (mouse users, no swipe) arrow buttons appear while there's more to see.
  const pillsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scrollPills = (direction: 1 | -1) => {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ q: trimmed });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section
      className="relative bg-white overflow-hidden pt-28 pb-16 lg:pt-40 lg:pb-24"
      aria-label="Search maids and nannies"
    >
      {/* Decorative gradient circles — matches home hero palette */}
      <div
        className="absolute translate-x-[-50%] translate-y-[80%] lg:translatee-y-[18%] left-1/2 bottom-0 [filter:blur(150px)] lg:[filter:blur(300px)] w-full h-full bg-[#FF9068] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center px-4 lg:px-[120px] gap-8 lg:gap-20">
        {/* Heading */}
        <h1 className="text-[32px] lg:text-[72px] font-medium text-dark text-center leading-[42px] lg:leading-[80px] tracking-[-0.5px] lg:tracking-[-2px] max-w-[855px]">
          All <span className="font-semibold text-primary">Maids/Nannies</span>{" "}
          are in the UAE Now
        </h1>

        {/* Search input + quick-filter pills */}
        <div className="flex flex-col gap-2 lg:gap-3 w-full max-w-[855px]">
          {/* Search bar */}
          <div className="backdrop-blur-[34px] [-webkit-backdrop-filter:blur(34px)] bg-white/70 border border-white drop-shadow-[0px_19px_20px_rgba(0,0,0,0.05)] flex items-center pl-4 lg:pl-6 pr-2 py-2 rounded-2xl overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              placeholder="Search by type eg. Cook Cleaning"
              className="flex-1 text-base text-dark placeholder:text-dark/50 bg-transparent border-none outline-none min-w-0 leading-6 tracking-[0.25px]"
              aria-label="Search maids and nannies"
            />

            {/* Desktop: vertical divider + labelled split button */}
            <div className="hidden lg:flex items-center gap-6 shrink-0 self-stretch">
              <div className="w-px self-stretch bg-dark/10 my-1" />
              <SplitButton
                label="Search"
                icon={<Search className="w-6 h-6" strokeWidth={1.5} />}
                onClick={() => doSearch(query)}
              />
            </div>

            {/* Mobile: icon-only split button */}
            <SplitButton
              className="lg:hidden"
              icon={<Search className="w-5 h-5" strokeWidth={1.5} />}
              onClick={() => doSearch(query)}
            />
          </div>

          {/* Quick-filter pills */}
          <div className="relative">
            <div
              ref={pillsRef}
              className="flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-0.5"
            >
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => doSearch(filter)}
                  className="backdrop-blur-[34px] [-webkit-backdrop-filter:blur(34px)] bg-white/70 border border-white drop-shadow-[0px_19px_20px_rgba(0,0,0,0.05)] flex items-center px-3 py-2 lg:px-4 rounded-2xl shrink-0 text-[12px] lg:text-base text-dark/80 leading-[18px] lg:leading-6 tracking-[0.5px] lg:tracking-[0.25px] whitespace-nowrap hover:bg-white/90 transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>

            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollPills(-1)}
                aria-label="Scroll filters left"
                className="hidden xl:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white text-dark shadow-md hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollPills(1)}
                aria-label="Scroll filters right"
                className="hidden xl:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white text-dark shadow-md hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
