"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldPath,
  type UseFormRegisterReturn,
} from "react-hook-form";
import {
  Briefcase,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  ImagePlus,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { registerJobSeeker, getSkills, ApiError, NetworkError } from "@/lib/api";
import { DEFAULT_YOUTUBE_LINK } from "@/lib/youtube";
import { findCountryByCode } from "@/lib/countries";
import {
  DAYS_OFF,
  EDUCATION,
  LANGUAGE_LEVELS,
  LANGUAGES,
  LIVE_OPTIONS,
  LOCATIONS,
  MARITAL_STATUSES,
  RELIGIONS,
  SALARIES,
  SERVICES,
  SKILLS,
  VISA_STATUSES,
  optionToSalary,
  type Option,
} from "@/lib/maidFormOptions";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

/* ─── Constants ─────────────────────────────────────────────── */

// The API (and the ingress in front of it) rejects requests over 50 MB in
// total, so every file has its own cap and the sum is checked before upload.
const MB = 1024 * 1024;
const PHOTO_TYPES = ["jpg", "jpeg", "png", "webp"];
const PHOTO_MAX = 5 * MB;
const VIDEO_TYPES = ["mp4", "mov", "webm", "m4v"];
const VIDEO_MAX = 40 * MB;
const DOC_TYPES = ["jpg", "jpeg", "png", "webp", "pdf"];
const TOTAL_MAX = 48 * MB;

// The number part only — the dialing code comes from the country dropdown.
// PhoneInput strips non-digits as the visitor types, so this only checks length.
const PHONE_PATTERN = {
  value: /^[0-9]{6,15}$/,
  message: "Enter 6–15 digits without the country code",
};

// "+971" + "050 123 4567" → "+971501234567" (drops spaces, dashes and the trunk 0).
const withDial = (dial: string, number: string) => {
  const digits = number.replace(/[\s-]/g, "").replace(/^0+/, "");
  return digits ? `${dial}${digits}` : "";
};

const today = () => new Date().toISOString().slice(0, 10);

// Rich-text values are HTML — an editor left blank still holds tags like <p><br></p>.
const hasText = (html: string | undefined) =>
  !!html?.replace(/<[^>]*>|&nbsp;/g, "").trim();

/* ─── Types ──────────────────────────────────────────────────── */

interface LanguageRow {
  name: string;
  read: string;
  write: string;
  speak: string;
}

interface JobRow {
  title: string;
  location: string;
  experiance: string;
  reason_leaving: string;
  job_description: string;
}

// *_code fields hold the ISO country code picked in the phone dropdowns.
interface JobSeekerData {
  // Personal details
  name: string;
  age: string;
  marital_status: string;
  nationality: string;
  location: string;
  religion: string;
  service: string;
  salary: string;
  education: string;
  email: string;
  day_of: string;
  // Contact
  uae_code: string;
  uae_no: string;
  botim_code: string;
  botim_number: string;
  whatsapp_code: string;
  whatsapp_no: string;
  current_location: string;
  // Other details
  available_from: string;
  visa_status: string;
  visa_expire: string;
  skills: string[];
  option: string;
  languages: LanguageRow[];
  // Employment history
  employmentHistory: JobRow[];
  // Additional info
  notes: string;
}

interface Step {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  fields: FieldPath<JobSeekerData>[];
}

// Same tabs, fields and order as the admin panel's Add/Edit Maid form.
const STEPS: Step[] = [
  {
    title: "Personal Details",
    subtitle: "Your photo and basic details",
    icon: User,
    fields: [
      "name",
      "age",
      "marital_status",
      "nationality",
      "location",
      "religion",
      "service",
      "salary",
      "education",
      "email",
      "day_of",
    ],
  },
  {
    title: "Contact",
    subtitle: "How families can reach you",
    icon: Phone,
    fields: ["uae_no", "botim_number", "whatsapp_no", "current_location"],
  },
  {
    title: "Other Details",
    subtitle: "Visa, skills and languages",
    icon: ClipboardList,
    fields: ["available_from", "visa_status", "visa_expire", "skills", "option", "languages"],
  },
  {
    title: "Employment History",
    subtitle: "Your previous jobs",
    icon: Briefcase,
    fields: ["employmentHistory"],
  },
  {
    title: "Additional Info",
    subtitle: "Notes, intro video and documents",
    icon: FileText,
    fields: ["notes"],
  },
];

const fileExt = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";
const formatSize = (bytes: number) =>
  bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

// Returns an error message, or null when the file is acceptable.
function checkFile(file: File, types: string[], maxBytes: number, label: string) {
  if (!types.includes(fileExt(file))) return `${label} must be ${types.join(", ")}`;
  if (file.size > maxBytes) return `${label} must be under ${maxBytes / MB} MB`;
  return null;
}

// Object URL for a local file preview, revoked when the file changes.
function usePreviewUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

/* ─── Small building blocks ─────────────────────────────────── */

const inputCls = (hasError: boolean) =>
  `w-full h-12 px-4 rounded-xl border text-dark text-sm outline-none transition-colors placeholder:text-muted/70 ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary-50"
  }`;

function Field({
  label,
  htmlFor,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-dark">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectInput({
  id,
  registration,
  options,
  placeholder,
  hasError = false,
}: {
  id?: string;
  registration: UseFormRegisterReturn;
  options: Option[];
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        {...registration}
        className={`${inputCls(hasError)} appearance-none pr-10 cursor-pointer`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

// Country flag/dialing-code dropdown joined to a number input.
function PhoneInput({
  id,
  control,
  codeName,
  registration,
  hasError,
}: {
  id: string;
  control: Control<JobSeekerData>;
  codeName: "uae_code" | "botim_code" | "whatsapp_code";
  registration: UseFormRegisterReturn;
  hasError: boolean;
}) {
  return (
    <div
      className={`flex h-12 rounded-xl border transition-colors ${
        hasError
          ? "border-red-400 bg-red-50"
          : "border-gray-200 bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-50"
      }`}
    >
      <div className="shrink-0 border-r border-gray-200">
        <Controller
          control={control}
          name={codeName}
          render={({ field }) => (
            <CountrySelect mode="dial" value={field.value} onChange={field.onChange} ariaLabel="Country code" />
          )}
        />
      </div>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        maxLength={15}
        placeholder="501234567"
        {...registration}
        onChange={(e) => {
          // Digits only — drops letters, spaces and symbols, typed or pasted.
          e.target.value = e.target.value.replace(/\D/g, "");
          return registration.onChange(e);
        }}
        className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-sm text-dark outline-none placeholder:text-muted/70"
      />
    </div>
  );
}

function SectionCard({
  title,
  required,
  action,
  children,
}: {
  title: string;
  required?: boolean;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-dark">
          {title}
          {required && <span className="text-primary"> *</span>}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const smallBtnCls =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-dark hover:border-primary hover:text-primary transition-colors cursor-pointer";

const required = (label: string) => ({ required: `Please select ${label}` });
const requiredText = (label: string) => ({
  validate: (v: string) => !!v?.trim() || `Please enter ${label}`,
});
const requiredRichText = (label: string) => ({
  validate: (v: string) => hasText(v) || `Please enter ${label}`,
});

/* ─── JobSeekerForm ──────────────────────────────────────────── */

// Full-page sign-up for domestic workers looking for a job (/register?as=job).
// Collects the same profile as the admin panel's Add Maid form plus an intro
// video and posts it to /v1/jobfrontend. The profile stays hidden from
// families until an admin approves it.
export function JobSeekerForm({ onBack }: { onBack?: () => void }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const [profile, setProfile] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [docs, setDocs] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  // Set once the visitor tries to leave the current tab, so the message for
  // things outside react-hook-form (files, skills, list rows) shows up live.
  const [stepChecked, setStepChecked] = useState(false);
  // Active skills from the admin panel; the built-in list covers a failed request.
  const [skillOptions, setSkillOptions] = useState<string[]>(SKILLS);

  useEffect(() => {
    let cancelled = false;
    getSkills()
      .then((res) => {
        const names = (res.data?.skills || []).map((s) => s.name);
        if (!cancelled && names.length) setSkillOptions(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const profileUrl = usePreviewUrl(profile);
  const videoUrl = usePreviewUrl(video);
  const topRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    trigger,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobSeekerData>({
    defaultValues: {
      nationality: "",
      uae_code: "AE",
      botim_code: "AE",
      whatsapp_code: "AE",
      skills: [],
      languages: [{ name: "English", read: "0", write: "0", speak: "0" }],
      employmentHistory: [],
      notes: "",
    },
  });

  const languages = useFieldArray({ control, name: "languages" });
  const history = useFieldArray({ control, name: "employmentHistory" });
  const skills = watch("skills");

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Requirements react-hook-form can't express: uploads and list lengths.
  function stepRequirement(index: number): string | null {
    switch (index) {
      case 0:
        return profile ? null : "Please upload a profile photo";
      case 2:
        if (skills.length === 0) return "Please select at least one skill";
        if (languages.fields.length === 0) return "Please add at least one language";
        return null;
      case 3:
        return history.fields.length === 0 ? "Please add at least one previous job" : null;
      case 4:
        if (!video) return "Please upload an introduction video";
        if (docs.length === 0) return "Please add at least one document";
        return null;
      default:
        return null;
    }
  }

  async function validateStep(index: number) {
    const ok = await trigger(STEPS[index].fields);
    return ok && !stepRequirement(index);
  }

  function changeStep(index: number) {
    setStepChecked(false);
    setStep(index);
  }

  async function goNext() {
    setStepChecked(true);
    if (!(await validateStep(step))) return;
    changeStep(Math.min(step + 1, STEPS.length - 1));
    scrollToTop();
  }

  function goBack() {
    setServerError(null);
    if (step === 0) {
      onBack?.();
      return;
    }
    changeStep(step - 1);
    scrollToTop();
  }

  function toggleSkill(skill: string) {
    const list = getValues("skills");
    setValue(
      "skills",
      list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]
    );
  }

  function pickProfile(file: File | undefined) {
    if (!file) return;
    const error = checkFile(file, PHOTO_TYPES, PHOTO_MAX, "Profile photo");
    setFileError(error);
    if (!error) setProfile(file);
  }

  function pickVideo(file: File | undefined) {
    if (!file) return;
    const error = checkFile(file, VIDEO_TYPES, VIDEO_MAX, "Video");
    setFileError(error);
    if (!error) setVideo(file);
  }

  function pickDocs(files: FileList | null) {
    const list = Array.from(files ?? []);
    const bad = list.find((f) => !DOC_TYPES.includes(fileExt(f)));
    if (bad) {
      setFileError(`Documents must be ${DOC_TYPES.join(", ")} — "${bad.name}" is not allowed`);
      return;
    }
    setFileError(null);
    setDocs((prev) => [...prev, ...list]);
  }

  const totalBytes =
    (profile?.size ?? 0) + (video?.size ?? 0) + docs.reduce((n, f) => n + f.size, 0);

  async function onSubmit(data: JobSeekerData) {
    setServerError(null);
    // A photo or row may have been removed after its tab was passed.
    const missing = STEPS.findIndex((_, i) => stepRequirement(i));
    if (missing !== -1) {
      if (missing !== step) changeStep(missing);
      setStepChecked(true);
      scrollToTop();
      return;
    }
    if (totalBytes > TOTAL_MAX) {
      setFileError(
        `Your files add up to ${formatSize(totalBytes)}. Please keep them under ${TOTAL_MAX / MB} MB in total.`
      );
      return;
    }

    const dial = (code: string) => findCountryByCode(code)?.dial ?? "+971";
    const uae = withDial(dial(data.uae_code), data.uae_no);
    const botim = withDial(dial(data.botim_code), data.botim_number);
    const whatsapp = withDial(dial(data.whatsapp_code), data.whatsapp_no);
    const { salary, is_negotiable_salary } = optionToSalary(data.salary);

    const form = new FormData();
    const text: Record<string, string> = {
      name: data.name,
      age: data.age,
      marital_status: data.marital_status,
      nationality: data.nationality,
      location: data.location,
      religion: data.religion,
      service: data.service,
      education: data.education,
      email: data.email,
      date: today(),
      day_of: data.day_of,
      // Like the admin form, `mobile` is the main contact number.
      mobile: uae,
      uae_no: uae,
      botim_number: botim,
      whatsapp_no: whatsapp,
      current_location: data.current_location,
      youtube_link: DEFAULT_YOUTUBE_LINK,
      available_from: data.available_from,
      visa_status: data.visa_status,
      visa_expire: data.visa_expire,
      option: data.option,
      notes: data.notes,
    };
    Object.entries(text).forEach(([key, value]) => {
      const trimmed = value?.trim();
      if (trimmed) form.append(key, trimmed);
    });

    form.append("availability", "true");
    form.append("is_negotiable_salary", String(is_negotiable_salary));
    form.append("salary", JSON.stringify(salary));
    form.append("skills", JSON.stringify(data.skills));
    form.append(
      "language",
      JSON.stringify(
        data.languages
          .filter((l) => l.name)
          .map((l) => ({
            name: l.name,
            read: Number(l.read),
            write: Number(l.write),
            speak: Number(l.speak),
          }))
      )
    );
    form.append(
      "employmentHistory",
      JSON.stringify(
        data.employmentHistory
          .map((j) => ({
            title: j.title.trim(),
            location: j.location.trim(),
            experiance: j.experiance ? Number(j.experiance) : undefined,
            reason_leaving: j.reason_leaving.trim(),
            job_description: j.job_description,
          }))
          .filter((j) => j.title || j.location || j.experiance || j.reason_leaving || j.job_description)
      )
    );

    if (profile) form.append("profile", profile);
    if (video) form.append("video", video);
    docs.forEach((doc) => form.append("wordfiles", doc));

    try {
      await registerJobSeeker(form, setProgress);
      setSubmitted(true);
      scrollToTop();
    } catch (err) {
      if (err instanceof NetworkError) {
        setServerError(
          "We couldn't reach our servers — this can happen on mobile data. Please check your signal or switch to Wi-Fi, then try again."
        );
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Submission failed. Please try again.");
      }
    } finally {
      setProgress(null);
    }
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center py-26 px-4">
        <div ref={topRef} className="w-full max-w-lg bg-white rounded-3xl p-10 text-center">
          <div className="mx-auto w-18 h-18 rounded-full bg-primary-50 flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-primary" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-dark tracking-[-0.5px]">
            Application Received!
          </h1>
          <p className="mt-2 text-sm text-muted leading-6">
            Thank you! Our team will review your profile and get in touch with
            you shortly about jobs with families that match you.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex px-7 py-3 rounded-full bg-dark text-white text-sm font-semibold hover:bg-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="bg-[#F5F5F5] min-h-screen pt-24 lg:pt-28 pb-16 px-4">
      <div ref={topRef} className="mx-auto max-w-6xl scroll-mt-28">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-dark px-6 py-8 lg:px-12 lg:py-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid lg:grid-cols-[1fr_auto] items-center gap-6">
            <div>
              <h1 className="text-[28px] lg:text-[40px] font-bold leading-tight text-white tracking-[-0.5px]">
                Find your next job with <span className="text-primary">Pickmymaid</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm lg:text-base text-white/70">
                Build your profile once and get matched with trusted families
                across all 7 Emirates.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verified families
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Takes about 5 minutes
                </span>
                <span className="inline-flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" /> Stand out with a video
                </span>
              </div>
            </div>
            <div className="hidden lg:block relative h-52 w-52 rounded-full bg-primary/20">
              <Image
                src="/images/home/hero-maid.webp"
                alt="Domestic worker looking for a job"
                fill
                sizes="208px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {/* Form card */}
          <div className="min-w-0 rounded-3xl bg-white p-6 lg:p-10">
            {/* Progress — "Step 1 of 5 · Personal Details" over a filling bar */}
            <div className="mb-7">
              <h2 className="text-lg lg:text-xl font-normal text-dark/80 tracking-[-0.25px]">
                Step {step + 1} of {STEPS.length} ·{" "}
                <span className="font-bold text-primary">{current.title}</span>
              </h2>
              <div
                role="progressbar"
                aria-label="Application progress"
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-valuenow={step + 1}
                aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${current.title}`}
                className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-sm text-muted">{current.subtitle}</p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                {serverError}
              </div>
            )}

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (isLast) {
                  setStepChecked(true);
                  handleSubmit(onSubmit)();
                } else goNext();
              }}
            >
              {/* ── Tab 1: Personal Details ── */}
              {step === 0 && (
                <div className="flex flex-col gap-6">
                  {/* Profile photo */}
                  <div className="flex items-center gap-5">
                    <label className="relative flex h-44 w-44 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAFAFA] text-center hover:border-primary transition-colors">
                      {profileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileUrl} alt="Profile preview" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-7 w-7 text-primary" />
                      )}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="sr-only"
                        aria-label="Profile photo"
                        onChange={(e) => {
                          pickProfile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <div>
                      <p className="text-sm font-semibold text-dark">
                        Profile<span className="text-primary"> *</span>
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        A clear, smiling photo of your face. JPG, PNG or WEBP, max 5 MB.
                      </p>
                      {profile && (
                        <button
                          type="button"
                          onClick={() => setProfile(null)}
                          className="mt-1.5 text-xs font-semibold text-muted hover:text-red-500 cursor-pointer"
                        >
                          Remove photo
                        </button>
                      )}
                      {fileError && step === 0 && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Name" htmlFor="job_name" required error={errors.name?.message}>
                      <input
                        id="job_name"
                        type="text"
                        placeholder="Name"
                        autoComplete="name"
                        {...register("name", {
                          required: "Please enter the name",
                          minLength: { value: 3, message: "Name must be at least 3 characters" },
                        })}
                        className={inputCls(!!errors.name)}
                      />
                    </Field>
                    <Field label="Age" htmlFor="job_age" required error={errors.age?.message}>
                      <input
                        id="job_age"
                        type="number"
                        inputMode="numeric"
                        placeholder="Age"
                        {...register("age", {
                          required: "Please enter the age",
                          min: { value: 18, message: "You must be at least 18" },
                          max: { value: 70, message: "Enter a valid age" },
                        })}
                        className={inputCls(!!errors.age)}
                      />
                    </Field>
                    <Field label="Marital Status" htmlFor="job_marital_status" required error={errors.marital_status?.message}>
                      <SelectInput
                        id="job_marital_status"
                        registration={register("marital_status", required("marital status"))}
                        options={MARITAL_STATUSES}
                        placeholder="Select Marital Status"
                        hasError={!!errors.marital_status}
                      />
                    </Field>
                    <Field label="Nationality" htmlFor="job_nationality" required error={errors.nationality?.message}>
                      <Controller
                        control={control}
                        name="nationality"
                        rules={required("nationality")}
                        render={({ field }) => (
                          <CountrySelect
                            id="job_nationality"
                            mode="name"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Nationality"
                            hasError={!!errors.nationality}
                          />
                        )}
                      />
                    </Field>
                    <Field label="Location" htmlFor="job_location" required error={errors.location?.message}>
                      <SelectInput
                        id="job_location"
                        registration={register("location", required("location"))}
                        options={LOCATIONS}
                        placeholder="Select Location"
                        hasError={!!errors.location}
                      />
                    </Field>
                    <Field label="Religion" htmlFor="job_religion" required error={errors.religion?.message}>
                      <SelectInput
                        id="job_religion"
                        registration={register("religion", required("religion"))}
                        options={RELIGIONS}
                        placeholder="Select Religion"
                        hasError={!!errors.religion}
                      />
                    </Field>
                    <Field label="Service" htmlFor="job_service" required error={errors.service?.message}>
                      <SelectInput
                        id="job_service"
                        registration={register("service", required("service"))}
                        options={SERVICES}
                        placeholder="Select Service"
                        hasError={!!errors.service}
                      />
                    </Field>
                    <Field label="Salary (AED / month)" htmlFor="job_salary" required error={errors.salary?.message}>
                      <SelectInput
                        id="job_salary"
                        registration={register("salary", required("salary"))}
                        options={SALARIES}
                        placeholder="Select Salary"
                        hasError={!!errors.salary}
                      />
                    </Field>
                    <Field label="Education" htmlFor="job_education" required error={errors.education?.message}>
                      <SelectInput
                        id="job_education"
                        registration={register("education", required("education"))}
                        options={EDUCATION}
                        placeholder="Select Education"
                        hasError={!!errors.education}
                      />
                    </Field>
                    <Field label="Email" htmlFor="job_email" required error={errors.email?.message}>
                      <input
                        id="job_email"
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        {...register("email", {
                          required: "Please enter the email",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                        className={inputCls(!!errors.email)}
                      />
                    </Field>
                    <Field label="Date" htmlFor="job_date" required>
                      {/* Always today's date (the application date) — set by the server too. */}
                      <input
                        id="job_date"
                        type="date"
                        value={today()}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                        className={`${inputCls(false)} bg-gray-50! text-muted cursor-not-allowed pointer-events-none`}
                      />
                    </Field>
                    <Field label="Day Off" htmlFor="job_day_of" required error={errors.day_of?.message}>
                      <SelectInput
                        id="job_day_of"
                        registration={register("day_of", required("day off"))}
                        options={DAYS_OFF}
                        placeholder="Select Day Off"
                        hasError={!!errors.day_of}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Tab 2: Contact ── */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <p className="rounded-xl bg-primary-50 px-4 py-3 text-xs text-dark">
                    All numbers are required so families and our team can reach you.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="UAE Calling Number" htmlFor="job_uae_no" required error={errors.uae_no?.message}>
                      <PhoneInput
                        id="job_uae_no"
                        control={control}
                        codeName="uae_code"
                        registration={register("uae_no", {
                          ...requiredText("the UAE calling number"),
                          pattern: PHONE_PATTERN,
                        })}
                        hasError={!!errors.uae_no}
                      />
                    </Field>
                    <Field label="Botim Calling Number" htmlFor="job_botim_number" required error={errors.botim_number?.message}>
                      <PhoneInput
                        id="job_botim_number"
                        control={control}
                        codeName="botim_code"
                        registration={register("botim_number", {
                          ...requiredText("the Botim calling number"),
                          pattern: PHONE_PATTERN,
                        })}
                        hasError={!!errors.botim_number}
                      />
                    </Field>
                    <Field label="Whatsapp Number" htmlFor="job_whatsapp_no" required error={errors.whatsapp_no?.message}>
                      <PhoneInput
                        id="job_whatsapp_no"
                        control={control}
                        codeName="whatsapp_code"
                        registration={register("whatsapp_no", {
                          ...requiredText("the Whatsapp number"),
                          pattern: PHONE_PATTERN,
                        })}
                        hasError={!!errors.whatsapp_no}
                      />
                    </Field>
                    <Field label="Current Location" htmlFor="job_current_location" required error={errors.current_location?.message}>
                      <input
                        id="job_current_location"
                        type="text"
                        placeholder="e.g. Al Nahda, Dubai"
                        {...register("current_location", requiredText("the current location"))}
                        className={inputCls(!!errors.current_location)}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Tab 3: Other Details ── */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Available from" htmlFor="job_available_from" required error={errors.available_from?.message}>
                      <input
                        id="job_available_from"
                        type="text"
                        placeholder="e.g. Immediately, 1 November"
                        {...register("available_from", requiredText("when you are available from"))}
                        className={inputCls(!!errors.available_from)}
                      />
                    </Field>
                    <Field label="Visa Status" htmlFor="job_visa_status" required error={errors.visa_status?.message}>
                      <SelectInput
                        id="job_visa_status"
                        registration={register("visa_status", required("visa status"))}
                        options={VISA_STATUSES}
                        placeholder="Select Visa Status"
                        hasError={!!errors.visa_status}
                      />
                    </Field>
                    <Field label="Visa expire" htmlFor="job_visa_expire" required error={errors.visa_expire?.message}>
                      <input
                        id="job_visa_expire"
                        type="date"
                        {...register("visa_expire", required("the visa expiry date"))}
                        className={inputCls(!!errors.visa_expire)}
                      />
                    </Field>
                    <Field label="Options" htmlFor="job_option" required error={errors.option?.message} className="sm:col-span-2">
                      <SelectInput
                        id="job_option"
                        registration={register("option", required("an option"))}
                        options={LIVE_OPTIONS}
                        placeholder="Select Options"
                        hasError={!!errors.option}
                      />
                    </Field>
                  </div>

                  <SectionCard title="Skills" required>
                    <p className="mb-3 text-xs text-gray-500">Select all that apply.</p>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((s) => {
                        const on = skills.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggleSkill(s)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              on
                                ? "border-primary bg-primary text-white"
                                : "border-gray-200 bg-white text-dark hover:border-primary hover:text-primary"
                            }`}
                          >
                            {on ? <Check className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" />}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Languages"
                    required
                    action={
                      <button
                        type="button"
                        onClick={() => languages.append({ name: "", read: "0", write: "0", speak: "0" })}
                        className={smallBtnCls}
                      >
                        <Plus className="h-3 w-3" />
                        {languages.fields.length === 0 ? "Add Language" : "Add Another Language"}
                      </button>
                    }
                  >
                    {languages.fields.length === 0 && (
                      <p className="text-sm text-muted">No languages added.</p>
                    )}
                    <div className="flex flex-col gap-3">
                      {languages.fields.map((f, i) => (
                        <div
                          key={f.id}
                          className="grid grid-cols-3 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-xl bg-white p-3 border border-gray-200"
                        >
                          <Field
                            label="Language"
                            htmlFor={`job_lang_${i}`}
                            required
                            error={errors.languages?.[i]?.name?.message}
                            className="col-span-3 sm:col-span-1"
                          >
                            <SelectInput
                              id={`job_lang_${i}`}
                              registration={register(`languages.${i}.name`, required("a language"))}
                              options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                              placeholder="Select language"
                              hasError={!!errors.languages?.[i]?.name}
                            />
                          </Field>
                          {(["read", "write", "speak"] as const).map((skill) => (
                            <Field
                              key={skill}
                              label={skill[0].toUpperCase() + skill.slice(1)}
                              htmlFor={`job_lang_${i}_${skill}`}
                            >
                              <SelectInput
                                id={`job_lang_${i}_${skill}`}
                                registration={register(`languages.${i}.${skill}`)}
                                options={LANGUAGE_LEVELS.map((l) => ({ value: String(l.value), label: l.label }))}
                              />
                            </Field>
                          ))}
                          <button
                            type="button"
                            onClick={() => languages.remove(i)}
                            aria-label="Remove language"
                            className="col-span-3 sm:col-span-1 h-12 sm:w-12 flex items-center justify-center rounded-xl border border-gray-200 text-muted hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ── Tab 4: Employment History ── */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  {history.fields.length === 0 && (
                    <p className="text-sm text-muted">
                      No employment history added yet. Please add at least one previous job.
                    </p>
                  )}
                  {history.fields.map((f, i) => (
                    <div key={f.id} className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Job {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => history.remove(i)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field
                          label="Title"
                          htmlFor={`job_${i}_title`}
                          required
                          error={errors.employmentHistory?.[i]?.title?.message}
                        >
                          <input
                            id={`job_${i}_title`}
                            type="text"
                            placeholder="e.g. Nanny"
                            {...register(`employmentHistory.${i}.title`, requiredText("the job title"))}
                            className={inputCls(!!errors.employmentHistory?.[i]?.title)}
                          />
                        </Field>
                        <Field
                          label="Location"
                          htmlFor={`job_${i}_location`}
                          required
                          error={errors.employmentHistory?.[i]?.location?.message}
                        >
                          <input
                            id={`job_${i}_location`}
                            type="text"
                            placeholder="e.g. Dubai"
                            {...register(`employmentHistory.${i}.location`, requiredText("the job location"))}
                            className={inputCls(!!errors.employmentHistory?.[i]?.location)}
                          />
                        </Field>
                        <Field
                          label="Duration (years)"
                          htmlFor={`job_${i}_experiance`}
                          required
                          error={errors.employmentHistory?.[i]?.experiance?.message}
                        >
                          <input
                            id={`job_${i}_experiance`}
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            placeholder="e.g. 2"
                            {...register(`employmentHistory.${i}.experiance`, {
                              required: "Please enter the duration",
                              min: { value: 0, message: "Enter a valid duration" },
                            })}
                            className={inputCls(!!errors.employmentHistory?.[i]?.experiance)}
                          />
                        </Field>
                        <Field
                          label="Reason For Leaving"
                          htmlFor={`job_${i}_reason`}
                          required
                          error={errors.employmentHistory?.[i]?.reason_leaving?.message}
                        >
                          <input
                            id={`job_${i}_reason`}
                            type="text"
                            placeholder="e.g. Contract finished"
                            {...register(`employmentHistory.${i}.reason_leaving`, requiredText("the reason for leaving"))}
                            className={inputCls(!!errors.employmentHistory?.[i]?.reason_leaving)}
                          />
                        </Field>
                        <Field
                          label="Job Description"
                          htmlFor={`job_${i}_description`}
                          required
                          error={errors.employmentHistory?.[i]?.job_description?.message}
                          className="sm:col-span-2"
                        >
                          <Controller
                            control={control}
                            name={`employmentHistory.${i}.job_description`}
                            rules={requiredRichText("the job description")}
                            render={({ field }) => (
                              <RichTextEditor
                                id={`job_${i}_description`}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="What did you do in this job?"
                                minHeight={120}
                              />
                            )}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      history.append({
                        title: "",
                        location: "",
                        experiance: "",
                        reason_leaving: "",
                        job_description: "",
                      })
                    }
                    className={`${smallBtnCls} self-start`}
                  >
                    <Plus className="h-3 w-3" />
                    {history.fields.length === 0 ? "Add Employment History" : "Add New Employment History"}
                  </button>
                </div>
              )}

              {/* ── Tab 5: Additional Info ── */}
              {step === 4 && (
                <div className="flex flex-col gap-6">
                  <Field label="Notes" htmlFor="job_notes" required error={errors.notes?.message}>
                    <Controller
                      control={control}
                      name="notes"
                      rules={requiredRichText("a few notes about yourself")}
                      render={({ field }) => (
                        <RichTextEditor
                          id="job_notes"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Tell families about yourself, your strengths and the job you're looking for."
                          minHeight={180}
                        />
                      )}
                    />
                  </Field>

                  {/* Intro video */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-dark">
                      Introduction Video<span className="text-primary"> *</span>
                    </span>
                    {videoUrl ? (
                      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-black">
                        <video src={videoUrl} controls playsInline preload="metadata" className="aspect-square w-full object-cover" />
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAFAFA] px-6 py-10 text-center hover:border-primary transition-colors">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                          <Video className="h-7 w-7 text-primary" />
                        </span>
                        <span className="mt-3 text-sm font-semibold text-dark">Upload a short intro video</span>
                        <span className="mt-1 max-w-sm text-xs text-muted">
                          Say hello, your name, your experience and the job you want.
                          MP4, MOV, WEBM · max 40 MB.
                        </span>
                        <input
                          type="file"
                          accept=".mp4,.mov,.webm,.m4v,video/mp4,video/quicktime,video/webm"
                          className="sr-only"
                          onChange={(e) => {
                            pickVideo(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                    {video && (
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span className="truncate">
                          {video.name} · {formatSize(video.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVideo(null)}
                          className="shrink-0 font-semibold hover:text-red-500 cursor-pointer"
                        >
                          Remove video
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <SectionCard
                    title="Add Documents"
                    required
                    action={
                      <label className={smallBtnCls}>
                        <Plus className="h-3 w-3" /> Add Files
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp,.pdf"
                          className="sr-only"
                          onChange={(e) => {
                            pickDocs(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    }
                  >
                    {docs.length === 0 ? (
                      <p className="text-sm text-muted">
                        Passport, visa, certificates or reference letters — PDF or images.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {docs.map((d, i) => (
                          <li
                            key={`${d.name}-${i}`}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="flex-1 truncate text-sm text-dark">{d.name}</span>
                            <span className="text-xs text-muted">{formatSize(d.size)}</span>
                            <button
                              type="button"
                              onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))}
                              aria-label={`Remove ${d.name}`}
                              className="text-muted hover:text-red-500 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>

                  {fileError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {fileError}
                    </div>
                  )}

                  <p className="text-xs text-muted">
                    Total upload size: {formatSize(totalBytes)} of {TOTAL_MAX / MB} MB. Your
                    profile will be visible to families after our team reviews it.
                  </p>
                </div>
              )}

              {stepChecked && stepRequirement(step) && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {stepRequirement(step)}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-sm font-semibold text-muted hover:text-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLast ? (
                    isSubmitting ? (
                      progress !== null && progress < 100 ? `Uploading… ${progress}%` : "Submitting…"
                    ) : (
                      "Submit Application"
                    )
                  ) : (
                    <>
                      Continue <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
