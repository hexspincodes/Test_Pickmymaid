import type { ApiMaid } from "@/types";
import type { Profile } from "@/components/cards/ProfileCard";
import type { FindMaidsParams } from "@/lib/api";

export { ASSET_BASE } from "@/lib/assets";
import { ASSET_BASE } from "@/lib/assets";

export const AVATAR_COLORS = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-teal-300",
  "bg-purple-300",
  "bg-blue-300",
  "bg-emerald-300",
  "bg-pink-300",
  "bg-indigo-300",
];

export const IMAGE_GRADIENTS = [
  "from-slate-300 via-slate-400 to-slate-600",
  "from-stone-300 via-stone-400 to-stone-600",
  "from-zinc-300 via-zinc-400 to-zinc-600",
  "from-neutral-300 via-neutral-400 to-neutral-600",
  "from-gray-300 via-gray-400 to-gray-600",
  "from-slate-400 via-slate-500 to-slate-700",
];

export const SORT_OPTIONS = [
  { value: "salary high to low", label: "Salary: High to Low" },
  { value: "salary low to high", label: "Salary: Low to High" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"] | "";

export const FILTER_GROUPS = [
  {
    key: "option" as const,
    label: "Position",
    options: ["Live In", "Live Out", "Live In And Live Out"],
  },
  {
    key: "location" as const,
    label: "Location",
    options: [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ajman",
      "Umm Al Quwain",
      "Ras Al Khaimah",
      "Fujairah",
      "Al Ain",
    ],
  },
  {
    key: "availability" as const,
    label: "Availability",
    options: ["Hired", "Not Hired"],
  },
  {
    key: "service" as const,
    label: "Category",
    options: [
      "Maid",
      "Nanny",
      "Caregiver",
      "Private Nurse",
      "Private Tutor",
      "Driver",
      "Postpartum care",
      "Cook",
    ],
  },
  {
    key: "religion" as const,
    label: "Religion",
    options: ["Christian", "Hinduism", "Islam", "Buddhist", "Sikhism"],
  },
  {
    key: "visa" as const,
    label: "Visa Status",
    options: [
      "Visit Visa",
      "To Be Cancel Visa",
      "Own Visa",
      "Husband Visa",
      "Cancelled Visa",
    ],
  },
  {
    key: "salary" as const,
    label: "Salary",
    options: [
      "1300-1500",
      "1500-1800",
      "1700-2000",
      "1800-2200",
      "2000-2500",
      "2300-2800",
      "2500-3000",
      "3000-3500",
      "Negotiable",
    ],
  },
  {
    key: "nationality" as const,
    label: "Nationality",
    options: [
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
      "Kenya",
      "Nigeria",
      "Ghana",
      "Cameroon",
      "Zimbabwe",
      "Uganda",
    ],
  },
] as const;

export type FilterKey = (typeof FILTER_GROUPS)[number]["key"];
export type ActiveFilters = Record<FilterKey, string[]>;

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2)
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

export function mapMaidToProfile(maid: ApiMaid, index: number): Profile {
  const photo = maid.profile
    ? maid.profile.startsWith("http")
      ? maid.profile
      : `${ASSET_BASE}/${maid.profile}`
    : undefined;

  const expYears = (maid.employmentHistory ?? []).reduce(
    (acc, e) => acc + (e.experiance ?? 0),
    0,
  );

  const getSalary = (from: number, to: number): string => {
    if (from === 0 && to === 0) return "Negotiable";
    return `AED ${from} - ${to}`;
  };

  return {
    id: parseInt(maid.ref_number) || index,
    name: maid.name,
    isNew: false,
    country: maid.nationality ?? "",
    experience: `${expYears.toFixed(0)} year${expYears !== 1 ? "s" : ""}`,
    desiredSalary: getSalary(maid.salary.from, maid.salary.to),
    desiredJob: maid.option,
    service: maid.service,
    availability: maid.availability ? "Immediate" : "Not Available",
    secondaryAction: maid.youtube_link?.trim() ? "watch" : "hire",
    youtubeLink: maid.youtube_link?.trim() || undefined,
    avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    initials: getInitials(maid.name),
    imageBg: IMAGE_GRADIENTS[index % IMAGE_GRADIENTS.length],
    image: photo,
    maidId: maid._id,
    isInWishlist: maid.is_in_wishlist ?? false,
    postedOn: maid.date,
  };
}

export function parseParam(val: string | null): string[] {
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseActiveFilters(searchParams: URLSearchParams): ActiveFilters {
  return {
    option: parseParam(searchParams.get("option")),
    location: parseParam(searchParams.get("location")),
    availability: parseParam(searchParams.get("availability")),
    service: parseParam(searchParams.get("service")),
    religion: parseParam(searchParams.get("religion")),
    visa: parseParam(searchParams.get("visa")),
    salary: parseParam(searchParams.get("salary")),
    nationality: parseParam(searchParams.get("nationality")),
  };
}

export function buildFindMaidsParams(
  searchParams: URLSearchParams,
  page: number,
): FindMaidsParams {
  const filters = parseActiveFilters(searchParams);
  const salaryMin = searchParams.get("salaryMin") ?? "";
  const salaryMax = searchParams.get("salaryMax") ?? "";
  const sortValue = (searchParams.get("sort") ?? "") as SortValue;
  const searchQuery = searchParams.get("q") ?? "";

  return {
    page,
    searchParams: searchQuery || undefined,
    option: filters.option.join(",") || undefined,
    location: filters.location.join(",") || undefined,
    availability: filters.availability.join(",") || undefined,
    service: filters.service.join(",") || undefined,
    religion: filters.religion.map((r) => r.toLowerCase()).join(",") || undefined,
    visa: filters.visa.join(",") || undefined,
    salary: filters.salary.join(",") || undefined,
    nationality:
      filters.nationality
        .map((n) => (n === "Sri Lanka" ? "Srilanka" : n))
        .join(",") || undefined,
    salaryFrom: salaryMin ? parseInt(salaryMin, 10) : undefined,
    salaryTo: salaryMax ? parseInt(salaryMax, 10) : undefined,
    sort: sortValue || undefined,
  };
}
