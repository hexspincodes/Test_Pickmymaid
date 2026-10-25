
// second
import Image from "next/image";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { StatsSection } from "./StatsSection";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { GoogleGIcon } from "../icons/GoogleG";
import { PackageCardIcon } from "../icons/PackageCardIcon";

function HeroCtaButton({
  href,
  icon,
  label,
  variant = "outline",
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: "outline" | "filled";
  className?: string;
}) {
  const isFilled = variant === "filled";

  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2.5 sm:gap-3 rounded-full px-6 py-3.5 sm:px-8 sm:py-4 transition-colors duration-200 ${
        isFilled
          ? "bg-primary hover:bg-primary-600"
          : "bg-white border-2 border-primary hover:bg-primary-50"
      } ${className}`}
    >
      <span
        className={`shrink-0 flex items-center justify-center ${
          isFilled ? "text-white bg-white/20 rounded-full p-1.5" : "text-primary"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
          isFilled ? "text-white" : "text-primary"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function HeroSection() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/home/hero-maid-mobile.webp"
        fetchPriority="high"
        media="(max-width: 1023px)"
      />
      <section className="relative bg-white overflow-hidden" aria-label="Hero">
        {/* ── Mobile / tablet layout ── */}
        <div className="lg:hidden flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 md:px-10 pb-0 relative overflow-hidden">
          {/* Decorative background glow */}
          <div
            aria-hidden="true"
            className="right-0 bottom-0 translate-x-[20%] translate-y-[30%] z-0 bg-[#ff9068] w-[80%] aspect-square absolute blur-[80px] rounded-full pointer-events-none will-change-transform"
          />
          <div
            aria-hidden="true"
            className="right-0 top-0 translate-x-[50%] z-0 bg-white w-[20%] aspect-square absolute blur-[60px] rounded-full pointer-events-none"
          />

          {/* Heading + description */}
          <div className="flex flex-col gap-3 z-10 mb-8 relative max-w-[400px] sm:max-w-[520px] md:max-w-[640px] mx-auto">
            <h1 className="text-[23px] max-[359px]:text-[20px] sm:text-[32px] md:text-[44px] font-semibold leading-snug tracking-[-0.5px] text-dark">
              Maids In Dubai - Hire Verified <br />
              <span className="text-primary">Maids & Nannies</span> in UAE
            </h1>
            <p className="text-[14px] sm:text-base text-dark/80 leading-5 sm:leading-6 tracking-[0.5px]">
              Find verified live-out maids, full-time maids, nannies, and caregivers across the UAE, including Dubai, Abu Dhabi, Sharjah, and all emirates.
            </p>
          </div>

          {/* Keyword search */}
          {/* z-20 keeps the skills dropdown above the maid image below (z-10) */}
          <div className="w-full sm:max-w-[520px] md:max-w-[640px] mx-auto z-20 mb-8 relative">
            <SearchBar variant="mobile" />
          </div>

          {/* Maid image + floating badges */}
          <div className="relative w-full z-10 h-[380px] sm:h-[480px] md:h-[580px] mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home/hero-maid-mobile.webp"
              alt="Professional maid"
              fetchPriority="high"
              decoding="sync"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] sm:w-[360px] md:w-[440px] h-auto"
              width={400}
              height={400}
            />

            {/* Google Rating badge */}
            <div className="absolute bottom-[184px] right-2 sm:bottom-[90px] sm:right-6 md:bottom-[104px] z-[2] bg-white/80 backdrop-blur-sm shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.1)] rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 flex items-center gap-1.5 sm:gap-2">
              <GoogleGIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <div className="flex flex-col gap-0.5 text-left">
                <p className="text-[9px] sm:text-[11px] font-medium text-dark/50 leading-3 tracking-[0.25px] whitespace-nowrap">
                  Google Rating
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-bold text-dark leading-4">
                    4.8
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* People Hired pill */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-2 bg-white backdrop-blur-sm shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.1)] rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 whitespace-nowrap">
              <div className="flex -space-x-3 shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-300 border border-white shrink-0">
                  <Image
                    src="/images/home/hired-people2.webp"
                    alt="People Hired"
                    width={64}
                    height={64}
                    className="object-cover"
                    fetchPriority="high"
                  />
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-300 border border-white shrink-0">
                  <Image
                    src="/images/home/hired-people1.webp"
                    alt="People Hired"
                    width={64}
                    height={64}
                    className="object-cover"
                    fetchPriority="high"
                  />
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-dark border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold shrink-0">
                  2k+
                </div>
              </div>
              <div className="text-left">
                <p className="text-[12px] sm:text-[13px] font-medium text-dark/50 leading-[18px] tracking-[0.5px]">
                  People Hired
                </p>
                <p className="text-[12px] sm:text-[13px] font-semibold text-dark leading-[18px] tracking-[0.5px]">
                  This Month
                </p>
              </div>
            </div>

            {/* Verified Professionals badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[2] bg-white/80 backdrop-blur-sm shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.1)] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-[170px] sm:max-w-[220px]">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <p className="text-[11px] sm:text-sm font-semibold leading-4 tracking-[0.25px] text-primary whitespace-nowrap">
                  Verified Professionals
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-dark/80 leading-[14px] sm:leading-4 tracking-[0.25px]">
                Our thoroughly vetted experts ensure your home is safe and spotless.
              </p>
            </div>
          </div>

        </div>

        {/* Stats (mobile / tablet) */}
        <div className="lg:hidden w-full bg-white relative z-10">
          <StatsSection />
        </div>

        {/* Buttons (mobile / tablet) */}
        <div className="lg:hidden flex flex-col gap-3 sm:gap-4 w-full max-w-[400px] sm:max-w-none mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-10 bg-white relative z-10">
          <HeroCtaButton
            label="Browse Maid Profiles"
            href="/search"
            variant="outline"
            icon={<Search className="w-5 h-5" strokeWidth={1.8} />}
          />
          <HeroCtaButton
            label="Select a Package"
            href="/pricing"
            variant="filled"
            icon={<PackageCardIcon className="w-5 h-5" strokeWidth={1.8} />}
          />
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden lg:flex min-h-[760px] xl:min-h-screen">
          {/* Decorative background glow */}
          <div
            aria-hidden="true"
            className="right-0 bottom-0 translate-x-[25%] translate-y-[25%] z-0 bg-[#ff9068] w-[48%] aspect-square absolute blur-[130px] rounded-full pointer-events-none will-change-transform"
          />
          <div className="flex flex-col gap-8 lg:gap-9 xl:gap-12 z-10 justify-center w-[58%] xl:w-[55%] px-8 lg:px-10 xl:px-[80px] pt-20 lg:pt-24 xl:pt-[152px] pb-12 lg:pb-16 xl:pb-[120px]">
            {/* Heading + description */}
            <div className="flex flex-col gap-6 lg:gap-7 xl:gap-8 text-start items-start">
              <h1 className="text-[length:clamp(2.15rem,3.6vw_-_0.65rem,4.25rem)] font-semibold leading-tight tracking-[-0.02em] text-dark">
                Maids In Dubai - Hire Verified <br />
                <span className="text-primary">Maids & Nannies</span> in UAE
              </h1>
              <p className="text-[20px] text-dark/80 leading-[30px] tracking-[0.25px] max-w-[560px]">
                Find verified live-out maids, full-time maids, nannies, and caregivers across the UAE, including Dubai, Abu Dhabi, Sharjah, and all emirates.
              </p>
            </div>

            {/* Search bar */}
            <SearchBar variant="desktop" />

            {/* Stats */}
            <StatsSection />

            {/* Buttons */}
            <div className="flex flex-row gap-4">
              <HeroCtaButton
                label="Browse Maid Profiles"
                href="/search"
                variant="outline"
                icon={<Search className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.8} />}
              />
              <HeroCtaButton
                label="Select a Package"
                href="/pricing"
                variant="filled"
                icon={<PackageCardIcon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.8} />}
              />
            </div>
          </div>

          {/* Right column: decorative circles + image + floating cards */}
          <div className="flex-1 z-10 relative overflow-hidden">
            {/* Maid image fills full column */}
            <div className="absolute inset-0 z-[1]">
              <Image
                src="/images/home/hero-maid.webp"
                alt="Professional maid holding cleaning supplies"
                width={800}
                height={1000}
                priority
                sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 42vw"
                quality={90}
                fetchPriority="high"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "85%",
                  bottom: 0,
                  left: 0,
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>

            {/* Top row: Google Rating + People Hired — flex row so they can never overlap */}
            <div className="absolute inset-x-3 lg:inset-x-3 xl:inset-x-6 top-[40%] lg:top-[38%] xl:top-[44%] z-[2] flex items-start justify-between gap-1.5 lg:gap-2 xl:gap-4">
              {/* Google Rating */}
              <div className="mt-10 lg:mt-8 xl:mt-14 shrink-0 min-w-0 bg-white/80 backdrop-blur-xl shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded-2xl lg:rounded-3xl px-3 py-2.5 lg:px-4 lg:py-3 xl:px-6 xl:py-4 flex items-center gap-1.5 lg:gap-2 xl:gap-3">
                <GoogleGIcon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-9 xl:h-9 shrink-0" />
                <div className="flex flex-col gap-0.5 lg:gap-1">
                  <p className="text-[11px] lg:text-xs xl:text-sm font-medium text-dark/50 leading-4 tracking-[0.25px] whitespace-nowrap">
                    Google Rating
                  </p>
                  <div className="flex items-center gap-1 lg:gap-1.5">
                    <span className="text-sm lg:text-base xl:text-lg font-bold text-dark leading-5 xl:leading-6">
                      4.8
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-2.5 h-2.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* People Hired */}
              <div className="shrink-0 min-w-0 bg-white/80 backdrop-blur-xl shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded-2xl lg:rounded-3xl px-3 py-2.5 lg:px-4 lg:py-3 xl:px-6 xl:py-5">
                <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-4">
                  <div className="flex -space-x-3 lg:-space-x-4 xl:-space-x-6 shrink-0">
                    <div className="w-7 h-7 lg:w-9 lg:h-9 xl:w-16 xl:h-16 rounded-full bg-orange-300 border-2 border-white shrink-0">
                      <Image
                        src="/images/home/hired-people1.webp"
                        alt="People Hired"
                        width={64}
                        height={64}
                        className="object-cover"
                        fetchPriority="high"
                      />
                    </div>
                    <div className="w-7 h-7 lg:w-9 lg:h-9 xl:w-16 xl:h-16 rounded-full bg-blue-300 border-2 border-white shrink-0">
                      <Image
                        src="/images/home/hired-people2.webp"
                        alt="People Hired"
                        width={64}
                        height={64}
                        className="object-cover"
                        fetchPriority="high"
                      />
                    </div>
                    <div className="w-7 h-7 lg:w-9 lg:h-9 xl:w-16 xl:h-16 rounded-full bg-dark border-2 border-white flex items-center justify-center text-white text-[9px] lg:text-xs xl:text-base font-semibold shrink-0">
                      2k+
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 lg:gap-1 whitespace-nowrap">
                    <p className="text-[11px] lg:text-xs xl:text-base font-medium text-dark/50 leading-4 xl:leading-6 tracking-[0.25px]">
                      People Hired
                    </p>
                    <p className="text-[11px] lg:text-xs xl:text-base font-semibold text-dark leading-4 xl:leading-6 tracking-[0.25px]">
                      This Month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card: Verified Professionals (bottom-left of image) */}
            <div className="absolute bottom-16 lg:bottom-20 xl:bottom-35 left-4 lg:left-6 z-[2] bg-white/80 backdrop-blur-xl shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded-2xl lg:rounded-3xl px-5 py-4 lg:px-6 lg:py-5 max-w-[300px] lg:max-w-[340px] xl:max-w-[381px]">
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <CheckCircleIcon className="w-5 h-5 lg:w-6 lg:h-6 text-primary shrink-0" />
                <p className="text-base lg:text-lg xl:text-[20px] font-semibold leading-6 lg:leading-7 xl:leading-[30px] tracking-[0.25px] text-primary whitespace-nowrap">
                  Verified Professionals
                </p>
              </div>
              <p className="text-sm lg:text-base text-dark/80 leading-5 lg:leading-6 tracking-[0.25px]">
                Our thoroughly vetted experts ensure your home is safe and
                spotless.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
