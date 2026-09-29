import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Script/connect sources beyond 'self' are constrained to what this app
// actually loads: GTM + Clarity analytics (lazily injected from
// components/analytics) plus the Google Ads/Analytics beacon and
// conversion-tracking hosts those tags call out to (google.com,
// analytics.google.com, googleads.g.doubleclick.net — note Google Ads'
// click-id redirect can also land on other country TLDs like google.co.in
// depending on visitor locale, which isn't fully enumerable here), the
// backend API, and YouTube/Vimeo embeds (the same hosts sanitizeHtml.ts
// allows for blog <iframe> tags). 'unsafe-inline'
// stays on script-src/style-src because Next's hydration payload and GTM's
// own tag-injection both rely on inline <script>, and this codebase uses
// inline `style={{...}}` throughout — removing it would require a
// nonce-based setup (middleware issuing a per-request nonce threaded through
// every inline script/style) that isn't in place yet. The other directives
// still meaningfully restrict where an injected script could load from,
// navigate to, or exfiltrate data to.
// Dev-only: Turbopack's HMR/error-overlay tooling relies on eval() for
// sourcemaps and isn't a public-facing surface, so 'unsafe-eval' is scoped
// out of the production CSP entirely rather than loosened everywhere.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://googleads.g.doubleclick.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://assets.pickmymaid.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://c.clarity.ms https://www.google.com https://www.google.co.in https://googleads.g.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' https://api.backendpickmymaid.site https://www.google-analytics.com https://www.clarity.ms https://c.clarity.ms https://www.google.com https://analytics.google.com https://googleads.g.doubleclick.net",
  "frame-src https://www.youtube.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        // Canonical maid URL is /maid/[numeric-id]/[slug].
        // Redirect the reversed format /maid/[slug]/[numeric-id] → /maid/[id]/[slug].
        source: "/maid/:slug([a-z][a-z0-9-]+)/:id(\\d+)",
        destination: "/maid/:id/:slug",
        permanent: true,
      },
      {
        // /packages was renamed to /pricing.
        source: "/packages",
        destination: "/pricing",
        permanent: true,
      },
      {
        // The backend's PAYMENT_REDIRECT_URL sends the gateway back to
        // /payment/redirect?ref=...; verification lives at /payment-verification.
        source: "/payment/redirect",
        destination: "/payment-verification",
        permanent: false,
      },
    ];
  },
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.pickmymaid.com", pathname: "/**" },
    ],
    qualities: [75, 90],
    formats: ["image/webp"],
  },
};

// Gives local `next dev` access to Cloudflare bindings (KV, etc.) via
// `getCloudflareContext()`. No-op when actually running on Workers.
initOpenNextCloudflareForDev();

export default nextConfig;
