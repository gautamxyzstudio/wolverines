"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  required = false,
  minYear = 1926,
  maxYear = new Date().getFullYear() - 3,
  maxDate,
  minDate,
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effective max date (default: maxYear-12-31)
  const effectiveMaxDate = useMemo(() => {
    if (maxDate) return maxDate;
    const d = new Date();
    d.setFullYear(maxYear);
    return d;
  }, [maxDate, maxYear]);

  // Effective min date (default: minYear-01-01)
  const effectiveMinDate = useMemo(() => {
    if (minDate) return minDate;
    return new Date(minYear, 0, 1);
  }, [minDate, minYear]);

  // Parse initial state from value
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) return { year: y, month: m, day: d, date };
    }
    return null;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => {
    if (parsedValue) return parsedValue.year;
    return maxYear;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (parsedValue) return parsedValue.month;
    if (effectiveMaxDate && effectiveMaxDate.getFullYear() === maxYear) {
      return effectiveMaxDate.getMonth();
    }
    return 0;
  });

  // Sync if value changes externally
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [parsedValue]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Generate list of years from maxYear (2023) down to minYear (1926)
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      dateString: string;
    }> = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dt = new Date(prevY, prevM, d);
      const isDis =
        (effectiveMaxDate && dt > effectiveMaxDate) ||
        (effectiveMinDate && dt < effectiveMinDate) ||
        false;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        isCurrentMonth: false,
        isDisabled: Boolean(isDis),
        dateString: dateStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(viewYear, viewMonth, d);
      const isDis =
        (effectiveMaxDate && dt > effectiveMaxDate) ||
        (effectiveMinDate && dt < effectiveMinDate) ||
        false;
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        isCurrentMonth: true,
        isDisabled: Boolean(isDis),
        dateString: dateStr,
      });
    }

    // Next month days
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dt = new Date(nextY, nextM, d);
      const isDis =
        (effectiveMaxDate && dt > effectiveMaxDate) ||
        (effectiveMinDate && dt < effectiveMinDate) ||
        false;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        isCurrentMonth: false,
        isDisabled: Boolean(isDis),
        dateString: dateStr,
      });
    }

    return days;
  }, [viewYear, viewMonth, effectiveMaxDate, effectiveMinDate]);

  // Prev / Next month boundaries
  const isPrevDisabled = useMemo(() => {
    if (!effectiveMinDate) return false;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    return new Date(prevY, prevM + 1, 0) < effectiveMinDate;
  }, [viewYear, viewMonth, effectiveMinDate]);

  const isNextDisabled = useMemo(() => {
    if (!effectiveMaxDate) return false;
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextY, nextM, 1) > effectiveMaxDate;
  }, [viewYear, viewMonth, effectiveMaxDate]);

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => Math.max(minYear, y - 1));
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => Math.min(maxYear, y + 1));
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Normal Clean Form Input */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-neutral-300 rounded hover:border-neutral-400 focus-within:border-neutral-500 cursor-pointer transition select-none"
      >
        <span
          className={
            value
              ? "text-neutral-900 font-medium font-mono"
              : "text-neutral-400 font-sans"
          }
        >
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1.5 text-neutral-400">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 hover:text-neutral-700 transition cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <CalendarIcon className="w-4 h-4 text-neutral-500" />
        </div>
      </div>

      {/* Hidden input for HTML5 required form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Normal Clean Calendar Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-[290px] sm:w-[310px] bg-white border border-neutral-200 rounded-lg shadow-xl z-50 p-3 select-none">
          {/* Header: Prev, Month Select, Year Select, Next */}
          <div className="flex items-center justify-between gap-1 mb-2 pb-2 border-b border-neutral-100">
            <button
              type="button"
              disabled={isPrevDisabled}
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-1 px-2 rounded border-0 outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-1 px-2 rounded border-0 outline-none cursor-pointer font-mono"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={isNextDisabled}
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-semibold text-neutral-400 py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const isSelected = value === item.dateString;
              return (
                <button
                  key={`${item.dateString}-${idx}`}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => handleSelectDay(item.dateString)}
                  className={`h-7 w-full rounded text-xs font-medium flex items-center justify-center transition cursor-pointer ${
                    item.isDisabled
                      ? "text-neutral-300 cursor-not-allowed bg-transparent"
                      : isSelected
                      ? "bg-[#DE2027] text-white font-bold"
                      : item.isCurrentMonth
                      ? "text-neutral-800 hover:bg-neutral-100 hover:text-[#DE2027]"
                      : "text-neutral-400 hover:bg-neutral-50"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
