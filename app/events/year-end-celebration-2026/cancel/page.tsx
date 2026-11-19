import React from "react";
import type { Metadata } from "next";
import PaymentCancelCard from "@/components/ui/PaymentCancelCard";

export const metadata: Metadata = {
  title: "Registration Cancelled | Wolverines Year-End Celebration 2026",
  description: "Your registration checkout was not completed.",
};

export default function YearEndCancelPage() {
  return (
    <main className="w-full min-h-screen bg-neutral-50 flex items-center justify-center">
      <PaymentCancelCard
        programName="Wolverines Year-End Celebration 2026"
        retryUrl="/events/year-end-celebration-2026"
      />
    </main>
  );
}
