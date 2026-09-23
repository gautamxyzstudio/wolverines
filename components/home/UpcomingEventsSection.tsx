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
        {/* Contained Card with Clean Cinematic Background & High Contrast */}
        <div
          className={`relative w-full text-white rounded-2xl sm:rounded-3xl border border-white/15 px-6 sm:px-12 md:px-16 py-14 sm:py-20 lg:py-24 flex flex-col items-center text-center shadow-2xl overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10, 10, 10, 0.58) 0%, rgba(10, 10, 10, 0.72) 100%), url('/gallery_img/tournament3-1536x1024.webp')",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Centered Section Tag with Brand Red Gradient Accent Bar */}
          <div className="relative z-10 flex items-center justify-center gap-2.5 sm:gap-3 mb-3.5">
            <div
              className="w-[9px] sm:w-[11px] h-[30px] sm:h-[36px] flex-shrink-0"
              style={{
                background:
                  "linear-gradient(180deg, #D32F2F 0%, #dc2626 25%, #f87171 70%, #ffffff 100%)",
              }}
            />
            <h2
              className="text-[30px] sm:text-[38px] md:text-[44px] font-normal leading-none tracking-wide uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
                fontWeight: 400,
              }}
            >
              UPCOMING EVENTS
            </h2>
          </div>

          {/* Centered Subtitle Description */}
          <p className="relative z-10 text-neutral-100 text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
            Beyond hockey, we bring together various sports enthusiasts by hosting tournaments,
            training camps, and sports festivals. Check out our upcoming events and get involved.
          </p>

          {/* Centered View All Events Button - Solid Brand Red with Crisp White Text */}
          <div className="relative z-10 mt-6 sm:mt-8">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 rounded-lg bg-[#DE2027] hover:bg-[#c41920] active:bg-[#a8141a] text-white text-sm sm:text-base font-semibold tracking-wide shadow-lg shadow-black/40 hover:shadow-red-950/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
              style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
            >
              <span>View all events</span>
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
