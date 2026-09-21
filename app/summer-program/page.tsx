import React from "react";
import type { Metadata } from "next";
import SummerProgramForm from "@/components/registration/SummerProgramForm";

export const metadata: Metadata = {
  title: "Summer Program Registration | The Wolverines Field Hockey Club",
  description:
    "Register for The Wolverines Summer Program in Abbotsford, BC. Training, agility, and development camps for junior and youth hockey players.",
};

export default function SummerProgramPage() {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900 select-none">
      <SummerProgramForm />
    </main>
  );
}
