import React from "react";
import type { Metadata } from "next";
import RegistrationHero from "@/components/registration/RegistrationHero";
import RegistrationForm from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Registration | The Wolverines Field Hockey Club",
  description:
    "Join The Wolverines Field Hockey Club. Fill out the registration enquiry form to join youth academies, competitive squads, and training programs in Abbotsford, BC.",
};

export default function RegistrationPage() {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900 select-none">
      {/* Registration Hero with Slanted Cut & JOIN US dual-layer typography */}
      <RegistrationHero />

      {/* Registration & Player Enquiry Form */}
      <RegistrationForm />
    </main>
  );
}
