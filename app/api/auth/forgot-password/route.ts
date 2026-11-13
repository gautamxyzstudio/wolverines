import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { forgotPasswordSchema } from "@/app/validations/auth.validation";
import { sendPasswordResetOtpEmail } from "@/app/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid email address",
        },
        { status: 400 },
      );
    }

    const email = validation.data.email.toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "No account found with this email address.",
        },
        { status: 404 },
      );
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Expiration: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any previous active reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        otp,
        expiresAt,
        verified: false,
      },
    });

    // Send the OTP via email
    await sendPasswordResetOtpEmail({
      email,
      name: user.name,
      otp,
    });

    return NextResponse.json(
      {
        success: true,
        message: "A 6-digit verification code has been sent to your email.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to process forgot password request.",
      },
      { status: 500 },
    );
  }
}
