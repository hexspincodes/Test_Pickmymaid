import type { Metadata } from 'next'
import { sanitizeRichHtml } from '@/lib/sanitizeHtml'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, ArrowRight, ChevronRight } from 'lucide-react'
import { getBlogBySlug, getFeaturedJobs } from '@/lib/api'
import { seoConfig } from '@/config/seo.config'
import { ShareButton } from '@/components/blog/ShareButton'
import { MaidSidebarCard } from '@/components/blog/MaidSidebarCard'
import { SplitButton } from '@/components/ui/SplitButton'

// No ISR — every request fetches the post straight from the API.
export const dynamic = 'force-dynamic'

const ASSET_BASE = 'https://assets.pickmymaid.com'

type Props = { params: Promise<{ slug: string }> }

function thumbnailSrc(thumbnail: string): string {
  if (!thumbnail) return '/og-default.jpg'
  if (thumbnail.startsWith('http')) return thumbnail
  return `${ASSET_BASE}/${thumbnail}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const res = await getBlogBySlug(slug)
    const blog = res.data.blog
    const imageUrl = thumbnailSrc(blog.thumbnail)
    return {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.description,
      keywords: blog.meta_keywords,
      alternates: { canonical: `/blog/${blog.canonical_url || blog.slug}` },
      openGraph: {
        title: blog.og_title || blog.meta_title || blog.title,
        description: blog.og_description || blog.meta_description || blog.description,
        url: `${seoConfig.siteUrl}/blog/${blog.slug}`,
        siteName: seoConfig.siteName,
        type: 'article',
        publishedTime: blog.editedAt,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
      },
    }
  } catch {
    return { title: `Blog | ${seoConfig.siteName}` }
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params

  const [blogRes, maidsRes] = await Promise.all([
    getBlogBySlug(slug).catch(() => null),
    getFeaturedJobs().catch(() => null),
  ])

  if (!blogRes?.data?.blog) notFound()

  const blog = blogRes.data.blog
  const maids = (maidsRes?.data ?? []).slice(0, 6)
  const pageUrl = `${seoConfig.siteUrl}/blog/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: thumbnailSrc(blog.thumbnail),
    datePublished: blog.editedAt,
    dateModified: blog.editedAt,
    author: { '@type': 'Organization', name: seoConfig.siteName, url: seoConfig.siteUrl },
    publisher: { '@type': 'Organization', name: seoConfig.siteName, url: seoConfig.siteUrl },
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#F5F5F5] min-h-screen py-26 lg:py-12">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-16">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 mb-6 text-xs text-muted flex-wrap"
          >
            <Link href="/" className="hover:text-dark transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/blog" className="hover:text-dark transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-dark line-clamp-1">{blog.title}</span>
          </nav>

          <div className="flex gap-6 lg:gap-8 items-start">

            {/* ─── Main Content ──────────────────────────────────── */}
            <article className="flex-1 min-w-0 flex flex-col gap-4">

              {/* Hero image */}
              <div className="relative rounded-3xl overflow-hidden h-[240px] sm:h-[360px] lg:h-[480px]">
                <Image
                  src={thumbnailSrc(blog.thumbnail)}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, calc(100vw - 420px)"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />
                <ShareButton url={pageUrl} title={blog.title} />
              </div>

              {/* Article body */}
              <div className="bg-white rounded-3xl p-6 lg:p-10 flex flex-col gap-6">

                {/* Date */}
                <div className="flex items-center gap-2 text-muted">
                  <CalendarDays className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm tracking-[0.25px]">
                    Posted on {formatDate(blog.editedAt)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-[36px] font-bold text-dark leading-tight lg:leading-[46px] tracking-[-0.5px]">
                  {blog.title}
                </h1>

                {/* Description */}
                <p className="text-base lg:text-lg text-muted leading-relaxed tracking-[0.25px] pb-6 border-b border-gray-100">
                  {blog.description}
                </p>

                {/* HTML content */}
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichHtml(blog.content),
                  }}
                />
              </div>

              {/* Mobile — maid profiles */}
              {maids.length > 0 && (
                <div className="lg:hidden bg-white rounded-3xl p-5 flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-dark">
                      Handpicked profiles for you
                    </h2>
                    <Link
                      href="/search"
                      className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-600 transition-colors"
                    >
                      View All
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="flex flex-col">
                    {maids.map((maid, i) => (
                      <MaidSidebarCard key={String(maid._id)} maid={maid} index={i} />
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <SplitButton label="Browse All Maids" href="/search" className="w-full" />
                  </div>
                </div>
              )}
            </article>

            {/* ─── Desktop Sidebar ───────────────────────────────── */}
            {maids.length > 0 && (
              <aside
                aria-label="Handpicked maid profiles"
                className="hidden lg:flex flex-col gap-4 w-[320px] xl:w-[350px] shrink-0 sticky top-[88px]"
              >
                <div className="bg-white rounded-3xl overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-base font-semibold text-dark">
                        Handpicked for you
                      </h2>
                      <p className="text-xs text-muted mt-0.5">
                        Verified maids &amp; nannies available now
                      </p>
                    </div>
                    <Link
                      href="/search"
                      className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-600 transition-colors shrink-0"
                    >
                      View All
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Maid list */}
                  <div className="px-3 py-3 flex flex-col divide-y divide-gray-50">
                    {maids.map((maid, i) => (
                      <MaidSidebarCard key={String(maid._id)} maid={maid} index={i} />
                    ))}
                  </div>

                  {/* CTA footer */}
                  <div className="px-5 pb-5">
                    <SplitButton label="Browse All Maids" href="/search" className="w-full" />
                  </div>
                </div>
              </aside>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
