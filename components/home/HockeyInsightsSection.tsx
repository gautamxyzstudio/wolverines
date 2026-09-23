"use client";

import React, { useState, useEffect, useRef } from "react";

export default function HockeyInsightsSection() {
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
      className="relative w-full bg-white text-neutral-900 py-6 sm:py-8 lg:py-10 select-none overflow-hidden"
    >
      <div className="site-container relative">
          <div className="flex flex-col items-center text-center">
            {/* Section Tag with Red Accent Bar */}
            <div
              className={`flex items-center justify-center gap-2.5 sm:gap-3 transition-all duration-700 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
              }`}
            >
              <div
                className="w-[10px] sm:w-[12px] md:w-[14px] h-[34px] sm:h-[40px] md:h-[44px] flex-shrink-0"
                style={{
                  background: "linear-gradient(180deg, #D32F2F 0%, #dc2626 22%, #f87171 65%, #ffffff 100%)",
                }}
              />
              <h2
                className="text-[32px] sm:text-[36px] md:text-[40px] font-normal leading-[40px] sm:leading-[44px] md:leading-[48px] uppercase text-[#181818]"
                style={{
                  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
                  fontWeight: 400,
                  color: "#181818",
                }}
              >
                LATEST HOCKEY INSIGHTS
              </h2>
            </div>

            {/* Subtitle Description */}
            <div
              className={`transition-all duration-800 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <p className="text-neutral-700 text-sm sm:text-[15px] md:text-base font-normal leading-relaxed max-w-3xl mt-4 text-center">
                Beyond hockey, we bring together various sports enthusiasts by hosting tournaments,
                training camps, and sports festivals. Check out our upcoming events and get involved.
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}
