"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SweetSuccessAlert from "@/components/ui/SweetSuccessAlert";

function WinterSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <SweetSuccessAlert
      sessionId={sessionId}
      title="Winter Program Registration Successful!"
      subtitle="Your registration and payment have been successfully confirmed. Welcome to The Wolverines Winter Program!"
      programName="Wolverines Winter Program"
      homeUrl="/"
      programUrl="/winter-program"
    />
  );
}

export default function WinterProgramSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#DE2027] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WinterSuccessContent />
    </Suspense>
  );
}
