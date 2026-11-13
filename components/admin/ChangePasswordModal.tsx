"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getAdminToken } from "@/app/lib/admin-api";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessMessage(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess();
      }

      // Close modal immediately
      onClose();
    } catch (err: any) {
      console.error("Change password error:", err);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px] animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#141414] border border-white/15 p-6 sm:p-7 shadow-2xl shadow-black/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-30"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 relative z-10 pr-10">
          <div className="h-11 w-11 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[#D32F2F] shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="pt-0.5">
            <h3 className="text-xl font-black text-white tracking-tight">
              Change Password
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Keep your account protected with a strong, updated password.
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-green-950/50 border border-green-500/40 text-green-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Current Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
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
                placeholder="Enter current password"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
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
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Helper notes */}
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span
                className={
                  isLongEnough
                    ? "text-emerald-400 font-medium flex items-center gap-1"
                    : "text-neutral-500"
                }
              >
                {isLongEnough ? (
                  <>
                    <Check className="h-3 w-3" /> Minimum 6 characters
                  </>
                ) : (
                  "At least 6 characters"
                )}
              </span>

              {currentPassword && newPassword && currentPassword === newPassword && (
                <span className="text-amber-400 font-medium">
                  Must differ from current
                </span>
              )}
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] focus-within:ring-2 focus-within:ring-[#D32F2F]/20 transition-all">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Match feedback */}
            {confirmPassword.length > 0 && (
              <div className="mt-1.5 text-[11px]">
                {isMatching ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    Passwords do not match yet
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !isLongEnough || (confirmPassword.length > 0 && !isMatching)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#D32F2F] hover:bg-[#b71c1c] text-white transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
