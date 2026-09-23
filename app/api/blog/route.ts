import { prisma } from "@/app/lib/prisma";
import { AuthError, requireAdmin } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// find all

export async function GET(request: NextRequest) {
    try {

        const blogs = await prisma.blog.findMany({
            orderBy: {
                date: "desc"
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
            }
        });

        return NextResponse.json({
            message: "blogs fetched successfully",
            data: blogs || []
        });
    } catch (error) {
        console.log("Error fetching blogs", error);
        return NextResponse.json({
            message: "Failed to fetch blogs"
        }, { status: 500 })
    }
}

// create

export async function POST(request: NextRequest) {
    let uploadedFilePath: string | undefined
    try {

        await requireAdmin(request);

        const data = await request.formData()

        const title = data.get("title");
        const content = data.get("content");
        const featuredImage = data.get("featuredImage");
        const metaTitle = data.get("metaTitle");
        const metaDescription = data.get("metaDescription");
        const slug = data.get("slug");
        const date = data.get("date");
        const shortDescription = data.get("shortDescription");


        // required fields

        if (typeof title !== "string" || !title.trim()) {
            return NextResponse.json({
                message: "title is required",
            }, { status: 400 })
        }

        if (typeof content !== "string" || !content.trim()) {
            return NextResponse.json({
                message: "content is required",
            }, { status: 400 })
        }

        if (typeof slug !== "string" || !slug.trim()) {
            return NextResponse.json({
                message: "slug is required",
            }, { status: 400 })
        }

        if (typeof date !== "string") {
            return NextResponse.json({
                message: "date is required",
            }, { status: 400 })
        }

        if (typeof shortDescription !== "string" || !shortDescription.trim()) {
            return NextResponse.json({
                message: "shortDescription is required",
            }, { status: 400 })
        }

        if (!(featuredImage instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "featuredImage is required",
                },
                { status: 400 },
            );
        }

        // Validate slug
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        if (!slugRegex.test(slug.trim())) {
            return NextResponse.json(
                {
                    message:
                        "slug can only contain lowercase letters, numbers and hyphens",
                },
                { status: 400 },
            );
        }

        // Check duplicate slug
        const existingBlog = await prisma.blog.findUnique({
            where: {
                slug: slug.trim(),
            },
        });

        if (existingBlog) {
            return NextResponse.json(
                {
                    message: "Blog with this slug already exists",
                },
                { status: 409 },
            );
        }

        // Validate date
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

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(featuredImage.type)) {
            return NextResponse.json({
                message: "invalid file type , only JPEG, PNG and WebP images are allowed",
            }, { status: 400 })
        }

        // Create upload directory
        const uploadDirectory = path.join(
            process.cwd(),
            "public",
            "uploads",
            "blogs",
        );

        await fs.mkdir(uploadDirectory, {
            recursive: true,
        });

        // Create unique filename
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

        // Save image
        const bytes = await featuredImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await fs.writeFile(filePath, buffer);

        uploadedFilePath = filePath;

        // Path that will be stored in database
        const imageUrl = `/uploads/blogs/${fileName}`;

        const blog = await prisma.blog.create({
            data: {
                title: title.trim(),
                content,
                featuredImage: imageUrl,

                metaTitle:
                    typeof metaTitle === "string" &&
                        metaTitle.trim()
                        ? metaTitle.trim()
                        : null,

                metaDescription:
                    typeof metaDescription === "string" &&
                        metaDescription.trim()
                        ? metaDescription.trim()
                        : null,

                slug: slug.trim(),

                date: parsedDate,

                shortDescription:
                    typeof shortDescription === "string" &&
                        shortDescription.trim()
                        ? shortDescription.trim()
                        : null

            }
        })

        return NextResponse.json({
            message: "Blog created successfully",
            data: blog
        }, { status: 201 })

    } catch (error) {
        // Remove uploaded image if database creation fails
        if (uploadedFilePath) {
            try {
                await fs.unlink(uploadedFilePath);
            } catch (fileError) {
                console.error(
                    "Failed to remove uploaded image:",
                    fileError,
                );
            }
        }

        if (error instanceof AuthError) {
            return NextResponse.json({
                message: error.message
            }, {
                status: error.status
            })
        }

        console.error("Error creating blog", error);
        return NextResponse.json({
            message: "Failed to create blog"
        }, {
            status: 500
        })
    }
}