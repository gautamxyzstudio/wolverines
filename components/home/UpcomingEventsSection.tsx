"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function UpcomingEventsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white py-6 sm:py-10 lg:py-14 select-none overflow-hidden"
    >
      <div className="site-container">
        {/* Contained Card with Proper Deep Black Background, Border & Rounded Corners */}
        <div
          className={`relative w-full text-white rounded-2xl sm:rounded-3xl border border-neutral-800/90 px-6 sm:px-12 md:px-16 py-14 sm:py-20 lg:py-24 flex flex-col items-center text-center shadow-2xl overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0.84)), url('/gallery_img/tournament3-1536x1024.webp')",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Subtle Ambient Red Glow in the center for depth */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[280px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"
          />

          {/* Centered Section Tag with Red Accent Bar */}
          <div className="relative z-10 flex items-center justify-center gap-2.5 sm:gap-3 mb-3.5">
            <div
              className="w-[9px] sm:w-[11px] h-[30px] sm:h-[36px] flex-shrink-0"
              style={{
                background:
                  "linear-gradient(180deg, #D32F2F 0%, #dc2626 25%, #f87171 70%, #ffffff 100%)",
              }}
            />
            <h2
              className="text-[28px] sm:text-[36px] md:text-[42px] font-normal leading-none tracking-wide uppercase text-white"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
                fontWeight: 400,
              }}
            >
              UPCOMING EVENTS
            </h2>
          </div>

          {/* Centered Subtitle Description */}
          <p className="relative z-10 text-neutral-300 text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-2xl mx-auto">
            Beyond hockey, we bring together various sports enthusiasts by hosting tournaments,
            training camps, and sports festivals. Check out our upcoming events and get involved.
          </p>

          {/* Centered View All Events Button */}
          <div className="relative z-10 mt-6 sm:mt-8">
            <Link
              href="/events"
              className="inline-flex items-center justify-center px-7 sm:px-9 py-3 rounded-lg border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-red-950/40"
              style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
            >
              View all events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
