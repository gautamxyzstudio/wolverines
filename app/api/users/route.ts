import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "@/app/lib/password";
import { createUserSchema } from "@/app/validations/user.validation";
import { requireSuperAdmin, AuthError } from "@/app/lib/auth";

// get all users

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const users = await prisma.user.findMany({
      select: {
        name: true,
        id: true,
        email: true,
        createdAt: true,
        role: true,
        blocked: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "users fetched successfully",
        data: users,
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

    console.log("error : ", error);
    return NextResponse.json(
      {
        message: "failed to fetch the users",
      },
      { status: 500 },
    );
  }
}

// create user

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const data = await request.json();

    // Validate request body
    const result = createUserSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const { name, email, password, role } = result.data;

    // check if user already exists

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "user with this email already exists",
        },
        { status: 409 },
      );
    }

    // hash passowrd
    const hashedPassword = await hashPassword(password);

    //  create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "user created successfully",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("error : ", error);
    return NextResponse.json(
      {
        message: "failed to create the user",
      },
      { status: 500 },
    );
  }
}
