"use client";

import { Menu, LogOut, ShieldCheck, Crown, User, Lock, ChevronDown } from "lucide-react";
import { clearAdminSession, getAdminUser } from "@/app/lib/admin-api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ProfileModal from "@/components/admin/ProfileModal";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string; email?: string } | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getAdminUser());

    const handleUserUpdate = () => {
      setUser(getAdminUser());
    };
    window.addEventListener("admin_user_updated", handleUserUpdate);
    return () => window.removeEventListener("admin_user_updated", handleUserUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur-xl px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 lg:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden sm:block text-xs text-neutral-400 font-normal mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
              user?.role === "SUPER_ADMIN"
                ? "bg-red-950/50 border-red-500/30 text-red-400"
                : "bg-white/[0.04] border-white/10 text-neutral-300"
            }`}
          >
            {user?.role === "SUPER_ADMIN" ? (
              <Crown className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
            )}
            <span>{user?.role ? user.role.replace("_", " ") : "ADMIN"}</span>
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative pl-2 border-l border-white/10" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#D32F2F] to-[#7f1d1d] flex items-center justify-center font-bold text-xs text-white shadow-md shadow-red-950/40">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
              </div>
              <span className="hidden md:block text-xs font-semibold text-neutral-200 group-hover:text-white max-w-[120px] truncate">
                {user?.name || "Admin"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#141414] border border-white/10 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                {/* Profile (Unified Details & Password) */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer group"
                >
                  <div className="p-1 rounded-lg bg-white/5 text-neutral-400 group-hover:text-[#D32F2F] group-hover:bg-red-950/30 transition-colors">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span>Profile</span>
                </button>

                {/* Sign Out option */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left cursor-pointer mt-0.5 group"
                >
                  <div className="p-1 rounded-lg bg-red-950/30 text-red-400 group-hover:text-red-300 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Unified Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccess={(updated) => setUser(updated)}
      />
    </>
  );
}
