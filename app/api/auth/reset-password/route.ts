import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { resetPasswordSchema } from "@/app/validations/auth.validation";
import { hashPassword } from "@/app/lib/password";
import jwt from "jsonwebtoken";

type ResetJwtPayload = {
  email: string;
  purpose: string;
  tokenId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 },
      );
    }

    const { email: rawEmail, newPassword, otp, resetToken } = validation.data;
    const email = rawEmail.toLowerCase();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User with this email does not exist.",
        },
        { status: 404 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    let isAuthorized = false;

    // Check authorization via resetToken if provided
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, secret) as ResetJwtPayload;

        if (
          decoded.email?.toLowerCase() === email &&
          decoded.purpose === "password_reset"
        ) {
          if (decoded.tokenId) {
            const tokenRecord = await prisma.passwordResetToken.findUnique({
              where: { id: decoded.tokenId },
            });

            if (tokenRecord && tokenRecord.verified && new Date() <= tokenRecord.expiresAt) {
              isAuthorized = true;
            }
          } else {
            isAuthorized = true;
          }
        }
      } catch (err) {
        // Token invalid or expired
        isAuthorized = false;
      }
    }

    // Fallback: If resetToken was not provided or failed, verify via OTP directly
    if (!isAuthorized && otp) {
      const resetRecord = await prisma.passwordResetToken.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
      });

      if (
        resetRecord &&
        resetRecord.otp === otp.trim() &&
        new Date() <= resetRecord.expiresAt
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          message: "Invalid, expired, or unverified password reset session. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Invalidate/delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    return NextResponse.json(
      {
        message: "Your password has been reset successfully. You can now sign in.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        message: error?.message || "Failed to reset password.",
      },
      { status: 500 },
    );
  }
}
