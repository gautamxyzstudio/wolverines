import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Email must be a string"
          : "Email is required",
    })
    .trim()
    .email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Email must be a string"
          : "Email is required",
    })
    .trim()
    .email("Invalid email address"),
  otp: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "OTP must be a string"
          : "OTP is required",
    })
    .trim()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "Email must be a string"
          : "Email is required",
    })
    .trim()
    .email("Invalid email address"),
  newPassword: z
    .string({
      error: (issue) =>
        issue.code === "invalid_type"
          ? "New password must be a string"
          : "New password is required",
    })
    .min(6, "Password must be at least 6 characters"),
  otp: z.string().trim().optional(),
  resetToken: z.string().trim().optional(),
}).refine((data) => Boolean(data.otp || data.resetToken), {
  message: "Either OTP or reset token is required to reset password",
  path: ["resetToken"],
});
