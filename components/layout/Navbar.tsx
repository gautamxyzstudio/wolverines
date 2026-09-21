"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
  { label: "Donation", href: "/donation" },
  { label: "Gallery", href: "/gallery" },
  { label: "Registration", href: "/registration" },
];


export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d0d0d] border-b border-[#222222]/80 select-none shadow-md">
      <div className="site-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
              <Image
                src="/images/logo.png"
                alt="The Wolverines Field Hockey Club Abbotsford Logo"
                width={130}
                height={55}
                className="h-14 w-auto object-contain brightness-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links & Contact Us CTA Button */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <nav className="flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative transition-colors duration-200 font-normal tracking-wide text-[16px] leading-[24px] ${
                      isActive
                        ? "text-[#D32F2F] font-medium"
                        : "text-white/90 hover:text-[#D32F2F]"
                    }`}
                    style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-2 rounded-md border-2 border-[#D32F2F] text-white text-[16px] leading-[24px] font-normal transition-all duration-200 hover:bg-[#D32F2F] hover:text-white active:scale-95 shadow-sm"
              style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
            >
              Contact us
            </Link>
          </div>

          {/* Mobile Hamburger / Close Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#D32F2F] hover:bg-neutral-800/60 focus:outline-none transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="block h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Slide-in Drawer Overlay */}
      <div
        className={`fixed inset-x-0 top-20 bottom-0 z-40 lg:hidden flex justify-end transition-all duration-300 ${
          mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        {/* Left Side: Blurred Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`flex-1 bg-black/45 backdrop-blur-md transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu"
        />

        {/* Right Side: Slide-out Navigation Drawer */}
        <div
          className={`w-[65vw] sm:w-[320px] md:w-[340px] h-full bg-[#121212] border-l border-[#D32F2F]/25 flex flex-col overflow-y-auto select-none shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <div
                  key={item.label}
                  className="border-b border-[#D32F2F]/25"
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-6 py-3.5 sm:py-4 text-[16.5px] sm:text-[17px] font-semibold tracking-wide transition-colors duration-150 ${
                      isActive
                        ? "text-[#D32F2F]"
                        : "text-white hover:text-[#D32F2F]"
                    }`}
                    style={{
                      fontFamily:
                        'var(--font-open-sans), "Open Sans", sans-serif',
                    }}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Centered Contact Us Button */}
          <div className="p-6 flex items-center justify-center">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center w-full max-w-[200px] py-2.5 px-6 rounded-md border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white active:scale-95 font-medium text-[16px] leading-[24px] tracking-wide transition-all duration-200 shadow-sm text-center"
              style={{
                fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
              }}
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
