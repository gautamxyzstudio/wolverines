"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { Calendar, AlertCircle, RefreshCw, FileText } from "lucide-react";

export interface BlogItem {
  id: string;
  title: string;
  slug?: string;
  featuredImage?: string | null;
  date?: string | Date;
  shortDescription?: string | null;
  createdAt?: string;
}

function formatBlogDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const DEFAULT_BLOG_IMAGE = "/images/blog_evolution_hockey.jpg";

export default function BlogsListClient() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.BLOG);
      if (!res.ok) {
        throw new Error(`Failed to fetch blogs (Status: ${res.status})`);
      }
      const json = await res.json();
      const list: BlogItem[] = Array.isArray(json.data) ? json.data : [];
      setBlogs(list);
    } catch (err: any) {
      console.error("Error fetching blogs on frontend:", err);
      setError(err?.message || "Failed to load blogs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const otherPosts = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900 py-12 sm:py-16 lg:py-20 select-none">
      {/* Inline animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes blogHeaderAnim {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes blogItemAnim {
              0% { opacity: 0; transform: translateY(24px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-blog-header {
              animation: blogHeaderAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .animate-blog-card {
              animation: blogItemAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
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
          `,
        }}
      />

      <div className="site-container">
        {/* Page Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14 animate-blog-header">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-normal uppercase tracking-wider text-neutral-900 leading-none mb-3"
            style={{
              fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
            }}
          >
            BLOGS
          </h1>
          <p
            className="text-neutral-600 text-sm sm:text-base max-w-2xl font-normal leading-relaxed"
            style={{
              fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
            }}
          >
            Stay updated with the latest field hockey news, tips, and training resources. Join the Wolverine community today!
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-8">
            {/* Featured Post Skeleton */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[320px]">
                <div className="lg:col-span-7 h-64 lg:h-auto shimmer" />
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4">
                  <div className="h-4 w-28 rounded-full shimmer" />
                  <div className="h-7 w-3/4 rounded shimmer" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded shimmer" />
                    <div className="h-4 w-5/6 rounded shimmer" />
                  </div>
                  <div className="h-4 w-24 rounded shimmer" />
                </div>
              </div>
            </div>

            {/* Grid Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs"
                >
                  <div className="aspect-[16/9] w-full shimmer" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-24 rounded-full shimmer" />
                    <div className="h-6 w-3/4 rounded shimmer" />
                    <div className="h-4 w-full rounded shimmer" />
                    <div className="h-4 w-20 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="max-w-lg mx-auto my-12 p-8 bg-red-50/70 border border-red-200 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Unable to Load Blogs</h3>
              <p className="text-sm text-neutral-600">{error}</p>
            </div>
            <button
              onClick={fetchBlogs}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DE2027] hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogs.length === 0 && (
          <div className="max-w-md mx-auto my-16 p-10 bg-neutral-50 rounded-3xl border border-neutral-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-200/70 flex items-center justify-center mx-auto text-neutral-500">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-1">No Blog Posts Yet</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                We are preparing exciting hockey stories, tactical guides, and club news. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Blog Posts Display */}
        {!isLoading && !error && blogs.length > 0 && (
          <>
            {/* Featured Hero Blog Card */}
            {featuredPost && (
              <div className="mb-8 sm:mb-12 animate-blog-card">
                <Link
                  href={`/blogs/${featuredPost.slug || featuredPost.id}`}
                  className="block bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Left: Featured Image */}
                    <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[260px] sm:min-h-[340px] lg:min-h-[390px] w-full overflow-hidden bg-neutral-100">
                      <img
                        src={featuredPost.featuredImage || DEFAULT_BLOG_IMAGE}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                        }}
                      />
                      {featuredPost.date && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                          <Calendar className="w-3 h-3 text-[#DE2027]" />
                          {formatBlogDate(featuredPost.date)}
                        </div>
                      )}
                    </div>

                    {/* Right: Content */}
                    <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#DE2027] mb-2">
                        Featured Post
                      </span>
                      <h2
                        className="text-xl sm:text-2xl lg:text-[26px] font-bold text-neutral-900 mb-3 leading-snug group-hover:text-[#DE2027] transition-colors duration-200"
                        style={{
                          fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                        }}
                      >
                        {featuredPost.title}
                      </h2>
                      {featuredPost.shortDescription && (
                        <p className="text-sm sm:text-base text-neutral-600 mb-5 leading-relaxed line-clamp-3">
                          {featuredPost.shortDescription}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#DE2027] group-hover:text-red-700 transition-colors no-underline mt-auto">
                        Read More <span className="transition-transform duration-200 group-hover:translate-x-1.5">&rsaquo;</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Bottom Blog Cards Grid (2-columns) */}
            {otherPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {otherPosts.map((post) => (
                  <div key={post.id} className="animate-blog-card">
                    <Link
                      href={`/blogs/${post.slug || post.id}`}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group h-full"
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
                        <img
                          src={post.featuredImage || DEFAULT_BLOG_IMAGE}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                          }}
                        />
                        {post.date && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                            <Calendar className="w-3 h-3 text-[#DE2027]" />
                            {formatBlogDate(post.date)}
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                        <div>
                          <h3
                            className="text-base sm:text-lg font-bold text-neutral-900 mb-2.5 leading-snug group-hover:text-[#DE2027] transition-colors duration-200 line-clamp-2"
                            style={{
                              fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                            }}
                          >
                            {post.title}
                          </h3>
                          {post.shortDescription && (
                            <p className="text-xs sm:text-sm text-neutral-600 mb-5 leading-relaxed line-clamp-3">
                              {post.shortDescription}
                            </p>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#DE2027] group-hover:text-red-700 transition-colors no-underline">
                          Read More <span className="transition-transform duration-200 group-hover:translate-x-1.5">&rsaquo;</span>
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
