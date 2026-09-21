"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import GradientDivider from "@/components/ui/GradientDivider";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Registration", href: "/registration" },
  { label: "Donation", href: "/donation" },
  { label: "Contact Us", href: "/contact" },
  { label: "Summer Program", href: "/summer-program" },
  { label: "Winter Program", href: "/winter-program" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="w-full bg-[#111111] text-white border-t border-neutral-800/60 select-none">
      <div className="site-container pt-12 sm:pt-16 pb-8">
          {/* Top Header: "Get in touch" with diagonal arrow */}
          <div className="group">
            <Link
              href="/contact"
              className="flex items-center justify-between pb-8 sm:pb-12"
              aria-label="Get in touch with Wolverines Field Hockey Club"
            >
              <span
                className="text-[44px] sm:text-[76px] md:text-[110px] lg:text-[156px] text-white font-normal not-italic leading-none lg:leading-[160px] tracking-tight transition-colors group-hover:text-neutral-200"
                style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
              >
                Get in touch
              </span>
              <div className="flex-shrink-0 ml-4">
                <svg
                  className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-neutral-300 group-hover:text-white group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </Link>

            {/* Customizable Animated Gradient Line */}
            <GradientDivider
              colors={["#D32F2F", "#ff6b35", "#fbbf24", "#ea580c"]}
              height="1px"
              speed={4}
              glow={true}
              fadePercent={15}
              className="mt-2"
            />
          </div>

          {/* Middle Section: Logo, Quick Links (5 per row), Contact Us */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-8 py-12 sm:py-16">
            {/* Column 1: Brand Logo & Description */}
            <div className="md:col-span-12 lg:col-span-3 flex flex-col items-start">
              <Link href="/" className="inline-block mb-6 group transition-transform duration-200 hover:scale-[1.02]">
                <Image
                  src="/images/logo.png"
                  alt="Wolverines Field Hockey Club Abbotsford Logo"
                  width={150}
                  height={65}
                  className="h-14 sm:h-16 w-auto object-contain brightness-110"
                />
              </Link>
              <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-xs">
                Wolverines is dedicated to developing skill, confidence, and teamwork
                through quality field hockey training. We proudly support athlete
                growth, community involvement, and a lifelong love for the sports.
              </p>
            </div>

            {/* Column 2: Quick Links (Strictly 5 per row) */}
            <div className="md:col-span-12 lg:col-span-6 xl:col-span-6">
              <h3
                className="text-[20px] font-normal leading-[28px] tracking-wide text-white uppercase mb-5"
                style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", var(--font-open-sans), "Open Sans", sans-serif' }}
              >
                QUICK LINKS
              </h3>
              <ul className="grid grid-rows-5 grid-cols-2 grid-flow-col gap-x-8 gap-y-3">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm sm:text-[14px] inline-block whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Us */}
            <div className="md:col-span-12 lg:col-span-3">
              <h3
                className="text-[20px] font-normal leading-[28px] tracking-wide text-white uppercase mb-5"
                style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", var(--font-open-sans), "Open Sans", sans-serif' }}
              >
                CONTACT US
              </h3>
              <div className="space-y-4 text-sm sm:text-[15px]">
                <div>
                  <p className="text-white font-medium text-sm">Address</p>
                  <a
                    href="https://maps.app.goo.gl/EUDW1u9gB9rYZE6H8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 mt-0.5 inline-block"
                  >
                    Abbotsford B.C, Canada
                  </a>
                </div>

                <div>
                  <p className="text-white font-medium text-sm">Email</p>
                  <a
                    href="mailto:support@thewolverines.ca"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 mt-0.5 inline-block break-all"
                  >
                    support@thewolverines.ca
                  </a>
                </div>

                <div>
                  <p className="text-white font-medium text-sm">Call</p>
                  <a
                    href="tel:+16047101373"
                    className="text-neutral-400 hover:text-white transition-colors duration-200 mt-0.5 inline-block"
                  >
                    +1 604-710-1373
                  </a>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3.5 pt-2">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/people/Wolverines-FHC/100093636536434/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Wolverines on Facebook"
                    className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-600 transition-all duration-200 hover:scale-105"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/wolverinesfhc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Wolverines on Instagram"
                    className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-600 transition-all duration-200 hover:scale-105"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* White Gradient Divider Line */}
          <div
            className="w-full h-[1px] mb-6"
            style={{
              background: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Bottom Bar: Copyright & Privacy Policy */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-400">
            <p>
              Wolverines © 2026 | Designed by{" "}
              <a
                href="https://www.xyz.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white font-medium transition-colors duration-200"
              >
                XYZ Studio
              </a>
            </p>
            <p className="flex items-center gap-1.5">
              <span>All rights reserved.</span>
              <Link
                href="/privacy-policy"
                className="underline text-neutral-400 hover:text-white transition-colors duration-200 ml-1"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
    </footer >
  
  );
}
