"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { loginCustomer, verifyAuth, getPaymentDetails, ApiError, NetworkError } from "@/lib/api";

/* ─── OAuth endpoints ────────────────────────────────────────
   TODO: confirm exact paths with backend team                */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.backendpickmymaid.site/api";
const GOOGLE_URL = `${API_BASE}/v2/auth/google`;
const APPLE_URL  = `${API_BASE}/v2/auth/apple`;

/* ─── Types ─────────────────────────────────────────────────── */

interface EmailForm { email: string; password: string }

/* ─── SVG Icons ─────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/* ─── Method button ──────────────────────────────────────────── */

function MethodButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-dark"
    >
      {icon}
      <span className="flex-1 text-center">{label}</span>
    </button>
  );
}

/* ─── LoginPage ─────────────────────────────────────────────── */

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const rawReturn = searchParams.get("returnTo") ?? "";
  // Sanitise: only allow relative paths to prevent open redirect
  const returnTo = rawReturn.startsWith("/") && !rawReturn.startsWith("//") ? rawReturn : "/pricing#plans";

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>();

  /* ── OAuth handlers ──
     The backend stores this in a session cookie and redirects the
     browser straight to it after the provider callback, so it must be
     an absolute URL — a relative path resolves against api.backendpickmymaid.site
     instead of this site. */
  function handleGoogle() {
    const redirect = `${window.location.origin}${returnTo}`;
    window.location.href = `${GOOGLE_URL}?redirect=${encodeURIComponent(redirect)}`;
  }
  function handleApple() {
    const redirect = `${window.location.origin}${returnTo}`;
    window.location.href = `${APPLE_URL}?redirect=${encodeURIComponent(redirect)}`;
  }

  /* ── Email submit ── */
  async function onSubmit(data: EmailForm) {
    setServerError(null);
    try {
      await loginCustomer({ email: data.email, password: data.password });
      const verify = await verifyAuth();
      const u = verify.data.user;

      let isSubscribed = false;
      let subscriptionTier: "basic" | "standard" | "premium" | "starter" | undefined;
      const TIER_MAP = ["basic", "standard", "premium", "starter"] as const;
      try {
        const payment = await getPaymentDetails();
        if (payment.data?.user?.status === 1) {
          isSubscribed = true;
          subscriptionTier = TIER_MAP[payment.data.user.type];
        }
      } catch {
        // Not subscribed or endpoint unavailable — defaults remain
      }

      setAuth({
        id: u.user_id,
        email: u.email,
        name: [u.first_name, u.last_name].filter(Boolean).join(" "),
        isSubscribed,
        subscriptionTier,
        profile: u.profile || undefined,
      });
      toast.success("Welcome back!");

      const raw = sessionStorage.getItem("pmm-pending-hire");
      const pending = raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
      if (pending && isSubscribed) {
        sessionStorage.removeItem("pmm-pending-hire");
        router.push(`/maid/${pending.id}`);
      } else {
        router.push(returnTo);
      }
    } catch (err) {
      if (err instanceof NetworkError || err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-dark text-sm outline-none transition-colors ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-white focus:border-primary"
    }`;

  return (
    <div className=" bg-[#F5F5F5] min-h-screen flex items-center justify-center py-26 px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-4">

        {/* ── Left panel — image (desktop only) ── */}
        <div className="hidden lg:block relative rounded-3xl overflow-hidden min-h-160">
          <Image
            src="/images/others/register-banner.webp"
            alt="Find trusted domestic help in UAE"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 0px, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white font-bold text-xl">Pickmymaid</p>
            <p className="text-white/80 text-sm mt-1">
              Trusted domestic help across all 7 Emirates.
            </p>
          </div>
        </div>

        {/* ── Right form card ── */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 flex flex-col justify-between min-h-[520px]">

          {/* Header */}
          <div>
            <div className="mb-8">
              <p className="text-primary font-bold text-lg mb-1 lg:hidden">Pickmymaid</p>
              <h1 className="text-2xl font-bold text-dark tracking-[-0.5px]">
                Login to your account
              </h1>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Select a payment plan after login to access maid contact details.
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                {serverError}
              </div>
            )}

            {/* ── Email form ── */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-dark">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="sarah@example.com"
                  autoComplete="email"
                  autoFocus
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-dark">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`${inputCls(!!errors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                      : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm tracking-wide hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Logging in…" : "Log In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-muted font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* ── OAuth methods ── */}
            <div className="flex flex-col gap-3">
              <MethodButton
                icon={<GoogleIcon />}
                label="Continue with Google"
                onClick={handleGoogle}
              />
              <MethodButton
                icon={<AppleIcon />}
                label="Continue with Apple"
                onClick={handleApple}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 mt-8">
            <p className="text-sm text-muted text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:text-primary-600 transition-colors"
              >
                Register
              </Link>
            </p>
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-dark font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
