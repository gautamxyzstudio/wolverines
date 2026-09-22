"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function GlobalPreloader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;
    let unmountTimer: ReturnType<typeof setTimeout>;

    const completeLoading = () => {
      // Small buffer to allow page to settle then smoothly fade out
      fadeTimer = setTimeout(() => {
        setIsFading(true);
        unmountTimer = setTimeout(() => {
          setMounted(false);
        }, 500);
      }, 650);
    };

    if (document.readyState === "complete") {
      completeLoading();
    } else {
      window.addEventListener("load", completeLoading);
    }

    // Safety fallback
    const safetyTimeout = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setMounted(false), 500);
    }, 3000);

    return () => {
      window.removeEventListener("load", completeLoading);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Listen to navigation link clicks for smooth route transition
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        !href ||
        targetAttr === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http://") ||
        href.startsWith("https://")
      ) {
        return;
      }

      if (href === pathname || href === window.location.pathname) {
        return;
      }

      setMounted(true);
      setIsFading(false);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [pathname]);

  // When pathname changes, smoothly fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      const hideTimer = setTimeout(() => {
        setMounted(false);
      }, 500);
      return () => clearTimeout(hideTimer);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!mounted || isAdmin) {
    return null;
  }

  return (
    <div
      id="global-preloader"
      aria-label="Loading Wolverines"
      aria-busy="true"
      role="status"
      className={`fixed inset-0 z-[999999] flex items-center justify-center select-none bg-black transition-all duration-500 ease-out will-change-[opacity,transform] ${
        isFading ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      {/* Self-contained Keyframe Animations for Logo Loading State */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes logoLoadingSweep {
              0% {
                transform: translateX(-160%) skewX(-25deg);
              }
              50%, 100% {
                transform: translateX(160%) skewX(-25deg);
              }
            }

            @keyframes logoPulseBreath {
              0%, 100% {
                transform: scale(1);
                opacity: 0.9;
              }
              50% {
                transform: scale(1.05);
                opacity: 1;
              }
            }

            @keyframes logoShadowWave {
              0%, 100% {
                opacity: 0.15;
              }
              50% {
                opacity: 0.55;
              }
            }
          `,
        }}
      />

      {/* Center Logo with active loading shimmer effect */}
      <div className="relative flex items-center justify-center">
        {/* Logo Container with continuous breathing pulse */}
        <div
          className="relative overflow-hidden rounded-2xl p-1"
          style={{ animation: "logoPulseBreath 1.8s ease-in-out infinite" }}
        >
          {/* Logo is always visible from the start */}
          <Image
            src="/icon.png"
            alt="The Wolverines Logo"
            width={96}
            height={96}
            priority
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />

          {/* Dynamic Light Shimmer Wave sweeping across the logo (Shows loading in progress) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)",
              animation: "logoLoadingSweep 1.6s ease-in-out infinite",
            }}
          />

          {/* Subtle dark shadow pulse over the logo */}
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{
              animation: "logoShadowWave 1.8s ease-in-out infinite",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>
    </div>
  );
}
