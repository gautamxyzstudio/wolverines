import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyOtpSchema } from "@/app/validations/auth.validation";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid input data",
        },
        { status: 400 },
      );
    }

    const email = validation.data.email.toLowerCase();
    const otp = validation.data.otp.trim();

    // Find the latest reset token record for this email
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          message: "No OTP request found for this email. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        {
          message: "The verification code has expired. Please request a new code.",
        },
        { status: 400 },
      );
    }

    // Check if OTP matches
    if (resetRecord.otp !== otp) {
      return NextResponse.json(
        {
          message: "Invalid verification code. Please check and try again.",
        },
        { status: 400 },
      );
    }

    // Mark as verified
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { verified: true },
    });

    // Create a secure temporary reset token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const resetToken = jwt.sign(
      {
        email,
        purpose: "password_reset",
        tokenId: resetRecord.id,
      },
      secret,
      { expiresIn: "10m" },
    );

    return NextResponse.json(
      {
        message: "OTP verified successfully. You may now reset your password.",
        resetToken,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      {
        message: error?.message || "Failed to verify OTP.",
      },
      { status: 500 },
    );
  }
}
