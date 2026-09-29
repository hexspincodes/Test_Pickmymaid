"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import {
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut,
  Home,
  Search,
  Compass,
  Info,
  Phone,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import { SplitButton } from "../ui/SplitButton";
import { OutlineButton } from "../ui/OutlineButton";
import { PackageCardIcon } from "../icons/PackageCardIcon";
import { useAuthStore } from "@/store/auth";
import { verifyAuth, logoutUser, getPaymentDetails } from "@/lib/api";

const ASSET_BASE = "https://assets.pickmymaid.com";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search Maid/Nanny", href: "/search", icon: Search },
  { label: "Packages", href: "/pricing", icon: PackageCardIcon },
  { label: "How It Works", href: "/how-it-works", icon: Compass },
  { label: "About Us", href: "/about-us", icon: Info },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Contact Us", href: "/contact", icon: Phone },
  { label: "Blogs", href: "/blog", icon: Newspaper },
];

const drawerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const drawerHeaderVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

const navItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Start as false — we always wait for hydration before deciding auth state
  const [authReady, setAuthReady] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  /* ── Disable browser scroll restoration — we handle it ourselves ── */
  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  /* ── Scroll shadow + hide-on-scroll-down ── */
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);

      if (mobileOpen || currentY <= 80) {
        setHideNav(false);
      } else if (currentY > lastScrollY.current) {
        setHideNav(true);
      } else if (currentY < lastScrollY.current) {
        setHideNav(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    if (mobileOpen) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [mobileOpen]);

  /* ── Auth verification on mount — cookie is sent automatically ── */
  useEffect(() => {
    const TIER_MAP = ["basic", "standard", "premium", "starter"] as const;

    verifyAuth()
      .then(async (res) => {
        const u = res.data.user;
        let isSubscribed = false;
        let subscriptionTier: "basic" | "standard" | "premium" | "starter" | undefined;

        try {
          const payment = await getPaymentDetails();
          if (payment.data?.user?.status === 1) {
            isSubscribed = true;
            subscriptionTier = TIER_MAP[payment.data?.user.type];
          }
        } catch {
          // Not subscribed or API unavailable — defaults remain false/undefined
        }

        setAuth({
          id: u.user_id,
          email: u.email,
          name: [u.first_name, u.last_name].filter(Boolean).join(" "),
          isSubscribed,
          subscriptionTier,
          profile: u.profile || undefined,
        });
        setAuthReady(true);
      })
      .catch(() => {
        logout();
        setAuthReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Dropdown click-outside ── */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      /* session already invalid */
    }
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    toast.success("Logged out successfully.");
    router.push("/");
  }

  const firstName = user?.name.split(" ")[0] ?? "";
  const avatarSrc = user?.profile
    ? user.profile.startsWith("http")
      ? user.profile
      : `${ASSET_BASE}/${user.profile}`
    : null;

  /* ── Desktop auth area ── */
  const desktopAuth = !authReady ? (
    <div className="w-36 h-9 bg-gray-100 rounded-full animate-pulse" />
  ) : user ? (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full pl-1.5 pr-3 py-1.5 hover:border-gray-200 transition-colors"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.name}
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white text-[10px] font-bold leading-none">
              {getInitials(user.name)}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-dark">{firstName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0px_19px_40px_0px_rgba(0,0,0,0.10)] border border-gray-100 overflow-hidden z-10">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-dark truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
          </div>
          {/* Links */}
          <div className="py-1.5">
            <Link
              href="/favorites"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-4 h-4 text-muted" strokeWidth={1.75} />
              Saved Profiles
            </Link>
          </div>
          {/* Logout */}
          <div className="py-1.5 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <OutlineButton curve="right" href="/login">
        Login
      </OutlineButton>
      <SplitButton label="Register" href="/register" />
    </div>
  );

  /* ── Mobile drawer auth section ── */
  const mobileAuth = user ? (
    <div className="p-4 border-t border-gray-100 space-y-2">
      {/* User card */}
      <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-2xl mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 overflow-hidden">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white text-sm font-bold">
              {getInitials(user.name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-dark truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
      </div>
      <Link
        href="/favorites"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
      >
        <Heart className="w-4 h-4 text-muted" strokeWidth={1.75} />
        Saved Profiles
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
        Logout
      </button>
    </div>
  ) : (
    <div className="p-4 border-t border-gray-100 flex items-stretch gap-3">
      <OutlineButton
        curve="right"
        href="/login"
        onClick={() => setMobileOpen(false)}
        className="flex-1"
      >
        Login
      </OutlineButton>
      <SplitButton
        label="Register"
        href="/register"
        className="flex-1"
        onClick={() => setMobileOpen(false)}
      />
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
          hideNav ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "shadow-sm" : ""}`}
      >
        <nav className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="hidden xl:flex items-center gap-2 shrink-0"
            >
              <Image
                src="/logo orange.webp"
                alt="Pickmymaid"
                width={200}
                height={54}
                priority
                fetchPriority="high"
                className="h-auto"
              />
            </Link>

            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex xl:hidden items-center gap-2 shrink-0"
            >
              <Image
                src="/logo orange.webp"
                alt="Pickmymaid"
                width={150}
                height={41}
                priority
                fetchPriority="high"
                className="h-auto"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden xl:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname === link.href;
                const linkClassName = `text-sm whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "font-semibold text-dark"
                    : "font-medium text-gray-600 hover:text-primary"
                }`;
                return link.href === "/search" ? (
                  <a key={link.href} href={link.href} className={linkClassName}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Desktop auth */}
              <div className="hidden md:flex items-center justify-end shrink-0">
                {desktopAuth}
              </div>

              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen(true)}
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-dark" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-white flex flex-col xl:hidden"
          >
            {/* Drawer header */}
            <motion.div
              variants={drawerHeaderVariants}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <Link
                href="/"
                onClick={(e) => {
                  handleLogoClick(e);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <Image
                  src="/logo orange.webp"
                  alt="Pickmymaid"
                  width={150}
                  height={41}
                  priority
                  fetchPriority="high"
                  className="h-auto"
                />
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-dark" />
              </button>
            </motion.div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              {navLinks.map((link) =>
                link.href === "/search" ? (
                  <motion.a
                    key={link.href}
                    variants={navItemVariants}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-dark hover:text-primary hover:bg-primary-50 px-4 py-3 rounded-xl transition-all duration-200"
                  >
                    <link.icon className="w-6 h-6 text-muted shrink-0" strokeWidth={1.75} />
                    {link.label}
                  </motion.a>
                ) : (
                  <motion.div key={link.href} variants={navItemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-dark hover:text-primary hover:bg-primary-50 px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      <link.icon className="w-6 h-6 text-muted shrink-0" strokeWidth={1.75} />
                      {link.label}
                    </Link>
                  </motion.div>
                ),
              )}
            </nav>

            {/* Auth section */}
            <motion.div variants={navItemVariants}>{mobileAuth}</motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
