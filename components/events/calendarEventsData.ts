export interface CalendarEventItem {
  id: string;
  title: string;
  type?: "practice" | "tournament" | "match";
  dateString: string; // e.g. "OCTOBER 5, 2026"
  year: number;
  month: number; // 0-indexed: 0 = Jan, 9 = Oct
  day: number;
  location: string;
  time: string;
}

export const allCalendarEvents: CalendarEventItem[] = [];

export function getEventsForDate(
  events: CalendarEventItem[],
  year: number,
  month: number,
  day: number
): CalendarEventItem[] {
  return events.filter(
    (event) => event.year === year && event.month === month && event.day === day
  );
}
