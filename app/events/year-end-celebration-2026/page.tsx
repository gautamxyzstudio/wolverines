import React from "react";
import type { Metadata } from "next";
import YearEndRegistrationHero from "@/components/events/YearEndRegistrationHero";
import YearEndRegistrationForm from "@/components/events/YearEndRegistrationForm";

export const metadata: Metadata = {
  title: "Year-End Celebration 2026 Registration | The Wolverines Field Hockey Club",
  description:
    "Register for the Wolverines Year-End Celebration 2026. Secure your individual or family tickets online with secure Stripe payment.",
};

export default function YearEndCelebrationPage() {
  return (
    <main className="w-full min-h-screen bg-white">
      {/* Event Header Banner */}
      <YearEndRegistrationHero />

      {/* Main Registration & Ticket Order Form */}
      <YearEndRegistrationForm />
    </main>
  );
}
