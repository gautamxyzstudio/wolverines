"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { Calendar, Clock, ArrowLeft, AlertCircle, FileText } from "lucide-react";

interface BlogDetailData {
  id: string;
  title: string;
  slug?: string;
  content: string;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  date?: string | Date;
  shortDescription?: string | null;
  createdAt?: string;
}

interface RecentBlogItem {
  id: string;
  title: string;
  slug?: string;
  featuredImage?: string | null;
  date?: string | Date;
  shortDescription?: string | null;
}

const DEFAULT_BLOG_IMAGE = "/images/blog_evolution_hockey.jpg";

function formatBlogDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

function calculateReadingTime(content?: string): string {
  if (!content) return "2 min read";
  const cleanText = content.replace(/<[^>]*>/g, "");
  const words = cleanText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function BlogDetailClient({
  slug,
  id,
}: {
  slug?: string;
  id?: string;
}) {
  const identifier = slug || id || "";
  const [blog, setBlog] = useState<BlogDetailData | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentBlogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch detail by slug / identifier
        const res = await fetch(`${API_ENDPOINTS.BLOG}/${encodeURIComponent(identifier)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Blog post not found");
          }
          throw new Error(`Failed to load blog post (Status: ${res.status})`);
        }

        const json = await res.json();
        if (isMounted) {
          setBlog(json.data);
        }

        // Fetch recent posts for the bottom section
        try {
          const recentRes = await fetch(API_ENDPOINTS.BLOG);
          if (recentRes.ok) {
            const recentJson = await recentRes.json();
            if (Array.isArray(recentJson.data) && isMounted) {
              // Exclude current blog and take up to 2
              const others = recentJson.data
                .filter(
                  (p: any) =>
                    p.id !== identifier &&
                    p.slug !== identifier &&
                    (json.data?.id ? p.id !== json.data.id : true) &&
                    (json.data?.slug ? p.slug !== json.data.slug : true),
                )
                .slice(0, 2);
              setRecentPosts(others);
            }
          }
        } catch {
          // Non-critical, ignore
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load blog post.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (identifier) {
      loadBlogData();
    }

    return () => {
      isMounted = false;
    };
  }, [identifier]);

  return (
    <main className="w-full min-h-screen bg-white text-neutral-900 py-8 sm:py-12 lg:py-16 select-none">
      {/* Animations and Rich Text Content Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes blogDetailFadeIn {
              0% { opacity: 0; transform: translateY(16px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-blog-detail-header {
              animation: blogDetailFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .animate-blog-detail-image {
              animation: blogDetailFadeIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
            }
            .animate-blog-detail-content {
              animation: blogDetailFadeIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .shimmer {
              background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }

            /* Rich Text Editor Content Styling matching design specs */
            .blog-body-html {
              font-family: var(--font-open-sans), "Open Sans", sans-serif;
              color: #181818;
            }
            .blog-body-html h1,
            .blog-body-html h2,
            .blog-body-html h3,
            .blog-body-html h4,
            .blog-body-html h5,
            .blog-body-html h6,
            .blog-body-html .wp-block-heading {
              font-family: var(--font-bebas-neue), "Bebas Neue", sans-serif !important;
              font-size: 32px !important;
              line-height: 1.25;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              color: #181818 !important;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
            }
            .blog-body-html p {
              font-family: var(--font-open-sans), "Open Sans", sans-serif !important;
              font-size: 20px !important;
              line-height: 1.6;
              color: #181818 !important;
              margin: 0px 0px 16px !important;
            }
            .blog-body-html ul {
              list-style-type: disc;
              padding-left: 1.75rem;
              margin: 0px 0px 16px;
              color: #181818;
              font-family: var(--font-open-sans), "Open Sans", sans-serif;
              font-size: 20px;
              line-height: 1.6;
            }
            .blog-body-html ol {
              list-style-type: decimal;
              padding-left: 1.75rem;
              margin: 0px 0px 16px;
              color: #181818;
              font-family: var(--font-open-sans), "Open Sans", sans-serif;
              font-size: 20px;
              line-height: 1.6;
            }
            .blog-body-html li {
              margin-bottom: 0.5rem;
              line-height: 1.6;
            }
            .blog-body-html blockquote {
              border-left: 4px solid #DE2027;
              padding-left: 1.25rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
              margin: 1.75rem 0;
              background-color: #fafafa;
              border-radius: 0 0.75rem 0.75rem 0;
              font-style: italic;
              color: #181818;
              font-family: var(--font-open-sans), "Open Sans", sans-serif;
              font-size: 20px;
              line-height: 1.6;
            }
            .blog-body-html a {
              color: #DE2027;
              text-decoration: underline;
              text-underline-offset: 3px;
              font-weight: 500;
            }
            .blog-body-html a:hover {
              color: #b91c1c;
            }
            .blog-body-html img {
              border-radius: 1rem;
              margin: 2rem auto;
              max-width: 100%;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .blog-body-html hr {
              border-color: #e5e7eb;
              margin: 2.5rem 0;
            }
          `,
        }}
      />

      <div className="site-container max-w-4xl mx-auto px-4 sm:px-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="h-4 w-40 rounded shimmer" />
            <div className="h-10 w-3/4 rounded shimmer" />
            <div className="flex gap-4">
              <div className="h-4 w-28 rounded shimmer" />
              <div className="h-4 w-24 rounded shimmer" />
            </div>
            <div className="aspect-[16/9] w-full rounded-2xl sm:rounded-3xl shimmer" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded shimmer" />
              <div className="h-4 w-full rounded shimmer" />
              <div className="h-4 w-4/5 rounded shimmer" />
              <div className="h-4 w-full rounded shimmer" />
            </div>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !blog) && (
          <div className="max-w-md mx-auto my-20 p-8 sm:p-10 bg-neutral-50 rounded-3xl border border-neutral-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#DE2027] flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Blog Post Not Found</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                The article you are looking for might have been moved or removed.
              </p>
            </div>
            <div>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#DE2027] hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to All Blogs
              </Link>
            </div>
          </div>
        )}

        {/* Blog Post Loaded */}
        {!isLoading && blog && (
          <>
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm mb-6 text-neutral-500 font-medium overflow-hidden text-ellipsis whitespace-nowrap animate-blog-detail-header">
              <Link href="/blogs" className="text-[#DE2027] hover:underline shrink-0 font-semibold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Blogs
              </Link>
              <span className="text-neutral-400">&gt;</span>
              <span className="text-neutral-700 truncate">{blog.title}</span>
            </nav>

            {/* Blog Post Header Title with Vertical Red Gradient Bar */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 animate-blog-detail-header">
              <div
                className="w-[8px] sm:w-[10px] h-[32px] sm:h-[38px] flex-shrink-0 mt-0.5"
                style={{
                  background:
                    "linear-gradient(180deg, #D32F2F 0%, #dc2626 22%, #f87171 65%, #ffffff 100%)",
                }}
              />
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase text-neutral-900 tracking-wide leading-tight"
                style={{
                  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
                }}
              >
                {blog.title}
              </h1>
            </div>

            {/* Meta badges: Date & Reading Time */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-500 mb-8 animate-blog-detail-header">
              {blog.date && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#DE2027]" />
                  <span>{formatBlogDate(blog.date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{calculateReadingTime(blog.content)}</span>
              </div>
            </div>

            {/* Featured Main Image */}
            <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 mb-8 sm:mb-10 shadow-xs animate-blog-detail-image">
              <img
                src={blog.featuredImage || DEFAULT_BLOG_IMAGE}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                }}
              />
            </div>

            {/* Short Description Lead Quote */}
            {blog.shortDescription && (
              <div
                className="p-5 sm:p-6 mb-8 rounded-2xl bg-neutral-50 border-l-4 border-[#DE2027] text-[#181818] text-lg sm:text-[20px] font-medium leading-relaxed italic animate-blog-detail-content"
                style={{
                  fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                }}
              >
                &ldquo;{blog.shortDescription}&rdquo;
              </div>
            )}

            {/* Article Body Content */}
            <article className="animate-blog-detail-content">
              {/* Check if content is HTML from rich text editor */}
              {blog.content && /<[a-z][\s\S]*>/i.test(blog.content) ? (
                <div
                  className="blog-body-html"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              ) : (
                /* Fallback for plain text paragraphs */
                <div className="blog-body-html">
                  {blog.content?.split("\n\n").map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </article>

            {/* Recent Posts Section */}
            {recentPosts.length > 0 && (
              <section className="mt-14 sm:mt-20 pt-10 border-t border-neutral-200/80">
                {/* Heading */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div
                    className="w-[6px] sm:w-[8px] h-[26px] sm:h-[32px] flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #D32F2F 0%, #dc2626 22%, #f87171 65%, #ffffff 100%)",
                    }}
                  />
                  <h2
                    className="text-2xl sm:text-3xl font-normal uppercase text-neutral-900 tracking-wide leading-none"
                    style={{
                      fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
                    }}
                  >
                    RECENT POSTS
                  </h2>
                </div>

                {/* 2-Column Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {recentPosts.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/blogs/${rec.slug || rec.id}`}
                      className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                        <img
                          src={rec.featuredImage || DEFAULT_BLOG_IMAGE}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                          }}
                        />
                      </div>
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                        <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#DE2027] transition-colors">
                          {rec.title}
                        </h3>
                        {rec.shortDescription && (
                          <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                            {rec.shortDescription}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
