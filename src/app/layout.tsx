import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/analytics";
import { seoConfig } from "@/config/seo.config";
import { Toaster } from "sonner";
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton";


export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  openGraph: {
    type: "website",
    siteName: seoConfig.siteName,
    images: [{ url: seoConfig.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    images: [seoConfig.defaultOgImage],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/favicon_io/apple-touch-icon.png" },
    other: [
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://pickmymaidbucket.sfo3.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.backendpickmymaid.site" />
        <link rel="dns-prefetch" href="https://api.backendpickmymaid.site" />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "500",
            },
            classNames: {
              toast: `shadow-[0px_19px_40px_0px_rgba(0,0,0,0.08)]`,
              success: `!bg-white !text-[#1A1A1A] [&_[data-icon]_svg]:!text-green-500`,
              error: `!bg-white !text-[#1A1A1A] [&_[data-icon]_svg]:!text-red-500`,
              warning: `!bg-white !text-[#1A1A1A] [&_[data-icon]_svg]:!text-yellow-500`,
              info: `!bg-white !text-[#1A1A1A] [&_[data-icon]_svg]:!text-blue-500`,
            },
          }}
        />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
