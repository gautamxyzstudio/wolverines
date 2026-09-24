import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 });
    }

    const decodedSlug = decodeURIComponent(slug).trim();

    // Find blog by slug
    let blog = await prisma.blog.findUnique({
      where: {
        slug: decodedSlug,
      },
      select: {
        featuredImageData: true,
        featuredImageType: true,
        updatedAt: true,
      },
    });

    // Fallback in case ID was passed instead of slug
    if (!blog || !blog.featuredImageData) {
      blog = await prisma.blog.findUnique({
        where: {
          id: decodedSlug,
        },
        select: {
          featuredImageData: true,
          featuredImageType: true,
          updatedAt: true,
        },
      });
    }

    if (!blog || !blog.featuredImageData) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const etag = `"${new Date(blog.updatedAt).getTime()}"`;
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    return new Response(blog.featuredImageData, {
      status: 200,
      headers: {
        "Content-Type": blog.featuredImageType || "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "ETag": etag,
      },
    });
  } catch (error) {
    console.error("Error serving blog image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
