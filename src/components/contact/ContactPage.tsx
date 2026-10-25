"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChevronsRight, Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { createContact } from "@/lib/api";
import { findCountryByCode } from "@/lib/countries";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { SplitButton } from "@/components/ui/SplitButton";
import { WhatsAppIcon } from "@/components/icons/Whatsapp";

const PHONE_DISPLAY = "+971 56 636 9736";
const PHONE_DIGITS = "971566369736";

const CONTACT_INFO = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Call us",
    value: PHONE_DISPLAY,
    href: `tel:+${PHONE_DIGITS}`,
  },
  {
    icon: <WhatsAppIcon className="w-5 h-5" />,
    label: "WhatsApp",
    value: PHONE_DISPLAY,
    href: `https://wa.me/${PHONE_DIGITS}`,
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: "support@pickmymaid.com",
    href: "mailto:support@pickmymaid.com",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Office",
    value: "The Iridium Building, Al Barsha, Dubai, United Arab Emirates",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "Opening hours",
    value: "Monday to Sunday, 9:00 AM – 10:00 PM",
  },
];

interface ContactForm {
  name: string;
  country_code: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

function FormField({
  label,
  htmlFor,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-dark tracking-[0.25px]">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full h-12 px-4 rounded-xl border text-dark text-sm outline-none transition-colors placeholder:text-muted/70 ${
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary-50"
  }`;

function InfoRow({
  icon,
  label,
  value,
  href,
}: (typeof CONTACT_INFO)[number]) {
  const content = (
    <>
      <span className="w-11 h-11 shrink-0 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-white/75 leading-none mb-1.5 tracking-[0.5px]">
          {label}
        </span>
        <span className="block text-[15px] sm:text-base font-semibold text-white leading-snug tracking-[0.25px] wrap-anywhere">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex items-center gap-4 -m-2 p-2 rounded-2xl transition-colors hover:bg-white/10 active:bg-white/15"
      >
        {content}
      </a>
    );
  }
  return <div className="flex items-center gap-4">{content}</div>;
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ defaultValues: { country_code: "AE" } });

  const phoneField = register("phone", {
    required: "Phone number is required",
    pattern: { value: /^\d{7,15}$/, message: "Enter a valid phone number" },
  });

  async function onSubmit(data: ContactForm) {
    try {
      await createContact({
        name: data.name,
        email: data.email,
        mobile: (findCountryByCode(data.country_code)?.dial ?? "+971") + data.phone,
        subject: data.subject,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Could not send your message. Please try again.");
    }
  }

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-26 lg:py-25">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-8 lg:mb-12 max-w-2xl">
          <div className="flex items-center gap-1 text-muted">
            <ChevronsRight className="w-5 h-5" />
            <span className="text-lg font-medium">Contact Us</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-dark leading-tight">
            We&apos;re here to help you hire with confidence
          </h1>
          <p className="text-base text-muted leading-6 tracking-[0.25px]">
            Questions about a profile, a package or your account? Message us and
            our team will get back to you, usually within a few hours.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-2 lg:p-3 shadow-[0px_19px_40px_0px_rgba(0,0,0,0.05)] grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-2 lg:gap-3">
          {/* ── Orange info panel ── */}
          <div
            className="relative overflow-hidden rounded-[20px] p-5 sm:p-6 lg:p-10 flex flex-col"
            style={{
              background:
                "radial-gradient(321.76% 108.33% at 4.94% 144.66%, var(--Shades-Orange-orange-600, #E86A3C) 43.13%, #FAAD62 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-16 -bottom-10 w-32 h-32 rounded-full bg-white/10"
              aria-hidden="true"
            />

            <h2 className="relative text-xl lg:text-2xl font-semibold text-white">
              Contact Information
            </h2>
            <p className="relative mt-2 text-sm text-white/80 leading-5 tracking-[0.5px] max-w-sm">
              Reach us directly by phone, WhatsApp or email.
            </p>

            <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1 mt-8 lg:mt-10">
              {CONTACT_INFO.map((item) => (
                <InfoRow key={item.label} {...item} />
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <div className="p-4 sm:p-6 lg:p-10">
            <h2 className="text-xl lg:text-2xl font-semibold text-dark">Send us a message</h2>
            <p className="mt-2 text-sm text-muted leading-5 tracking-[0.5px]">
              Fill out the form and we&apos;ll reply by phone or email.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5 mt-8"
              noValidate
            >
              <FormField label="Name" htmlFor="contact_name" required error={errors.name?.message}>
                <input
                  id="contact_name"
                  type="text"
                  placeholder="Enter your name"
                  autoComplete="name"
                  {...register("name", { required: "Name is required" })}
                  className={inputCls(!!errors.name)}
                />
              </FormField>

              <FormField label="Email" htmlFor="contact_email" required error={errors.email?.message}>
                <input
                  id="contact_email"
                  type="email"
                  placeholder="Enter your email"
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
              </FormField>

              <FormField label="Phone" htmlFor="contact_phone" required error={errors.phone?.message}>
                <div
                  className={`flex h-12 rounded-xl border transition-colors ${
                    errors.phone
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-50"
                  }`}
                >
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
                  <input
                    id="contact_phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="Enter your phone number"
                    autoComplete="tel-national"
                    {...phoneField}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                      return phoneField.onChange(e);
                    }}
                    className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-sm text-dark outline-none placeholder:text-muted/70"
                  />
                </div>
              </FormField>

              <FormField label="Subject" htmlFor="contact_subject" required error={errors.subject?.message}>
                <input
                  id="contact_subject"
                  type="text"
                  placeholder="Enter the subject"
                  {...register("subject", { required: "Subject is required" })}
                  className={inputCls(!!errors.subject)}
                />
              </FormField>

              <FormField
                label="Message"
                htmlFor="contact_message"
                error={errors.message?.message}
                className="col-span-full"
              >
                <textarea
                  id="contact_message"
                  placeholder="Enter your message"
                  rows={5}
                  {...register("message")}
                  className={`${inputCls(!!errors.message)} h-auto py-3 resize-none`}
                />
              </FormField>

              <div className="col-span-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
                <p className="text-xs text-muted tracking-[0.5px]">
                  <span className="text-primary">*</span> Required fields
                </p>
                <SplitButton
                  type="submit"
                  disabled={isSubmitting}
                  label={isSubmitting ? "Sending…" : submitted ? "Message Sent!" : "Send Message"}
                  icon={
                    isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" strokeWidth={1.75} />
                    )
                  }
                  className="w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
