@AGENTS.md

# Pickmymaid — Design & Code Reference

Service platform for hiring maids and nannies in the UAE. Always generate clean, production-ready code that matches the existing design system. No Figma needed — follow this document.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — config lives in `globals.css` via `@theme {}`, not `tailwind.config.ts` |
| Font | Plus Jakarta Sans (400/500/600/700/800), variable `--font-plus-jakarta` |
| Icons | `lucide-react` (primary) + custom SVG components in `src/components/icons/` |
| Animation | Framer Motion, CSS marquee (.marquee-track) |
| Toasts | `sonner` — `<Toaster />` in root layout, call `toast.*()` anywhere |
| Carousel | Embla Carousel |
| State | Zustand |
| Data fetching | React Query (TanStack) |
| Images | `next/image` — remote images from DigitalOcean Spaces (`ASSET_BASE` in `src/lib/assets.ts`) |

---

## Design Tokens

### Colors

```
Primary orange:  #FF7442   → text-primary / bg-primary / border-primary
Primary tints:   #FFF4F0   → bg-primary-50
                 #FFE5DB   → bg-primary-100
                 #FFBCA3   → bg-primary-200
Primary shades:  #ED541D   → bg-primary-600
                 #C54216   → bg-primary-700
Dark:            #1A1A1A   → text-dark / bg-dark
Muted gray:      #6B7280   → text-muted
Peach:           #FFF0EB   → bg-peach
Body text:       #212121   (darker than dark for card content)
Secondary text:  #6F6F6F   (captions, subtitles inside cards)
Surface gray:    #F5F5F5   (page bg, inner card bg, chip bg)
```

All custom tokens are Tailwind utilities: `bg-primary`, `text-dark`, `text-muted`, `bg-peach`, `bg-primary-50`, etc.

### Typography (Plus Jakarta Sans)

| Role | Classes |
|---|---|
| Hero heading (desktop) | `text-[72px] font-semibold leading-[80px] tracking-[-2px]` |
| Hero heading (mobile) | `text-[32px] font-semibold leading-[42px] tracking-[-0.5px]` |
| Section heading | `text-3xl lg:text-4xl font-bold text-dark leading-tight` |
| Card / section title | `text-base font-semibold text-dark` (mobile) / `text-xl lg:text-2xl font-semibold` (desktop) |
| Paragraph large | `text-xl leading-[30px] tracking-[0.25px]` |
| Paragraph body | `text-base leading-6 tracking-[0.25px]` |
| Paragraph small | `text-sm leading-5 tracking-[0.5px]` |
| Caption / chip label | `text-xs font-medium tracking-[0.5px]` |
| Badge text | `text-xs font-semibold tracking-[0.5px]` |

Use `tracking-[0.25px]` for body text, `tracking-[0.5px]` for smaller text and labels.

### Border Radius

| Scale | Tailwind | Use |
|---|---|---|
| 8px | `rounded-lg` | Small chips, inputs |
| 12px | `rounded-xl` | Medium chips, small cards |
| 16px | `rounded-2xl` | Inner card sections, badges |
| 24px | `rounded-3xl` | Primary cards and containers |
| Full | `rounded-full` | Pill badges, avatars, dot indicators |

### Spacing & Layout

- **Page max-width:** `max-w-400 mx-auto px-4 sm:px-6 lg:px-16` (`max-w-400` = 100rem = 1600px)
- **Section padding:** `py-12 lg:py-20`
- **Card padding:** `p-6` (mobile) / `p-8` or `px-8 pb-8 pt-6` (desktop)
- **Gap between cards in a column:** `gap-4` or `gap-5`
- **Gap between stacked sections:** `gap-6`

### Shadows

```
Card drop shadow:    shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)]
Inset highlight:     shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]
Elevated card:       shadow-sm or shadow-md on hover
```

### Surface Hierarchy

```
Page background      bg-[#F5F5F5]
Primary card         bg-white rounded-3xl
Inner section        bg-[#F5F5F5] rounded-2xl
Chip / info row      bg-[#F5F5F5] rounded-lg
Floating / glass     bg-white/80 backdrop-blur-xl
Accent tint          bg-primary-50 (peach tint, for highlights)
```

---

## Component Catalog

### SplitButton — `src/components/ui/SplitButton.tsx`

Two-tone pill CTA: orange label section + dark arrow section joined by an SVG wave.

```tsx
<SplitButton label="Contact Me" />                        // primary (default)
<SplitButton label="View Profile" href="/maid/123" />     // as link
<SplitButton label="Register" variant="secondary" />      // white + dark arrow
<SplitButton label="Hire Me" className="w-full" />        // full width
```

Props: `label`, `variant` ("primary" | "secondary"), `href`, `onClick`, `className`, `icon`.

