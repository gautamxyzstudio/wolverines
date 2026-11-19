"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { YEAR_END_EVENT_CONFIG } from "@/app/lib/year-end-constants";

export default function YearEndRegistrationHero() {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const formElement = document.getElementById("registration-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full overflow-hidden select-none bg-neutral-900 min-h-[540px] lg:min-h-[600px] flex items-center py-12 sm:py-16 lg:py-20">
      {/* 1. Background Image - Full Bleed with Normal Subtle Blur & NO heavy black shadows */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Image
          src="/images/year_end_hero_bg.jpg"
          alt="The Wolverines Field Hockey Tournament Match"
          fill
          priority
          className="object-cover object-[center_35%] filter blur-[2px] scale-105"
        />

        {/* Minimal subtle wash (only 15% opacity to avoid shadows while preserving crystal clear photo) */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      </div>

      {/* 2. Hero Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & Call-to-Action */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            {/* Headline */}
            <h1
              className="text-[52px] sm:text-[72px] md:text-[96px] lg:text-[124px] xl:text-[138px] font-normal leading-[0.88] tracking-normal text-white uppercase select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] text-center lg:text-left"
              style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
            >
              WOLVERINES <br />
              <span className="text-[#DE2027]">YEAR-END</span> <br />
              CELEBRATION
            </h1>

            {/* Subtitle */}
            <p className="text-white text-base sm:text-lg font-normal leading-relaxed max-w-xl mt-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] text-center lg:text-left mx-auto lg:mx-0">
              Join players, families, coaches, and alumni for an unforgettable evening celebrating our championship victories, team achievements, and outstanding player performances of the {YEAR_END_EVENT_CONFIG.eventYear} season.
            </p>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center lg:justify-start w-full">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#DE2027] text-white font-bold text-base hover:bg-red-700 transition-all duration-200 shadow-xl shadow-black/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>Get Tickets & Register</span>
              </button>
            </div>
          </div>

          {/* Right Column: Floating Frosted Glass Cards Panel (Hidden on mobile, visible on desktop) */}
          <div className="hidden lg:block lg:col-span-5 w-full">
            <div
              className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/25 border-b-white/10 bg-gradient-to-b from-white/[0.24] via-white/[0.12] to-white/[0.04] backdrop-blur-md"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.45)",
              }}
            >
              {/* White frosted top fade */}
              <div
                className="absolute inset-x-0 top-0 h-[88%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0) 100%)",
                }}
              />

              {/* Top Row: Date & Registration Cards */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Date & Time Card */}
                <div className="bg-white/95 hover:bg-white text-neutral-900 rounded-xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-normal tracking-wide text-neutral-900 uppercase flex items-center gap-1.5"
                      style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                    >
                      <Calendar className="w-4 h-4 text-[#DE2027]" />
                      EVENT DATE
                    </h3>
                    <p className="text-neutral-950 font-bold text-xs sm:text-[13px] mt-1.5">
                      December 19, 2026
                    </p>
                    <p className="text-neutral-600 text-xs sm:text-[12px] leading-snug mt-1 font-normal flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      5:30 PM &ndash; 10:30 PM
                    </p>
                  </div>

                </div>

                {/* Registration & Tickets Card */}
                <div className="bg-[#DE2027] hover:bg-red-700 text-white rounded-xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer" onClick={scrollToForm}>
                  <div>
                    <h3
                      className="text-[18px] sm:text-[20px] font-normal tracking-wide text-white uppercase flex items-center gap-1.5"
                      style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                    >
                      <Ticket className="w-4 h-4 text-white" />
                      TICKETS & PASSES
                    </h3>
                    <p className="text-white font-semibold text-xs sm:text-[13px] leading-snug mt-1.5">
                      Kids 5–10: $25 &bull; Ages 11+: $45
                    </p>


                  </div>
                  <button
                    onClick={scrollToForm}
                    className="text-white font-semibold text-xs sm:text-[13px] hover:underline inline-flex items-center gap-1 mt-3 text-left cursor-pointer"
                  >
                    Select Tickets &gt;
                  </button>
                </div>
              </div>

              {/* Bottom Card: Location / Venue Details */}
              <div className="relative z-10 bg-white/95 hover:bg-white text-neutral-900 rounded-xl p-3.5 sm:p-4 mt-3.5 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:shadow-md">
                {/* Location Thumbnail Icon */}
                <div className="relative w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 flex items-center justify-center text-red-500">
                  <MapPin className="w-8 h-8" />
                </div>

                {/* Venue Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[16px] sm:text-[18px] font-normal tracking-wide text-neutral-900 uppercase leading-tight"
                    style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
                  >
                    BANQUET VENUE
                  </h3>
                  <p className="text-neutral-950 font-bold text-xs sm:text-[13px] mt-0.5">
                    Abbotsford Banquet Centre, BC
                  </p>
                  <p className="text-neutral-600 text-[11px] sm:text-xs leading-snug mt-0.5">
                    Awards, trophies, player honors & buffet dinner.
                  </p>
                  <button
                    onClick={scrollToForm}
                    className="text-[#DE2027] font-semibold text-xs sm:text-[13px] hover:text-red-700 transition-colors inline-flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    Reserve Spot &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
