import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div
      aria-label="Loading Wolverines"
      aria-busy="true"
      role="status"
      className="fixed inset-0 z-[999999] flex items-center justify-center select-none bg-black"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes logoLoadingSweep {
              0% { transform: translateX(-160%) skewX(-25deg); }
              50%, 100% { transform: translateX(160%) skewX(-25deg); }
            }
            @keyframes logoPulseBreath {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.05); opacity: 1; }
            }
            @keyframes logoShadowWave {
              0%, 100% { opacity: 0.15; }
              50% { opacity: 0.55; }
            }
          `,
        }}
      />

      <div className="relative flex items-center justify-center">
        <div
          className="relative overflow-hidden rounded-2xl p-1"
          style={{ animation: "logoPulseBreath 1.8s ease-in-out infinite" }}
        >
          <Image
            src="/icon.png"
            alt="The Wolverines Logo"
            width={96}
            height={96}
            priority
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)",
              animation: "logoLoadingSweep 1.6s ease-in-out infinite",
            }}
          />

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
