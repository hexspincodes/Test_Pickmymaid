"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { registerCustomer, verifyRegistrationOtp, loginCustomer, ApiError, NetworkError } from "@/lib/api";
import { SplitButton } from "@/components/ui/SplitButton";
import { OtpInput } from "@/components/ui/OtpInput";
import { JobSeekerForm } from "@/components/auth/JobSeekerForm";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { findCountryByCode } from "@/lib/countries";

/* ─── Constants ─────────────────────────────────────────────── */

const EMIRATES = [
  "Abu Dhabi",
  "Al Ain",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaima",
  "Fujairah",
];

const POSITIONS = [
  "Nanny",
  "Maid",
  "Caregiver",
  "Private Nurse",
  "Private Tutor",
  "Postpartum Care",
  "Cook",
];

/* ─── Types ──────────────────────────────────────────────────── */

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  country_code: string; // ISO code, e.g. "AE" — several countries share a dialing code
  mobile: string;
  emirate_of_residence: string;
  position_required: string;
}

/* ─── RegisterPage ───────────────────────────────────────────── */

export function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const rawReturn = searchParams.get("returnTo") ?? "";
  // The chosen form lives in the URL (?as=customer|job) so the navbar
  // "Register" link (/register) always lands on the chooser and browser Back
  // returns to it. Visitors sent from a hire/contact/pricing CTA (?returnTo=)
  // are clearly customers, so they go straight to the customer form.
  const asParam = searchParams.get("as");
  const view: "choose" | "customer" | "job" =
    asParam === "job"
      ? "job"
      : asParam === "customer" || rawReturn
        ? "customer"
        : "choose";
  const returnTo = rawReturn.startsWith("/") && !rawReturn.startsWith("//") ? rawReturn : "/pricing";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Registration is two steps: submit details -> email OTP, then confirm the
  // OTP to actually create the account. `pendingRegistration` holds what was
  // submitted so "Resend OTP" and the final setAuth() call can reuse it.
  const [step, setStep] = useState<"form" | "otp">("form");
  const [pendingRegistration, setPendingRegistration] = useState<{
    body: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      emirate_of_residence: string;
      position_required: string;
      phone: string;
    };
    fullName: string;
  } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { country_code: "AE" },
  });

  const emailField = register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const nameParts = data.name.trim().split(/\s+/);
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ") || nameParts[0];
    const body = {
      first_name,
      last_name,
      email: data.email.trim().toLowerCase(),
      password: data.password,
      emirate_of_residence: data.emirate_of_residence,
      position_required: data.position_required,
      phone: `${findCountryByCode(data.country_code)?.dial ?? "+971"}${data.mobile}`,
    };

    try {
      await registerCustomer(body);
      setPendingRegistration({ body, fullName: data.name.trim() });
      setOtp("");
      setStep("otp");
      toast.success(`OTP sent to ${data.email}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        setServerError(
          "We couldn't reach our servers — this can happen on mobile data. Please check your signal or switch to Wi-Fi, then try again."
        );
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Registration failed. Please try again.");
      }
    }
  }

  async function onVerifyOtp() {
    if (!pendingRegistration) return;
    setServerError(null);
    setOtpSubmitting(true);
    try {
      const res = await verifyRegistrationOtp({
        email: pendingRegistration.body.email,
        otp,
      });
      // OTP verification doesn't open a server session, so authenticated
      // calls like create-payment would 401. Log in to get the session cookie.
      try {
        await loginCustomer({
          email: pendingRegistration.body.email,
          password: pendingRegistration.body.password,
        });
      } catch {
        // Account is created; payment flow will prompt a re-login if needed.
      }
      setAuth({
        id: res.data._id,
        email: res.data.email,
        name: pendingRegistration.fullName,
        isSubscribed: false,
      });
      toast.success("Account created! Welcome to Pickmymaid.");
      const separator = returnTo.includes("?") ? "&" : "?";
      router.push(`${returnTo}${separator}registered=1#plans`);
    } catch (err) {
      if (err instanceof NetworkError) {
        setServerError(
          "We couldn't reach our servers — this can happen on mobile data. Please check your signal or switch to Wi-Fi, then try again."
        );
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Verification failed. Please try again.");
      }
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function onResendOtp() {
    if (!pendingRegistration) return;
    setServerError(null);
    setResending(true);
    try {
      await registerCustomer(pendingRegistration.body);
      toast.success(`OTP sent to ${pendingRegistration.body.email}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        setServerError(
          "We couldn't reach our servers — this can happen on mobile data. Please check your signal or switch to Wi-Fi, then try again."
        );
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Couldn't resend OTP. Please try again.");
      }
    } finally {
      setResending(false);
    }
  }

  const inputCls = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border text-dark text-sm outline-none transition-colors ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-gray-200 bg-white focus:border-primary"
    }`;

  if (view === "job") {
    return <JobSeekerForm onBack={() => router.push("/register")} />;
  }

  if (view === "choose") {
    return (
      <div className="bg-white min-h-screen py-26 lg:py-32 px-4">
        <h1 className="text-[26px] lg:text-[32px] font-semibold text-dark text-center tracking-[-0.5px]">
          Let&rsquo;s get started. Choose an option.
        </h1>

        <div className="mt-12 lg:mt-16 max-w-247.5 mx-auto grid md:grid-cols-2 gap-8 lg:gap-x-47.5 items-center">
          <ChoiceCard
            watermark="FAMILY"
            image={
              <Image
                src="/images/register/family.webp"
                alt="Family looking for a nanny or maid"
                width={370}
                height={338}
                className="h-42.5 w-auto mix-blend-multiply"
              />
            }
            title="I’m looking for a Nanny or Maid"
            description="Search & contact hundreds of qualified nannies and maids ready to join in the UAE."
            cta={
              <Link href="/register?as=customer" className={choiceBtnCls}>
                Find Nannies
              </Link>
            }
          />
          <ChoiceCard
            watermark="NANNY"
            image={
              <Image
                src="/images/home/hero-maid.webp"
                alt="Domestic worker looking for a job"
                width={1200}
                height={1200}
                className="h-53 w-auto"
              />
            }
            title="I’m looking for a job"
            description="Create your account for FREE and get matched with amazing families near you."
            cta={
              <Link href="/register?as=job" className={choiceBtnCls}>
                Find Jobs
              </Link>
            }
          />
        </div>

        <div className="mt-12 flex justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 rounded-2xl bg-primary-50 border border-primary-100 px-6 py-4">
            <p className="text-base font-semibold text-dark">
              Already have an account?
            </p>
            <Link
              href="/login"
              className="px-7 py-2.5 rounded-full bg-dark text-white text-[15px] font-semibold hover:bg-primary transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center py-26 px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-4">
        {/* ── Left panel — image only (desktop) ── */}
        <div className="hidden lg:block relative rounded-3xl overflow-hidden min-h-160">
          <Image
            src="/images/others/register-banner.webp"
            alt="Find trusted domestic help in UAE"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 0px, 50vw"
            priority
          />
          {/* Subtle gradient overlay for branding */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white font-bold text-xl">Pickmymaid</p>
            <p className="text-white/80 text-sm mt-1">
              Trusted domestic help across all 7 Emirates.
            </p>
          </div>
        </div>

        {/* ── Right form card ── */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 flex flex-col">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-dark tracking-[-0.5px]">
              {step === "otp" ? "Verify Your Email" : "Free Registration"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {step === "otp"
                ? `Enter the 6-digit code we sent to ${pendingRegistration?.body.email}.`
                : "Fill in your details below and get instant access to verified candidates."}
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          {step === "otp" ? (
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-dark">
                  6-Digit OTP
                </label>
                <OtpInput value={otp} onChange={setOtp} disabled={otpSubmitting} />
              </div>

              <button
                type="button"
                disabled={otpSubmitting || otp.length !== 6}
                onClick={onVerifyOtp}
                className="mt-1 w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm tracking-wide hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {otpSubmitting ? "Verifying…" : "Verify & Create Account"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setServerError(null);
                  }}
                  className="text-muted hover:text-dark transition-colors"
                >
                  ← Back to edit details
                </button>
                <button
                  type="button"
                  disabled={resending}
                  onClick={onResendOtp}
                  className="text-primary font-semibold hover:text-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resending ? "Sending…" : "Resend OTP"}
                </button>
              </div>
            </div>
          ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 flex-1"
            noValidate
          >
            <div className="flex flex-col lg:flex-row gap-1.5 w-full">
              {/* Full Name */}
              <div className="flex flex-col flex-1 gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-dark">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  autoComplete="name"
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  className={inputCls(!!errors.name)}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col flex-1 gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-dark"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  {...emailField}
                  onChange={(e) => {
                    // Lowercase only — typed, pasted or autofilled.
                    e.target.value = e.target.value.toLowerCase();
                    return emailField.onChange(e);
                  }}
                  className={inputCls(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-dark"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`${inputCls(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm_password"
                className="text-sm font-medium text-dark"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  className={`${inputCls(!!errors.confirm_password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-xs text-red-500">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mobile" className="text-sm font-medium text-dark">
                Mobile Number
              </label>
              <div
                className={`flex rounded-xl border transition-colors ${
                  errors.mobile
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white"
                } focus-within:border-primary`}
              >
                {/* Country code */}
                <div className="shrink-0 border-r border-gray-200">
                  <Controller
                    control={control}
                    name="country_code"
                    render={({ field }) => (
                      <CountrySelect
                        mode="dial"
                        value={field.value}
                        onChange={field.onChange}
                        ariaLabel="Country code"
                      />
                    )}
                  />
                </div>
                {/* Phone input */}
                <input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  autoComplete="tel-national"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9\s\-]{7,15}$/,
                      message: "Enter a valid mobile number",
                    },
                  })}
                  className="flex-1 px-3 py-3 text-sm text-dark bg-transparent outline-none placeholder:text-muted"
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-red-500">{errors.mobile.message}</p>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-1.5 w-full">
              {/* Emirate */}
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor="emirate_of_residence"
                  className="text-sm font-medium text-dark"
                >
                  Emirate of Residence
                </label>
                <div className="relative">
                  <select
                    id="emirate_of_residence"
                    {...register("emirate_of_residence", {
                      required: "Please select your emirate",
                    })}
                    className={`${inputCls(!!errors.emirate_of_residence)} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Select your emirate</option>
                    {EMIRATES.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    strokeWidth={2}
                  />
                </div>
                {errors.emirate_of_residence && (
                  <p className="text-xs text-red-500">
                    {errors.emirate_of_residence.message}
                  </p>
                )}
              </div>

              {/* Position */}
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor="position_required"
                  className="text-sm font-medium text-dark"
                >
                  What Are You Looking For
                </label>
                <div className="relative">
                  <select
                    id="position_required"
                    {...register("position_required", {
                      required: "Please select a position",
                    })}
                    className={`${inputCls(!!errors.position_required)} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="">Select Service</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                    strokeWidth={2}
                  />
                </div>
                {errors.position_required && (
                  <p className="text-xs text-red-500">
                    {errors.position_required.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="mx-auto mt-2 w-full flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm tracking-wide hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Sending OTP…" : "Register"}
              </button>
              <Link
                href="/register"
                onClick={() => setServerError(null)}
                className="text-sm text-muted hover:text-dark transition-colors self-start"
              >
                ← Back
              </Link>
            </div>
          </form>
          )}

          {/* Footer */}
          <p className="text-sm text-muted text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:text-primary-600 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Choice card (register type picker) ────────────────────── */

const choiceBtnCls =
  "inline-block mt-5 px-7.5 py-2.5 rounded-full bg-primary/85 text-white text-[15px] font-medium shadow-[0_8px_16px_rgba(255,116,66,0.3)] hover:bg-primary transition-colors cursor-pointer";

function ChoiceCard({
  watermark,
  image,
  title,
  description,
  cta,
}: {
  watermark: string;
  image: React.ReactNode;
  title: string;
  description: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-100 mx-auto rounded-3xl border border-gray-300/70 bg-white overflow-hidden">
      <div className="relative h-53 flex justify-center items-end border-b border-gray-300/70 overflow-hidden">
        <span
          className="absolute top-6 inset-x-0 text-center text-[64px] sm:text-[80px] font-extrabold leading-none tracking-wide text-[#F2F2F2] select-none"
          aria-hidden="true"
        >
          {watermark}
        </span>
        <div className="relative">{image}</div>
      </div>
      <div className="px-8 sm:px-10 pt-6 pb-6">
        <h2 className="text-[22px] font-bold text-dark leading-snug tracking-[-0.3px]">
          {title}
        </h2>
        <p className="mt-2.5 text-[15px] text-dark/80 leading-relaxed">
          {description}
        </p>
        {cta}
      </div>
    </div>
  );
}
