import Image from "next/image";
import { BackButton } from "./BackButton";
import { Wallet, GraduationCap, Timer, Check } from "lucide-react";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { WishlistButton } from "./WishlistButton";
import { ContactSection } from "./ContactSection";
import { MaidSessionProvider } from "./MaidSessionContext";
import { sanitizeBasicHtml } from "@/lib/sanitizeHtml";
import { EmploymentHistory } from "./EmploymentHistory";
import { LanguagesSection } from "./LanguagesSection";
import { ProfileCard, type Profile } from "@/components/cards/ProfileCard";
import type { ApiMaid } from "@/types";
import UserCircleDashed from "../icons/UserCircleDashed";
import VisaSection from "./VisaSection";
import PersonalInformation from "./PersonalInformation";
import CalenderDots from "../icons/CalenderDots";
import MapPin from "../icons/MapPin";
import Heart from "../icons/Heart";
import HandsPraying from "../icons/HandsPraying";
import Student from "../icons/Student";
import CheckSquareOffset from "../icons/CheckSquareOffset";
import Briefcase from "../icons/Briefcase";
import { ReactNode } from "react";
import SkillsSection from "./SkillsSection";
import { ContactMeButton } from "./ContactMeButton";

/* ─── Helpers ───────────────────────────────────────────────── */

