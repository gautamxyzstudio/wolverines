"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";
import { getAdminToken } from "@/app/lib/admin-api";
import { API_ENDPOINTS } from "@/constants/endpoints";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isDifferent = newPassword.length > 0 && currentPassword.length > 0 && currentPassword !== newPassword;
  const isLongEnough = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (!isLongEnough) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password cannot be the same as your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    const token = getAdminToken();
    if (!token) {
      setErrorMessage("You must be logged in to change your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to update password.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Your password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Change password error:", err);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top back button */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Settings Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141414] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10 relative z-10">
          <div className="h-11 w-11 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[#D32F2F] shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Change Account Password
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Ensure your admin account stays secure with a strong password. You will need your
              current password to verify the change.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-950/50 border border-green-500/40 text-green-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Current Password
            </label>
            <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] focus-within:ring-2 focus-within:ring-[#D32F2F]/20 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="w-full pl-10 pr-11 py-3 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              New Password
            </label>
            <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] focus-within:ring-2 focus-within:ring-[#D32F2F]/20 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full pl-10 pr-11 py-3 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Validation indicators */}
            <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  isLongEnough
                    ? "bg-green-950/40 text-green-400 border-green-500/30"
                    : "bg-white/[0.02] text-neutral-500 border-white/5"
                }`}
              >
                {isLongEnough ? <Check className="h-3 w-3" /> : "•"}
                At least 6 characters
              </span>
              {currentPassword && newPassword && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                    isDifferent
                      ? "bg-green-950/40 text-green-400 border-green-500/30"
                      : "bg-red-950/40 text-red-400 border-red-500/30"
                  }`}
                >
                  {isDifferent ? <Check className="h-3 w-3" /> : "•"}
                  {isDifferent ? "Different from current" : "Must be different"}
                </span>
              )}
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] focus-within:ring-2 focus-within:ring-[#D32F2F]/20 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="w-full pl-10 pr-11 py-3 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && (
              <p
                className={`mt-2 text-[11px] flex items-center gap-1 font-medium ${
                  isMatching ? "text-green-400" : "text-red-400"
                }`}
              >
                {isMatching ? (
                  <>
                    <Check className="h-3 w-3" /> Passwords match
                  </>
                ) : (
                  "• Passwords do not match yet"
                )}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isLoading || (newPassword.length > 0 && (!isLongEnough || !isMatching))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#D32F2F] hover:bg-[#b71c1c] text-white transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Save New Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
