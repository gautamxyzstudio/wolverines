import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, comparePassword } from "@/app/lib/password";
import { changePasswordSchema } from "@/app/validations/auth.validation";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  role: string;
};

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce Authorization Bearer Token
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          message: "Unauthorized: No authorization token provided",
        },
        { status: 401 },
      );
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return NextResponse.json(
        {
          message: "Unauthorized: Invalid authorization token format",
        },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch {
      return NextResponse.json(
        {
          message: "Forbidden: Invalid or expired token",
        },
        { status: 403 },
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 },
      );
    }

    const { newPassword, confirmPassword } = validation.data;
    const currentPassword = (validation.data.currentPassword || validation.data.oldPassword) as string;

    // Check optional confirmPassword matching
    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message: "New password and confirm password do not match",
        },
        { status: 400 },
      );
    }

    // Ensure new password differs from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          message: "New password cannot be the same as the current password",
        },
        { status: 400 },
      );
    }

    // 3. Find the authenticated user from the token's user identifier
    const targetUserId =
      decoded.userId || (decoded as any).id || (decoded as any).sub;

    if (!targetUserId) {
      return NextResponse.json(
        {
          message: "Forbidden: Token is missing a valid user identifier",
        },
        { status: 403 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // 4. Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          message: "Incorrect current password",
        },
        { status: 400 },
      );
    }

    // 5. Hash new password and update user in database
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Change password error:", error);
    const isTimeout =
      error?.message?.includes("timed out") ||
      error?.code === "ETIMEDOUT" ||
      error?.message?.includes("Connection terminated");

    return NextResponse.json(
      {
        success: false,
        message: isTimeout
          ? "Database connection timed out. Please try again."
          : error?.message || "Failed to change password",
      },
      { status: isTimeout ? 503 : 500 },
    );
  }
}
