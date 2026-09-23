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

    let blog = await prisma.blog.findUnique({
      where: {
        slug,
      },
    });

    if (!blog) {
      // Fallback in case id was passed
      blog = await prisma.blog.findUnique({
        where: {
          id: slug,
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
        data: blog,
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

    let existing = await prisma.blog.findUnique({
      where: {
        id: slug,
      },
    });

    if (!existing) {
      existing = await prisma.blog.findUnique({
        where: {
          slug,
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
    });

    // Delete image from local storage
    if (existing.featuredImage) {
      try {
        const imagePath = path.join(
          process.cwd(),
          "public",
          existing.featuredImage.replace(/^\//, ""),
        );

        await fs.unlink(imagePath);
      } catch (fileError) {
        console.error("Failed to delete blog image:", fileError);
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
  let newUploadedFilePath: string | undefined;

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

    let existingBlog = await prisma.blog.findUnique({
      where: {
        id: slug,
      },
    });

    if (!existingBlog) {
      existingBlog = await prisma.blog.findUnique({
        where: {
          slug,
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

    const formData = await request.formData();

    const title = formData.get("title");
    const content = formData.get("content");
    const featuredImage = formData.get("featuredImage");
    const metaTitle = formData.get("metaTitle");
    const metaDescription = formData.get("metaDescription");
    const newSlug = formData.get("slug");
    const date = formData.get("date");
    const shortDescription =
      formData.get("shortDescription");

    const updateData: {
      title?: string;
      content?: string;
      featuredImage?: string | null;
      metaTitle?: string | null;
      metaDescription?: string | null;
      slug?: string;
      date?: Date;
      shortDescription?: string | null;
    } = {};

    // TITLE
    if (title !== null) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
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
    if (content !== null) {
      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
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
    if (newSlug !== null) {
      if (
        typeof newSlug !== "string" ||
        !newSlug.trim()
      ) {
        return NextResponse.json(
          {
            message: "slug must be a non-empty string",
          },
          { status: 400 },
        );
      }

      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

      if (!slugRegex.test(newSlug.trim())) {
        return NextResponse.json(
          {
            message:
              "slug can only contain lowercase letters, numbers and hyphens",
          },
          { status: 400 },
        );
      }

      if (newSlug.trim() !== existingBlog.slug) {
        const duplicateBlog =
          await prisma.blog.findUnique({
            where: {
              slug: newSlug.trim(),
            },
          });

        if (duplicateBlog) {
          return NextResponse.json(
            {
              message:
                "Blog with this slug already exists",
            },
            { status: 409 },
          );
        }
      }

      updateData.slug = newSlug.trim();
    }

    // DATE
    if (date !== null) {
      if (
        typeof date !== "string" ||
        !date.trim()
      ) {
        return NextResponse.json(
          {
            message: "date must be provided",
          },
          { status: 400 },
        );
      }

      const parsedDate = new Date(
        `${date}T00:00:00`,
      );

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
    if (metaTitle !== null) {
      if (
        typeof metaTitle !== "string"
      ) {
        return NextResponse.json(
          {
            message: "metaTitle must be a string",
          },
          { status: 400 },
        );
      }

      updateData.metaTitle =
        metaTitle.trim() || null;
    }

    // META DESCRIPTION
    if (metaDescription !== null) {
      if (
        typeof metaDescription !== "string"
      ) {
        return NextResponse.json(
          {
            message:
              "metaDescription must be a string",
          },
          { status: 400 },
        );
      }

      updateData.metaDescription =
        metaDescription.trim() || null;
    }

    // SHORT DESCRIPTION
    if (shortDescription !== null) {
      if (
        typeof shortDescription !== "string" ||
        !shortDescription.trim()
      ) {
        return NextResponse.json(
          {
            message:
              "shortDescription is required and cannot be empty",
          },
          { status: 400 },
        );
      }

      updateData.shortDescription =
        shortDescription.trim();
    }

    // FEATURED IMAGE
    if (featuredImage instanceof File) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(featuredImage.type)) {
        return NextResponse.json(
          {
            message:
              "Only JPEG, PNG and WebP images are allowed",
          },
          { status: 400 },
        );
      }

      const uploadDirectory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "blogs",
      );

      await fs.mkdir(uploadDirectory, {
        recursive: true,
      });

      const extension =
        featuredImage.type === "image/jpeg"
          ? ".jpg"
          : featuredImage.type === "image/png"
            ? ".png"
            : ".webp";

      const fileName = `${crypto.randomUUID()}${extension}`;

      const filePath = path.join(
        uploadDirectory,
        fileName,
      );

      const bytes =
        await featuredImage.arrayBuffer();

      const buffer = Buffer.from(bytes);

      await fs.writeFile(filePath, buffer);

      newUploadedFilePath = filePath;

      updateData.featuredImage =
        `/uploads/blogs/${fileName}`;
    }

    const updatedBlog = await prisma.blog.update({
      where: {
        id: existingBlog.id,
      },
      data: updateData,
    });

    // Delete old image only after successful DB update
    if (
      newUploadedFilePath &&
      existingBlog.featuredImage
    ) {
      try {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingBlog.featuredImage.replace(
            /^\//,
            "",
          ),
        );

        await fs.unlink(oldImagePath);
      } catch (fileError) {
        console.error(
          "Failed to delete old blog image:",
          fileError,
        );
      }
    }

    return NextResponse.json(
      {
        message: "Blog updated successfully",
        data: updatedBlog,
      },
      { status: 200 },
    );
  } catch (error) {
    // Remove newly uploaded file if database update fails
    if (newUploadedFilePath) {
      try {
        await fs.unlink(newUploadedFilePath);
      } catch (fileError) {
        console.error(
          "Failed to remove uploaded image:",
          fileError,
        );
      }
    }

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
