"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Loader2,
  CheckCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

/* ─── Constants ──────────────────────────────────────────────────────────── */

import { ASSET_BASE } from "@/lib/assets";
const LIMIT = 10;

const LOCATIONS = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaima",
  "Fujairah",
  "Al Ain",
];

const NATIONALITIES = [
  "Philippines",
  "India",
  "Nepal",
  "Indonesia",
  "Bangladesh",
  "Pakistan",
  "Myanmar",
  "Bhutan",
  "Sri Lanka",
  "Ethiopia",
  "Eritrea",
];

const SERVICES = [
  "Maid",
  "Nanny",
  "Caregiver",
  "Private Nurse",
  "Private Tutor",
  "Driver",
  "Postpartum care",
  "Cook",
];

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface JobPosting {
  _id: string | number;
  name?: string;
  title?: string;
  profile?: string | null;
  image?: string | null;
  photo?: string | null;
  thumbnail?: string | null;
  service?: string;
  option?: string;
  commitment?: string;
  location?: string;
  current_location?: string;
  nationality?: string;
  available_from?: string;
  date?: string;
}

type ApiRes = {
  data: JobPosting[] | { jobs?: JobPosting[]; total?: number };
  total?: number;
};

type Filters = { location: string; nationality: string; service: string };
type FormState = { name: string; mobile: string; email: string };

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function jobImageSrc(job: JobPosting): string | null {
  const raw = job.profile ?? job.image ?? job.photo ?? job.thumbnail ?? null;
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${ASSET_BASE}/${raw}`;
}

function parseResponse(
  res: ApiRes,
  setJobs: (j: JobPosting[]) => void,
  setTotal: (t: number) => void,
) {
  if (Array.isArray(res.data)) {
    setJobs(res.data);
    setTotal(res.total ?? res.data.length);
  } else if (res.data && "jobs" in res.data) {
    const inner = res.data as { jobs?: JobPosting[]; total?: number };
    setJobs(inner.jobs ?? []);
    setTotal(inner.total ?? res.total ?? 0);
  } else {
    setJobs([]);
    setTotal(0);
  }
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function CareersPage() {
  const [filters, setFilters] = useState<Filters>({
    location: "",
    nationality: "",
    service: "",
  });
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    mobile: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resultsRef = useRef<HTMLElement>(null);

  const totalPages = total > 0 ? Math.ceil(total / LIMIT) : 0;

  /* ── Fetch ──────────────────────────────────────────────── */

  const fetchJobs = useCallback(
    async (filtersArg: Filters, pageArg: number) => {
      setLoading(true);
      try {
        const body: Record<string, unknown> = { page: pageArg, limit: LIMIT };
        if (filtersArg.location) body.location = filtersArg.location;
        if (filtersArg.nationality) body.nationality = filtersArg.nationality;
        if (filtersArg.service) body.service = filtersArg.service.toLowerCase();

        const res = await api.post<ApiRes>("/v1/job/find-search", body);
        parseResponse(res, setJobs, setTotal);
      } catch {
        toast.error("Failed to load jobs. Please try again.");
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    async function init() {
      await fetchJobs({ location: "", nationality: "", service: "" }, 1);
    }
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Search (resets to page 1) ──────────────────────────── */

  const handleSearch = useCallback(async () => {
    setPage(1);
    await fetchJobs(filters, 1);
  }, [filters, fetchJobs]);

  /* ── Page change ────────────────────────────────────────── */

  const goToPage = useCallback(
    async (p: number) => {
      setPage(p);
      await fetchJobs(filters, p);
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [filters, fetchJobs],
  );

  /* ── Modal ──────────────────────────────────────────────── */

  const openModal = (job: JobPosting) => {
    setSelectedJob(job);
    setForm({ name: "", mobile: "", email: "" });
    setSubmitted(false);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/v1/job/register", {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
      });
      setSubmitted(true);
      setTimeout(closeModal, 3500);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setFilter =
    (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      setFilters((f) => ({
        ...f,
        [key]: e.target.value,
      }));

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative bg-white overflow-hidden py-26 lg:py-32"
        aria-label="Find a Job"
      >
        <div
          className="absolute -right-30 -top-20 w-125 h-125 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #FFDDD0 0%, #FFF0EB 45%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -left-40 -bottom-30 w-120 h-120 rounded-full pointer-events-none opacity-60"
          style={{
            background: "radial-gradient(circle, #FFF0EB 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-1 text-muted text-xs font-medium mb-4 lg:mb-6">
              <ChevronsRight className="w-4 h-4" />
              <span>For Domestic Workers</span>
            </div>
            <h1 className="text-[36px] lg:text-[64px] font-semibold leading-11 lg:leading-18 tracking-[-0.5px] lg:tracking-[-2px] text-dark">
              Find Your Next Job{" "}
              <span className="text-primary">in the UAE.</span>
            </h1>
            <p className="mt-4 lg:mt-6 text-base lg:text-xl text-dark/70 leading-relaxed tracking-[0.25px] max-w-xl">
              Browse job listings posted by families across Dubai, Abu Dhabi,
              and beyond. Apply in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filter bar ───────────────────────────────────────────── */}
      <div className="bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] relative z-10">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16 py-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <FilterSelect
              label="Where?"
              value={filters.location}
              onChange={setFilter("location")}
              options={LOCATIONS}
            />
            <FilterSelect
              label="Nationality?"
              value={filters.nationality}
              onChange={setFilter("nationality")}
              options={NATIONALITIES}
            />
            <FilterSelect
              label="Service?"
              value={filters.service}
              onChange={setFilter("service")}
              options={SERVICES}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary hover:bg-primary-600 disabled:opacity-60 transition-colors text-white font-semibold text-sm px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────── */}
      <section
        ref={resultsRef}
        className="bg-[#F5F5F5] min-h-100 py-10 lg:py-16"
      >
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Result count */}
              <p className="mb-6 text-sm text-dark tracking-[0.25px]">
                <span className="font-semibold text-primary">
                  {total} job{total !== 1 ? "s" : ""}
                </span>{" "}
                found according to your requirement
              </p>

              {/* Table header — desktop */}
              {jobs.length > 0 && (
                <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_110px] gap-4 px-5 mb-3">
                  {[
                    "Job Details",
                    "Commitment",
                    "Location",
                    "Posted Date",
                    "Actions",
                  ].map((col) => (
                    <span
                      key={col}
                      className="text-xs font-semibold text-muted uppercase tracking-[0.5px]"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}

              {/* Job rows */}
              <div className="flex flex-col gap-4">
                {jobs.map((job) => {
                  const img = jobImageSrc(job);
                  const title = job.name || job.title || "Job Opening";
                  const commitment =
                    job.option || job.commitment || "Full-Time";
                  const location =
                    job.location || job.current_location || "UAE";
                  const date = job.available_from || job.date || "";

                  return (
                    <div
                      key={job._id}
                      className="bg-white rounded-2xl border border-primary/15 p-5
                                 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04)]
                                 flex flex-col gap-4
                                 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_110px] lg:items-center lg:gap-4"
                    >
                      {/* Job details */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl bg-primary-50 overflow-hidden shrink-0 flex items-center justify-center">
                          {img ? (
                            <Image
                              src={img}
                              alt={title}
                              fill
                              className="object-cover object-top"
                              sizes="56px"
                            />
                          ) : (
                            <Briefcase className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark leading-5 truncate">
                            {title}
                          </p>
                          {job.service && (
                            <p className="text-xs text-muted tracking-[0.5px] mt-0.5">
                              {job.service}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Commitment */}
                      <div className="flex items-center gap-2 lg:block">
                        <Briefcase className="w-4 h-4 text-muted lg:hidden shrink-0" />
                        <span className="text-sm text-dark">{commitment}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 lg:block">
                        <MapPin className="w-4 h-4 text-muted lg:hidden shrink-0" />
                        <span className="text-sm text-dark">{location}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 lg:block">
                        <Calendar className="w-4 h-4 text-muted lg:hidden shrink-0" />
                        <span className="text-xs text-muted">
                          {date ? formatDate(date) : "—"}
                        </span>
                      </div>

                      {/* Apply */}
                      <button
                        onClick={() => openModal(job)}
                        className="bg-primary hover:bg-primary-600 transition-colors text-white text-xs font-semibold px-4 py-2.5 rounded-lg self-start lg:self-auto"
                      >
                        Apply Now
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {jobs.length === 0 && (
                <div className="bg-white rounded-3xl p-16 text-center">
                  <Search className="w-10 h-10 text-primary/25 mx-auto mb-3" />
                  <p className="font-semibold text-dark mb-1">No jobs found</p>
                  <p className="text-sm text-muted">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-dark hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pageNumbers(page, totalPages).map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="w-9 h-9 flex items-center justify-center text-sm text-muted"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => goToPage(n)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                          ${
                            n === page
                              ? "bg-primary text-white"
                              : "border border-gray-200 bg-white text-dark hover:border-primary hover:text-primary"
                          }`}
                      >
                        {n}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-dark hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Apply Modal ──────────────────────────────────────────── */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-md shadow-[0px_32px_64px_0px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-dark">
                  Apply for this Job
                </h2>
                <p className="text-xs text-muted mt-0.5 tracking-[0.5px] truncate max-w-65">
                  {selectedJob.name || selectedJob.title || "Job Opening"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-dark" />
              </button>
            </div>

            <div className="px-6 py-6">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-dark mb-1.5">
                      Application Sent!
                    </h3>
                    <p className="text-sm text-muted leading-5 max-w-[280px]">
                      Thank you! We&apos;ve received your application and will
                      be in touch with you shortly.
                    </p>
                  </div>
                  <p className="text-xs text-muted tracking-[0.5px]">
                    This window will close automatically.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <FormField
                    label="Full Name"
                    type="text"
                    placeholder="Maria Santos"
                    value={form.name}
                    onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  />
                  <FormField
                    label="Mobile Number"
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={form.mobile}
                    onChange={(v) => setForm((f) => ({ ...f, mobile: v }))}
                  />
                  <FormField
                    label="Email Address"
                    type="email"
                    placeholder="maria@example.com"
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary-600 disabled:opacity-60 transition-colors text-white font-semibold text-sm py-3 rounded-xl mt-1 flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Submitting…" : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <label className="text-xs font-semibold text-dark tracking-[0.5px]">
        {label} <span className="text-primary">*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-dark bg-white pr-9 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      </div>
    </div>
  );
}

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-dark tracking-[0.5px]">
        {label}
      </label>
      <input
        required
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:border-primary"
      />
    </div>
  );
}