### OutlineButton — `src/components/ui/OutlineButton.tsx`

Scalloped-border button with a concave wave edge.

```tsx
<OutlineButton curve="right">Login</OutlineButton>        // children left, wave right
<OutlineButton curve="left"><ArrowRight /></OutlineButton> // wave left, icon right
<OutlineButton curve="right" href="/search">View All</OutlineButton>
```

Props: `curve` ("left" | "right"), `children`, `href`, `stroke` (border color, default `#b5b5b5`).

### SectionHeader — `src/components/ui/SectionHeader.tsx`

Standardised section intro used on all marketing sections.

```tsx
<SectionHeader
  breadcrumb="Why Choose Us"
  heading="Your Safety & Peace of Mind is Our Priority"
  subheading="Subheading text explaining the section in 1–2 sentences."
/>
```

Places a muted `ChevronsRight` breadcrumb row above a bold h2, with the subheading right-aligned on desktop.

### ProfileCard — `src/components/cards/ProfileCard.tsx`

Maid/nanny listing card with hero image, avatar, info rows, and CTA buttons.

```tsx
<ProfileCard profile={profile} />  // Profile shape from @/types
```

Key `Profile` fields: `name`, `country`, `experience`, `desiredSalary`, `desiredJob`, `availability`, `image` (URL), `initials`, `avatarBg`, `imageBg`, `isNew`, `secondaryAction`.

### InfoRow (local pattern)

Used inside profile cards and the maid profile page — NOT a shared component, but a consistent pattern you must follow exactly:

```tsx
<div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-3 py-2 rounded-lg">
  <div className="flex items-center gap-2 shrink-0">
    <span className="text-dark/50">{icon}</span>
    <span className="text-xs font-medium text-dark tracking-[0.5px]">{label}</span>
  </div>
  <span className="text-xs font-medium text-dark/60 text-right truncate tracking-[0.5px]">{value}</span>
</div>
```

### Section Card (local pattern)

All sidebar/detail cards on the maid profile follow this shell:

```tsx
<div className="bg-white rounded-3xl p-6">
  <h2 className="text-base font-semibold text-dark mb-5">Section Title</h2>
  {/* content */}
</div>
```

### Skill Chips (local pattern)

```tsx
<span className="px-3 py-1.5 bg-[#f5f5f5] text-xs font-medium rounded-xl">{skill}</span>
```

### Orange Badge / Pill (local pattern)

Used for duration, status badges with primary colour:

```tsx
<div className="flex items-center gap-2 border border-primary rounded-full pl-2 pr-4 py-2 shrink-0 self-start shadow-[inset_1px_1px_2px_0px_rgba(0,0,0,0.1)]">
  <Icon className="w-5 h-5 text-primary shrink-0" />
  <span className="text-xs font-semibold text-primary tracking-[0.5px] whitespace-nowrap">Label</span>
</div>
```

### Toast Notifications — `sonner`

`<Toaster />` is mounted once in `src/app/layout.tsx` (themed to Plus Jakarta Sans, `rounded-2xl`, white surface, card shadow). Import `toast` from `sonner` in any client component:

```tsx
import { toast } from "sonner"

toast.success("Account created! Welcome to Pickmymaid.")
toast.error("Something went wrong. Please try again.")
toast("Profile saved.")          // neutral
toast.loading("Uploading…")      // loading state
```

The Toaster is pre-themed — do not add inline `style` or `className` overrides per call site. Keep messages short (one sentence max).

---

### Floating Glass Card (local pattern)

Used for floating info overlays on hero images:

```tsx
<div className="bg-white/80 backdrop-blur-xl shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded-3xl px-6 py-5">
  {/* content */}
</div>
```

---

## Page Layout Patterns

### Marketing/home sections

```tsx
<section className="py-12 lg:py-20 bg-white" aria-label="Section Name">
  <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
    <SectionHeader breadcrumb="..." heading="..." subheading="..." />
    {/* content grid */}
  </div>
</section>
```

Alternate section backgrounds: `bg-white` ↔ `bg-[#FAFAFA]`.

### Internal page (profile, search, etc.)

```tsx
<div className="bg-[#F5F5F5] min-h-screen py-6 lg:py-25">
  <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
    {/* page content */}
  </div>
</div>
```

### Two-column profile layout

```tsx
<div className="flex gap-6 lg:gap-8 items-start">
  {/* Main column — left */}
  <div className="flex-1 min-w-0 flex flex-col gap-5">
    {/* ... */}
  </div>

  {/* Sidebar — desktop only */}
  <aside className="hidden lg:flex flex-col gap-4 w-85 xl:w-90 shrink-0">
    {/* ... */}
  </aside>
</div>
```

---

## Responsive Strategy

