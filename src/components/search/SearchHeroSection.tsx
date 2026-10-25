"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { SplitButton } from "@/components/ui/SplitButton";
import { SkillSearchBox } from "@/components/ui/SkillSearchBox";

// Each popular search applies the matching sidebar filter: a plain text
// search only matches exact wording, so "Indian" found nobody stored as
// nationality "India". Part Time and Malayalam have no filter in the API
// (no part-time option or language filter), so they stay text searches.
const QUICK_FILTER_PARAMS: Record<string, Record<string, string>> = {
  Filipino: { nationality: "Philippines" },
  Indian: { nationality: "India" },
  Nepali: { nationality: "Nepal" },
  "Sri Lankan": { nationality: "Sri Lanka" },
  Indonesian: { nationality: "Indonesia" },
  "Own Visa": { visa: "Own Visa" },
  Muslim: { religion: "Islam" },
  "Part Time": { q: "Part Time" },
  Malayalam: { q: "Malayalam" },
};
const QUICK_FILTERS = Object.keys(QUICK_FILTER_PARAMS);

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

  // Typing a popular search (e.g. "indian") applies its filter too.
  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const popular = QUICK_FILTERS.find((f) => f.toLowerCase() === trimmed.toLowerCase());
    const params = new URLSearchParams(popular ? QUICK_FILTER_PARAMS[popular] : { q: trimmed });
    router.push(`/search?${params.toString()}`);
  };

  const searchSkill = (skill: string) => {
    router.push(`/search?${new URLSearchParams({ skills: skill }).toString()}`);
  };

  return (
    <section
      className="relative bg-white pt-28 pb-16 lg:pt-40 lg:pb-24"
      aria-label="Search maids and nannies"
    >
      {/* Orange glow — matches home hero palette. A gradient, not a blurred
          circle: Safari paints large CSS blur filters very slowly, which
          delayed this page's first paint and made scrolling janky. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 95% 120% at 50% 112%, rgba(255,144,104,0.6) 0%, rgba(255,144,104,0.34) 35%, rgba(255,144,104,0.14) 65%, rgba(255,144,104,0.05) 90%)",
        }}
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
          {/* Search bar — tapping it lists every skill */}
          <div className="relative z-20">
            <SkillSearchBox
              value={query}
              onValueChange={setQuery}
              onSearch={() => doSearch(query)}
              onPickSkill={searchSkill}
              placeholder="Search by type eg. Cook Cleaning"
              ariaLabel="Search maids and nannies"
              barClassName="bg-white/70 border border-white drop-shadow-[0px_19px_20px_rgba(0,0,0,0.05)] flex items-center pl-4 lg:pl-6 pr-2 py-2 rounded-2xl overflow-hidden"
              inputClassName="flex-1 text-base text-dark placeholder:text-dark/50 bg-transparent border-none outline-none min-w-0 leading-6 tracking-[0.25px]"
              buttons={
                <>
                  {/* Desktop: vertical divider + labelled split button */}
                  <div className="hidden lg:flex items-center gap-6 shrink-0 self-stretch">
                    <div className="w-px self-stretch bg-dark/10 my-1" />
                    <SplitButton
                      type="submit"
                      label="Search"
                      icon={<Search className="w-6 h-6" strokeWidth={1.5} />}
                    />
                  </div>

                  {/* Mobile: icon-only split button */}
                  <SplitButton
                    type="submit"
                    aria-label="Search"
                    className="lg:hidden"
                    icon={<Search className="w-5 h-5" strokeWidth={1.5} />}
                  />
                </>
              }
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
                  className="bg-white/70 border border-white drop-shadow-[0px_19px_20px_rgba(0,0,0,0.05)] flex items-center px-3 py-2 lg:px-4 rounded-2xl shrink-0 text-[12px] lg:text-base text-dark/80 leading-[18px] lg:leading-6 tracking-[0.5px] lg:tracking-[0.25px] whitespace-nowrap hover:bg-white/90 transition-colors"
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
