import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { BannerSection } from "@/components/home/BannerSection";
import { BelowFoldClient } from "@/components/home/BelowFoldClient";
import { HomeJsonLd } from "@/components/home/HomeJsonLd";
import { getFeaturedVideoProfiles } from "@/lib/getFeaturedVideoProfiles";
import { seoConfig } from "@/config/seo.config";

const BlogSection = nextDynamic(() =>
  import("@/components/home/BlogSection").then((m) => m.BlogSection),
);

// No ISR — every request fetches featured jobs straight from the API.
// (Named `dynamic` — this is Next's route segment config, not next/dynamic
// above, which is imported as `nextDynamic` to avoid the name clash.)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: seoConfig.openGraphTitle,
    description: seoConfig.openGraphDescription,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
  },
};

export default async function HomePage() {
  const videoProfiles = await getFeaturedVideoProfiles(20).catch(() => []);

  return (
    <>
      <HomeJsonLd />
      <HeroSection />
      <BannerSection />
      <BelowFoldClient videoProfiles={videoProfiles} />
      <BlogSection />
    </>
  );
}
