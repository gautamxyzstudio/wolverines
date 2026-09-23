"use client";

import React, { useState, useEffect } from "react";
import EventCalendarModal from "./EventCalendarModal";

export default function StickyEventCalendar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scheduleSection = document.getElementById(
        "indoor-practice-schedule-section"
      );
      if (scheduleSection) {
        const rect = scheduleSection.getBoundingClientRect();
        // Visible ONLY while the user is inside this section
        const isInSection =
          rect.top <= window.innerHeight * 0.7 && rect.bottom >= 120;
        setIsVisible(isInSection);
      } else {
        // Fallback
        const photoSection = document.getElementById("events-scrolling-photos");
        if (photoSection) {
          const rect = photoSection.getBoundingClientRect();
          setIsVisible(rect.bottom <= window.innerHeight * 0.75);
        } else {
          setIsVisible(window.scrollY > 800);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check in case user reloaded midway

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Sticky Button on Right Side - Animates in when scrolled to scrolling images */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 z-50 select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible && !isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{ right: 0 }}
      >
        <button
          id="sticky-calendar-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-[#DE2027] hover:bg-[#C11B22] text-white font-bold text-sm sm:text-base pl-4 sm:pl-5 pr-3.5 sm:pr-4 py-3 sm:py-3.5 rounded-l-[15px] shadow-[-4px_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 cursor-pointer group hover:pl-6"
          title="Open Event Calendar"
          aria-label="Event Calendar"
        >
          <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200">
            📅
          </span>
          <span className="tracking-wide drop-shadow-xs whitespace-nowrap">
            Event Calendar
          </span>
        </button>
      </div>

      {/* Event Calendar Modal */}
      <EventCalendarModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
