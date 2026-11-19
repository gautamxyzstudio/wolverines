import React from "react";
import type { Metadata } from "next";
import EventsHero from "@/components/events/EventsHero";
import YearEndEventBanner from "@/components/events/YearEndEventBanner";
import IndoorPracticeSchedule from "@/components/events/IndoorPracticeSchedule";
import StickyEventCalendar from "@/components/events/StickyEventCalendar";

export const metadata: Metadata = {
  title: "Events | The Wolverines Field Hockey Club",
  description:
    "Explore upcoming tournaments, youth championships, match schedules, and community events at The Wolverines Field Hockey Club.",
};

export default function EventsPage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-80px)] bg-white text-neutral-900 relative">
      {/* Events Hero Section */}
      <EventsHero />

    
      {/* Indoor Practice Schedule Section */}
      <IndoorPracticeSchedule />

      {/* Sticky Event Calendar Button on the Right Side */}
      <StickyEventCalendar />
    </main>
  );
}
