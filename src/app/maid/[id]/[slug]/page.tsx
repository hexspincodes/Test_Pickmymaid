import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getMaid } from "@/lib/api";
import type { ApiMaid } from "@/types";
import { MaidProfilePage } from "@/components/maid/MaidProfilePage";
import { seoConfig } from "@/config/seo.config";

// No ISR — every request fetches the maid straight from the API, so an
// admin edit shows up on the next page load with no cache to invalidate.
export const dynamic = "force-dynamic";

import { ASSET_BASE } from "@/lib/assets";

function getPhotoUrl(profile: string | null): string | undefined {
  if (!profile) return undefined;
  return profile.startsWith("http") ? profile : `${ASSET_BASE}/${profile}`;
}

function getSalaryLabel(from: number, to: number): string {
  if (from === 0 && to === 0) return "Negotiable";
  return `AED ${from}–${to}/month`;
}

function getTotalExp(maid: ApiMaid): number {
  return (maid.employmentHistory ?? []).reduce(
    (acc, e) => acc + (e.experiance ?? 0),
    0,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id: rawId, slug: rawSlug } = await params;
  // Canonical format is /maid/[numeric-id]/[slug]. Detect reversed URLs.
  const id = /^\d+$/.test(rawId) ? rawId : rawSlug;
  const slug = /^\d+$/.test(rawId) ? rawSlug : rawId;

  let maid: ApiMaid;
  try {
    maid = (await getMaid(id)).data?.jobApplication;
  } catch {
    return { title: "Maid Profile" };
  }

  if (!maid) return { title: "Maid Profile" };

  const expYears = getTotalExp(maid);
  const salary = getSalaryLabel(maid.salary.from, maid.salary.to);
  const photoUrl = getPhotoUrl(maid.profile);
  const canonical = `${seoConfig.siteUrl}/maid/${id}/${slug}`;
  const title = `${maid.name} – ${maid.option} from ${maid.nationality}`;
  const description = `Hire ${maid.name}, a verified ${maid.service} from ${maid.nationality} with ${expYears} year${expYears !== 1 ? "s" : ""} of experience. Desired salary: ${salary}.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      type: "profile",
      title,
      description,
      ...(photoUrl && {
        images: [{ url: photoUrl, width: 1200, height: 630, alt: maid.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MaidProfileRoute({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id: rawId, slug: rawSlug } = await params;

  // Redirect reversed URLs (/maid/slug/id → /maid/id/slug)
  if (!/^\d+$/.test(rawId) && /^\d+$/.test(rawSlug)) {
    permanentRedirect(`/maid/${rawSlug}/${rawId}`);
  }

  const id = rawId;
  const slug = rawSlug;

  let maid: ApiMaid;
  try {
    maid = (await getMaid(id)).data.jobApplication;
    if (!maid.ref_number) notFound();
  } catch {
    notFound();
  }

  const photoUrl = getPhotoUrl(maid.profile);
  const canonical = `${seoConfig.siteUrl}/maid/${maid.ref_number}/${slug}`;
  const salary = getSalaryLabel(maid.salary.from, maid.salary.to);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: maid.name,
    jobTitle: maid.option,
    nationality: {
      "@type": "Country",
      name: nationalityLabel(maid.nationality),
    },
    description: `Verified ${maid.option} from ${maid.nationality}. Desired salary: ${salary}.`,
    url: canonical,
    ...(photoUrl && { image: photoUrl }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MaidProfilePage maid={maid} similar={[]} />
    </>
  );
}

function nationalityLabel(n: string) {
  return n === "Srilanka" ? "Sri Lanka" : n;
}
