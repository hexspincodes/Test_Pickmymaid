import type { Metadata } from "next";
import { ChevronsRight } from "lucide-react";
import { BlogListingSection } from "@/components/blog/BlogListingSection";
import { getBlogs } from "@/lib/api";
import { seoConfig } from "@/config/seo.config";

// No ISR — every request fetches the listing straight from the API.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: `Blog — Maid Hiring Tips & Guides | ${seoConfig.siteName}`,
  description:
    "Expert tips, guides, and updates on hiring maids, nannies, and domestic help in Dubai and across the UAE.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog — Maid Hiring Tips & Guides | ${seoConfig.siteName}`,
    description:
      "Expert tips, guides, and updates on hiring maids, nannies, and domestic help in Dubai and across the UAE.",
    url: `${seoConfig.siteUrl}/blog`,
    siteName: seoConfig.siteName,
    type: "website",
  },
};

export default async function BlogPage() {
  let initialPosts: Awaited<ReturnType<typeof getBlogs>>["data"]["blogs"] = [];

  try {
    const res = await getBlogs(1);
    initialPosts = res.data?.blogs ?? [];
  } catch {
    // Render empty state; user can still use load more to retry
  }

  const initialHasMore = initialPosts.length >= PAGE_SIZE;

  const jsonLd =
    initialPosts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${seoConfig.siteName} Blog`,
          url: `${seoConfig.siteUrl}/blog`,
          description: metadata.description,
          blogPost: initialPosts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            url: `${seoConfig.siteUrl}/blog/${post.slug}`,
            datePublished: post.editedAt,
          })),
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="bg-[#F5F5F5] min-h-screen py-26 lg:py-22">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">
          {/* Page header */}
          <header className="mb-10 lg:mb-14">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-5">
              <ChevronsRight className="w-4 h-4" />
              <span>Our Blog</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-16">
              <h1 className="text-3xl lg:text-[44px] font-bold text-dark leading-tight lg:leading-[54px] tracking-[-0.5px] max-w-xl">
                Guides, Tips &amp; Updates for UAE Hiring
              </h1>
              <p className="text-base text-muted max-w-sm lg:text-right leading-relaxed shrink-0">
                Expert advice on finding and managing domestic help in Dubai and
                across the UAE.
              </p>
            </div>
          </header>

          <BlogListingSection
            initialPosts={initialPosts}
            initialHasMore={initialHasMore}
          />
        </div>
      </div>
    </>
  );
}
