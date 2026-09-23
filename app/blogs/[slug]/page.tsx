import React from "react";
import type { Metadata } from "next";
import BlogDetailClient from "@/components/blogs/BlogDetailClient";
import { prisma } from "@/app/lib/prisma";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    let blog = await prisma.blog.findUnique({
      where: { slug },
      select: { title: true, shortDescription: true, metaTitle: true, metaDescription: true },
    });

    if (!blog) {
      blog = await prisma.blog.findUnique({
        where: { id: slug },
        select: { title: true, shortDescription: true, metaTitle: true, metaDescription: true },
      });
    }

    if (blog) {
      return {
        title: blog.metaTitle || `${blog.title} | The Wolverines Field Hockey Club`,
        description: blog.metaDescription || blog.shortDescription || "Read latest updates from The Wolverines.",
      };
    }
  } catch {
    // Ignore db read error during static generation / metadata
  }

  return {
    title: "Blog Details | The Wolverines Field Hockey Club",
    description: "Stay updated with the latest field hockey news, tips, and training resources.",
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
