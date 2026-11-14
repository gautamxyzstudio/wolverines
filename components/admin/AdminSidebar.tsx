"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  HeartHandshake,
  Calendar,
  FileText,
  DollarSign,
  UserPlus,
  Mail,
  LogOut,
  ExternalLink,
  Shield,
  X,
  Lock,
  Users,
} from "lucide-react";
import { clearAdminSession, getAdminUser, AdminUser } from "@/app/lib/admin-api";
import { useEffect, useState } from "react";
import ProfileModal from "@/components/admin/ProfileModal";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Camp Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
  },
  {
    label: "General Enquiries",
    href: "/admin/inquiries",
    icon: MessageSquare,
  },
  {
    label: "Donations",
    href: "/admin/donations",
    icon: HeartHandshake,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Camp Pricing",
    href: "/admin/camp-pricing",
    icon: DollarSign,
  },
  {
    label: "Join Requests",
    href: "/admin/join-requests",
    icon: UserPlus,
  },
  {
    label: "Email Marketing",
    href: "/admin/emails",
    icon: Mail,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    superAdminOnly: true,
  },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    setUser(getAdminUser());

    const handleUserUpdate = () => {
      setUser(getAdminUser());
    };
    window.addEventListener("admin_user_updated", handleUserUpdate);
    return () => window.removeEventListener("admin_user_updated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const content = (
    <div className="flex h-full flex-col bg-[#0f0f0f] border-r border-white/10 text-white select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="h-10 w-10 flex items-center justify-center shrink-0">
            <Image
              src="/icon.png"
              alt="Wolverines Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div>
            <h1 className="font-black tracking-wider text-base uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Wolverines
            </h1>
            <p className="text-[11px] font-semibold text-[#D32F2F] uppercase tracking-wider">
              Admin Portal
            </p>
          </div>
        </Link>

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          Main Navigation
        </div>
        {NAV_ITEMS.filter(
          (item) => !(item as any).superAdminOnly || user?.role === "SUPER_ADMIN",
        ).map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                active
                  ? "bg-gradient-to-r from-[#D32F2F] to-[#b91c1c] text-white shadow-lg shadow-red-950/40 font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                  active ? "text-white" : "text-neutral-400 group-hover:text-[#D32F2F]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Website Link & User Footer */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#0a0a0a]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
            View Live Site
          </span>
        </Link>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D32F2F]/40 to-neutral-800 border border-[#D32F2F]/40 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Administrator"}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                {user?.email || "admin@thewolverines.ca"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setChangePasswordOpen(true)}
              title="Profile & Security"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Lock className="h-4 w-4" />
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#D32F2F] hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>

      {/* Profile & Security Modal */}
      <ProfileModal
        isOpen={changePasswordOpen}
        initialTab="password"
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
}
