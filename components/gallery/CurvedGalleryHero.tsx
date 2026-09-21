"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GalleryItem } from "./galleryData";

interface CurvedGalleryHeroProps {
  items: GalleryItem[];
  onOpenLightbox: (index: number) => void;
}

export default function CurvedGalleryHero({
  items,
  onOpenLightbox,
}: CurvedGalleryHeroProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"left" | "right">("left");
  const [speed, setSpeed] = useState<number>(42); // duration in seconds

  // Use a curated 24-item slice for the marquee for optimal performance
  const showcaseItems = items.length > 24 ? items.slice(0, 24) : items;
  const marqueeItems = [...showcaseItems, ...showcaseItems, ...showcaseItems];

  return (
    <section className="relative w-full bg-white pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16 overflow-hidden select-none">
      {/* Hidden SVG Definition for the Distinct 3D Curved Ribbon Silhouette */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <clipPath id="curved-ribbon-clip" clipPathUnits="objectBoundingBox">
            {/* 
              Distinct 3D concave ribbon curve:
              Top edge: Starts at (0, 0), dips to (0.5, 0.11), rises to (1, 0).
              Bottom edge: Curves from (1, 1) up to (0.5, 0.89), down to (0, 1).
              Preserves 78% of center height while keeping the stylish 3D curved silhouette.
            */}
            <path d="M 0,0 C 0.28,0.11 0.72,0.11 1,0 L 1,1 C 0.72,0.89 0.28,0.89 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Hero Header matching user's design */}
      <div className="site-container text-center mb-6 sm:mb-8 lg:mb-10">
        <h1
          className="animate-gallery-title text-[52px] sm:text-[70px] md:text-[88px] lg:text-[104px] leading-none tracking-[0.06em] uppercase text-[#111111] font-normal"
          style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
        >
          GALLERY
        </h1>
        <p
          className="animate-gallery-sub text-neutral-700 text-center text-xs sm:text-sm md:text-base font-normal mt-2.5 sm:mt-3 max-w-xl mx-auto px-4 leading-relaxed"
          style={{ fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif' }}
        >
          &ldquo;Relive the action, the passion, and the glory through stunning visuals.&rdquo;
        </p>
      </div>

      {/* Curved 3D Scrolling Ribbon Showcase */}
      <div className="relative w-full overflow-hidden flex justify-center">
        <div
          className="animate-gallery-ribbon relative w-full max-w-[1600px] h-[220px] sm:h-[270px] md:h-[310px] lg:h-[350px] flex items-center overflow-hidden"
          style={{
            clipPath: "url(#curved-ribbon-clip)",
            WebkitClipPath: "url(#curved-ribbon-clip)",
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          {/* Inner Scrolling Track */}
          <div
            className={`flex items-center ${
              scrollDirection === "left" ? "animate-gallery-left" : "animate-gallery-right"
            } ${isPaused ? "animate-gallery-paused" : ""}`}
            style={{
              animationDuration: `${speed}s`,
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          >
            {marqueeItems.map((item, index) => {
              const actualIndex = index % showcaseItems.length;
              const globalIndex = items.findIndex((it) => it.id === item.id);
              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => onOpenLightbox(globalIndex >= 0 ? globalIndex : actualIndex)}
                  className="relative flex-shrink-0 w-[155px] sm:w-[195px] md:w-[235px] lg:w-[265px] h-[220px] sm:h-[270px] md:h-[310px] lg:h-[350px] mr-2.5 sm:mr-3.5 bg-neutral-900 cursor-pointer overflow-hidden select-none rounded-lg"
                  style={{
                    transform: "translateZ(0)",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    className="object-cover object-[center_25%]"
                    priority={index < 8}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Interactive Controls Bar */}
      <div className="site-container mt-5 sm:mt-6 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 text-xs sm:text-sm text-neutral-600">
        <div className="flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-200/90 shadow-sm">
          {/* 1. Play / Pause Switch Toggle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
              isPaused
                ? "bg-[#DE2027] text-white"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
            }`}
            title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            aria-label={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
          >
            {isPaused ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-neutral-200 hidden xs:block" />

          {/* 2. Direction 2-Way Segmented Switch */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setScrollDirection("left")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                scrollDirection === "left"
                  ? "bg-[#DE2027] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Scroll Left"
            >
              <span>←</span>
              <span>Left</span>
            </button>
            <button
              type="button"
              onClick={() => setScrollDirection("right")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                scrollDirection === "right"
                  ? "bg-[#DE2027] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              title="Scroll Right"
            >
              <span>Right</span>
              <span>→</span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-neutral-200 hidden sm:block" />

          {/* 3. Speed 3-Way Segmented Switch */}
          <div className="hidden sm:flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 text-xs">
            <button
              type="button"
              onClick={() => setSpeed(55)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                speed === 55
                  ? "bg-[#DE2027] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Slow
            </button>
            <button
              type="button"
              onClick={() => setSpeed(42)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                speed === 42
                  ? "bg-[#DE2027] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setSpeed(28)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                speed === 28
                  ? "bg-[#DE2027] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Fast
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
