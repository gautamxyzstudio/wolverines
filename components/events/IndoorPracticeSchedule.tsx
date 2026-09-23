"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface ScheduleItem {
  id: string;
  date: string;
  location: string;
  time: string;
}

function formatEventDate(dateVal: string | Date): string {
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase();
  } catch {
    return String(dateVal);
  }
}

function formatEventTime(startVal?: string | Date, endVal?: string | Date): string {
  if (!startVal && !endVal) return "05:00 PM to 07:00 PM";

  const formatSingleTime = (val?: string | Date) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-US", {
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

  const start = formatSingleTime(startVal);
  const end = formatSingleTime(endVal);

  if (start && end) return `${start} to ${end}`;
  return start || end || "05:00 PM to 07:00 PM";
}

export default function IndoorPracticeSchedule() {
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const res = await fetch(API_ENDPOINTS.EVENT);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            // Sort by date ascending
            const sorted = [...json.data].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            const mapped: ScheduleItem[] = sorted.map((item: any) => ({
              id: item.id,
              date: formatEventDate(item.date),
              location: item.location || "32470 Haida Dr. Abbotsford",
              time: formatEventTime(item.startTime, item.endTime),
            }));
            setEvents(mapped);
          } else {
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching /api/event:", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <section
      id="indoor-practice-schedule-section"
      className="w-full bg-white py-12 sm:py-16 lg:py-20 select-none relative"
    >
      <div className="site-container">
        {/* Centered Section Heading matching user screenshot */}
        <div className="text-center mb-10 sm:mb-14">
          <h2
            className="text-[#DE2027] text-3xl sm:text-4xl lg:text-[46px] tracking-wide font-normal uppercase leading-none"
            style={{
              fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
            }}
          >
            INDOOR PRACTICE SCHEDULE
          </h2>
        </div>

        {/* 1. SKELETON LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="border border-neutral-200 rounded-2xl p-6 sm:p-7 bg-neutral-50/60 flex flex-col justify-center"
              >
                {/* Date skeleton */}
                <div className="h-5 w-44 bg-neutral-200 rounded-md mb-4" />
                {/* Location skeleton */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-4 h-4 rounded-full bg-neutral-200 shrink-0" />
                  <div className="h-3.5 w-52 bg-neutral-200/80 rounded" />
                </div>
                {/* Time skeleton */}
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-neutral-200 shrink-0" />
                  <div className="h-3.5 w-36 bg-neutral-200/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. EMPTY STATE (No events found) */}
        {!isLoading && events.length === 0 && (
          <div className="py-8 sm:py-14 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            {/* 3D Modern Graphic */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-6 drop-shadow-sm rounded-2xl overflow-hidden border border-neutral-100 bg-white">
              <Image
                src="/images/no-events.jpg"
                alt="No events scheduled"
                fill
                className="object-cover"
                priority
              />
            </div>

            <h3
              className="text-2xl sm:text-3xl font-normal uppercase text-neutral-900 tracking-wide mb-2.5"
              style={{
                fontFamily: 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
              }}
            >
              No Practice Sessions Scheduled
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 font-normal max-w-md">
              There are currently no upcoming practice sessions or events listed in the schedule. Please check back soon or contact our coaching staff for updates.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#DE2027] text-[#DE2027] hover:bg-[#DE2027] hover:text-white font-semibold text-xs sm:text-sm tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Refresh Schedule</span>
            </button>
          </div>
        )}

        {/* 3. POPULATED EVENTS GRID */}
        {!isLoading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {events.map((item) => (
              <div
                key={item.id}
                className="border border-[#DE2027] rounded-2xl p-6 sm:p-7 bg-white hover:shadow-md transition-shadow duration-200 flex flex-col justify-center"
              >
                {/* Date Header */}
                <h3
                  className="text-[16px] sm:text-[17px] font-bold text-neutral-900 uppercase tracking-wide mb-3.5"
                  style={{
                    fontFamily: 'var(--font-open-sans), "Open Sans", sans-serif',
                  }}
                >
                  {item.date}
                </h3>

                {/* Location Row */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700 mb-2.5">
                  <svg
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#DE2027] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21c-4.418-5.5-7-9.5-7-13a7 7 0 1 1 14 0c0 3.5-2.582 7.5-7 13z"
                    />
                    <circle cx="12" cy="8" r="2.5" />
                  </svg>
                  <span className="leading-none">{item.location}</span>
                </div>

                {/* Time Row */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700">
                  <svg
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#DE2027] shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                  </svg>
                  <span className="leading-none">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
