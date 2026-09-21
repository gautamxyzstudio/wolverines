import React from "react";
import type { Metadata } from "next";
import SummerProgramForm from "@/components/registration/SummerProgramForm";

export const metadata: Metadata = {
  title: "Registration | The Wolverines Field Hockey Club",
  description:
    "Join The Wolverines Field Hockey Club. Register for our Summer Program, youth training, and camps in Abbotsford, BC.",
};

export default function RegistrationPage() {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900 select-none">
      <SummerProgramForm />
    </main>
  );
}
