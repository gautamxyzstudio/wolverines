import React from "react";
import type { Metadata } from "next";
import WinterProgramForm from "@/components/registration/WinterProgramForm";

export const metadata: Metadata = {
  title: "Winter Program Registration | The Wolverines Field Hockey Club",
  description:
    "Register for The Wolverines Winter Program in Abbotsford, BC. Indoor practice, agility, and development camps for junior and youth hockey players.",
};

export default function WinterProgramPage() {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-white text-neutral-900 select-none">
      <WinterProgramForm />
    </main>
  );
}
