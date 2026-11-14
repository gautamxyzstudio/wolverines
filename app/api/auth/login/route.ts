import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { comparePassword } from "@/app/lib/password";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "email and password are required",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "user with this email does not exist",
        },
        { status: 404 },
      );
    }

    // Check if account is blocked
    if (user.blocked) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is blocked. Please contact a Super Administrator.",
        },
        { status: 403 },
      );
    }

    // check password
    const isValidPass = await comparePassword(password, user.password);

    if (!isValidPass) {
      return NextResponse.json(
        {
          message: "invalid password",
        },
        { status: 401 },
      );
    }

    // generate token

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      {
        expiresIn: "200d",
      },
    );

    return NextResponse.json(
      {
        jwt: token,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to login",
      },
      { status: 500 },
    );
  }
}
