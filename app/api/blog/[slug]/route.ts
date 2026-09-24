import { prisma } from "@/app/lib/prisma";
import { AuthError, requireAdmin } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function formatBlogImage<T extends { featuredImage: string | null; updatedAt: Date }>(blog: T) {
  return {
    ...blog,
    featuredImage: blog.featuredImage?.startsWith("/api/blog/")
      ? `${blog.featuredImage.split("?")[0]}?v=${new Date(blog.updatedAt).getTime()}`
      : blog.featuredImage,
  };
}

// find by slug
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        {
          message: "slug is required to find blog",
        },
        { status: 400 },
      );
    }

    const decodedSlug = decodeURIComponent(slug).trim();

    let blog = await prisma.blog.findUnique({
      where: {
        slug: decodedSlug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        date: true,
        shortDescription: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!blog) {
      // Fallback in case id was passed
      blog = await prisma.blog.findUnique({
        where: {
          id: decodedSlug,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          featuredImage: true,
          date: true,
          shortDescription: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (!blog) {
      return NextResponse.json(
        {
          message: "blog not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "blog fetched successfully",
        data: formatBlogImage(blog),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("error fetching blog", error);
    return NextResponse.json(
      {
        message: "error fetching blog",
      },
      { status: 500 },
    );
  }
}

// delete
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          message: "id or slug is required to delete blog",
        },
        { status: 400 },
      );
    }

    const decodedSlug = decodeURIComponent(slug).trim();

    let existing = await prisma.blog.findUnique({
      where: {
        slug: decodedSlug,
      },
    });

    if (!existing) {
      existing = await prisma.blog.findUnique({
        where: {
          id: decodedSlug,
        },
      });
    }

    if (!existing) {
      return NextResponse.json(
        {
          message: "blog not found",
        },
        { status: 404 },
      );
    }

    const deleted = await prisma.blog.delete({
      where: {
        id: existing.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    // Cleanup any legacy uploaded images on disk safely without throwing
    if (existing.featuredImage && existing.featuredImage.startsWith("/uploads/blogs/")) {
      try {
        const imagePath = path.join(
          process.cwd(),
          "public",
          existing.featuredImage.replace(/^\//, ""),
        );
        await fs.unlink(imagePath);
      } catch (fileError) {
        // Ignore file removal error in serverless or missing files
      }
    }

    return NextResponse.json(
      {
        message: "blog deleted successfully",
        data: deleted,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.log("error deleting blog", error);
    return NextResponse.json(
      {
        message: "error deleting blog",
      },
      { status: 500 },
    );
  }
}

// update
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireAdmin(request);

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          message: "id or slug is required to update blog",
        },
        { status: 400 },
      );
    }

    const decodedSlug = decodeURIComponent(slug).trim();

    let existingBlog = await prisma.blog.findUnique({
      where: {
        slug: decodedSlug,
      },
    });

    if (!existingBlog) {
      // Fallback in case id was passed instead of slug
      existingBlog = await prisma.blog.findUnique({
        where: {
          id: decodedSlug,
        },
      });
    }

    if (!existingBlog) {
      return NextResponse.json(
        {
          message: "Blog not found",
        },
        { status: 404 },
      );
    }

    let title: unknown = null;
    let content: unknown = null;
    let featuredImage: unknown = null;
    let metaTitle: unknown = null;
    let metaDescription: unknown = null;
    let newSlug: unknown = null;
    let date: unknown = null;
    let shortDescription: unknown = null;

    const contentType = request.headers.get("content-type") || "";

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      title = formData.get("title");
      content = formData.get("content");
      featuredImage = formData.get("featuredImage");
      metaTitle = formData.get("metaTitle");
      metaDescription = formData.get("metaDescription");
      newSlug = formData.get("slug");
      date = formData.get("date");
      shortDescription = formData.get("shortDescription");
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      title = body.title;
      content = body.content;
      featuredImage = body.featuredImage;
      metaTitle = body.metaTitle;
      metaDescription = body.metaDescription;
      newSlug = body.slug;
      date = body.date;
      shortDescription = body.shortDescription;
    } else {
      try {
        const formData = await request.formData();
        title = formData.get("title");
        content = formData.get("content");
        featuredImage = formData.get("featuredImage");
        metaTitle = formData.get("metaTitle");
        metaDescription = formData.get("metaDescription");
        newSlug = formData.get("slug");
        date = formData.get("date");
        shortDescription = formData.get("shortDescription");
      } catch {
        const body = await request.json();
        title = body.title;
        content = body.content;
        featuredImage = body.featuredImage;
        metaTitle = body.metaTitle;
        metaDescription = body.metaDescription;
        newSlug = body.slug;
        date = body.date;
        shortDescription = body.shortDescription;
      }
    }

    const updateData: {
      title?: string;
      content?: string;
      featuredImage?: string | null;
      featuredImageData?: Uint8Array<ArrayBuffer> | null;
      featuredImageType?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      slug?: string;
      date?: Date;
      shortDescription?: string | null;
    } = {};

    // TITLE
    if (title !== null && title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          {
            message: "title must be a non-empty string",
          },
          { status: 400 },
        );
      }

      updateData.title = title.trim();
    }

    // CONTENT
    if (content !== null && content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return NextResponse.json(
          {
            message: "content must be a non-empty string",
          },
          { status: 400 },
        );
      }

      updateData.content = content;
    }

    // SLUG
    let finalSlug = existingBlog.slug;
    if (newSlug !== null && newSlug !== undefined) {
      if (typeof newSlug !== "string" || !newSlug.trim()) {
        return NextResponse.json(
          {
            message: "slug must be a non-empty string",
          },
          { status: 400 },
        );
      }

      const formattedSlug = newSlug.trim().toLowerCase();
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      if (!slugRegex.test(formattedSlug)) {
        return NextResponse.json(
          {
            message:
              "slug can only contain lowercase letters, numbers and hyphens",
          },
          { status: 400 },
        );
      }

      if (formattedSlug !== existingBlog.slug) {
        const duplicateBlog = await prisma.blog.findUnique({
          where: {
            slug: formattedSlug,
          },
        });

        if (duplicateBlog && duplicateBlog.id !== existingBlog.id) {
          return NextResponse.json(
            {
              message: "Blog with this slug already exists",
            },
            { status: 409 },
          );
        }
      }

      updateData.slug = formattedSlug;
      finalSlug = formattedSlug;

      // If slug changed and existing image points to the image endpoint, update the URL
      if (
        existingBlog.featuredImage &&
        existingBlog.featuredImage.startsWith("/api/blog/")
      ) {
        updateData.featuredImage = `/api/blog/${formattedSlug}/image`;
      }
    }

    // DATE
    if (date !== null && date !== undefined) {
      if (typeof date !== "string" || !date.trim()) {
        return NextResponse.json(
          {
            message: "date must be provided",
          },
          { status: 400 },
        );
      }

      const dateStr = date.trim();
      const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
      const parsedDate = new Date(`${dateOnly}T00:00:00.000Z`);

      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid date",
          },
          { status: 400 },
        );
      }

      updateData.date = parsedDate;
    }

    // META TITLE
    if (metaTitle !== null && metaTitle !== undefined) {
      if (typeof metaTitle !== "string") {
        return NextResponse.json(
          {
            message: "metaTitle must be a string",
          },
          { status: 400 },
        );
      }

      updateData.metaTitle = metaTitle.trim() || null;
    }

    // META DESCRIPTION
    if (metaDescription !== null && metaDescription !== undefined) {
      if (typeof metaDescription !== "string") {
        return NextResponse.json(
          {
            message: "metaDescription must be a string",
          },
          { status: 400 },
        );
      }

      updateData.metaDescription = metaDescription.trim() || null;
    }

    // SHORT DESCRIPTION
    if (shortDescription !== null && shortDescription !== undefined) {
      if (
        typeof shortDescription !== "string" ||
        !shortDescription.trim()
      ) {
        return NextResponse.json(
          {
            message: "shortDescription is required and cannot be empty",
          },
          { status: 400 },
        );
      }

      updateData.shortDescription = shortDescription.trim();
    }

    // FEATURED IMAGE
    if (featuredImage instanceof File && featuredImage.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(featuredImage.type)) {
        return NextResponse.json(
          {
            message: "Only JPEG, PNG, WebP and GIF images are allowed",
          },
          { status: 400 },
        );
      }

      // Max 10MB
      const maxFileSize = 10 * 1024 * 1024;
      if (featuredImage.size > maxFileSize) {
        return NextResponse.json(
          {
            message: "Image size exceeds 10MB limit",
          },
          { status: 400 },
        );
      }

      const bytes = await featuredImage.arrayBuffer();
      updateData.featuredImageData = new Uint8Array(bytes);
      updateData.featuredImageType = featuredImage.type;
      updateData.featuredImage = `/api/blog/${finalSlug}/image`;
    } else if (typeof featuredImage === "string" && featuredImage.trim()) {
      updateData.featuredImage = featuredImage.trim();
    }

    // Update using existingBlog.id (primary key) for safe atomic update
    const updatedBlog = await prisma.blog.update({
      where: {
        id: existingBlog.id,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        date: true,
        shortDescription: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Blog updated successfully",
        data: formatBlogImage(updatedBlog),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Error updating blog:", error);

    return NextResponse.json(
      {
        message: "Failed to update blog",
      },
      { status: 500 },
    );
  }
}
