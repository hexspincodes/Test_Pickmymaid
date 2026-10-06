import Link from "next/link";
import { ChevronsRight } from "lucide-react";
import { BlogCard } from "@/components/ui/BlogCard";
import { SplitButton } from "../ui/SplitButton";
import { getBlogs } from "@/lib/api";

import { ASSET_BASE } from "@/lib/assets";

function thumbnailSrc(thumbnail: string): string {
  if (!thumbnail) return "/og-default.jpg";
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${ASSET_BASE}/${thumbnail}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export async function BlogSection() {
  let posts: { image: string; date: string; title: string; href: string }[] = [];

  try {
    const res = await getBlogs(1);
    posts = (res.data?.blogs ?? []).slice(0, 4).map((blog) => ({
      image: thumbnailSrc(blog.thumbnail),
      date: formatDate(blog.editedAt),
      title: blog.title,
      href: `/blog/${blog.slug}`,
    }));
  } catch {
    // silent fail — section won't render
  }

  if (posts.length === 0) return null;

  return (
    <section
      className="py-[10px] lg:py-20 bg-[#fafafa]"
      aria-label="Latest Blogs"
    >
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-20">
        {/* Mobile layout */}
        <div className="flex flex-col gap-10 md:hidden">
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="flex items-center gap-2 text-dark/80 text-xs font-medium">
              <ChevronsRight className="w-4 h-4" />
              <span className="text-lg font-medium">Latest Blogs</span>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-regular text-dark leading-tight tracking-[-0.25px]">
                Your Guide to Finding the Perfect Maid
              </h2>
              <p className="text-sm text-dark/80 leading-relaxed">
                Find expert advice, essential tips, and important updates for
                hiring and managing a successful domestic helper in your home.
              </p>
            </div>
            <div className="w-max">
              <SplitButton label="Explore More" href="/blog" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {posts.slice(0, 3).map((post) => (
              <BlogCard key={post.href} {...post} />
            ))}
          </div>
        </div>

        {/* Tablet & up layout */}
        <div className="hidden md:flex md:flex-col gap-16 lg:gap-20">
          {/* Breadcrumb */}
          <div className="flex justify-center md:justify-normal items-center gap-1 text-muted text-xs font-medium mb-4 lg:mb-6">
            <ChevronsRight className="w-8 h-8  md:w-11 md:h-11 font-thin" />
            <span className='text-lg  font-medium'>Latest Blogs</span>
          </div>

          {/* Header: heading + description/button, stacked until lg */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-dark leading-tight lg:leading-[62px] tracking-[-1px] max-w-[580px]">
              Your Guide to Finding the  Perfect Maid
            </h2>
            <div className="flex flex-col gap-6 max-w-[400px] xl:max-w-[600px] lg:pt-2">
              <p className="text-xl text-dark/80 leading-relaxed">
                Find expert advice, essential tips, and important updates for
                hiring and managing a successful domestic helper in your home.
              </p>
              <div className="w-max">
                <SplitButton label="Explore More" href="/blog" />
              </div>
            </div>
          </div>

          {/* Card grid — 3 cards everywhere, except a 4th that only shows as a 2x2 at md */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post) => (
              <BlogCard key={post.href} {...post} />
            ))}
            {posts[3] && (
              <div className="hidden md:block lg:hidden">
                <BlogCard {...posts[3]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
