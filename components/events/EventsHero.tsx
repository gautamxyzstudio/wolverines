"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface EventPhoto {
  id: string;
  src: string;
  alt: string;
}

const eventPhotos: EventPhoto[] = [
  {
    id: "photo-tournament-1",
    src: "/gallery_img/tournament1-1536x1137.webp",
    alt: "Tournament match action on field",
  },
  {
    id: "photo-speaking-1",
    src: "/gallery_img/speaking1-864x1536.webp",
    alt: "Youth player speaking at ceremony",
  },
  {
    id: "photo-tournament-3",
    src: "/gallery_img/tournament3-1536x1024.webp",
    alt: "Full field hockey match in action",
  },
  {
    id: "photo-training-6",
    src: "/gallery_img/training6-1536x1157.webp",
    alt: "Junior players training tactical drills",
  },
  {
    id: "photo-winter-11",
    src: "/gallery_img/winter11-1536x1024.webp",
    alt: "Winter championship tournament play",
  },
  {
    id: "photo-development-7",
    src: "/gallery_img/development7-1536x1157.webp",
    alt: "Youth fitness and athletic conditioning",
  },
  {
    id: "photo-hiking-10",
    src: "/gallery_img/hiking10-1536x1157.webp",
    alt: "Team expedition in Fraser Valley mountains",
  },
  {
    id: "photo-tournament-10",
    src: "/gallery_img/tournament10-1536x1024.webp",
    alt: "Championship victory celebration",
  },
  {
    id: "photo-winter-4",
    src: "/gallery_img/winter4-1536x1024.webp",
    alt: "Indoor match scrimmage action",
  },
  {
    id: "photo-training-1",
    src: "/gallery_img/training1-1024x576.webp",
    alt: "Stick handling and agility training",
  },
  {
    id: "photo-speaking-7",
    src: "/gallery_img/speaking7-1536x1181.webp",
    alt: "Annual ceremony presentation",
  },
  {
    id: "photo-development-1",
    src: "/gallery_img/development1-1536x864.webp",
    alt: "Team fitness session",
  },
  {
    id: "photo-tournament-8",
    src: "/gallery_img/tournament8-1536x1024.webp",
    alt: "High intensity match on turf",
  },
  {
    id: "photo-winter-16",
    src: "/gallery_img/winter16-1536x1024.webp",
    alt: "Winter medal and trophy celebration",
  },
  {
    id: "photo-hiking-3",
    src: "/gallery_img/hiking3-1024x771.webp",
    alt: "Team standing at mountain viewpoint",
  },
];

// Duplicate list for seamless infinite loop
const loopPhotos = [...eventPhotos, ...eventPhotos];

export default function EventsHero() {
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white flex flex-col items-center select-none">
      {/* Self-contained CSS for 100% butter-smooth, continuous infinite autoscroll without hover pause */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes eventInfiniteScroll {
              0% {
                transform: translate3d(0, 0, 0);
              }
              100% {
                transform: translate3d(-50%, 0, 0);
              }
            }
            .events-autoscroll-track {
              display: flex;
              width: max-content;
              animation: eventInfiniteScroll 40s linear infinite;
              will-change: transform;
            }
            /* Never pause on hover */
            .events-autoscroll-track:hover,
            .events-autoscroll-track *:hover {
              animation-play-state: running !important;
            }
          `,
        }}
      />

      {/* Top Hero Banner - Full-Bleed 100% Width */}
      <section
        ref={sectionRef}
        className="relative w-full overflow-hidden rounded-t-none rounded-b-[20px] sm:rounded-b-[28px] lg:rounded-b-[36px] bg-neutral-900 min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[680px] flex items-center justify-center"
      >
        {/* Background Video Container - Full Bleed */}
        <div className="absolute inset-0 w-full h-full bg-neutral-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: "50% 100%",
            }}
          >
            <source src="/videos/event-hero-section.mp4" type="video/mp4" />
          </video>
          {/* Subtle contrast overlay */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>

        {/* Hero Content Container - Centered */}
        <div
          className={`site-container relative z-10 py-10 sm:py-14 lg:py-16 flex flex-col items-center text-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          {/* Main Title */}
          <h1
            className="text-[64px] sm:text-[96px] md:text-[128px] lg:text-[156px] font-normal leading-none text-white uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] mb-2 sm:mb-3"
            style={{
              fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
              fontWeight: 400,
            }}
          >
            EVENTS
          </h1>

          {/* Subtitle Quote */}
          <p
            className="text-[14px] sm:text-[16px] md:text-[18px] text-white font-medium max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            style={{
              fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
            }}
          >
            &ldquo;Unleash Your Passion for Hockey – Join Us for the Ultimate Tournament!&rdquo;
          </p>
        </div>
      </section>

      {/* Infinite Auto-Scrolling Photo Row - Full viewport width */}
      <div
        id="events-scrolling-photos"
        className="relative w-full overflow-hidden pt-8 sm:pt-10 pb-6 sm:pb-8"
      >
        <div className="events-autoscroll-track gap-4 sm:gap-5 md:gap-6 py-2">
          {loopPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="relative flex-shrink-0 w-[210px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-[300px] sm:h-[340px] md:h-[370px] lg:h-[390px] rounded-2xl sm:rounded-[22px] overflow-hidden bg-neutral-100 shadow-md border border-neutral-200/50"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 210px, (max-width: 1024px) 260px, 280px"
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