- **Breakpoint:** `lg` (1024px) is the single main breakpoint. Mobile-first.
- **Show/hide:** `lg:hidden` (mobile only) / `hidden lg:block` or `hidden lg:flex` (desktop only).
- **Font scaling:** Mobile uses smaller sizes, scale up with `lg:text-*`.
- **Padding scaling:** `p-5` mobile → `lg:px-8 lg:pb-8 lg:pt-6` desktop.
- **Gap scaling:** `gap-[18px] lg:gap-6`.
- **Layout switch:** `flex-col lg:flex-row` for sections that stack on mobile and go side-by-side on desktop.

---

## Icons

**Lucide React** for all standard icons. Import from `lucide-react`. Common ones used: `Briefcase`, `Wallet`, `GraduationCap`, `Timer`, `Clock`, `ArrowLeft`, `ArrowUpRight`, `Search`, `MapPin`, `ChevronsRight`, `Menu`, `X`, `Check`.

**Custom SVG icons** in `src/components/icons/` for Phosphor-style icons not in Lucide: `Books`, `Briefcase` (custom), `CalenderDots`, `CheckCircleIcon`, `CheckSquareOffset`, `GlobeSimple`, `HandsPraying`, `Heart`, `HeartStraight`, `MapPin` (custom), `PenNib`, `Student`, `UserCircleDashed`, `UserSound`.

Icon sizing convention:
- Inline / label icon: `w-4 h-4` (16px)
- Action / button icon: `w-5 h-5` (20px)
- Feature / card icon: `w-6 h-6` (24px)
- Hero / large feature: `w-8 h-8` (32px)

---

## File Structure

```
src/
  app/                        # Next.js App Router pages
    page.tsx                  # Home
    search/page.tsx
    maid/[id]/page.tsx
  components/
    cards/                    # Reusable card components
    home/                     # Home page sections
    icons/                    # Custom SVG icon components
    layout/                   # Navbar, Footer
    maid/                     # Maid profile page sections
    search/                   # Search page sections
    ui/                       # Generic UI primitives (SplitButton, OutlineButton, etc.)
  lib/api/index.ts            # API calls
  types/index.ts              # Shared TypeScript types
  config/seo.config.ts        # SEO metadata
```

New pages go in `src/app/`. New sections/components go in the matching `src/components/` subfolder. Create a new subfolder for new page-specific components.

---

## Coding Conventions

- **Server components by default.** Add `"use client"` only when the component needs `useState`, `useEffect`, or browser event handlers.
- **No comments** unless the WHY is non-obvious. Well-named variables and components are self-documenting.
- **Images:** Always use `next/image` with `fill` + `sizes` for responsive images. Use `priority` + `fetchPriority="high"` only for above-the-fold images.
- **Links:** Always use `next/link` for internal navigation.
- **Metadata:** Export a `metadata` object from every `page.tsx` with `title`, `description`, and `alternates.canonical`.
- **Dynamic imports:** Use `dynamic()` for heavy below-fold sections to improve LCP (see `page.tsx` for pattern).
- **`dangerouslySetInnerHTML`:** Allowed only for API-returned HTML content that is already server-sanitised (e.g. `maid.notes`, `entry.job_description`).
- **Tailwind v4:** No `tailwind.config.ts`. All custom tokens live in the `@theme {}` block in `globals.css`. Do not add inline `style={}` when a Tailwind utility exists.
- **No dark mode.** The service platform is light-only. Never add dark: variants.

---

## Nationality / Flag Helpers

Flag images live at `/public/images/national-flags/{nationality_lowercase}.webp`.
Sri Lanka is stored as `"sri lanka.webp"` (with space); the API returns `"Srilanka"` — always handle this edge case.

```ts
function flagPath(nationality: string): string {
  if (nationality === "Srilanka") return "/images/national-flags/sri lanka.webp";
  return `/images/national-flags/${nationality.toLowerCase()}.webp`;
}
```

---

## API & Types

Remote images: `https://pickmymaidbucket.sfo3.cdn.digitaloceanspaces.com/{profile_path}` (DigitalOcean Spaces; base in `src/lib/assets.ts`, overridable via `NEXT_PUBLIC_ASSET_BASE_URL`; whitelisted in `next.config.ts` images + CSP).

Core types in `src/types/index.ts`: `ApiMaid`, `ApiMaidEmploymentHistory`, `JobLanguage`, `Salary`.

`ApiMaid` key fields: `_id`, `ref_number`, `name`, `profile` (image path or null), `age`, `nationality`, `salary {from, to}`, `option` (job type), `availability` (bool), `available_from`, `visa_status`, `employmentHistory[]`, `language[]`, `skills[]`, `notes` (HTML), `references` (bool), `youtube_link`.

Salary display: `from === 0 && to === 0` → "Negotiable", otherwise "AED {from} – {to} / month".
