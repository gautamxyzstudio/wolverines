"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { GalleryItem, GalleryCategory, galleryTabs } from "./galleryData";

interface GalleryGridProps {
  items: GalleryItem[];
  onOpenLightbox: (index: number) => void;
}

export default function GalleryGrid({ items, onOpenLightbox }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<GalleryCategory>("all");

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter(
      (item) => item.category === activeTab || item.categories.includes(activeTab)
    );
  }, [items, activeTab]);

  return (
    <section className="w-full bg-white pt-2 sm:pt-4 pb-16 sm:pb-24 select-none">
      <div className="site-container">
        {/* Category Navigation Tabs Bar */}
        <div className="w-full flex justify-start sm:justify-center mb-6 sm:mb-10 overflow-x-auto no-scrollbar px-1 sm:px-0">
          <nav className="flex items-center gap-1 sm:gap-2">
            {galleryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-[6px] px-[12px] sm:px-[15px] text-[20px] sm:text-[24px] leading-tight tracking-[0.03em] uppercase transition-colors whitespace-nowrap cursor-pointer select-none font-normal ${
                    isActive
                      ? "text-[#181818]"
                      : "text-[#181818]/65 hover:text-[#181818]"
                  }`}
                  style={{
                    fontFamily:
                      'var(--font-bebas-neue), "Bebas Neue", "Open Sans", sans-serif',
                  }}
                >
                  <span>{tab.label}</span>

                  {/* Active Clean Left-Right Gradient Underline (No shadow, 1px) */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-[12px] right-[12px] sm:left-[15px] sm:right-[15px] h-[2px] pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, #D32F2F 50%, transparent 100%)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pure Masonry Image Gallery Grid (2 columns on mobile, 3 on desktop) */}
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-neutral-400">
            <p className="text-base font-medium text-neutral-600">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="columns-2 lg:columns-3 gap-2.5 sm:gap-4 md:gap-5 [column-fill:_balance]">
            {filteredItems.map((item, idx) => {
              const originalIndex = items.findIndex((it) => it.id === item.id);
              return (
                <div
                  key={`${activeTab}-${item.id}`}
                  onClick={() => onOpenLightbox(originalIndex)}
                  className="animate-card-slide-up break-inside-avoid mb-2.5 sm:mb-4 md:mb-5 group relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-neutral-100 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
                  style={{
                    animationDelay: `${Math.min(idx * 45, 450)}ms`,
                  }}
                >
                  <div className={`relative w-full ${item.aspectRatioClass || "aspect-[4/3]"}`}>
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />

                    {/* Subtle hover vignette with quick view indicator */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-md transform scale-80 group-hover:scale-100 transition-transform duration-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
