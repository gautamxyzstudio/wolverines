"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Crown,
  ShieldCheck,
  Lock,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { getAdminToken, getAdminUser, setAdminSession, AdminUser } from "@/app/lib/admin-api";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "details" | "password";
  onSuccess?: (updatedUser: AdminUser) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  initialTab = "details",
  onSuccess,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "password">(initialTab);

  // Profile fields
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prevent background scrolling
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

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Load user data & reset fields when opening
  useEffect(() => {
    if (isOpen) {
      const u = getAdminUser();
      setCurrentUser(u);
      setName(u?.name || "");
      setEmail(u?.email || "");
      setRole(u?.role || "ADMIN");
      setActiveTab(initialTab);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Password validation checks
  const isMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isDifferent =
    newPassword.length > 0 &&
    currentPassword.length > 0 &&
    currentPassword !== newPassword;
  const isLongEnough = newPassword.length >= 6;

  // Save Profile Name
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Full name cannot be empty.");
      return;
    }

    if (!currentUser?.id) {
      setErrorMessage("User session not found. Please log in again.");
      return;
    }

    const token = getAdminToken();
    if (!token) {
      setErrorMessage("You must be logged in to update your profile.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to update profile name.");
        setIsLoading(false);
        return;
      }

      const updatedUser: AdminUser = {
        ...currentUser,
        name: name.trim(),
      };

      // Update local storage session
      setAdminSession(token, updatedUser);

      // Dispatch event to notify header & sidebar immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("admin_user_updated"));
      }

      if (onSuccess) {
        onSuccess(updatedUser);
      }

      onClose();
    } catch (err: any) {
      console.error("Profile update error:", err);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
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

      // Close modal immediately upon success
      onClose();
    } catch (err: any) {
      console.error("Change password error:", err);
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSuper = role === "SUPER_ADMIN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#141414] border border-white/15 p-6 sm:p-7 shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-200"
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
        <div className="flex items-start gap-4 mb-5 pr-10">
          <div className="h-11 w-11 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[#D32F2F] shrink-0">
            {activeTab === "details" ? (
              <User className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>

          <div className="pt-0.5">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Profile
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Manage your personal details and account security.
            </p>
          </div>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("details");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "details"
                ? "bg-[#D32F2F] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "password"
                ? "bg-[#D32F2F] text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
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

        {/* Tab 1: Profile Details */}
        {activeTab === "details" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Full Name (Editable) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Full Name
              </label>
              <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address (Disabled / Read-only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Email Address
                </label>
                <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-medium">
                  <Lock className="h-3 w-3" /> Cannot be changed
                </span>
              </div>
              <div className="relative rounded-xl bg-white/[0.02] border border-white/5 opacity-70 cursor-not-allowed">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-600">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-neutral-400 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* System Role (Read-only Badge) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Role
              </label>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuper
                        ? "bg-red-950/60 border border-red-500/30 text-[#D32F2F]"
                        : "bg-white/5 border border-white/10 text-neutral-300"
                    }`}
                  >
                    {isSuper ? (
                      <Crown className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isSuper ? "Super Administrator" : "Administrator"}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {isSuper
                        ? "Full system control & user management"
                        : "Standard administrative privileges"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isSuper
                      ? "bg-red-950/60 border-red-500/40 text-red-300"
                      : "bg-white/5 border-white/10 text-neutral-300"
                  }`}
                >
                  {role ? role.replace("_", " ") : "ADMIN"}
                </span>
              </div>
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
                disabled={isLoading || !name.trim() || name.trim() === currentUser?.name}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#D32F2F] hover:bg-[#b71c1c] text-white transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === "password" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Current Password
              </label>
              <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
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
              <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
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

              {/* Requirements Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
                    isLongEnough
                      ? "bg-green-950/40 text-green-400 border-green-500/30"
                      : "bg-white/[0.02] text-neutral-500 border-white/5"
                  }`}
                >
                  {isLongEnough ? <Check className="h-3 w-3" /> : "•"}
                  6+ chars
                </span>
                {currentPassword && newPassword && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
                      isDifferent
                        ? "bg-green-950/40 text-green-400 border-green-500/30"
                        : "bg-red-950/40 text-red-400 border-red-500/30"
                    }`}
                  >
                    {isDifferent ? <Check className="h-3 w-3" /> : "•"}
                    {isDifferent ? "Different" : "Must be different"}
                  </span>
                )}
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative group rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus-within:border-[#D32F2F] transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#D32F2F] transition-colors">
                  <ShieldCheck className="h-4 w-4" />
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

              {/* Match indicator */}
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
                disabled={
                  isLoading ||
                  !isLongEnough ||
                  (confirmPassword.length > 0 && !isMatching)
                }
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
        )}
      </div>
    </div>
  );
}
