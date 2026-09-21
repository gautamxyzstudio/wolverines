"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { GalleryItem } from "./galleryData";

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export default function GalleryLightbox({
  items,
  currentIndex,
  onClose,
  onSelectIndex,
}: GalleryLightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Lightbox Content Container */}
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white/80">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-medium tracking-wider uppercase bg-[#D32F2F] text-white px-2.5 py-1 rounded">
              {currentItem.categoryLabel}
            </span>
            <span className="text-xs sm:text-sm text-neutral-400">
              {currentIndex + 1} / {items.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close image modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Image Frame with Navigation Arrows */}
        <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[70vh] flex items-center justify-center bg-black/25 rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <Image
            src={currentItem.image}
            alt={currentItem.alt}
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />

          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#D32F2F] text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#D32F2F] text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            aria-label="Next photo"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Bottom Details Caption */}
        <div className="w-full pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-neutral-200 gap-1.5 px-1">
          <div>
            <h3
              className="text-lg sm:text-xl font-normal text-white uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif' }}
            >
              {currentItem.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 max-w-2xl">
              {currentItem.description}
            </p>
          </div>
          {currentItem.date && (
            <span className="text-xs font-mono text-neutral-400 self-start sm:self-center">
              {currentItem.date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
