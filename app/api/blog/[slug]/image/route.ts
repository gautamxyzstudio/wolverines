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
        },
      });
    }

    if (!blog || !blog.featuredImageData) {
      return new NextResponse("Image not found", { status: 404 });
    }

    return new Response(blog.featuredImageData, {
      status: 200,
      headers: {
        "Content-Type": blog.featuredImageType || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error serving blog image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
