import type { MetadataRoute } from "next";
import { findMaids } from "@/lib/api";

// findMaids now goes through axios, which Next's static-render detection
// doesn't see — without this, the sitemap would render once at build time
// and never regenerate, silently going stale as maids are added/removed.
export const dynamic = "force-dynamic";

const BASE = "https://www.pickmymaid.com";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE, priority: 1.0, changeFrequency: "daily" },
  { url: `${BASE}/search`, priority: 0.9, changeFrequency: "daily" },
  { url: `${BASE}/pricing`, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE}/about-us`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/how-it-works`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/contact`, priority: 0.6, changeFrequency: "monthly" },
  { url: `${BASE}/blog`, priority: 0.7, changeFrequency: "weekly" },
  { url: `${BASE}/terms`, priority: 0.4, changeFrequency: "yearly" },
  { url: `${BASE}/privacy`, priority: 0.4, changeFrequency: "yearly" },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maidEntries: MetadataRoute.Sitemap = [];

  let page = 1;
  while (true) {
    const res = await findMaids({ page }).catch(() => null);
    const maids = res?.data?.maids ?? [];
    if (maids.length === 0) break;

    for (const m of maids) {
      if (!m.ref_number) continue;
      const slug = slugify(`${m.name ?? ""} ${m.option ?? ""} ${m.nationality ?? ""}`);
      maidEntries.push({
        url: `${BASE}/maid/${String(m.ref_number)}/${slug}`,
        priority: 0.6,
        changeFrequency: "weekly",
      });
    }

    if (maidEntries.length >= (res?.data?.count ?? 0)) break;
    page++;
  }

  return [...STATIC_PAGES, ...maidEntries];
}
