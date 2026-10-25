import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Phone, Mail, MapPin } from "lucide-react";
import { SplitButton } from "../ui/SplitButton";

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#e86a3c" points="9.75,15.02 15.5,12 9.75,8.98" />
    </svg>
  );
}

const navColumns = [
  {
    heading: "For families",
    links: [
      { label: "Find Maid", href: "/search?service=Maid" },
      { label: "Find Nanny", href: "/search?service=Nanny" },
      { label: "Find Driver", href: "/search?service=Driver" },
      { label: "Find Cook", href: "/search?service=Cook" },
      { label: "Find Caregiver", href: "/search?service=Caregiver" },

    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about-us" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Contact us", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    heading: "Other Links",
    links: [
      { label: "Press Appearance", href: "/press-appearance" },
      { label: "Hiring Tips", href: "/hiring-tips" },
    ],
  },
];

const socialLinks = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/pickmymaid" },
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/pickmymaid" },
  { icon: XIcon, label: "X (Twitter)", href: "https://twitter.com/pickmymaid" },
  { icon: LinkedInIcon, label: "LinkedIn", href: "https://linkedin.com/company/pick-my-maid" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://www.youtube.com/@pickmymaid.com." },
];

const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" }
];

const contactInfo = [
  { icon: Phone, label: "+971 566369736", href: "tel:+971566369736" },
  { icon: Mail, label: "support@pickmymaid.com", href: "mailto:support@pickmymaid.com" },
  { icon: MapPin, label: "The Iridium Building, Al Barsha, Dubai, UAE", href: null },
];

function SubscribeButton() {
  return (
    <button
      type="submit"
      className="flex items-center rounded-2xl overflow-hidden flex-shrink-0"
    >
      <span className="bg-white text-primary px-4 py-3 lg:px-5 lg:py-4 text-xs lg:text-base font-semibold whitespace-nowrap leading-none">
        Subscribe
      </span>
      <span className="bg-dark text-white px-3 lg:px-4 py-3 lg:py-4 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
      </span>
    </button>
  );
}

function NavColumn({
  heading,
  links,
  centered = false,
}: {
  heading: string;
  links: { label: string; href: string }[];
  centered?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${centered ? "items-center" : "items-start"}`}
    >
      <p
        className={`text-white font-medium text-base lg:text-lg ${centered ? "text-center" : ""}`}
      >
        {heading}
      </p>
      <ul
        className={`flex flex-col gap-1 ${centered ? "items-center" : "items-start"}`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-white/80 text-sm lg:text-base py-1 block hover:text-white transition-colors ${centered ? "text-center" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#e86a3c" }}>
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20 overflow-x-hidden">
        {/* ── Mobile layout ── */}
        <div className="lg:hidden py-[60px] flex flex-col gap-10">
          {/* Logo + contact */}
          <div className="flex flex-col gap-6 items-start text-left">
            <Image
              src="/logo orange.webp"
              alt="Pickmymaid"
              width={148}
              height={40}
              className="brightness-0 invert h-auto"
              priority
            />
            <p className="text-sm text-white/80 leading-6">
              Pickmymaid is the UAE&apos;s No 1 platform for finding trusted maids and nannies across Dubai, Abu Dhabi, Sharjah, and beyond. Browse detailed profiles with real recommendations, connect directly with helpers, and make confident hiring decisions — all without paying a single dirham in agency fees. No middlemen, no inflated costs, just the right person for your home.
            </p>
            <div className="flex flex-col gap-3 items-start">
              {contactInfo.map(({ icon: Icon, label, href }) =>
                href ? (
                  <a key={label} href={href} className="flex items-start gap-2 text-white/80 hover:text-white transition-colors">
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span className="text-sm">{label}</span>
                  </a>
                ) : (
                  <div key={label} className="flex items-start gap-2 text-white/80">
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span className="text-sm">{label}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Nav columns — left-aligned, stacked */}
          <div className="flex flex-col gap-8 items-start border-b border-white/20 pb-10">
            {navColumns.map((col) => (
              <NavColumn key={col.heading} {...col} />
            ))}
          </div>

          {/* Bottom: copyright → social → legal */}
          <div className="flex flex-col gap-8 items-start">
            <p className="text-white text-sm text-left">
              © 2026 Pick My Maid. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white hover:text-white/70 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <div className="flex flex-col items-start gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white text-sm hover:text-white/70 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden lg:flex lg:flex-col gap-20 pt-[120px] pb-20">
          {/* Top: logo + newsletter | nav columns */}
          <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-10 pb-20 border-b border-white/20">
            {/* Left: logo + tagline */}
            <div className="flex flex-col gap-5 shrink-0 max-w-96">
              <Image
                src="/logo orange.webp"
                alt="Pickmymaid"
                width={208}
                height={56}
                className="brightness-0 invert h-auto"
                priority
              />
              <p className="text-sm text-white/80 leading-6">
                Pickmymaid is the UAE&apos;s No 1 platform for finding trusted maids and nannies across Dubai, Abu Dhabi, Sharjah, and beyond. Browse detailed profiles with real recommendations, connect directly with helpers, and make confident hiring decisions — all without paying a single dirham in agency fees. No middlemen, no inflated costs, just the right person for your home.
              </p>
            </div>

            {/* Right: nav columns + contact */}
            <div className="flex flex-wrap gap-x-10 gap-y-8 xl:gap-x-16">
              {navColumns.map((col) => (
                <NavColumn key={col.heading} {...col} />
              ))}
              <div className="flex flex-col gap-4">
                <p className="text-white font-medium text-base lg:text-lg">Contact Us</p>
                <ul className="flex flex-col gap-1">
                  {contactInfo.map(({ icon: Icon, label, href }) => (
                    <li key={label}>
                      {href ? (
                        <a href={href} className="flex items-start gap-2 text-white/80 hover:text-white transition-colors py-1">
                          <Icon className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                          <span className="text-sm lg:text-base">{label}</span>
                        </a>
                      ) : (
                        <div className="flex items-start gap-2 text-white/80 py-1">
                          <Icon className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                          <span className="text-sm lg:text-base max-w-48 leading-5">{label}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom: copyright | social | legal */}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <p className="text-white text-base whitespace-nowrap">
              © {new Date().getFullYear()} Pick My Maid. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white hover:text-white/70 transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-8 lg:gap-10">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white text-base hover:text-white/70 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
