"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { registerCustomer, verifyRegistrationOtp, ApiError, NetworkError } from "@/lib/api";
import { SplitButton } from "@/components/ui/SplitButton";
import { OtpInput } from "@/components/ui/OtpInput";

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

const COUNTRY_CODES = [
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+1268", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+1242", flag: "🇧🇸", name: "Bahamas" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+1246", flag: "🇧🇧", name: "Barbados" },
  { code: "+375", flag: "🇧🇾", name: "Belarus" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+501", flag: "🇧🇿", name: "Belize" },
  { code: "+229", flag: "🇧🇯", name: "Benin" },
  { code: "+975", flag: "🇧🇹", name: "Bhutan" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+387", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "+267", flag: "🇧🇼", name: "Botswana" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+238", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+269", flag: "🇰🇲", name: "Comoros" },
  { code: "+243", flag: "🇨🇩", name: "Congo (DRC)" },
  { code: "+242", flag: "🇨🇬", name: "Congo (Republic)" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "+53", flag: "🇨🇺", name: "Cuba" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "+1767", flag: "🇩🇲", name: "Dominica" },
  { code: "+1809", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+268", flag: "🇸🇿", name: "Eswatini" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+679", flag: "🇫🇯", name: "Fiji" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+1473", flag: "🇬🇩", name: "Grenada" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+509", flag: "🇭🇹", name: "Haiti" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+354", flag: "🇮🇸", name: "Iceland" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+225", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "+1876", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+7", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+686", flag: "🇰🇮", name: "Kiribati" },
  { code: "+383", flag: "🇽🇰", name: "Kosovo" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+266", flag: "🇱🇸", name: "Lesotho" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+218", flag: "🇱🇾", name: "Libya" },
  { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+853", flag: "🇲🇴", name: "Macau" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+960", flag: "🇲🇻", name: "Maldives" },
  { code: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "+356", flag: "🇲🇹", name: "Malta" },
  { code: "+222", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+373", flag: "🇲🇩", name: "Moldova" },
  { code: "+377", flag: "🇲🇨", name: "Monaco" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia" },
  { code: "+382", flag: "🇲🇪", name: "Montenegro" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+674", flag: "🇳🇷", name: "Nauru" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+850", flag: "🇰🇵", name: "North Korea" },
  { code: "+389", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+680", flag: "🇵🇼", name: "Palau" },
  { code: "+970", flag: "🇵🇸", name: "Palestine" },
  { code: "+507", flag: "🇵🇦", name: "Panama" },
  { code: "+675", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+1758", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+685", flag: "🇼🇸", name: "Samoa" },
  { code: "+378", flag: "🇸🇲", name: "San Marino" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+381", flag: "🇷🇸", name: "Serbia" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+421", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia" },
  { code: "+677", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+211", flag: "🇸🇸", name: "South Sudan" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+597", flag: "🇸🇷", name: "Suriname" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+963", flag: "🇸🇾", name: "Syria" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "+992", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+670", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+676", flag: "🇹🇴", name: "Tonga" },
  { code: "+1868", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+688", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+379", flag: "🇻🇦", name: "Vatican City" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
];

/* ─── Types ──────────────────────────────────────────────────── */

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  country_code: string;
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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { country_code: "+971" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const nameParts = data.name.trim().split(/\s+/);
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(" ") || nameParts[0];
    const body = {
      first_name,
      last_name,
      email: data.email,
      password: data.password,
      emirate_of_residence: data.emirate_of_residence,
      position_required: data.position_required,
      phone: `${data.country_code}${data.mobile}`,
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
                className={`flex rounded-xl border overflow-hidden transition-colors ${
                  errors.mobile
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white"
                } focus-within:border-primary`}
              >
                {/* Country code */}
                <div className="relative shrink-0 border-r border-gray-200">
                  <select
                    {...register("country_code")}
                    className="h-full pl-3 pr-7 py-3 text-sm text-dark bg-transparent appearance-none outline-none cursor-pointer"
                    aria-label="Country code"
                  >
                    {COUNTRY_CODES.map(({ code, flag, name }) => (
                      <option key={`${code}-${name}`} value={code}>
                        {flag} {code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
                    strokeWidth={2}
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
            <div className="mx-auto mt-2 w-full">
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm tracking-wide hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Sending OTP…" : "Register"}
              </button>
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