function toYouTubeEmbed(url: string): string {
  if (!url) return "";
  const params = "rel=0&modestbranding=1&playsinline=1";
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?${params}`;
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}?${params}`;
  const shorts = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}?${params}`;
  if (url.includes("/embed/"))
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  return url;
}

/* ─── Constants ─────────────────────────────────────────────── */

import { ASSET_BASE } from "@/lib/assets";

const AVATAR_COLORS = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-teal-300",
  "bg-purple-300",
  "bg-blue-300",
  "bg-emerald-300",
];

const IMAGE_GRADIENTS = [
  "from-slate-300 via-slate-400 to-slate-600",
  "from-stone-300 via-stone-400 to-stone-600",
  "from-zinc-300 via-zinc-400 to-zinc-600",
];

/* ─── Helpers ────────────────────────────────────────────────── */

function getPhotoUrl(profile: string | null): string | undefined {
  if (!profile) return undefined;
  return profile.startsWith("http") ? profile : `${ASSET_BASE}/${profile}`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

function getSalaryLabel(from: number, to: number): string {
  if (from === 0 && to === 0) return "Negotiable";
  return `AED ${from} – ${to} / month`;
}

function flagPath(nationality: string): string {
  if (nationality === "Srilanka")
    return "/images/national-flags/sri lanka.webp";
  return `/images/national-flags/${nationality.toLowerCase()}.webp`;
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPostedOn(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapMaidToProfile(maid: ApiMaid, index: number): Profile {
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
    desiredSalary: getSalaryLabel(maid.salary.from, maid.salary.to),
    desiredJob: maid.option,
    service: maid.service,
    availability: maid.availability ? "Immediate" : "Not Available",
    secondaryAction: "hire",
    avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    initials: getInitials(maid.name),
    imageBg: IMAGE_GRADIENTS[index % IMAGE_GRADIENTS.length],
    image: getPhotoUrl(maid.profile),
    postedOn: maid.date,
  };
}

/* ─── InfoRow ────────────────────────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-dark/50">{icon}</span>
        <span className="text-xs font-medium text-dark tracking-[0.5px]">
          {label}
        </span>
      </div>
      <span className="text-xs font-medium text-dark/60 text-right truncate tracking-[0.5px] max-w-[55%]">
        {value}
      </span>
    </div>
  );
}

/* ─── MaidProfilePage ────────────────────────────────────────── */

export function MaidProfilePage({
  maid,
  similar,
}: {
  maid: ApiMaid;
  similar: ApiMaid[];
}) {
  const photoUrl = getPhotoUrl(maid.profile);
  const expYears = (maid.employmentHistory ?? []).reduce(
    (acc, e) => acc + (e.experiance ?? 0),
    0,
  );
  const salary = getSalaryLabel(maid.salary.from, maid.salary.to);
  const availableFrom = maid.available_from?.trim();

  const similarProfiles = similar.map((m, i) => mapMaidToProfile(m, i));

  const youtubeUrl = toYouTubeEmbed(maid.youtube_link?.trim() ?? "");
  const personalInformations: {
    icon: ReactNode;
    label: string;
    value: string;
  }[] = [
    {
      icon: <CalenderDots />,
      label: "Age",
      value: maid.age?.toString(),
    },
    {
      icon: <MapPin />,
      label: "Location",
      value: maid.location as string,
    },
    {
      icon: (
        <Image
          src={flagPath(maid.nationality)}
          width={24}
          height={24}
          alt={maid.nationality === "Srilanka" ? "Sri Lanka" : maid.nationality}
          className="rounded-full object-cover w-6 h-6"
        />
      ),
      label: "Nationality",
      value: maid.nationality,
    },
    {
      icon: <Heart />,
      label: "Marital Status",
      value: maid.marital_status as string,
    },
    {
      icon: <HandsPraying />,
      label: "Religion",
      value: maid.religion as string,
    },
    {
      icon: <Student />,
      label: "Education",
      value: maid.education as string,
    },
    {
      icon: <CheckSquareOffset />,
      label: "Day Off",
      value: maid.day_of as string,
    },
    {
      icon: <Briefcase />,
      label: "Starting",
      value: maid.salary.from === 0 ? "Negotiable" : `AED ${maid.salary.from}`,
    },
  ];

  return (
    <MaidSessionProvider maidId={maid._id}>
    <div className="bg-[#F5F5F5] min-h-screen py-26 lg:py-25">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Back button */}
        <div className="mb-5">
          <BackButton />
        </div>

        {/* ── Two-column on desktop ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left / main column */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Hero card */}
            <div className="bg-white rounded-3xl p-6 flex flex-col gap-5">
              {/* Image */}
              <div className="relative rounded-xl overflow-hidden aspect-square">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={`${maid.name} profile photo`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${IMAGE_GRADIENTS[0]}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  {/* Top row: badge + heart */}
                  <div className="flex items-start justify-between">
                    {!maid.availability ? (
                      <div className="flex items-center gap-1 bg-dark/80 backdrop-blur-sm shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] text-white/80 text-xs font-medium px-3 py-2 rounded-full leading-none tracking-[0.5px]">
                        <Check className="w-3 h-3 shrink-0" strokeWidth={2.5} />
                        Hired
                      </div>
                    ) : (
                      <div className="bg-[#6DA544] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] text-white text-xs font-medium px-3 py-2 rounded-full leading-none tracking-[0.5px]">
                        Available
                      </div>
                    )}
                    <WishlistButton maidId={maid._id} />
                  </div>

                  {/* Bottom row: posted on + flag */}
                  <div className="flex items-end justify-between">
                    {maid.date ? (
                      <p className="text-[11px] font-medium text-white/80 tracking-[0.5px]">
                        Posted On : {formatPostedOn(maid.date)}
                      </p>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-2 bg-white/10 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm px-3 py-2 rounded-full">
                      <Image
                        src={flagPath(maid.nationality)}
                        width={20}
                        height={20}
                        alt={
                          maid.nationality === "Srilanka"
                            ? "Sri Lanka"
                            : maid.nationality
                        }
                      />
                      <span className="text-xs font-medium text-white tracking-[0.5px]">
                        {maid.nationality === "Srilanka"
                          ? "Sri Lanka"
                          : maid.nationality}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name + verified */}
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <h1 className="text-[20px] font-semibold text-[#212121] line-clamp-1 leading-[30px] tracking-[0.25px]">
                    {maid.name}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-primary font-medium tracking-[0.5px]">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div className="flex flex-col gap-1">
                {expYears > 0 && (
                  <InfoRow
                    icon={
                      <Briefcase stroke="currentColor" className="w-4 h-4" />
                    }
                    label="Experience"
                    value={`${expYears} year${expYears !== 1 ? "s" : ""}`}
                  />
                )}
                <InfoRow
                  icon={<Wallet className="w-4 h-4" />}
                  label="Desired Salary"
                  value={salary}
                />
                {maid.option && (
                  <InfoRow
                    icon={<GraduationCap className="w-4 h-4" />}
                    label="Desired Job"
                    value={maid.option}
                  />
                )}
                <InfoRow
                  icon={<Timer className="w-4 h-4" />}
                  label="Availability"
                  value={availableFrom as string}
                />
              </div>

              <ContactMeButton
                maidRefNumber={String(maid.ref_number)}
                maidName={maid.name}
                maidService={maid.service}
                maidId={maid._id}
              />

              {/* References note */}
              {maid.references && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2.5 rounded-xl">
                  <div
                    className="flex p-3 items-center rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(109, 165, 68, 0.15) 0%, rgba(109, 165, 68, 0.03) 100%)",
                    }}
                  >
                    <UserCircleDashed className="w-6 h-6 text-green-600 shrink-0" />
                  </div>
                  <span className="text-xs font-medium text-green-700">
                    Reference available from previous employer
                  </span>
                </div>
              )}
            </div>

            {/* About section */}
            {maid.notes && (
              <div className="bg-white lg:hidden rounded-3xl p-6">
                <h2 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
                  About Me
                </h2>
                <div
                  className="text-sm max-w-none text-dark/70  prose-strong:text-dark"
                  dangerouslySetInnerHTML={{ __html: sanitizeBasicHtml(maid.notes) }}
                />
              </div>
            )}

            {/* Visa section */}
            <div className="block">
              <VisaSection
                status={maid.visa_status}
                expiryDate={maid.visa_expire}
              />
            </div>
          </div>

          {/* Right / sticky sidebar — desktop only */}
          <aside className="flex-2 flex flex-col gap-4 shrink-0">
            <div className="flex flex-col-reverse lg:flex-row gap-4 items-stretch">
              <div id="contact-section" className="flex-2">
                <ContactSection
                  maidRefNumber={String(maid.ref_number)}
                  maidName={maid.name}
                />
              </div>
              {/* YouTube video */}
              {youtubeUrl && (
                <div className="bg-white rounded-3xl p-6 flex-1">
                  <h2 className="text-base font-semibold text-dark mb-4">
                    Video Introduction
                  </h2>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                    <iframe
                      src={youtubeUrl}
                      title={`${maid.name} video introduction`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* About / Notes */}
            {maid.notes && (
              <div className="bg-white hidden lg:block rounded-3xl p-6">
                <h2 className="text-base font-semibold text-dark mb-4 flex items-center gap-2">
                  About Me
                </h2>
                <div
                  className="prose prose-sm max-w-none text-dark/70 prose-p:leading-relaxed prose-ul:leading-relaxed prose-strong:text-dark"
                  dangerouslySetInnerHTML={{ __html: sanitizeBasicHtml(maid.notes) }}
                />
              </div>
            )}

            <PersonalInformation info={personalInformations} />

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SkillsSection skills={maid.skills || []} />
              </div>
              <div className="flex-1">
                <LanguagesSection languages={maid.language || []} />
              </div>
            </div>
            <EmploymentHistory history={maid.employmentHistory ?? []} />
          </aside>
        </div>
      </div>
    </div>
    </MaidSessionProvider>
  );
}
