"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden rounded-t-none rounded-b-[36px] sm:rounded-b-[48px] lg:rounded-b-[60px] bg-neutral-900 min-h-[520px] lg:min-h-[560px] xl:min-h-[580px] flex items-center">
      {/* Background Video Container - Full Bleed 100% Viewport Width */}
      <div className="absolute inset-0 w-full h-full bg-neutral-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-[center_35%]"
        >
          <source src="/videos/1HBVideo-WC-1.mp4" type="video/mp4" />
          <source src="/videos/1HBvideo-WC-1.mp4" type="video/mp4" />
        </video>

        {/* Minor subtle overlay layer */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      {/* Hero Content Container - Standard site-container */}
      <div className="site-container relative z-10 py-14 sm:py-18 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Huge Headline, Paragraph & CTA Button */}
          <div className="lg:col-span-7 flex flex-col items-start animate-hero-left">
            <h1
              className="text-[68px] sm:text-[96px] md:text-[120px] lg:text-[144px] font-normal leading-[0.88] tracking-tight text-white uppercase select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
              style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
            >
              RISE <br />
              STRONG
            </h1>

            <p className="text-white text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mt-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Elevate your field hockey game with Wolverines by building skills,
              confidence, teamwork, and a winning spirit.
            </p>

            <div className="mt-8 sm:mt-10">
              <Link
                href="/registration"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-[#D32F2F] text-white font-medium text-base hover:bg-red-700 transition-all duration-200 shadow-xl shadow-black/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Our Club
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Frosted Glass Cards Panel */}
          <div className="lg:col-span-5 w-full animate-hero-right">
            <div
              className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/25 border-b-white/10 bg-gradient-to-b from-white/[0.24] via-white/[0.12] to-white/[0.04] backdrop-blur-md"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.45)",
              }}
            >
              {/* White frosted fade extending further down */}
              <div
                className="absolute inset-x-0 top-0 h-[88%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0) 100%)",
                }}
              />

              {/* Top Row: Donation & Registration Cards */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Donation Card */}
                <div className="bg-white/95 hover:bg-white text-neutral-900 rounded-xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-normal tracking-wide text-neutral-900 uppercase"
                      style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                    >
                      DONATION
                    </h3>
                    <p className="text-neutral-600 text-xs sm:text-[13px] leading-snug mt-1.5 font-normal">
                      Your support helps develop young athletes and grow the sport.
                    </p>
                  </div>
                  <Link
                    href="/donation"
                    className="text-[#D32F2F] font-semibold text-xs sm:text-[13px] hover:text-red-700 transition-colors inline-flex items-center gap-1 mt-3"
                  >
                    Donate Now &gt;
                  </Link>
                </div>

                {/* Registration Card */}
                <div className="bg-[#D32F2F] hover:bg-red-700 text-white rounded-xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-normal tracking-wide text-white uppercase"
                      style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                    >
                      REGISTRATION
                    </h3>
                    <p className="text-white/90 text-xs sm:text-[13px] leading-snug mt-1.5 font-normal">
                      Become a Wolverine! Train, compete, and grow with us.
                    </p>
                  </div>
                  <Link
                    href="/registration"
                    className="text-white font-semibold text-xs sm:text-[13px] hover:underline inline-flex items-center gap-1 mt-3"
                  >
                    Register Now &gt;
                  </Link>
                </div>
              </div>

              {/* Bottom Card: Upcoming Matches */}
              <div className="relative z-10 bg-white/95 hover:bg-white text-neutral-900 rounded-xl p-3.5 sm:p-4 mt-3.5 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-md">
                {/* Match Thumbnail */}
                <div className="relative w-24 sm:w-28 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200">
                  <Image
                    src="/images/hockey_match_thumb.jpg"
                    alt="Upcoming Wolverines Field Hockey Match"
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[16px] sm:text-[18px] font-normal tracking-wide text-neutral-900 uppercase leading-tight"
                    style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                  >
                    UPCOMING MATCHES
                  </h3>
                  <p className="text-neutral-900 font-semibold text-xs sm:text-[13px] mt-0.5">
                    Game On!
                  </p>
                  <p className="text-neutral-600 text-[11px] sm:text-xs leading-snug mt-0.5 truncate sm:whitespace-normal">
                    Don&apos;t miss our next big match.
                  </p>
                  <Link
                    href="/events"
                    className="text-[#D32F2F] font-semibold text-xs sm:text-[13px] hover:text-red-700 transition-colors inline-flex items-center gap-1 mt-1"
                  >
                    View &gt;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
