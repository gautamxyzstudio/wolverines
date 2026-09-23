"use client";

import React, { useState } from "react";
import EventCalendarModal from "./EventCalendarModal";

export default function StickyEventCalendar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Sticky Button on Right Side (aligned with site-container on large screens, edge on mobile/laptop) */}
      {!isOpen && (
        <div
          className="fixed top-1/2 -translate-y-1/2 z-50 select-none animate-in fade-in duration-200"
          style={{ right: 0 }}
        >
          <button
            id="sticky-calendar-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-[#DE2027] hover:bg-[#C11B22] text-white font-bold text-sm sm:text-base pl-4 sm:pl-5 pr-3.5 sm:pr-4 py-3 sm:py-3.5 rounded-l-md transition-all duration-200 cursor-pointer group"
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
      )}

      {/* Event Calendar Modal */}
      <EventCalendarModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
