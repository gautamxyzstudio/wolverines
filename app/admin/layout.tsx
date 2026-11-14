"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminToken, getAdminUser } from "@/app/lib/admin-api";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/forgot-password";

  useEffect(() => {
    if (isAuthPage) {
      setIsCheckingAuth(false);
      return;
    }

    const token = getAdminToken();
    const user = getAdminUser();

    if (!token || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      router.push("/admin/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0b0b0b] text-white">{children}</div>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#D32F2F] mb-4" />
        <p className="text-sm font-semibold text-neutral-400 tracking-wider uppercase">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  // Get dynamic page title based on pathname
  const getHeaderInfo = () => {
    if (pathname === "/admin") {
      return { title: "Dashboard Overview", subtitle: "Real-time stats and management hub" };
    }
    if (pathname.startsWith("/admin/registrations")) {
      return { title: "Camp Registrations", subtitle: "Summer camp and winter camp registrations" };
    }
    if (pathname.startsWith("/admin/inquiries")) {
      return { title: "General Enquiries", subtitle: "Review contact messages and website inquiries" };
    }
    if (pathname.startsWith("/admin/donations")) {
      return { title: "Donations Hub", subtitle: "Track contributions, donors, and payment records" };
    }
    if (pathname.startsWith("/admin/events")) {
      return { title: "Events Management", subtitle: "Create, edit, schedule, and delete club events" };
    }
    if (pathname.startsWith("/admin/blogs")) {
      return { title: "Blogs Management", subtitle: "Publish, update, and manage blogs" };
    }
    if (pathname.startsWith("/admin/camp-pricing")) {
      return { title: "Camps Pricing", subtitle: "Configure summer & winter camp fees, discounts, and toggles" };
    }
    if (pathname.startsWith("/admin/join-requests")) {
      return { title: "Join Our Club Requests", subtitle: "Review and process requests to join the club" };
    }
    if (pathname.startsWith("/admin/emails")) {
      return { title: "Email Marketing & History", subtitle: "Compose dynamic campaigns and inspect delivery history" };
    }
    if (pathname.startsWith("/admin/users")) {
      return { title: "User Management", subtitle: "Manage system administrators and roles" };
    }
    if (pathname.startsWith("/admin/change-password")) {
      return { title: "Security & Password", subtitle: "Update your admin account credentials" };
    }
    return { title: "Admin Portal", subtitle: "The Wolverines Sports Club" };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex">
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
