"use client";

import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
  Search,
  Check,
} from "lucide-react";
import { ProfileCard, type Profile } from "@/components/cards/ProfileCard";
import { findMaids } from "@/lib/api";
import { useSkillOptions } from "@/lib/useSkillOptions";
import type { ApiMaid } from "@/types";
import Filter from "../icons/Filter";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import {
  SORT_OPTIONS,
  FILTER_GROUPS,
  mapMaidToProfile,
  parseParam,
  parseActiveFilters,
  buildFindMaidsParams,
  searchedSkills,
  type SortValue,
  type FilterKey,
} from "@/lib/searchFilters";

/* ─── Skeleton ────────────────────────────────────────────────────────────── */

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

/* ─── CheckboxFilterGroup ─────────────────────────────────────────────────── */

function CheckboxFilterGroup({
  label,
  options,
  selected,
  onToggle,
  defaultOpen = false,
  searchable = false,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (val: string) => void;
  defaultOpen?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const activeCount = selected.length;

  const visible =
    searchable && query.trim()
      ? options.filter((o) =>
          o.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-3.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="font-semibold text-sm text-dark">{label}</span>
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
        }`}
      >
        {searchable && (
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 text-[16px] rounded-lg border border-gray-200 bg-white outline-none focus:border-primary text-dark placeholder:text-muted/60 transition-colors"
            />
          </div>
        )}
        <div className="flex flex-col overflow-y-auto ">
          {visible.map((opt) => {
            const isActive = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                aria-pressed={isActive}
                className="flex items-center gap-2.5 w-full py-2 text-left group"
              >
                <span
                  className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border transition-all ${
                    isActive
                      ? "bg-primary border-primary"
                      : "border-gray-300 bg-white group-hover:border-primary/60"
                  }`}
                >
                  {isActive && (
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-sm tracking-[0.25px] ${
                    isActive ? "text-dark font-medium" : "text-dark/70"
                  }`}
                >
                  {opt}
                </span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <p className="text-xs text-muted py-2">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── SalaryFilterGroup ───────────────────────────────────────────────────── */

function SalaryFilterGroup({
  options,
  selected,
  onToggle,
  salaryMin,
  salaryMax,
  onSalaryRange,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (val: string) => void;
  salaryMin: string;
  salaryMax: string;
  onSalaryRange: (min: string, max: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(salaryMin);
  const [localMax, setLocalMax] = useState(salaryMax);
  const [syncedMin, setSyncedMin] = useState(salaryMin);
  const [syncedMax, setSyncedMax] = useState(salaryMax);
  const activeCount = selected.length + (salaryMin || salaryMax ? 1 : 0);

  // Sync inputs when URL params change externally (e.g. clearAll)
  if (syncedMin !== salaryMin) {
    setSyncedMin(salaryMin);
    setLocalMin(salaryMin);
  }
  if (syncedMax !== salaryMax) {
    setSyncedMax(salaryMax);
    setLocalMax(salaryMax);
  }

  function apply() {
    onSalaryRange(localMin, localMax);
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full py-3.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="font-semibold text-sm text-dark">Salary</span>
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
        }`}
      >
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-muted tracking-[0.5px] uppercase mb-1.5">
              Min (AED)
            </p>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={apply}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="1300"
              min={0}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-primary text-dark placeholder:text-muted/60 transition-colors"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-muted tracking-[0.5px] uppercase mb-1.5">
              Max (AED)
            </p>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={apply}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder="3500"
              min={0}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-primary text-dark placeholder:text-muted/60 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const isActive = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-dark/80 border-gray-200 hover:border-primary/60 hover:text-primary"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── ActiveFilterChips ───────────────────────────────────────────────────── */

function ActiveFilterChips({
  activeFilters,
  salaryMin,
  salaryMax,
  onRemove,
  onRemoveSalaryRange,
  onClearAll,
}: {
  activeFilters: Record<FilterKey, string[]>;
  salaryMin: string;
  salaryMax: string;
  onRemove: (key: FilterKey, val: string) => void;
  onRemoveSalaryRange: () => void;
  onClearAll: () => void;
}) {
  const chips = FILTER_GROUPS.flatMap((g) =>
    activeFilters[g.key].map((val) => ({ key: g.key, val })),
  );
  const hasSalaryRange = !!(salaryMin || salaryMax);
  const salaryRangeLabel =
    salaryMin && salaryMax
      ? `AED ${salaryMin} – ${salaryMax}`
      : salaryMin
        ? `Min AED ${salaryMin}`
        : `Max AED ${salaryMax}`;

  if (chips.length === 0 && !hasSalaryRange) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {chips.map(({ key, val }) => (
        <span
          key={`${key}-${val}`}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-medium"
        >
          {val}
          <button
            type="button"
            onClick={() => onRemove(key, val)}
            aria-label={`Remove ${val} filter`}
            className="-mr-1 p-1 rounded-md hover:text-primary-600 active:bg-primary/20 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {hasSalaryRange && (
        <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-medium">
          {salaryRangeLabel}
          <button
            type="button"
            onClick={onRemoveSalaryRange}
            aria-label="Remove salary range"
            className="hover:text-primary-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted hover:text-dark active:text-dark transition-colors flex items-center gap-1 py-1.5 px-2 rounded-lg"
      >
        <RotateCcw className="w-3 h-3" />
        Clear all
      </button>
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const delta = 2;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const btnBase =
    "w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-8 flex-wrap"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${btnBase} border-gray-200 bg-white text-dark hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-muted text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btnBase} ${
              p === page
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-200 text-dark hover:border-primary hover:text-primary"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${btnBase} border-gray-200 bg-white text-dark hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

/* ─── Fetch state reducer ─────────────────────────────────────────────────── */

type FetchState = {
  profiles: Profile[];
  total: number;
  perPage: number;
  loading: boolean;
  error: boolean;
};

type FetchAction =
  | { type: "start" }
  | { type: "success"; profiles: Profile[]; total: number; perPage: number }
  | { type: "error" };

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: false };
    case "success":
      return {
        profiles: action.profiles,
        total: action.total,
        perPage: action.perPage,
        loading: false,
        error: false,
      };
    case "error":
      return { ...state, loading: false, error: true };
  }
}

const initialFetchState: FetchState = {
  profiles: [],
  total: 0,
  perPage: 0,
  loading: true,
  error: false,
};

/* ─── SearchResultsSection ────────────────────────────────────────────────── */

export interface SearchResultsInitialData {
  profiles: Profile[];
  total: number;
  perPage: number;
}

export function SearchResultsSection({
  initialData,
}: {
  initialData?: SearchResultsInitialData | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [{ profiles, total, perPage, loading, error }, dispatch] = useReducer(
    fetchReducer,
    initialData
      ? { ...initialData, loading: false, error: false }
      : initialFetchState,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const skillOptions = useSkillOptions();

  const sectionRef = useRef<HTMLElement>(null);
  const shouldScrollRef = useRef(false);
  const pendingScrollY = useRef<number | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const skipNextFetch = useRef(!!initialData);

  /* Derive everything from URL — single source of truth */
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sortValue = (searchParams.get("sort") ?? "") as SortValue;
  const searchQuery = searchParams.get("q") ?? "";
  const searchKey = searchParams.toString();
  const salaryMin = searchParams.get("salaryMin") ?? "";
  const salaryMax = searchParams.get("salaryMax") ?? "";

  const activeFilters: Record<FilterKey, string[]> = parseActiveFilters(searchParams);

  const totalActive =
    Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0) +
    (salaryMin || salaryMax ? 1 : 0);

  const totalPages =
    perPage > 0 ? Math.max(page, Math.ceil(total / perPage)) : page;

  /* Scroll to top of results when updatePage fires */
  useEffect(() => {
    if (shouldScrollRef.current) {
      shouldScrollRef.current = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [page]);

  /* Read scroll restoration target from sessionStorage immediately on mount */
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
        pendingScrollY.current = parseInt(saved, 10);
      }
    } else {
      sessionStorage.removeItem(key);
    }
  }, []);

  /* Apply pending scroll after data loads and profiles are in the DOM */
  useEffect(() => {
    if (!loading && pendingScrollY.current !== null && profiles.length > 0) {
      const y = pendingScrollY.current;
      pendingScrollY.current = null;
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          window.scrollTo({ top: y, behavior: "instant" }),
        ),
      );
    }
  }, [loading, profiles]);

  /* URL updaters — all filter/sort changes reset page to 1 */
  const updateFilter = useCallback(
    (key: FilterKey, values: string[]) => {
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      if (values.length > 0) params.set(key, values.join(","));
      else params.delete(key);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const toggleFilter = useCallback(
    (key: FilterKey, value: string) => {
      const current = parseParam(new URLSearchParams(window.location.search).get(key));
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateFilter(key, updated);
    },
    [updateFilter],
  );

  const clearAll = useCallback(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [router]);

  const updateSalaryRange = useCallback(
    (min: string, max: string) => {
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      if (min) params.set("salaryMin", min);
      else params.delete("salaryMin");
      if (max) params.set("salaryMax", max);
      else params.delete("salaryMax");
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const updateSort = useCallback(
    (val: SortValue) => {
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      if (val) params.set("sort", val);
      else params.delete("sort");
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const updatePage = useCallback(
    (p: number) => {
      shouldScrollRef.current = true;
      const params = new URLSearchParams(window.location.search);
      if (p <= 1) params.delete("page");
      else params.set("page", String(p));
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  /* Data fetching */
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    let cancelled = false;
    dispatch({ type: "start" });

    findMaids(buildFindMaidsParams(searchParams, page))
      .then((res) => {
        if (cancelled) return;
        const maids: ApiMaid[] = res.data?.maids ?? [];
        const count = res.data?.count ?? 0;
        const offset = (page - 1) * (perPage || maids.length);
        const mapped = maids.map((m, i) => mapMaidToProfile(m, offset + i));
        dispatch({
          type: "success",
          profiles: mapped,
          total: count,
          perPage: maids.length > perPage ? maids.length : perPage,
        });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchKey]);

  /* Lock body scroll when sheet open */
  useEffect(() => {
    if (sheetOpen) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [sheetOpen]);

  /* Close sort dropdown on outside click */
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  /* Shared filter panel content */
  const filterContent = (
    <div>
      {FILTER_GROUPS.map((group, i) => {
        if (group.key === "salary") {
          return (
            <SalaryFilterGroup
              key={group.key}
              options={group.options}
              selected={activeFilters.salary}
              onToggle={(val) => toggleFilter("salary", val)}
              salaryMin={salaryMin}
              salaryMax={salaryMax}
              onSalaryRange={updateSalaryRange}
            />
          );
        }
        return (
          <CheckboxFilterGroup
            key={group.key}
            label={group.label}
            options={group.key === "skills" ? skillOptions : group.options}
            selected={activeFilters[group.key]}
            onToggle={(val) => toggleFilter(group.key, val)}
            defaultOpen={i < 2 || (group.key === "skills" && activeFilters.skills.length > 0)}
            searchable={
              group.key === "location" || group.key === "nationality" || group.key === "skills"
            }
          />
        );
      })}
    </div>
  );

  const { skills: skillsSearched } = searchedSkills(searchParams);
  const skillLabel = skillsSearched.join(", ");
  const resultLabel = loading
    ? null
    : total > 0
      ? skillLabel
        ? `Found ${total} ${skillLabel} profile${total !== 1 ? "s" : ""}`
        : `Found ${total} result${total !== 1 ? "s" : ""} according to your requirements`
      : skillLabel
        ? `No ${skillLabel} profiles found`
        : `No results${searchQuery ? ` for "${searchQuery}"` : ""}`;

  return (
    <>
      <section
        ref={sectionRef}
        className="bg-[#F5F5F5] min-h-screen py-8 lg:py-12 pb-24 lg:pb-12"
        aria-label="Search results"
      >
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
          {/* Results header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              {resultLabel && (
                <p className="text-sm text-dark font-medium">{resultLabel}</p>
              )}
              {loading && (
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              )}
            </div>

            {/* Sort + Filter controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                {/* Desktop */}
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="hidden lg:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-gray-300 transition-colors"
                >
                  <span className="text-muted text-xs">Sort by</span>
                  <span className="font-medium text-dark text-xs">
                    {SORT_OPTIONS.find((o) => o.value === sortValue)?.label ??
                      "Default"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>
                {/* Mobile — icon only */}
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-label="Sort"
                  className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
                    sortValue
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-gray-200 text-dark hover:border-gray-300"
                  }`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[190px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        updateSort("");
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${
                        !sortValue ? "text-primary font-semibold" : "text-dark"
                      }`}
                    >
                      Default
                    </button>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateSort(opt.value);
                          setSortOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${
                          sortValue === opt.value
                            ? "text-primary font-semibold"
                            : "text-dark"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter button — mobile icon only (desktop uses sidebar) */}
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label="Filters"
                className={`lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
                  totalActive > 0
                    ? "bg-primary text-white"
                    : "bg-white border-gray-200 text-dark hover:border-gray-300"
                }`}
              >
                <Filter className="w-4 h-4" />
                {totalActive > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-primary/20">
                    {totalActive}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8 items-start">
            {/* ── Desktop sidebar ──────────────────────────────── */}
            <aside
              aria-label="Search filters"
              className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-[88px] bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-semibold text-dark text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {totalActive > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {totalActive}
                    </span>
                  )}
                </span>
                {totalActive > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-primary font-medium hover:text-primary-600 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="px-5 py-2 overflow-y-auto max-h-[calc(100vh-160px)]">
                {filterContent}
              </div>
            </aside>

            {/* ── Results area ──────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Active filter chips */}
              <ActiveFilterChips
                activeFilters={activeFilters}
                salaryMin={salaryMin}
                salaryMax={salaryMax}
                onRemove={(key, val) => toggleFilter(key, val)}
                onRemoveSalaryRange={() => updateSalaryRange("", "")}
                onClearAll={clearAll}
              />

              {/* Grid */}
              {error ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <RotateCcw className="w-6 h-6 text-muted" />
                  </div>
                  <p className="font-semibold text-dark mb-1">
                    Something went wrong
                  </p>
                  <p className="text-sm text-muted mb-5">
                    We couldn&apos;t load the results. Please try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-semibold"
                  >
                    Try again
                  </button>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProfileCardSkeleton key={i} />
                  ))}
                </div>
              ) : profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <SlidersHorizontal className="w-6 h-6 text-muted" />
                  </div>
                  <p className="font-semibold text-dark mb-1">
                    No maids or nannies found
                  </p>
                  <p className="text-sm text-muted max-w-xs mb-5">
                    Try adjusting your filters or search term to find more
                    results.
                  </p>
                  {totalActive > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="px-6 py-2.5 bg-primary text-white rounded-2xl text-sm font-semibold"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profiles.map((profile: Profile, i) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        priority={page === 1 && i < 3}
                      />
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={updatePage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile filter sheet ────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 bg-dark/40 backdrop-blur-[2px] [-webkit-backdrop-filter:blur(2px)] z-40 transition-opacity duration-300 ${
          sheetOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSheetOpen(false)}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search filters"
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl max-h-[88dvh] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sheetOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 shrink-0" aria-hidden="true">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
          <span className="font-semibold text-dark flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {totalActive > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                {totalActive}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {totalActive > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-primary font-semibold px-3 py-2 rounded-xl bg-primary/10 active:bg-primary/20 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Close filters"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">{filterContent}</div>

        {/* Sheet footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full bg-dark text-white rounded-2xl py-3.5 text-sm font-semibold transition-colors hover:bg-dark/90"
          >
            {!loading && total > 0
              ? `View ${total} result${total !== 1 ? "s" : ""}`
              : "View Results"}
          </button>
        </div>
      </div>
    </>
  );
}
