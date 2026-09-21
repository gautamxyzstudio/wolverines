"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AboutSection() {
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
      className="relative w-full bg-white text-neutral-900 py-12 sm:py-16 lg:py-20 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Tag Header: "ABOUT US" with Gradient Red Bar */}
        <div
          className={`flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <div
            className="w-[8px] sm:w-[10px] h-[28px] sm:h-[34px] flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #D32F2F 0%, #DE2027 50%, rgba(255,255,255,0) 100%)",
            }}
          />
          <h2
            className="text-[20px] sm:text-[24px] md:text-[28px] font-bold leading-none tracking-wider uppercase text-[#181818]"
            style={{
                                 fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif', 

              fontWeight: 800,
            }}
          >
            ABOUT US
          </h2>
        </div>

        {/* Main Relative Container holding Player and Big Typography */}
        <div className="relative">
          {/* Action Hockey Player Cutout on the Top Right - Balanced Position */}
          <div
            className={`relative lg:absolute lg:right-0 xl:right-1 2xl:right-2 lg:-top-8 xl:-top-10 2xl:-top-12 w-full lg:w-auto flex justify-center lg:justify-end mb-6 lg:mb-0 pointer-events-none z-10 transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-16 scale-95"
            }`}
          >
            <div
              className="relative w-[230px] sm:w-[260px] md:w-[290px] lg:w-[310px] xl:w-[340px] aspect-[74/79]"
            >
              <Image
                src="/images/hockey_player.png"
                alt="Wolverines Field Hockey Player In Action"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Staggered Big Typography: STRONGER / TOGETHER / ALWAYS */}
          <div className="relative z-0">
            {/* Line 1: STRONGER (Bold, Dark) */}
            <div
              className={`transition-all duration-900 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
              }`}
            >
              <h2
                className="text-[48px] sm:text-[70px] md:text-[90px] lg:text-[106px] xl:text-[124px] font-extrabold leading-[0.92] tracking-tight uppercase text-[#181818]"
                style={{
                  fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                  fontWeight: 800,
                }}
              >
                STRONGER
              </h2>
            </div>

            {/* Line 2: TOGETHER (Regular Weight, Indented, Dark) */}
            <div
              className={`transition-all duration-900 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
              }`}
            >
              <h2
                className="text-[48px] sm:text-[70px] md:text-[90px] lg:text-[106px] xl:text-[124px] font-normal leading-[0.92] tracking-tight uppercase text-[#181818] ml-4 sm:ml-10 md:ml-18 lg:ml-28 xl:ml-36 my-1 sm:my-2"
                style={{
                  fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                  fontWeight: 400,
                }}
              >
                TOGETHER
              </h2>
            </div>

            {/* Line 3: ALWAYS on Left + Narrative Text & Learn More on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-start mt-4 sm:mt-6 lg:mt-8 relative z-20">
              {/* ALWAYS (Bold, Dark) */}
              <div
                className={`lg:col-span-5 xl:col-span-5 transition-all duration-900 delay-450 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-12 translate-y-4"
                }`}
              >
                <h2
                  className="text-[48px] sm:text-[70px] md:text-[90px] lg:text-[106px] xl:text-[124px] font-extrabold leading-[0.92] tracking-tight uppercase text-[#181818]"
                  style={{
                    fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                    fontWeight: 800,
                  }}
                >
                  ALWAYS
                </h2>
              </div>

              {/* Narrative Description & CTA on the Right (Shifted Down & Right) */}
              <div
                className={`lg:col-span-7 xl:col-span-7 flex flex-col items-start pt-4 sm:pt-6 lg:pt-9 xl:pt-12 lg:pl-6 xl:pl-10 max-w-xl xl:max-w-2xl transition-all duration-1000 delay-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <p className="text-[#262626] text-xs sm:text-sm md:text-[14.5px] lg:text-[15px] xl:text-[15.5px] leading-[1.7] font-normal">
                  Wolverines in Abbotsford, British Columbia, is committed to
                  developing young athletes in the dynamic sport of field hockey.
                  We offer expert coaching, inclusive training programs, and a
                  supportive environment where players of all skill levels can
                  grow, improve, and enjoy the game. Our mission is to nurture
                  confidence, teamwork, and a lifelong passion for field hockey
                  while providing opportunities to engage in community events and
                  competitive play. At Wolverines, every athlete is guided to
                  reach their full potential and love the sport.
                </p>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-[#DE2027] font-semibold text-xs sm:text-sm hover:text-red-700 hover:gap-2 transition-all duration-200 mt-4 group"
                >
                  <span>Learn More</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">&gt;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
