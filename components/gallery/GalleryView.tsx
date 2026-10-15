"use client";

import React, { useState } from "react";
import { galleryItems } from "./galleryData";
import CurvedGalleryHero from "./CurvedGalleryHero";
import GalleryGrid from "./GalleryGrid";
import GalleryLightbox from "./GalleryLightbox";

export default function GalleryView() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900" key="gallery-root-view-v3">
      {/* 
        Hero Section with the 3D Curved Concave Ribbon Marquee 
      */}
      <CurvedGalleryHero
        items={galleryItems}
        onOpenLightbox={(index) => setLightboxIndex(index)}
      />

      {/* Pure Masonry Image Gallery with Screenshot Tabs */}
      <GalleryGrid
        items={galleryItems}
        onOpenLightbox={(index) => setLightboxIndex(index)}
      />

      {/* Fullscreen Lightbox Modal on Image Click */}
      <GalleryLightbox
        items={galleryItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(index) => setLightboxIndex(index)}
      />
    </div>
  );
}
