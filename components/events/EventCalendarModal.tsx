"use client";

import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { CalendarEventItem } from "./calendarEventsData";

interface EventCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function EventCalendarModal({
  isOpen,
  onClose,
}: EventCalendarModalProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeEvents, setActiveEvents] = useState<CalendarEventItem[]>([]);

  // Fetch real events from /api/event whenever modal is opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadEvents() {
      setIsLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.EVENT);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            const parsed: CalendarEventItem[] = json.data
              .map((item: any) => {
                const d = new Date(item.date);
                if (isNaN(d.getTime())) return null;

                const year = d.getUTCFullYear();
                const month = d.getUTCMonth(); // 0-indexed
                const day = d.getUTCDate();

                const dateString = d
                  .toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                  .toUpperCase();

                const formatSingleTime = (val?: string | Date) => {
                  if (!val) return "";
                  try {
                    const td = new Date(val);
                    if (!isNaN(td.getTime())) {
                      return td.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "UTC",
                      });
                    }
                    return String(val);
                  } catch {
                    return String(val);
                  }
                };

                const start = formatSingleTime(item.startTime);
                const end = formatSingleTime(item.endTime);
                const time =
                  start && end
                    ? `${start} to ${end}`
                    : start || end || "05:00 PM to 07:00 PM";

                return {
                  id: item.id,
                  title: "Indoor Practice Session",
                  type: "practice" as const,
                  dateString,
                  year,
                  month,
                  day,
                  location: item.location || "32470 Haida Dr. Abbotsford",
                  time,
                };
              })
              .filter(Boolean) as CalendarEventItem[];

            // Sort chronologically
            parsed.sort((a, b) => {
              if (a.year !== b.year) return a.year - b.year;
              if (a.month !== b.month) return a.month - b.month;
              return a.day - b.day;
            });

            setEvents(parsed);

            if (parsed.length > 0) {
              // Open to the month of the first scheduled event
              setCurrentYear(parsed[0].year);
              setCurrentMonth(parsed[0].month);
              setSelectedDay(parsed[0].day);
            }
          } else {
            setEvents([]);
            setSelectedDay(null);
          }
        } else {
          setEvents([]);
          setSelectedDay(null);
        }
      } catch (err) {
        console.error("Error fetching events for calendar modal:", err);
        setEvents([]);
        setSelectedDay(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [isOpen]);

  // Update active events when year, month or selectedDay changes
  useEffect(() => {
    if (selectedDay !== null) {
      const filtered = events.filter(
        (e) =>
          e.year === currentYear &&
          e.month === currentMonth &&
          e.day === selectedDay
      );
      setActiveEvents(filtered);
    } else {
      setActiveEvents([]);
    }
  }, [currentYear, currentMonth, selectedDay, events]);

  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on ESC key or clicking outside the calendar panel (non-blocking)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("#sticky-calendar-btn")) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);

    // Note: Do not lock document.body.style.overflow so the background page
    // remains completely scrollable and interactive.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Month navigation
  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Auto-select event if exists in previous month
    const inMonth = events.filter(
      (e) => e.year === newYear && e.month === newMonth
    );
    if (inMonth.length > 0) {
      setSelectedDay(inMonth[0].day);
    } else {
      setSelectedDay(null);
    }
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Auto-select event if exists in next month
    const inMonth = events.filter(
      (e) => e.year === newYear && e.month === newMonth
    );
    if (inMonth.length > 0) {
      setSelectedDay(inMonth[0].day);
    } else {
      setSelectedDay(null);
    }
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const emptyPrefixSlots = Array.from({ length: firstDayOfWeek });
  const daySlots = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label="Event Calendar"
      style={{ right: "max(12px, calc((100vw - 1280px) / 2 + 16px))" }}
      className="fixed top-1/2 -translate-y-1/2 z-50 w-[calc(100vw-24px)] sm:w-[410px] max-w-[420px] max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-[-12px_16px_45px_rgba(0,0,0,0.25)] border border-neutral-200/90 flex flex-col overflow-hidden select-none transition-all duration-300"
    >
      {/* Red Top Header Bar */}
      <div className="bg-[#DE2027] px-5 sm:px-6 py-4 flex items-center justify-between text-white border-b border-[#C11B22] shrink-0">
          <div>
            <h3
              className="text-2xl sm:text-[26px] font-black uppercase tracking-wider leading-none text-white drop-shadow-xs"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
              }}
            >
              EVENT CALENDAR
            </h3>
            <p className="text-xs text-white/90 font-medium tracking-normal mt-1">
              Indoor Practice &amp; Match Schedule
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Calendar"
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition border border-white/25 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

      {/* Scrollable Calendar Body */}
      <div className="overflow-y-auto flex-1 overscroll-contain">
        {/* White Calendar Area */}
        <div className="p-5 sm:p-6 bg-white">
          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition shadow-xs cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <h4
              className="text-lg sm:text-xl font-black text-neutral-900 tracking-wider uppercase"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
              }}
            >
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition shadow-xs cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[11px] sm:text-xs font-bold text-neutral-500 tracking-wider py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
            {/* Empty slots before day 1 */}
            {emptyPrefixSlots.map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-11" />
            ))}

            {/* Days in Month */}
            {daySlots.map((day) => {
              const dayEvents = events.filter(
                (e) =>
                  e.year === currentYear &&
                  e.month === currentMonth &&
                  e.day === day
              );
              const hasEvent = dayEvents.length > 0;
              const isSelected = selectedDay === day;

              if (hasEvent) {
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    aria-label={`${MONTH_NAMES[currentMonth]} ${day}: ${dayEvents.length} event(s)`}
                    className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer relative border ${
                      isSelected
                        ? "border-[#DE2027] bg-[#FEE8E9] shadow-sm ring-2 ring-[#DE2027]/20"
                        : "border-[#FCA5A5] bg-[#FFF1F2] hover:bg-[#FEE8E9]"
                    }`}
                  >
                    <span className="text-[13px] sm:text-[14px] font-bold text-[#DE2027] leading-tight">
                      {day}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE2027] mt-0.5 shrink-0" />
                  </button>
                );
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-neutral-100 text-neutral-900 font-bold border border-neutral-300"
                      : "text-neutral-800 hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <span className="text-[13px] sm:text-[14px] leading-tight">
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Info Card / Details */}
        <div className="bg-neutral-50 border-t border-neutral-100 px-5 sm:px-6 py-4">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-neutral-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DE2027] animate-ping" />
              Loading schedule...
            </div>
          ) : selectedDay !== null && activeEvents.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DE2027] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#DE2027] animate-pulse" />
                  Practice Scheduled
                </span>
                <span className="text-xs text-neutral-500 font-semibold">
                  {MONTH_NAMES[currentMonth].slice(0, 3)} {selectedDay},{" "}
                  {currentYear}
                </span>
              </div>

              {activeEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col gap-1.5"
                >
                  <h5 className="text-sm font-bold text-neutral-900 leading-snug">
                    {evt.title}
                  </h5>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#DE2027]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#DE2027]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {evt.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDay !== null ? (
            <div className="text-center py-2 text-xs text-neutral-500">
              No sessions scheduled on {MONTH_NAMES[currentMonth].slice(0, 3)}{" "}
              {selectedDay}, {currentYear}. Check dates with the{" "}
              <span className="text-[#DE2027] font-semibold">red dot</span>.
            </div>
          ) : events.length > 0 ? (
            <div className="text-center py-2 text-xs text-neutral-500">
              Click any date with a{" "}
              <span className="text-[#DE2027] font-semibold">red dot</span> to
              view practice details.
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-neutral-500">
              No practice sessions currently scheduled.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
