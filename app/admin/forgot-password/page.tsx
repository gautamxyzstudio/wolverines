"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { API_ENDPOINTS } from "@/constants/endpoints";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Steps: 1 = Email, 2 = OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // OTP inputs references
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Prefill email if provided in query params
  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Focus first OTP box when entering Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // -------------------------------------------------------------
  // Step 1: Submit Email to receive OTP
  // -------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your admin email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to send verification code.");
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      setSuccessMessage(data.message || "Verification code sent to your email.");
      setStep(2);
      setResendCountdown(120); // 2 minutes (120s) cooldown
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 2: Handle OTP Input (Auto-advance & Paste support)
  // -------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // If user typed/pasted a single digit
    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pasted) return;

    const digits = pasted.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus last filled or 6th input
    const nextIdx = Math.min(digits.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // -------------------------------------------------------------
  // Step 2: Submit OTP for verification
  // -------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullOtp = otp.join("").trim();
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      setResetToken(data.resetToken || "");
      setSuccessMessage("Code verified! Please create your new password.");
      setStep(3);
    } catch (err) {
      console.error("Verify OTP failed:", err);
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Step 3: Submit New Password
  // -------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
          resetToken: resetToken || undefined,
          otp: otp.join("").trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      setStep(4);
    } catch (err) {
      console.error("Reset password failed:", err);
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0b0b0b] relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D32F2F]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-950/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center mb-4">
            <Image
              src="/icon.png"
              alt="The Wolverines Logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain drop-shadow-[0_4px_16px_rgba(211,47,47,0.4)]"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            The Wolverines
          </h1>
          <p className="text-xs font-semibold text-[#D32F2F] uppercase tracking-widest mt-1">
            Account Recovery
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-[#141414]/90 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Progress Step Indicator (Only for steps 1 to 3) */}
          {step <= 3 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 text-xs font-bold uppercase tracking-wider">
              <div
                className={`flex items-center gap-1.5 ${
                  step >= 1 ? "text-[#D32F2F]" : "text-neutral-500"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 1
                      ? "bg-[#D32F2F] text-white"
                      : "bg-white/10 text-neutral-400"
                  }`}
                >
                  1
                </span>
                <span>Email</span>
              </div>

              <div
                className={`h-0.5 flex-1 mx-2 ${
                  step >= 2 ? "bg-[#D32F2F]" : "bg-white/10"
                }`}
              />

              <div
                className={`flex items-center gap-1.5 ${
                  step >= 2 ? "text-[#D32F2F]" : "text-neutral-500"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 2
                      ? "bg-[#D32F2F] text-white"
                      : "bg-white/10 text-neutral-400"
                  }`}
                >
                  2
                </span>
                <span>Verify</span>
              </div>

              <div
                className={`h-0.5 flex-1 mx-2 ${
                  step >= 3 ? "bg-[#D32F2F]" : "bg-white/10"
                }`}
              />

              <div
                className={`flex items-center gap-1.5 ${
                  step >= 3 ? "text-[#D32F2F]" : "text-neutral-500"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 3
                      ? "bg-[#D32F2F] text-white"
                      : "bg-white/10 text-neutral-400"
                  }`}
                >
                  3
                </span>
                <span>Reset</span>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && step !== 4 && (
            <div className="mb-5 p-3.5 rounded-xl bg-green-950/50 border border-green-500/40 text-green-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: Enter Email                                       */}
          {/* ========================================================= */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Forgot Password?
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enter your registered admin email address and we will send you a
                  6-digit verification code to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@thewolverines.ca"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: Enter 6-digit OTP                                 */}
          {/* ========================================================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Enter Verification Code
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We sent a 6-digit code to{" "}
                  <strong className="text-white font-semibold">{email}</strong>.
                  Please enter it below:
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  6-Digit OTP Code
                </label>
                <div
                  className="flex items-center justify-between gap-2 sm:gap-2.5"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-13 sm:w-13 sm:h-14 text-center text-xl font-black rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/40 transition-all font-mono"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change Email
                </button>

                {resendCountdown > 0 ? (
                  <span className="text-neutral-500 font-medium">
                    Resend code in {Math.floor(resendCountdown / 60)}:
                    {(resendCountdown % 60).toString().padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-[#D32F2F] hover:text-red-400 font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className="h-3 w-3" />
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Verify &amp; Continue
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 3: Set New Password                                  */}
          {/* ========================================================= */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Create New Password
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your identity has been verified. Enter your new password
                  below (minimum 6 characters).
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    autoFocus
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <KeyRound className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 4: Success View                                      */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="text-center py-4 space-y-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-white">
                  Password Reset Complete!
                </h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed max-w-sm mx-auto">
                  Your password has been successfully updated. You can now use
                  your new password to log in to the admin dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/admin/login")}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                Sign In with New Password
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {step !== 4 && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link
                href="/admin/login"
                className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#D32F2F]" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
